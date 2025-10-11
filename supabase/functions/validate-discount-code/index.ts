import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DiscountCode {
  id: string
  code: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_purchase_amount: number
  max_discount_amount: number | null
  usage_limit: number | null
  usage_count: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
}

interface ValidationRequest {
  code: string
  subtotal: number
  userId?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    )

    const { code, subtotal, userId }: ValidationRequest = await req.json()

    if (!code || !subtotal) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Código y subtotal son requeridos' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // 1. Buscar el código
    const { data: discountCode, error: fetchError } = await supabaseClient
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (fetchError || !discountCode) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Código no válido o inactivo' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    const discount = discountCode as DiscountCode
    const now = new Date()

    // 2. Validar fecha de inicio
    if (new Date(discount.valid_from) > now) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Este código aún no está disponible' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // 3. Validar fecha de expiración
    if (discount.valid_until && new Date(discount.valid_until) < now) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Este código ha expirado' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // 4. Validar límite de usos
    if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Este código ha alcanzado su límite de usos' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // 5. Validar monto mínimo de compra
    if (subtotal < discount.min_purchase_amount) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: `Compra mínima de $${discount.min_purchase_amount.toFixed(2)} requerida` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // 6. Si hay userId, verificar si ya usó el código
    if (userId) {
      const { data: previousUsage } = await supabaseClient
        .from('discount_code_usage')
        .select('id')
        .eq('discount_code_id', discount.id)
        .eq('user_id', userId)
        .single()

      if (previousUsage) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            message: 'Ya has usado este código anteriormente' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }
    }

    // 7. Calcular descuento
    let discountAmount = 0

    if (discount.discount_type === 'percentage') {
      discountAmount = (subtotal * discount.discount_value) / 100
      
      // Aplicar descuento máximo si existe
      if (discount.max_discount_amount) {
        discountAmount = Math.min(discountAmount, discount.max_discount_amount)
      }
    } else if (discount.discount_type === 'fixed') {
      discountAmount = discount.discount_value
    }

    // No permitir que el descuento sea mayor al subtotal
    discountAmount = Math.min(discountAmount, subtotal)

    return new Response(
      JSON.stringify({ 
        valid: true,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        discountType: discount.discount_type,
        discountValue: discount.discount_value,
        description: discount.description,
        codeId: discount.id,
        message: `Descuento de $${discountAmount.toFixed(2)} aplicado`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error validating discount code:', error)
    return new Response(
      JSON.stringify({ 
        valid: false, 
        message: 'Error al validar el código' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})