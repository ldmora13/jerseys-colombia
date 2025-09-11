import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { Buffer } from "https://deno.land/std@0.177.0/node/buffer.ts";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";
import { timingSafeEqual } from "https://deno.land/std@0.177.0/crypto/timing_safe_equal.ts";

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
      
      // 2. Crear/actualizar el perfil del cliente
      const { error: customerError } = await supabaseAdmin
        .from('customers')
        .upsert({ 
          id: userId, 
          name: customer.fullName,
          phone: customer.phone,
          address: {
            address: customer.address,
            city: customer.city,
            postalCode: customer.postalCode,
            country: customer.country
          }
        }, { onConflict: 'id' });

      if(customerError) throw new Error(`Error al actualizar/crear perfil: ${customerError.message}`);

      // 3. Crear la orden final
      const { data: finalOrder, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          customer_id: userId,
          bold_transaction_id: transactionData.payment_id,
          total: transactionData.amount.total / 100,
          status: 'COMPLETED'
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // 4. Crear los items de la orden (sin cambios)
      const itemsToInsert = items.map(item => ({
        order_id: finalOrder.id,
        product_name: item.name,
        quantity: item.quantity,
        price_at_purchase: item.price + ((item.customName || item.customNumber) ? 5 : 0),
        size: item.size,
        custom_name: item.customName || null,
        custom_number: item.customNumber || null,
        product_details: {
            sport: item.sport,
            category: item.category,
            team: item.team,
            year: item.year,
            driver: item.driver,
            country: item.country
        }
      }));

      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw new Error(`Error al guardar los items de la orden: ${itemsError.message}`);

      // 5. Borrar la orden pendiente
      await supabaseAdmin.from('pending_orders').delete().eq('order_id', orderId);

      console.log(`Orden ${finalOrder.id} confirmada y guardada exitosamente.`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (error) {
    console.error('Error procesando el webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
})