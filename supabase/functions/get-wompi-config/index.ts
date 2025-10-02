import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Manejar OPTIONS request para CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obtener la llave pública de Wompi desde las variables de entorno
    let publicKey = Deno.env.get('WOMPI_PUBLIC_KEY');

    console.log('Getting Wompi config...', {
      hasPublicKey: !!publicKey,
      originalLength: publicKey?.length,
      keyPrefix: publicKey ? publicKey.substring(0, 12) : 'none'
    });

    if (!publicKey) {
      throw new Error('WOMPI_PUBLIC_KEY not configured in environment variables');
    }

    // Limpieza agresiva de la publicKey
    publicKey = publicKey
      .trim()                          // Eliminar espacios inicio/fin
      .replace(/\s+/g, '')             // Eliminar TODOS los espacios
      .replace(/[\r\n\t]/g, '')        // Eliminar saltos de línea y tabs
      .replace(/[^\x20-\x7E]/g, '');   // Eliminar caracteres no imprimibles

    console.log('Cleaned public key:', {
      length: publicKey.length,
      prefix: publicKey.substring(0, 12),
      suffix: publicKey.substring(publicKey.length - 5)
    });

    // Validar formato de la llave
    if (!publicKey.startsWith('pub_test_') && !publicKey.startsWith('pub_prod_')) {
      console.error('Invalid public key format:', publicKey.substring(0, 20));
      throw new Error('Invalid Wompi public key format. Must start with pub_test_ or pub_prod_');
    }

    // Validar longitud esperada (aproximadamente 44-50 caracteres)
    if (publicKey.length < 40 || publicKey.length > 60) {
      console.error('Invalid public key length:', publicKey.length);
      throw new Error(`Invalid public key length: ${publicKey.length}. Expected 40-60 characters.`);
    }

    return new Response(JSON.stringify({
      publicKey: publicKey,
      environment: publicKey.startsWith('pub_test_') ? 'test' : 'production'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in get-wompi-config:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to retrieve Wompi configuration'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})