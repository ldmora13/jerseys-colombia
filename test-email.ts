// Ejecutar con: deno run --allow-net --allow-env test-email.ts

const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const ANON_KEY = 'tu-anon-key';

interface TestEmailConfig {
  customerEmail: string;
  customerName: string;
  includeCustomization?: boolean;
  includeDiscount?: boolean;
  paymentMethod?: 'paypal' | 'bold' | 'wompi';
}

async function sendTestEmail(config: TestEmailConfig) {
  const {
    customerEmail,
    customerName,
    includeCustomization = false,
    includeDiscount = false,
    paymentMethod = 'paypal'
  } = config;

  const testOrder = {
    orderId: `TEST_ORDER_${Date.now()}`,
    customerEmail: customerEmail,
    orderDetails: {
      customer: {
        fullName: customerName,
        email: customerEmail,
        phone: '+57 300 123 4567',
        address: 'Calle 123 #45-67',
        city: 'Bogotá',
        state: 'Cundinamarca',
        country: 'Colombia',
        postalCode: '110111'
      },
      items: [
        {
          name: 'Camiseta Selección Colombia 2024',
          quantity: 1,
          price: 89.99,
          size: 'L',
          team: 'Selección Colombia',
          year: '2024',
          category: 'Fútbol',
          img: 'https://example.com/colombia-jersey.jpg',
          ...(includeCustomization && {
            customName: 'JAMES',
            customNumber: '10'
          })
        },
        {
          name: 'Camiseta Real Madrid Home 2024',
          quantity: 2,
          price: 94.99,
          size: 'M',
          team: 'Real Madrid',
          year: '2024',
          category: 'Fútbol',
          img: 'https://example.com/realmadrid-jersey.jpg'
        },
        {
          name: 'Camiseta Argentina Copa América 2024',
          quantity: 1,
          price: 99.99,
          size: 'XL',
          team: 'Selección Argentina',
          year: '2024',
          category: 'Fútbol',
          img: 'https://example.com/argentina-jersey.jpg',
          ...(includeCustomization && {
            customName: 'MESSI',
            customNumber: '10'
          })
        }
      ],
      totals: {
        subtotal: includeCustomization ? 294.97 : 284.97,
        shipping: 15.00,
        discount: includeDiscount ? 30.00 : 0,
        total: includeCustomization 
          ? (includeDiscount ? 279.97 : 309.97)
          : (includeDiscount ? 269.97 : 299.97),
        totalCOP: includeCustomization 
          ? (includeDiscount ? 1119880 : 1239880)
          : (includeDiscount ? 1079880 : 1199880),
        exchangeRate: 4000
      },
      paymentMethod: paymentMethod
    }
  };

  console.log('📧 Enviando email de prueba...');
  console.log(`   Email: ${customerEmail}`);
  console.log(`   Nombre: ${customerName}`);
  console.log(`   Personalización: ${includeCustomization ? 'Sí' : 'No'}`);
  console.log(`   Descuento: ${includeDiscount ? 'Sí' : 'No'}`);
  console.log(`   Método de pago: ${paymentMethod}`);
  console.log('');

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/send-order-confirmation-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify(testOrder)
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Email enviado exitosamente!');
      console.log('   Revisa la bandeja de entrada de:', customerEmail);
      console.log('   (También revisa spam/promociones)');
    } else {
      console.error('❌ Error enviando email:');
      console.error('   Status:', response.status);
      console.error('   Error:', result);
    }

    return result;

  } catch (error) {
    console.error('❌ Error de conexión:');
    console.error('   ', error.message);
    throw error;
  }
}

// Función para probar múltiples escenarios
async function runAllTests() {
  console.log('🧪 Ejecutando suite completa de pruebas de emails\n');
  console.log('='.repeat(60));
  console.log('');

  const testEmail = 'tu-email@example.com'; // Cambia esto por tu email

  // Test 1: Pedido básico con PayPal
  console.log('TEST 1: Pedido básico con PayPal');
  console.log('-'.repeat(60));
  await sendTestEmail({
    customerEmail: testEmail,
    customerName: 'Juan Pérez',
    paymentMethod: 'paypal'
  });
  console.log('');
  await delay(2000);

  // Test 2: Pedido con personalización y Bold
  console.log('TEST 2: Pedido con personalización y Bold');
  console.log('-'.repeat(60));
  await sendTestEmail({
    customerEmail: testEmail,
    customerName: 'María García',
    includeCustomization: true,
    paymentMethod: 'bold'
  });
  console.log('');
  await delay(2000);

  // Test 3: Pedido con descuento y Wompi
  console.log('TEST 3: Pedido con descuento y Wompi');
  console.log('-'.repeat(60));
  await sendTestEmail({
    customerEmail: testEmail,
    customerName: 'Carlos López',
    includeDiscount: true,
    paymentMethod: 'wompi'
  });
  console.log('');
  await delay(2000);

  // Test 4: Pedido completo (personalización + descuento)
  console.log('TEST 4: Pedido completo (personalización + descuento)');
  console.log('-'.repeat(60));
  await sendTestEmail({
    customerEmail: testEmail,
    customerName: 'Ana Martínez',
    includeCustomization: true,
    includeDiscount: true,
    paymentMethod: 'paypal'
  });
  console.log('');

  console.log('='.repeat(60));
  console.log('✅ Suite de pruebas completada!');
  console.log(`📬 Revisa tu bandeja de entrada: ${testEmail}`);
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Menú interactivo
async function main() {
  console.log('\n🎯 Sistema de Pruebas de Emails\n');
  
  const args = Deno.args;
  
  if (args.length === 0) {
    console.log('Uso:');
    console.log('  deno run --allow-net --allow-env test-email.ts <email> [opciones]');
    console.log('');
    console.log('Opciones:');
    console.log('  --all              Ejecutar todas las pruebas');
    console.log('  --custom           Incluir personalización');
    console.log('  --discount         Incluir descuento');
    console.log('  --payment=<method> Método de pago (paypal, bold, wompi)');
    console.log('  --name=<name>      Nombre del cliente');
    console.log('');
    console.log('Ejemplos:');
    console.log('  deno run --allow-net --allow-env test-email.ts test@example.com');
    console.log('  deno run --allow-net --allow-env test-email.ts test@example.com --custom --discount');
    console.log('  deno run --allow-net --allow-env test-email.ts --all');
    Deno.exit(0);
  }

  if (args[0] === '--all') {
    await runAllTests();
    return;
  }

  const email = args[0];
  const includeCustomization = args.includes('--custom');
  const includeDiscount = args.includes('--discount');
  
  let paymentMethod: 'paypal' | 'bold' | 'wompi' = 'paypal';
  const paymentArg = args.find(arg => arg.startsWith('--payment='));
  if (paymentArg) {
    paymentMethod = paymentArg.split('=')[1] as any;
  }

  let customerName = 'Cliente Test';
  const nameArg = args.find(arg => arg.startsWith('--name='));
  if (nameArg) {
    customerName = nameArg.split('=')[1];
  }

  await sendTestEmail({
    customerEmail: email,
    customerName: customerName,
    includeCustomization,
    includeDiscount,
    paymentMethod
  });
}

if (import.meta.main) {
  main();
}