import React, { useEffect } from "react";
import { Alert, AlertTitle } from "@mui/material";

const AlertGlobal = ({ alert, setAlert, autoHideDuration = 3000 }) => {
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert((prev) => ({ ...prev, show: false }));
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [alert.show, autoHideDuration, setAlert]);

  if (!alert.show) return null;

  return (
    <div className="fixed bottom-10 right-5  sm:left-[36%] z-[9999] w-[90%] sm:w-[400px]">
      <Alert
        severity={alert.severity || "info"}
        onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
        className="rounded-[16px]"
      >
        {alert.title && <AlertTitle>{alert.title}</AlertTitle>}
        {alert.message}
      </Alert>
    </div>
  );
};

export default AlertGlobal;
