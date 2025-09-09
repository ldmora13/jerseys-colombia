import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { Buffer } from "https://deno.land/std@0.177.0/node/buffer.ts";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";
import { timingSafeEqual } from "https://deno.land/std@0.177.0/crypto/timing_safe_equal.ts";


function verifySignature(secret: string, rawBody: string, boldSignature: string): boolean {
  try {
    const encodedBody = Buffer.from(rawBody).toString('base64');
    const hmac = createHmac('sha256', secret);
    hmac.update(encodedBody);
    const hashed = hmac.digest('hex');

    const receivedSignBuffer = new TextEncoder().encode(boldSignature);
    const calculatedSignBuffer = new TextEncoder().encode(hashed);
    
    if (receivedSignBuffer.length !== calculatedSignBuffer.length) {
      return false;
    }
    
    return timingSafeEqual(receivedSignBuffer, calculatedSignBuffer);

  } catch (error) {
    console.error("Error dentro de verifySignature:", error);
    return false;
  }
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const boldSignature = req.headers.get('x-bold-signature');
    const rawBody = await req.text();

    if (!boldSignature) {
      throw new Error("Firma de webhook 'x-bold-signature' no encontrada en los encabezados.");
    }
    
    const secretKey = ''; 

    const isValid = verifySignature(secretKey, rawBody, boldSignature);

    if (!isValid) {
      console.warn("Firma de webhook inválida. La solicitud podría no ser de Bold.");
      return new Response(JSON.stringify({ message: "Firma inválida" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const webhookPayload = JSON.parse(rawBody);
    console.log('Webhook con firma válida recibido:', JSON.stringify(webhookPayload, null, 2));

    const transactionType = webhookPayload.type;

    if (transactionType === 'SALE_APPROVED') {
      const { data: transactionData } = webhookPayload;
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      const { error } = await supabaseAdmin
        .from('orders')
        .insert({
          bold_transaction_id: transactionData.payment_id,
          order_details: webhookPayload,
          customer_email: transactionData.customer?.email || 'no-email@provided.com',
          total: transactionData.amount.total / 100,
          status: 'COMPLETED'
        });

      if (error) {
        throw new Error(`Error al guardar la orden desde el webhook: ${error.message}`);
      }
      console.log(`Orden ${transactionData.metadata?.reference} guardada exitosamente.`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error procesando el webhook de Bold:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})