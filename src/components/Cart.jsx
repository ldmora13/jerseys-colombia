import React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import AlertGlobal from './AlertGlobal';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

import { calculateShippingCost } from '../utils/shippingUtils';
import { calculateItemPrice, calculateSubtotal } from '../utils/priceCalculations';

const Cart = ({ cartVisible, setCartVisible }) => {
  const { cartItems, setCartItems } = useCart();
  const navigate = useNavigate();
  const cartRef = useRef(null);

  const precioTotal = cartItems.reduce(
    (acc, item) => acc + calculateItemPrice(item) * (item.quantity || 1),
    0
  );

  const shippingCost = useMemo(() => {
    return calculateShippingCost(cartItems);
  }, [cartItems]);

  const totalProductCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  }, [cartItems]);

  const [tasaCOP, setTasaCOP] = useState(null);

  const [alert, setAlert] = useState({
    show: false,
    message: '', 
    severity: '', 
    title: '' 
  });

  useEffect(() => {
    const fetchTasa = async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await res.json();
        setTasaCOP(data.rates.COP);
      } catch (err) {
        console.error('Error obteniendo tasa de cambio:', err);
      }
    };
    fetchTasa();
    const interval = setInterval(fetchTasa, 300000);
    return () => clearInterval(interval);
  }, []);

  const deleteItem = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleCart = () => {
    setCartVisible(false);
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      setCartVisible(false)
      navigate('/checkout');
    } else {
      setAlert({ show: true, message: "Añade productos al carrito antes de continuar", severity: "error", title: "Carrito vacío" });
            return;
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        cartVisible &&
        cartRef.current &&
        !cartRef.current.contains(event.target)
      ) {
        setCartVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [cartVisible, setCartVisible]);

  const generarSlug = (str) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .trim();
  };

  const renderProductTitle = (producto) => {
    switch (producto.deporte) {
      case 'NBA':
        return <>{producto.team} {producto.player ? producto.player : producto.year}</>;
      case 'F1':
        return <>{producto.team} {producto.driver ? producto.driver : producto.year}</>;
      case 'futbol':
        return <> {producto.team} {producto.year}</>;
      default:
        return <> {producto.name}</>;
    }
  };

  const getShippingMessage = () => {
    if (totalProductCount >= 5) {
      return "Envío GRATIS";
    } else if (totalProductCount === 4) {
      return "¡1 más para envío gratis!";
    } else if (totalProductCount === 3) {
      return "¡2 más para envío gratis!";
    } else if (totalProductCount === 2) {
      return "¡3 más para envío gratis!";
    } else if (totalProductCount === 1) {
      return "¡4 más para envío gratis!";
    } else {
      return "";
    }
  };

  return (
    <div className="flex items-center justify-center w-full z-[1000] overflow-hidden">
      <AlertGlobal alert={alert} setAlert={setAlert} />
      <AnimatePresence>
        {cartVisible && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[900]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartVisible(false)}
            />

            <motion.div
              ref={cartRef}
              className="fixed top-0 right-0 sm:w-1/4 lg:w-[350px] w-full h-full bg-[#fafbfb] p-4 gap-4 gap-y-6 flex flex-col z-[1000] overflow-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex flex-col items-center overflow-auto pb-20">
                <div className="flex items-center flex-row justify-start w-full p-2 gap-x-5 mt-2">
                  <svg className="h-5 sm:ml-2 sm:h-6 cursor-pointer hover:scale-110 transition" role="button" onClick={toggleCart} viewBox="0 0 24 24">
                    <path d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="#000000"></path>
                  </svg>
                  <h2 className="text-lg font-bold sm:text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Carrito</h2>
                </div>

                <div className="mt-7 mb-2 w-full h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>

                {/* Lista de productos */}
                {cartItems.map((producto, index) => { // CAMBIO: camiseta -> producto
                  const imagenPrincipal = producto.img?.length > 0 ? producto.img[producto.img.length - 1] : null;
                  const categoria = producto.deporte.toLowerCase();
                  return (
                    <div key={index} className="mt-3 flex flex-row items-center border-2 rounded-2xl shadow p-2 gap-2 w-full bg-blue-50 mx-auto cursor-pointer">
                      <Link to={`/${categoria}/${generarSlug(producto.name)}`} onClick={() => setCartVisible(false)} className="flex items-center">
                        {imagenPrincipal && (
                          <img src={imagenPrincipal} alt={producto.name} className="w-[80px] h-[80px] object-contain rounded-2xl" />
                        )}
                      </Link>

                      <div className="relative flex flex-row items-center justify-start w-full overflow-auto">
                        <Link to={`/${categoria}/${generarSlug(producto.name)}`} onClick={() => setCartVisible(false)} className="flex items-center">
                          <div className="flex flex-col items-start justify-start">
                            <h2 className="font-bold text-sm capitalize">
                              {renderProductTitle(producto)}
                            </h2>
                            <span className="text-xs text-gray-500 capitalize">
                              {producto.category} - ${calculateItemPrice(producto)} USD {producto.quantity < 2 ? '' : ` x ${producto.quantity}`}
                            </span>
                            <span className="text-xs text-gray-500">
                              {producto.size ? `Talla: ${producto.size}` : ''}
                            </span>
                            {producto.customName ? (
                              <span className="text-xs text-gray-500">{`Custom: ${producto.customName} ${producto.customNumber}`}</span>
                            ) : (
                              ''
                            )}
                          </div>
                        </Link>

                        <svg className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:scale-110 transition" role="button" onClick={() => deleteItem(index)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="#000000"></path>
                        </svg>
                      </div>
                    </div>
                  );
                })}

                {/* Total y botón */}
                <div className="absolute bottom-0 flex flex-col items-center justify-start mt-4 w-full">
                  {/* Información de envío */}
                  {cartItems.length > 0 && (
                    <div className="w-full bg-blue-100 rounded-t-lg p-2 border-b border-blue-200">
                      <div className="flex flex-col items-center text-xs">
                        <p className="text-blue-700 font-medium">
                          Productos: {totalProductCount} | Envío: {shippingCost === 0 ? 'GRATIS' : `$${shippingCost} USD`}
                        </p>
                        <p className="text-blue-600 text-xs mt-1">
                          {getShippingMessage()}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-row items-center justify-start w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 p-2 shadow-lg">
                    <p className="text-sm md:text-lg font-bold text-white">
                      Tu compra: ${(precioTotal + shippingCost)} USD
                    </p>
                    <p className="text-gray-200 italic text-[10px] sm:text-xs ml-2">
                      {tasaCOP
                        ? `= ${((precioTotal + shippingCost) * tasaCOP).toLocaleString('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                          })}`
                        : ' (Cargando tasa...)'} COP
                    </p>
                  </div>
                  <div className="w-full">
                    <button onClick={handleCheckout} className='group relative w-full h-10 flex items-center justify-center bg-white text-black font-bold gap-2 cursor-pointer shadow-md overflow-hidden '>
                      <span className='relative z-10'>Pagar</span>
                      <svg className='relative z-10 h-3 ' viewBox="0 0 576 512"><path className='fill-black' d="M512 80c8.8 0 16 7.2 16 16v32H48V96c0-8.8 7.2-16 16-16H512zm16 144V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V224H528zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm56 304c-13.3 0-24 10.7-24 24s10.7 24 24 24h48c13.3 0 24-10.7 24-24s-10.7-24-24-24H120zm128 0c-13.3 0-24 10.7-24 24s10.7 24 24 24H360c13.3 0 24-10.7 24-24s-10.7-24-24-24H248z"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;