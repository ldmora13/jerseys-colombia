import React, { useEffect } from "react";


const BoldButton = ({ orderId, amount, description, integritySignature, customerData, billingAddress }) => {
  useEffect(() => {
    // Inyecta el script solo una vez
    if (!document.querySelector('script[src="https://checkout.bold.co/library/boldPaymentButton.js"]')) {
      const script = document.createElement("script");
      script.src = "https://checkout.bold.co/library/boldPaymentButton.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div>
      <script
        data-bold-button="dark-M"
        data-order-id={orderId}
        data-currency="COP"
        data-amount={amount}
        data-api-key={import.meta.env.VITE_BOLD_PUBLIC_KEY}
        data-integrity-signature={integritySignature}
        data-description={description}
        data-redirection-url="jerseyscol/checkout/success"
        data-customer-data={JSON.stringify(customerData)}
        data-billing-address={JSON.stringify(billingAddress)}
      />
    </div>
  );
};

export default BoldButton;
