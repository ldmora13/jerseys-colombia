import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import crypto from "https://esm.sh/crypto-js@4.2.0";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json();
    const signature = req.headers.get('x-wompi-signature');
    const timestamp = req.headers.get('x-wompi-timestamp');

    // Verificar la firma del webhook
    const webhookSecret = Deno.env.get('WOMPI_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    // Construir la cadena para verificar la firma
    const signatureString = `${timestamp}.${JSON.stringify(payload)}`;
    const expectedSignature = crypto.HmacSHA256(signatureString, webhookSecret).toString();

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return new Response('Invalid signature', { status: 401 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Procesar el evento según el tipo
    const event = payload.event;
    const transaction = payload.data?.transaction;

    if (event === 'transaction.updated' && transaction) {
      const reference = transaction.reference;
      const status = transaction.status;
      const transactionId = transaction.id;

      // Buscar la orden pendiente por referencia
      const { data: pendingOrder } = await supabaseAdmin
        .from('pending_orders')
        .select('*')
        .eq('order_id', reference)
        .single();

      if (!pendingOrder) {
        console.log('No pending order found for reference:', reference);
        return new Response('OK', { status: 200 });
      }

      if (status === 'APPROVED') {
        // Crear orden confirmada
        const { error: insertError } = await supabaseAdmin
          .from('orders')
          .insert({
            user_id: pendingOrder.user_id,
            order_details: pendingOrder.order_details,
            payment_method: 'wompi',
            payment_status: 'completed',
            transaction_id: transactionId,
            total_amount: transaction.amount_in_cents / 100,
            currency: 'COP',
            shipping_status: 'pending'
          });

        if (!insertError) {
          // Eliminar orden pendiente
          await supabaseAdmin
            .from('pending_orders')
            .delete()
            .eq('order_id', reference);

          // Enviar email de confirmación
          await supabaseAdmin.functions.invoke('send-order-confirmation-email', {
            body: {
              orderId: reference,
              customerEmail: pendingOrder.order_details.customer.email,
              orderDetails: pendingOrder.order_details
            }
          });
        }
      } else {
        // Actualizar estado de la orden pendiente
        await supabaseAdmin
          .from('pending_orders')
          .update({
            payment_status: status.toLowerCase(),
            transaction_id: transactionId
          })
          .eq('order_id', reference);
      }
    }

    return new Response('OK', {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in wompi-webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})