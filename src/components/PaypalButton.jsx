import React, { useEffect, useRef } from "react";

const PayPalButton = ({ orderId, amount, description, customerData, billingAddress, onSuccess, onError }) => {
  const paypalRef = useRef();

  useEffect(() => {
    if (!document.querySelector('script[src*="paypal.com/sdk/js"]')) {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;
      
      script.onload = () => {
        renderPayPalButton();
      };
      
      document.head.appendChild(script);

    } else {
      renderPayPalButton();
    }
  }, [orderId, amount]);

  const renderPayPalButton = () => {
    if (window.paypal && paypalRef.current) {
      paypalRef.current.innerHTML = '';
      
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal'
        },
        
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              reference_id: orderId,
              amount: {
                currency_code: 'USD',
                value: amount.toFixed(2)
              },
              description: description,
              shipping: {
                name: {
                  full_name: customerData.fullName
                },
                address: {
                  address_line_1: billingAddress.address,
                  admin_area_2: billingAddress.city,
                  admin_area_1: billingAddress.state,
                  postal_code: billingAddress.postalCode || '00000',
                  country_code: 'CO'
                }
              }
            }],
            payer: {
              name: {
                given_name: customerData.fullName.split(' ')[0] || customerData.fullName,
                surname: customerData.fullName.split(' ').slice(1).join(' ') || 'Cliente'
              },
              email_address: customerData.email
            }
          });
        },

        onApprove: async (data, actions) => {
          try {
            const order = await actions.order.capture();
            console.log('PayPal order captured:', order);
            
            if (onSuccess) {
              onSuccess(order, data);
            }
            
            window.location.href = `${window.location.origin}/checkout/success?paypal-tx-status=approved&paypal-order-id=${orderId}&paypal-transaction-id=${order.id}`;
            
          } catch (error) {
            console.error('Error capturing PayPal order:', error);
            if (onError) {
              onError(error);
            }
          }
        },

        onError: (err) => {
          console.error('PayPal error:', err);
          if (onError) {
            onError(err);
          }
          // Redirigir a página de error
          window.location.href = `${window.location.origin}/checkout/success?paypal-tx-status=failed&paypal-order-id=${orderId}`;
        },

        onCancel: (data) => {
          console.log('PayPal payment cancelled:', data);
          // Redirigir a página de cancelación
          window.location.href = `${window.location.origin}/checkout/success?paypal-tx-status=cancelled&paypal-order-id=${orderId}`;
        }

      }).render(paypalRef.current);
    }
  };

  return (
    <div>
      <div ref={paypalRef} style={{ minHeight: '50px' }}></div>
    </div>
  );
};

export default PayPalButton;