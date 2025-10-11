import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import crypto from "https://esm.sh/crypto-js@4.2.0";


async function registerDiscountUsage(
  supabaseClient: any,
  discountCodeId: string,
  userId: string,
  orderId: string,
  discountAmount: number
): Promise<boolean> {
  if (!discountCodeId || !discountAmount || discountAmount <= 0) {
    console.log('No hay código de descuento para registrar');
    return true; // No es un error
  }

  try {
    console.log(`Registrando descuento: código=${discountCodeId}, monto=${discountAmount}`);
    
    const { data, error } = await supabaseClient
      .rpc('register_discount_code_usage', {
        p_discount_code_id: discountCodeId,
        p_user_id: userId,
        p_order_id: orderId,
        p_discount_amount: discountAmount
      });

    if (error) {
      console.error('❌ Error RPC registrando descuento:', error);
      return false;
    }

    if (data && data.success) {
      console.log(`✅ Descuento registrado exitosamente:`, {
        code: data.code,
        newCount: data.new_usage_count,
        message: data.message
      });
      return true;
    } else {
      console.warn('⚠️ RPC retornó sin éxito:', data?.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Excepción registrando descuento:', error);
    return false;
  }
}

serve(async (req) => {
  // Permitir CORS y métodos OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('Webhook invoked:', {
    method: req.method,
    headers: Object.fromEntries(req.headers.entries())
  });

  try {
    const payload = await req.json();
    
    console.log('Webhook payload received:', JSON.stringify(payload, null, 2));
    
    console.log('Webhook received:', {
      event: payload.event,
      hasTransaction: !!payload.data?.transaction,
      transactionId: payload.data?.transaction?.id
    });

    // En sandbox, la verificación de firma puede ser opcional
    const signature = req.headers.get('x-wompi-signature');
    const timestamp = req.headers.get('x-wompi-timestamp');
    const webhookSecret = Deno.env.get('WOMPI_WEBHOOK_SECRET');

    // Solo verificar firma si tenemos el secret configurado Y los headers están presentes
    if (webhookSecret && signature && timestamp) {
      const signatureString = `${timestamp}.${JSON.stringify(payload)}`;
      const expectedSignature = crypto.HmacSHA256(signatureString, webhookSecret).toString();

      if (signature !== expectedSignature) {
        console.warn('Invalid webhook signature - proceeding anyway in sandbox mode');
      }
    } else {
      console.log('Webhook signature verification skipped (sandbox mode or missing headers)');
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

      console.log('Processing transaction:', {
        reference,
        status,
        transactionId,
        amount: transaction.amount_in_cents
      });

      // Buscar la orden pendiente por referencia
      const { data: pendingOrder, error: fetchError } = await supabaseAdmin
        .from('pending_orders')
        .select('*')
        .eq('order_id', reference)
        .single();

      if (fetchError) {
        console.error('Error fetching pending order:', fetchError);
      }

      if (!pendingOrder) {
        console.log('No pending order found for reference:', reference);
        return new Response('OK', { status: 200 });
      }

      console.log('Pending order found:', {
        orderId: pendingOrder.order_id,
        userId: pendingOrder.user_id
      });

      if (status === 'APPROVED') {
        console.log('Creating confirmed order...');
        
        // Extraer datos del cliente
        const customerData = pendingOrder.order_details?.customer || {};
        const customerEmail = customerData.email;
        
        let customerId = null;
        
        if (customerEmail) {
          // Buscar o crear cliente
          const { data: existingCustomer } = await supabaseAdmin
            .from('customers')
            .select('id')
            .eq('id', pendingOrder.user_id)
            .single();
          
          if (existingCustomer) {
            customerId = existingCustomer.id;
            console.log('Customer found:', customerId);
            
            // Actualizar información del cliente
            await supabaseAdmin
              .from('customers')
              .update({
                name: customerData.fullName || existingCustomer.name,
                phone: customerData.phone || existingCustomer.phone,
                address: customerData.address ? {
                  street: customerData.address,
                  city: customerData.city,
                  state: customerData.state,
                  country: customerData.country,
                  postalCode: customerData.postalCode
                } : existingCustomer.address
              })
              .eq('id', pendingOrder.user_id);
          } else if (pendingOrder.user_id) {
            // Crear nuevo cliente si no existe
            const { data: newCustomer, error: customerError } = await supabaseAdmin
              .from('customers')
              .insert({
                id: pendingOrder.user_id,
                name: customerData.fullName || 'Cliente',
                phone: customerData.phone || '',
                address: customerData.address ? {
                  street: customerData.address,
                  city: customerData.city,
                  state: customerData.state,
                  country: customerData.country,
                  postalCode: customerData.postalCode
                } : null
              })
              .select()
              .single();
            
            if (!customerError && newCustomer) {
              customerId = newCustomer.id;
              console.log('New customer created:', customerId);
            } else {
              console.error('Error creating customer:', customerError);
            }
          }
        }
        
        // Crear orden confirmada
        const { data: newOrder, error: insertOrderError } = await supabaseAdmin
          .from('orders')
          .insert({
            user_id: pendingOrder.user_id,
            customer_id: customerId,
            payment_method: 'wompi',
            payment_status: 'completed',
            transaction_id: transactionId,
            total: transaction.amount_in_cents / 100,
            currency: 'COP',
            shipping_status: 'pending',
            status: 'completed',
            order_details: pendingOrder.order_details
          })
          .select()
          .single();

        if (insertOrderError) {
          console.error('Error creating order:', insertOrderError);
          throw insertOrderError;
        }

        console.log('Order created successfully:', newOrder.id);

        if (pendingOrder.discount_code_id && pendingOrder.discount_amount > 0) {
          await registerDiscountUsage(
            supabaseAdmin,
            pendingOrder.discount_code_id,
            pendingOrder.user_id,
            reference,
            pendingOrder.discount_amount
          );
        }
        // Crear items de la orden
        if (pendingOrder.order_details?.items && Array.isArray(pendingOrder.order_details.items)) {
          const orderItems = pendingOrder.order_details.items.map(item => ({
            order_id: newOrder.id,
            product_name: item.name,
            quantity: item.quantity || 1,
            price_at_purchase: item.price,
            size: item.size || null,
            custom_name: item.customName || null,
            custom_number: item.customNumber || null,
            product_details: {
              team: item.team,
              year: item.year,
              category: item.category,
              img: item.img
            }
          }));

          const { error: itemsError } = await supabaseAdmin
            .from('order_items')
            .insert(orderItems);

          if (itemsError) {
            console.error('Error creating order items:', itemsError);
          } else {
            console.log(`Created ${orderItems.length} order items`);
          }
        }

        // Eliminar orden pendiente
        const { error: deleteError } = await supabaseAdmin
          .from('pending_orders')
          .delete()
          .eq('order_id', reference);

        if (deleteError) {
          console.error('Error deleting pending order:', deleteError);
        } else {
          console.log('Pending order deleted');
        }

        // Enviar email de confirmación
        try {
          await supabaseAdmin.functions.invoke('send-order-confirmation-email', {
            body: {
              orderId: reference,
              customerEmail: pendingOrder.order_details.customer.email,
              orderDetails: pendingOrder.order_details
            }
          });
          console.log('Confirmation email sent');
        } catch (emailError) {
          console.error('Error sending email:', emailError);
        }
      } else {
        console.log('Transaction not approved, updating status...');
        
        // Actualizar estado de la orden pendiente
        const { error: updateError } = await supabaseAdmin
          .from('pending_orders')
          .update({
            payment_status: status.toLowerCase(),
            transaction_id: transactionId
          })
          .eq('order_id', reference);

        if (updateError) {
          console.error('Error updating pending order:', updateError);
        } else {
          console.log('Pending order updated with status:', status);
        }
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