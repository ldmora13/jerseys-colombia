import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from './Loader.jsx';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Puedes cambiar el tiempo (ms)

    return () => clearTimeout(timer);
  }, [location.pathname]); // Cada vez que cambia la ruta

  return (
    <>
      {loading ? <Loader /> : children}
    </>
  );
};

export default AppLayout;