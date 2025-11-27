import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { Buffer } from "https://deno.land/std@0.177.0/node/buffer.ts";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";
import { timingSafeEqual } from "https://deno.land/std@0.177.0/crypto/timing_safe_equal.ts";

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

const generarSlug = (str: string) => {
    if (!str) return '';
    return str.toLowerCase().normalize("NFD").replace(/[\u0000-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").trim();
};

// La función verifySignature no cambia.
function verifySignature(secret: string, rawBody: string, boldSignature: string): boolean {
  try {
    const encodedBody = Buffer.from(rawBody).toString('base64');
    const hmac = createHmac('sha256', secret);
    hmac.update(encodedBody);
    const hashed = hmac.digest('hex');
    const receivedSignBuffer = new TextEncoder().encode(boldSignature);
    const calculatedSignBuffer = new TextEncoder().encode(hashed);
    if (receivedSignBuffer.length !== calculatedSignBuffer.length) return false;
    return timingSafeEqual(receivedSignBuffer, calculatedSignBuffer);
  } catch (error) {
    console.error("Error dentro de verifySignature:", error);
    return false;
  }
}

async function sendWhatsAppNotification(orderData: any) {
  try {
    console.log('📱 Enviando notificación de WhatsApp...');
    
    const n8nWebhookUrl = 'https://panelN8N.jerseyscol.com/webhook/order-confirmed';
    
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderData.id,
        payment_method: 'bold',
        order_details: orderData.order_details,
        customer_id: orderData.customer_id,
        total: orderData.total,
        currency: orderData.currency,
        created_at: new Date().toISOString()
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ WhatsApp notification sent:', result);
      return true;
    } else {
      const error = await response.text();
      console.error('❌ Error sending WhatsApp:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Exception sending WhatsApp:', error);
    return false;
  }
}

serve(async (req) => {
  // La lógica de verificación de firma no cambia.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const boldSignature = req.headers.get('x-bold-signature');
    const rawBody = await req.text();
    if (!boldSignature) throw new Error("Firma de webhook no encontrada.");
    
    const secretKey = ''; // Clave vacía para pruebas
    const isValid = verifySignature(secretKey, rawBody, boldSignature);

    if (!isValid) {
      console.warn("Firma de webhook inválida.");
      return new Response(JSON.stringify({ message: "Firma inválida" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const webhookPayload = JSON.parse(rawBody);
    console.log('Webhook válido:', webhookPayload.type);

    if (webhookPayload.type === 'SALE_APPROVED') {
      const { data: transactionData } = webhookPayload;
      const orderId = transactionData.metadata?.reference;

      if (!orderId) {
        throw new Error("No se encontró la referencia de la orden en el webhook.");
      }

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      // Verificamos si esta transacción ya fue procesada para evitar duplicados.
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('bold_transaction_id', transactionData.payment_id)
        .single();

      if (existingOrder) {
        console.log(`La transacción ${transactionData.payment_id} ya fue procesada. Ignorando webhook duplicado.`);
        return new Response(JSON.stringify({ received: true, message: 'Duplicate webhook ignored' }), { status: 200 });
      }

      // 1. Buscar la orden pendiente
      const { data: pendingOrder, error: findError } = await supabaseAdmin
        .from('pending_orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (findError || !pendingOrder) {
        throw new Error(`Orden pendiente con ID ${orderId} no encontrada.`);
      }

      const { user_id: userId, order_details } = pendingOrder;
      const { items, customer } = order_details;
      
      let customerId = null;

      if (userId) {
        const { data: existingCustomer } = await supabaseAdmin
          .from('customers')
          .select('id')
          .eq('id', userId)
          .single();
        
        if (existingCustomer) {
          customerId = existingCustomer.id;
          console.log('Customer found:', customerId);
          
          await supabaseAdmin
            .from('customers')
            .update({
              name: customer.fullName || existingCustomer.name,
              phone: customer.phone || existingCustomer.phone,
              address: customer.address ? {
                street: customer.address,
                city: customer.city,
                state: customer.state,
                country: customer.country,
                postalCode: customer.postalCode
              } : existingCustomer.address
            })
            .eq('id', userId);
        } else {
          // Crear nuevo cliente
          const { data: newCustomer, error: customerError } = await supabaseAdmin
            .from('customers')
            .insert({
              id: userId,
              name: customer.fullName || 'Cliente',
              phone: customer.phone || '',
              address: customer.address ? {
                street: customer.address,
                city: customer.city,
                state: customer.state,
                country: customer.country,
                postalCode: customer.postalCode
              } : null
            })
            .select()
            .single();

          if (!customerError && newCustomer) {
            customerId = newCustomer.id;
            console.log('New customer created:', customerId);
          } else if (customerError) {
            console.error('Error creating customer:', customerError);
          }
        }
      }

      const { data: finalOrder, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: userId,
          customer_id: customerId,
          bold_transaction_id: transactionData.payment_id,
          total: transactionData.amount.total / 100,
          currency: 'COP',
          shipping_status: 'pending',
          status: 'completed',
          payment_status: 'completed',
          payment_method: 'bold',
          order_details: order_details
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }
      if (pendingOrder.discount_code_id && pendingOrder.discount_amount > 0) {

      await registerDiscountUsage(
        supabaseAdmin,
        pendingOrder.discount_code_id,
        pendingOrder.user_id,
        orderId,
        pendingOrder.discount_amount
      );
    }

      console.log('Order created:', finalOrder.id);

      if (pendingOrder.discount_code_id && pendingOrder.discount_amount > 0) {
        await registerDiscountUsage(
          supabaseAdmin,
          pendingOrder.discount_code_id,
          pendingOrder.user_id,
          orderId,
          pendingOrder.discount_amount
        );
      }

      
      const itemsToInsert = items.map(item => ({
        order_id: finalOrder.id,
        product_name: item.name,
        quantity: item.quantity || 1,
        price_at_purchase: item.price + ((item.customName || item.customNumber) ? 5 : 0),
        size: item.size || null,
        custom_name: item.customName || null,
        custom_number: item.customNumber || null,
        product_details: {
          team: item.team,
          year: item.year,
          category: item.category,
          sport: item.sport,
          driver: item.driver,
          country: item.country,
          img: item.img,
          slug: generarSlug(item.name)
        }
      }));


      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Error saving items:', itemsError);
        throw new Error(`Error al guardar los items de la orden: ${itemsError.message}`);
      }

      console.log(`Created ${itemsToInsert.length} order items`);

      await supabaseAdmin
        .from('pending_orders')
        .delete()
        .eq('order_id', orderId);

      console.log(`Orden ${finalOrder.id} confirmada y guardada exitosamente.`);

      try {
        console.log('📱 Enviando notificación de WhatsApp para la orden:', finalOrder.id);
        await sendWhatsAppNotification(finalOrder);
      } catch (whatsAppError) {
        console.error('❌ Error enviando notificación de WhatsApp (no crítico):', whatsAppError);
      }

      try {
        console.log('📧 Enviando email de confirmación a:', customer.email);
        
        await supabaseAdmin.functions.invoke('send-order-confirmation-email', {
          body: {
            orderId: orderId,
            customerEmail: customer.email,
            orderDetails: order_details
          }
        });
        
        console.log('✅ Email de confirmación enviado exitosamente (Bold)');
      } catch (emailError) {
        console.error('❌ Error enviando email (no crítico):', emailError);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error) {
    console.error('Error procesando el webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
})