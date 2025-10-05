import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const generarSlug = (str: string) => {
    if (!str) return '';
    return str.toLowerCase().normalize("NFD").replace(/[\u0000-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").trim();
};

async function verifyPayPalWebhook(webhookId: string, headers: Headers, body: string): Promise<boolean> {
  try {
    const paypalClientId = Deno.env.get('VITE_PAYPAL_CLIENT_ID');
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    
    if (!paypalClientId || !paypalClientSecret) {
      console.error('PayPal credentials not configured');
      return false;
    }
    
    // Determinar el entorno
    const isProduction = Deno.env.get('PAYPAL_ENVIRONMENT') === 'production';
    const baseURL = isProduction 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';
    
    // Obtener token de acceso de PayPal
    const authString = btoa(`${paypalClientId}:${paypalClientSecret}`);
    const tokenResponse = await fetch(`${baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      console.error('Error obteniendo token PayPal:', await tokenResponse.text());
      return false;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Función helper para obtener headers (case-insensitive)
    const getHeader = (headerName: string): string | null => {
      // Intentar con el nombre original
      let value = headers.get(headerName);
      if (value) return value;
      
      // Intentar con minúsculas
      value = headers.get(headerName.toLowerCase());
      if (value) return value;
      
      // Intentar con mayúsculas
      value = headers.get(headerName.toUpperCase());
      if (value) return value;
      
      return null;
    };

    // Extraer headers de PayPal (manejar diferentes formatos)
    const authAlgo = getHeader('PAYPAL-AUTH-ALGO') || getHeader('paypal-auth-algo');
    const certId = getHeader('PAYPAL-CERT-ID') || getHeader('paypal-cert-id');
    const transmissionId = getHeader('PAYPAL-TRANSMISSION-ID') || getHeader('paypal-transmission-id');
    const transmissionSig = getHeader('PAYPAL-TRANSMISSION-SIG') || getHeader('paypal-transmission-sig');
    const transmissionTime = getHeader('PAYPAL-TRANSMISSION-TIME') || getHeader('paypal-transmission-time');

    console.log('Headers extraídos:', {
      authAlgo,
      certId,
      transmissionId,
      transmissionSig,
      transmissionTime,
      webhookId
    });

    if (!authAlgo || !certId || !transmissionId || !transmissionSig || !transmissionTime) {
      console.error('Headers de PayPal incompletos:', {
        authAlgo: !!authAlgo,
        certId: !!certId,
        transmissionId: !!transmissionId,
        transmissionSig: !!transmissionSig,
        transmissionTime: !!transmissionTime
      });
      return false;
    }

    // Verificar el webhook
    const verificationData = {
      auth_algo: authAlgo,
      cert_id: certId,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: JSON.parse(body)
    };

    console.log('Verificando webhook con PayPal API...');
    const verifyResponse = await fetch(`${baseURL}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(verificationData)
    });

    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text();
      console.error('Error verificando webhook PayPal:', errorText);
      return false;
    }

    const verifyResult = await verifyResponse.json();
    console.log('Resultado de verificación:', verifyResult);
    return verifyResult.verification_status === 'SUCCESS';
    
  } catch (error) {
    console.error("Error verificando webhook de PayPal:", error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const rawBody = await req.text();
    const webhookPayload = JSON.parse(rawBody);
    
    console.log('Webhook PayPal recibido:', webhookPayload.event_type);
    console.log('Payload completo:', JSON.stringify(webhookPayload, null, 2));
    
    // ID del webhook configurado en PayPal Dashboard
    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID');
    const isProduction = Deno.env.get('PAYPAL_ENVIRONMENT') === 'production';
    
    if (!webhookId) {
      console.warn("⚠️ PAYPAL_WEBHOOK_ID no configurado");
      if (isProduction) {
        return new Response(JSON.stringify({ message: "Webhook ID no configurado" }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
      console.log("Modo desarrollo: Continuando sin verificación de webhook");
    }
    
    // Verificar la firma del webhook (solo si tenemos webhook_id)
    let isValid = true;
    if (webhookId) {
      console.log('Verificando firma del webhook...');
      isValid = await verifyPayPalWebhook(webhookId, req.headers, rawBody);
      
      if (!isValid) {
        console.warn("⚠️ Webhook de PayPal con firma inválida.");
        // En producción, rechazar. En desarrollo, continuar con warning
        if (isProduction) {
          return new Response(JSON.stringify({ message: "Firma inválida" }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }
        console.warn("⚠️ Modo desarrollo: Continuando a pesar de firma inválida");
      } else {
        console.log('✅ Firma del webhook verificada correctamente');
      }
    }

    console.log('Webhook PayPal válido:', webhookPayload.event_type);

    // Procesar diferentes tipos de eventos de PayPal
    if (webhookPayload.event_type === 'CHECKOUT.ORDER.APPROVED' || 
        webhookPayload.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      
      const orderData = webhookPayload.resource;
      let orderId = null;
      let customerId = null;
      
      // Extraer orderId según el tipo de evento
      if (webhookPayload.event_type === 'CHECKOUT.ORDER.APPROVED') {
        orderId = orderData.purchase_units?.[0]?.reference_id;
        console.log('ORDER.APPROVED - orderId extraído:', orderId);
      } else if (webhookPayload.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        // Para CAPTURE.COMPLETED, buscar en diferentes lugares
        orderId = orderData.custom_id || 
                  orderData.invoice_id || 
                  orderData.supplementary_data?.related_ids?.order_id;
        console.log('CAPTURE.COMPLETED - orderId extraído:', orderId);
      }

      if (!orderId) {
        console.error("No se encontró la referencia de la orden en el webhook de PayPal");
        console.error("Purchase units:", orderData.purchase_units);
        console.error("Order data keys:", Object.keys(orderData));
        throw new Error("No se encontró la referencia de la orden en el webhook de PayPal.");
      }

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      // Verificar si esta transacción ya fue procesada
      const transactionId = orderData.id;
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('paypal_transaction_id', transactionId)
        .single();

      if (existingOrder) {
        console.log(`La transacción PayPal ${transactionId} ya fue procesada. Ignorando webhook duplicado.`);
        return new Response(JSON.stringify({ received: true, message: 'Duplicate webhook ignored' }), { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Buscar la orden pendiente
      console.log('Buscando orden pendiente con ID:', orderId);
      const { data: pendingOrder, error: findError } = await supabaseAdmin
        .from('pending_orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (findError || !pendingOrder) {
        console.error(`Orden pendiente con ID ${orderId} no encontrada:`, findError);
        console.error('Verificando órdenes pendientes existentes...');
        
        // Debug: mostrar órdenes pendientes existentes
        const { data: allPending } = await supabaseAdmin
          .from('pending_orders')
          .select('order_id, created_at')
          .limit(10);
        console.log('Órdenes pendientes:', allPending);
        
        throw new Error(`Orden pendiente con ID ${orderId} no encontrada.`);
      }

      console.log('Orden pendiente encontrada:', pendingOrder.order_id);
      const { user_id: userId, order_details } = pendingOrder;
      const { items, customer } = order_details;
      
      if (userId) {
        const { data: existingCustomer } = await supabaseAdmin
          .from('customers')
          .select('id')
          .eq('id', userId)
          .single();
        
        if (existingCustomer) {
          customerId = existingCustomer.id;
          console.log('Customer found:', customerId);
          
          // Actualizar información del cliente
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
          }
        }
      }

      // Obtener el monto total del webhook de PayPal
      let totalAmount = 0;
      if (webhookPayload.event_type === 'CHECKOUT.ORDER.APPROVED') {
        totalAmount = parseFloat(orderData.purchase_units?.[0]?.amount?.value || '0');
      } else if (webhookPayload.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        totalAmount = parseFloat(orderData.amount?.value || '0');
      }

      console.log('Total amount from PayPal:', totalAmount);

      // Crear la orden final
      const { data: finalOrder, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: userId,
          customer_id: customerId,
          paypal_transaction_id: transactionId,
          total: totalAmount,
          currency: 'USD',
          shipping_status: 'pending',
          status: 'completed',
          payment_status: 'completed',
          payment_method: 'paypal',
          order_details: order_details
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creando orden final:', orderError);
        throw orderError;
      }

      console.log('Orden final creada:', finalOrder.id);

      
      // Crear los items de la orden
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

      console.log('Items a insertar:', itemsToInsert.length);
      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Error guardando items:', itemsError);
        throw new Error(`Error al guardar los items de la orden: ${itemsError.message}`);
      }

      // Borrar la orden pendiente
      await supabaseAdmin
        .from('pending_orders')
        .delete()
        .eq('order_id', orderId);
      console.log('Orden pendiente eliminada');

      console.log(`✅ Orden ${finalOrder.id} confirmada y guardada exitosamente (PayPal).`);
      
      await supabaseAdmin
        .from('pending_orders')
        .delete()
        .eq('order_id', orderId);
      console.log('Orden pendiente eliminada');

      console.log(`✅ Orden ${finalOrder.id} confirmada y guardada exitosamente (PayPal).`);
      
      return new Response(JSON.stringify({ 
        received: true, 
        order_id: finalOrder.id,
        message: 'Order processed successfully' 
      }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Para otros tipos de eventos
    console.log('Evento no procesado:', webhookPayload.event_type);
    return new Response(JSON.stringify({ received: true, message: 'Event not processed' }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error procesando el webhook de PayPal:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
})