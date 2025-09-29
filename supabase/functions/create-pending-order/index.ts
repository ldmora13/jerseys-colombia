import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import crypto from "https://esm.sh/crypto-js@4.2.0";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { customerInfo, itemsToCheckout, subtotal, shippingCost, tasaCOP, paymentMethod = 'bold' } = await req.json();
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Generar un ID único para la orden
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calcular el total
    const totalUSD = subtotal + shippingCost;
    const totalCOP = Math.round(totalUSD * tasaCOP);

    // Preparar datos para guardar
    const orderDetails = {
      items: itemsToCheckout,
      customer: customerInfo,
      totals: {
        subtotal,
        shipping: shippingCost,
        total: totalUSD,
        totalCOP,
        exchangeRate: tasaCOP
      },
      paymentMethod
    };

    // Guardar orden pendiente (sin expires_at ya que la tabla lo maneja automáticamente)
    const { error: insertError } = await supabaseAdmin
      .from('pending_orders')
      .insert({
        order_id: orderId,
        user_id: customerInfo.userId,
        order_details: orderDetails,
        payment_method: paymentMethod
      });

    if (insertError) {
      throw new Error(`Error al crear orden pendiente: ${insertError.message}`);
    }

    // Preparar respuesta según el método de pago
    if (paymentMethod === 'bold') {
      // Para Bold - generar firma de integridad
      const amountInCents = Math.round(totalCOP);
      const integritySecret = Deno.env.get('BOLD_INTEGRITY_SECRET')!;
      const signatureString = `${orderId}${amountInCents}COP${integritySecret}`;
      const integritySignature = crypto.SHA256(signatureString).toString();

      return new Response(JSON.stringify({
        orderId,
        amount: amountInCents,
        integritySignature,
        currency: 'COP'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else if (paymentMethod === 'paypal') {
      // Para PayPal - solo necesitamos el orderId
      return new Response(JSON.stringify({
        orderId,
        amount: totalUSD,
        currency: 'USD'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

  } catch (error) {
    console.error('Error en create-pending-order:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})