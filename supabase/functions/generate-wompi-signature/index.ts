import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import crypto from "https://esm.sh/crypto-js@4.2.0";

serve(async (req) => {
  
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    try {
      const { reference, amountInCents, currency } = await req.json();

      // Validar parámetros
      if (!reference || !amountInCents || !currency) {
        throw new Error('Missing required parameters: reference, amountInCents, currency');
      }

      // Obtener el secreto de integridad
      const integritySecret = Deno.env.get('WOMPI_INTEGRITY_SECRET');
      
      if (!integritySecret) {
        throw new Error('WOMPI_INTEGRITY_SECRET not configured');
      }

    console.log("🔑 reference:", JSON.stringify(reference));
    console.log("🔑 amountInCents:", JSON.stringify(amountInCents));
    console.log("🔑 currency:", JSON.stringify(currency));
    console.log("🔑 integritySecret prefix:", integritySecret.substring(0,15));


    const signatureString = `${reference}${amountInCents}${currency}${integritySecret}`;
    console.log("📄 Cadena firmada:", JSON.stringify(signatureString));
    console.log("🔑 Longitud secreto:", integritySecret.length);

    // Generar el hash SHA256
    const signature = crypto.SHA256(signatureString).toString(crypto.enc.Hex);
    console.log("🔐 Firma generada:", signature);

    return new Response(JSON.stringify({
      signature,
      reference,
      amountInCents,
      currency
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

    } catch (error) {
      console.error('Error generating signature:', error);
      return new Response(JSON.stringify({ 
        error: error.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  })