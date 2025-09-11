import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import CryptoJS from "https://esm.sh/crypto-js@4.2.0";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { customerInfo, itemsToCheckout, subtotal, shippingCost, tasaCOP } = await req.json();

    if (!customerInfo || !itemsToCheckout || !tasaCOP) {
      throw new Error("Faltan datos para crear la orden.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const orderId = `order_${Date.now()}_${crypto.randomUUID().split('-')[0]}`; 
    const totalUSD = subtotal + shippingCost;
    const amountInCOP = Math.round(totalUSD * tasaCOP);
    const currency = "COP";
    const integritySecret = Deno.env.get('BOLD_INTEGRITY_SECRET')!;

    const signatureString = `${orderId}${amountInCOP}${currency}${integritySecret}`;
    const integritySignature = CryptoJS.SHA256(signatureString).toString();

    const orderDetails = {
      items: itemsToCheckout,
      customer: customerInfo
    };

    const { error } = await supabaseAdmin
      .from('pending_orders')
      .insert({
        order_id: orderId,
        user_id: customerInfo.userId,
        order_details: orderDetails
      });

    if (error) throw error;

    return new Response(JSON.stringify({ orderId, amount: amountInCOP, integritySignature }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})