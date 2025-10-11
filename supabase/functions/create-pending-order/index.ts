import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import crypto from "https://esm.sh/crypto-js@4.2.0";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      customerInfo, 
      itemsToCheckout, 
      subtotal, 
      shippingCost, 
      discountAmount = 0,
      discountCodeId = null,
      finalTotal,
      tasaCOP, 
      paymentMethod = 'bold' 
    } = await req.json();
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Generar un ID único para la orden
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calcular el total (puede venir del frontend o calcularlo aquí)
    const totalUSD = finalTotal !== undefined ? finalTotal : (subtotal + shippingCost - discountAmount);
    const totalCOP = Math.round(totalUSD * tasaCOP);

    // Preparar datos para guardar
    const orderDetails = {
      items: itemsToCheckout,
      customer: customerInfo,
      totals: {
        subtotal,
        shipping: shippingCost,
        discount: discountAmount,
        total: totalUSD,
        totalCOP,
        exchangeRate: tasaCOP
      },
      paymentMethod,
      discountInfo: discountCodeId ? {
        codeId: discountCodeId,
        amount: discountAmount
      } : null
    };

    // Guardar orden pendiente
    const { error: insertError } = await supabaseAdmin
      .from('pending_orders')
      .insert({
        order_id: orderId,
        user_id: customerInfo.userId,
        order_details: orderDetails,
        payment_method: paymentMethod,
        discount_code_id: discountCodeId,
        discount_amount: discountAmount,
        total_amount: totalUSD
      });

    if (insertError) {
      console.error('Error al insertar orden pendiente:', insertError);
      throw new Error(`Error al crear orden pendiente: ${insertError.message}`);
    }

    console.log(`Orden pendiente creada: ${orderId}`);

    // Preparar respuesta según el método de pago
    if (paymentMethod === 'bold') {
      // Para Bold - generar firma de integridad
      const amountInCents = Math.round(totalCOP);
      const integritySecret = Deno.env.get('BOLD_INTEGRITY_SECRET')!;
      
      if (!integritySecret) {
        throw new Error('BOLD_INTEGRITY_SECRET not configured');
      }

      const signatureString = `${orderId}${amountInCents}COP${integritySecret}`;
      const integritySignature = crypto.SHA256(signatureString).toString();

      return new Response(JSON.stringify({
        orderId,
        amount: amountInCents,
        integritySignature,
        currency: 'COP',
        total: totalUSD,
        totalCOP: totalCOP,
        discount: discountAmount
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } else if (paymentMethod === 'paypal') {
      // Para PayPal - solo necesitamos el orderId y monto en USD
      return new Response(JSON.stringify({
        orderId,
        amount: totalUSD,
        currency: 'USD',
        discount: discountAmount
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } else if (paymentMethod === 'wompi') {
      // Para Wompi - generar firma de integridad
      const amountInCents = Math.round(totalCOP * 100); // Wompi usa centavos
      const integritySecret = Deno.env.get('WOMPI_INTEGRITY_SECRET')!;
      
      if (!integritySecret) {
        throw new Error('WOMPI_INTEGRITY_SECRET not configured');
      }
      
      // Generar firma: referencia + monto + moneda + secreto
      const signatureString = `${orderId}${amountInCents}COP${integritySecret}`;
      const integritySignature = crypto.SHA256(signatureString).toString();
      
      return new Response(JSON.stringify({
        orderId,
        amount: amountInCents,
        currency: 'COP',
        reference: orderId,
        integritySignature,
        total: totalUSD,
        totalCOP: totalCOP,
        discount: discountAmount
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      throw new Error(`Método de pago no soportado: ${paymentMethod}`);
    }

  } catch (error) {
    console.error('Error en create-pending-order:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Error al procesar la orden pendiente'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})