import React, { useEffect } from "react";

const OrderTracker = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.ordertracker.com/sdk.js";
    script.async = true;
    script.onload = () => {
      window.Ordertracker({
        id: "682d168c3ac43b037281bc8a",
        // trackingNumber: "COLOCA_AQUI_UN_NUMERO"  
      }).render("#ordertracker-widget");
    };
    document.body.appendChild(script);
  }, []);

  return <div id="ordertracker-widget" className="w-full min-h-[400px]"></div>;
};

export default OrderTracker;
