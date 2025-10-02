import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, transactionId, status, reference } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verificar la transacción con la API de Wompi
    const wompiPrivateKey = Deno.env.get('WOMPI_PRIVATE_KEY');
    const authHeader = `Bearer ${wompiPrivateKey}`;

    // Detectar ambiente según el prefijo de la llave
    const isProduction = wompiPrivateKey?.startsWith('prv_prod_');
    const apiBaseUrl = isProduction 
      ? 'https://production.wompi.co/v1'
      : 'https://sandbox.wompi.co/v1';
    
    const apiUrl = `${apiBaseUrl}/transactions/${transactionId}`;
    
    console.log('Verificando transacción:', {
      transactionId,
      environment: isProduction ? 'production' : 'sandbox',
      apiUrl
    });

    const transactionResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': authHeader
      }
    });

    if (!transactionResponse.ok) {
      throw new Error('Failed to verify transaction with Wompi');
    }

    const transactionData = await transactionResponse.json();

    // Verificar que la transacción sea válida
    if (transactionData.data.reference !== reference) {
      throw new Error('Transaction reference mismatch');
    }

    // Obtener la orden pendiente
    const { data: pendingOrder, error: fetchError } = await supabaseAdmin
      .from('pending_orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (fetchError || !pendingOrder) {
      throw new Error('Pending order not found');
    }

    if (transactionData.data.status === 'APPROVED') {
      // Crear la orden confirmada
      const { error: insertOrderError } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: pendingOrder.user_id,
          order_details: pendingOrder.order_details,
          payment_method: 'wompi',
          payment_status: 'completed',
          transaction_id: transactionId,
          total_amount: transactionData.data.amount_in_cents / 100,
          currency: 'COP',
          shipping_status: 'pending'
        });

      if (insertOrderError) {
        throw new Error(`Error creating confirmed order: ${insertOrderError.message}`);
      }

      // Eliminar la orden pendiente
      await supabaseAdmin
        .from('pending_orders')
        .delete()
        .eq('order_id', orderId);

      // Enviar email de confirmación (opcional)
      await supabaseAdmin.functions.invoke('send-order-confirmation-email', {
        body: {
          orderId,
          customerEmail: pendingOrder.order_details.customer.email,
          orderDetails: pendingOrder.order_details
        }
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'Payment processed successfully',
        transactionId: transactionId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } else {
      // Pago no aprobado - actualizar estado
      const { error: updateError } = await supabaseAdmin
        .from('pending_orders')
        .update({
          payment_status: transactionData.data.status.toLowerCase(),
          transaction_id: transactionId
        })
        .eq('order_id', orderId);

      if (updateError) {
        console.error('Error updating pending order:', updateError);
      }

      return new Response(JSON.stringify({
        success: false,
        message: 'Payment not approved',
        status: transactionData.data.status
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

  } catch (error) {
    console.error('Error in process-wompi-payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})