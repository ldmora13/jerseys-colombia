import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Necesitarás crypto-js para la firma de integridad en el backend
// Deno lo importará automáticamente.
import crypto from "https://esm.sh/crypto-js@4.2.0";

serve(async (req) => {
  // Manejo de la solicitud pre-vuelo (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { transaction, orderDetails } = await req.json();

    const {
      id: transactionId,
      amountInCents,
      reference,
      customerEmail,
      paymentMethod,
      status
    } = transaction;

    // --- Verificación de Seguridad Crítica ---
    // Vuelve a generar la firma de integridad en el backend para asegurarte
    // de que el monto no fue alterado en el frontend.
    const integritySecret = Deno.env.get('BOLD_INTEGRITY_SECRET')!;
    const signatureString = `${reference}${amountInCents}COP${integritySecret}`;
    const serverSignature = crypto.SHA256(signatureString).toString();

    if (serverSignature !== transaction.integritySignature) {
       throw new Error('Firma de integridad inválida. La transacción podría haber sido alterada.');
    }

    // Si la firma es válida y el estado es APROBADO, procede a guardar en tu DB.
    if (status === 'APPROVED') {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      // Aquí guardas la orden en tu base de datos de Supabase.
      // Es una buena práctica crear una tabla 'orders'.
      const { data, error } = await supabaseAdmin
        .from('orders') // Asegúrate de tener una tabla 'orders'
        .insert({
          bold_transaction_id: transactionId,
          order_details: orderDetails, // Contiene los productos, etc.
          customer_email: customerEmail,
          total: amountInCents / 100, // Guarda el monto en la unidad principal
          status: 'COMPLETED'
        })
        .select();

      if (error) {
        throw new Error(`Error al guardar la orden: ${error.message}`);
      }

      return new Response(JSON.stringify({ success: true, order: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      // Si el pago es RECHAZADO, informa al cliente.
      return new Response(JSON.stringify({ success: false, message: 'Pago rechazado por la entidad financiera.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})