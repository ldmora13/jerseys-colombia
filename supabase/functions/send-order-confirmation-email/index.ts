import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  customName?: string;
  customNumber?: string;
  team?: string;
  year?: string;
  img?: string;
}

interface Customer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface EmailRequest {
  orderId: string;
  customerEmail: string;
  orderDetails: {
    customer: Customer;
    items: OrderItem[];
    totals: {
      subtotal: number;
      shipping: number;
      discount: number;
      total: number;
      totalCOP?: number;
      exchangeRate?: number;
    };
    paymentMethod: string;
  };
}

function generateEmailHTML(data: EmailRequest): string {
  const { orderId, orderDetails } = data;
  const { customer, items, totals, paymentMethod } = orderDetails;

  const itemsHTML = items.map(item => {
    const hasCustomization = item.customName || item.customNumber;
    const customizationCost = hasCustomization ? 5 : 0;
    
    return `
    <tr>
      <td style="padding: 20px 15px; border-bottom: 1px solid #f0f0f0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 80px; vertical-align: top;">
              <img src="${item.img[item.img.length - 1] }" 
                  alt="${item.name}" 
                  style="width:70px;height:70px;object-fit:cover;border-radius:8px;border:1px solid #e0e0e0;" />
            </td>
            <td style="padding-left: 15px; vertical-align: top;">
              <p style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 15px; font-weight: 600; line-height: 1.4;">${item.name}</p>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${item.size ? `<span style="display: inline-block; background-color: #f3f4f6; color: #4b5563; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500;">📏 Talla: ${item.size}</span>` : ''}
                ${item.team ? `<span style="display: inline-block; background-color: #ede9fe; color: #6b21a8; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500;">🏆 ${item.team}</span>` : ''}
                ${item.year ? `<span style="display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500;">📅 ${item.year}</span>` : ''}
              </div>
              ${hasCustomization ? `<div style="margin-top: 10px; padding: 8px 12px; background-color: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px;"><p style="margin: 0; color: #92400e; font-size: 12px; font-weight: 600;">✨ PERSONALIZACIÓN (+$${customizationCost.toFixed(2)})</p>${item.customName ? `<p style="margin: 4px 0 0 0; color: #78350f; font-size: 12px;">Nombre: <strong>${item.customName}</strong></p>` : ''}${item.customNumber ? `<p style="margin: 4px 0 0 0; color: #78350f; font-size: 12px;">Número: <strong>${item.customNumber}</strong></p>` : ''}</div>` : ''}
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top: 15px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #6b7280; font-size: 13px;">Cantidad: <strong style="color: #1a1a1a;">${item.quantity}</strong></td>
                  <td style="text-align: right;"><span style="color: #667eea; font-size: 16px; font-weight: 700;">$${(item.price + customizationCost).toFixed(2)}</span></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    `;
  }).join('');

  const paymentMethodInfo = {
    'paypal': { name: 'PayPal', icon: '💳', color: '#0070ba' },
    'bold': { name: 'Bold (Tarjeta)', icon: '💳', color: '#667eea' },
    'wompi': { name: 'Wompi (Tarjeta)', icon: '💳', color: '#00d4ff' }
  }[paymentMethod] || { name: paymentMethod, icon: '💳', color: '#667eea' };

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Pedido #${orderId}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 40px; text-align: center;">
              <div style="margin-bottom: 20px;">
                <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; border-radius: 50%; line-height: 80px;">
                  <span style="font-size: 40px;">✓</span>
                </div>
              </div>
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 32px; font-weight: 700;">¡Pedido Confirmado!</h1>
              <p style="color: rgba(255, 255, 255, 0.95); margin: 0; font-size: 16px;">Gracias por tu compra, ${customer.fullName.split(' ')[0]}</p>
            </td>
          </tr>

          <!-- Order ID -->
          <tr>
            <td style="padding: 30px 40px 20px 40px;">
              <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 12px; padding: 20px; text-align: center; border: 2px dashed #d1d5db;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; font-weight: 600;">NÚMERO DE PEDIDO</p>
                <p style="margin: 0; color: #1a1a1a; font-size: 20px; font-weight: 700; font-family: 'Courier New', monospace;">${orderId}</p>
              </div>
            </td>
          </tr>

          <!-- Welcome Message -->
          <tr>
            <td style="padding: 20px 40px 30px 40px;">
              <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 0 0 12px 0;"><strong>¡Hola ${customer.fullName}!</strong></p>
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0;">Tu pedido ha sido confirmado y está siendo procesado. Te notificaremos cuando sea enviado con un número de seguimiento.</p>
            </td>
          </tr>

          <!-- Products -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="border-top: 2px solid #f3f4f6; padding-top: 30px;">
                <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 20px 0; font-weight: 700;">📦 Productos</h2>
                <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                  <tbody>${itemsHTML}</tbody>
                </table>
              </div>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 25px;">
                <h3 style="color: #1a1a1a; font-size: 16px; margin: 0 0 20px 0; font-weight: 700;">💰 Resumen del Pedido</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Subtotal</td>
                    <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-size: 14px; font-weight: 600;">$${totals.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Envío</td>
                    <td style="padding: 10px 0; text-align: right; color: #1a1a1a; font-size: 14px; font-weight: 600;">$${totals.shipping.toFixed(2)}</td>
                  </tr>
                  ${totals.discount > 0 ? `
                  <tr>
                    <td style="padding: 10px 0; color: #059669; font-size: 14px; font-weight: 600;">🎉 Descuento</td>
                    <td style="padding: 10px 0; text-align: right; color: #059669; font-size: 14px; font-weight: 700;">-$${totals.discount.toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td colspan="2" style="padding: 18px 0 15px 0; border-top: 2px solid #e5e7eb;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="color: #1a1a1a; font-size: 18px; font-weight: 700;">Total</td>
                          <td style="text-align: right;">
                            <div style="color: #667eea; font-size: 24px; font-weight: 800;">$${totals.total.toFixed(2)} USD</div>
                            ${totals.totalCOP ? `<div style="color: #9ca3af; font-size: 13px; margin-top: 4px;">(${Math.round(totals.totalCOP).toLocaleString('es-CO')} COP)</div>` : ''}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Shipping & Payment Info -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 50%; vertical-align: top; padding-right: 10px;">
                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                      <h3 style="color: #1a1a1a; font-size: 14px; margin: 0 0 15px 0; font-weight: 700;">📍 Envío</h3>
                      <p style="color: #4b5563; font-size: 13px; line-height: 1.6; margin: 0;">
                        <strong style="color: #1a1a1a;">${customer.fullName}</strong><br>
                        ${customer.address}<br>
                        ${customer.city}, ${customer.state}<br>
                        ${customer.postalCode}<br>
                        ${customer.country}<br>
                        <span style="color: #667eea;">📞 ${customer.phone}</span>
                      </p>
                    </div>
                  </td>
                  <td style="width: 50%; vertical-align: top; padding-left: 10px;">
                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                      <h3 style="color: #1a1a1a; font-size: 14px; margin: 0 0 15px 0; font-weight: 700;">${paymentMethodInfo.icon} Pago</h3>
                      <div style="background-color: white; border-radius: 8px; padding: 12px; border: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #1a1a1a; font-size: 14px; font-weight: 600;">${paymentMethodInfo.name}</p>
                        <p style="margin: 8px 0 0 0; color: #059669; font-size: 12px; font-weight: 600;">✓ Pago Completado</p>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); border-radius: 12px; padding: 25px;">
                <h3 style="color: #5b21b6; font-size: 16px; margin: 0 0 15px 0; font-weight: 700;">📋 Próximos Pasos</h3>
                <ol style="margin: 0; padding-left: 20px; color: #6b21a8; font-size: 14px; line-height: 1.8;">
                  <li>Estamos preparando tu pedido</li>
                  <li>Te enviaremos un email cuando sea despachado</li>
                  <li>Recibirás el número de seguimiento</li>
                  <li>¡Disfruta tus productos!</li>
                </ol>
              </div>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <div style="text-align: center; padding: 30px 20px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb;">
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">¿Tienes preguntas sobre tu pedido?</p>
                <a href="mailto:soporte@jerseyscol.com" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 14px;">Contáctanos</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 30px 40px; text-align: center;">
              <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0 0 15px 0;">© ${new Date().getFullYear()} Jerseys Colombia. Todos los derechos reservados.</p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">Este es un email automático, por favor no respondas a este mensaje.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const emailData: EmailRequest = await req.json();

    console.log('📧 Preparando email de confirmación para:', emailData.customerEmail);

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY no está configurado');
    }

    const htmlContent = generateEmailHTML(emailData);
    
    console.log('📝 HTML generado, tamaño:', htmlContent.length, 'caracteres');
    console.log('🚀 Enviando email via Resend...');

    // Enviar email usando Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Jerseys Colombia <soporte@jerseyscol.com>',
        to: emailData.customerEmail,
        subject: `Confirmación de Pedido #${emailData.orderId}`,
        html: htmlContent,
        reply_to: 'soporte@jerseyscol.com'
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Error de Resend:', result);
      throw new Error(`Error de Resend: ${JSON.stringify(result)}`);
    }

    console.log('✅ Email enviado exitosamente via Resend');
    console.log('📬 Email ID:', result.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email enviado correctamente',
        emailId: result.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})