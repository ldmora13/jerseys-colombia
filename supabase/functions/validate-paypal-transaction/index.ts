import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

async function getPayPalAccessToken(): Promise<string> {
  const paypalClientId = Deno.env.get('VITE_PAYPAL_CLIENT_ID');
  const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  
  // Determinar si estamos en sandbox o producción
  const isProduction = Deno.env.get('PAYPAL_ENVIRONMENT') === 'production';
  const baseURL = isProduction 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';
  
  const authString = btoa(`${paypalClientId}:${paypalClientSecret}`);
  
  const response = await fetch(`${baseURL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error(`Error obteniendo token de PayPal: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function validatePayPalOrder(orderId: string, accessToken: string): Promise<any> {
  const isProduction = Deno.env.get('PAYPAL_ENVIRONMENT') === 'production';
  const baseURL = isProduction 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';

  const response = await fetch(`${baseURL}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Error validando orden de PayPal: ${response.statusText}`);
  }

  return response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { paypalOrderId, expectedAmount, expectedCurrency = 'USD' } = await req.json();

    if (!paypalOrderId) {
      throw new Error('PayPal Order ID es requerido');
    }

    // Obtener token de acceso
    const accessToken = await getPayPalAccessToken();
    
    // Validar la orden con PayPal
    const orderDetails = await validatePayPalOrder(paypalOrderId, accessToken);
    
    // Verificar que la orden esté completada/capturada
    const isCompleted = orderDetails.status === 'COMPLETED';
    const captureDetails = orderDetails.purchase_units?.[0]?.payments?.captures?.[0];
    
    if (!isCompleted || !captureDetails) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'La orden de PayPal no está completada o capturada' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Verificar el monto si se proporciona
    if (expectedAmount) {
      const actualAmount = parseFloat(captureDetails.amount.value);
      const expectedAmountFloat = parseFloat(expectedAmount.toString());
      
      if (Math.abs(actualAmount - expectedAmountFloat) > 0.01) {
        return new Response(JSON.stringify({ 
          valid: false, 
          error: `Monto no coincide. Esperado: ${expectedAmount}, Recibido: ${actualAmount}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }

    // Verificar la moneda si se proporciona
    if (expectedCurrency && captureDetails.amount.currency_code !== expectedCurrency) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: `Moneda no coincide. Esperada: ${expectedCurrency}, Recibida: ${captureDetails.amount.currency_code}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Verificar que no sea una transacción duplicada
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('paypal_transaction_id', captureDetails.id)
      .single();

    if (existingOrder) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Esta transacción ya fue procesada' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Si llegamos aquí, la transacción es válida
    return new Response(JSON.stringify({ 
      valid: true, 
      orderDetails: {
        paypalOrderId,
        transactionId: captureDetails.id,
        amount: captureDetails.amount.value,
        currency: captureDetails.amount.currency_code,
        status: captureDetails.status,
        captureTime: captureDetails.create_time
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error validando transacción de PayPal:', error);
    return new Response(JSON.stringify({ 
      valid: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})