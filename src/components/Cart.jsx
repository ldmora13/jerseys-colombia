import React from 'react'
import { useState, useEffect, useRef} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {useCart} from '../context/CartContext';

const Cart = ({ cartVisible, setCartVisible }) => {
  
    const { cartItems, setCartItems } = useCart();
    const navigate = useNavigate();
    const cartRef = useRef(null);

    const precioTotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    const [tasaCOP, setTasaCOP] = useState(null);

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
        setCartItems(prev => prev.filter((_, i) => i !== index));
    };
    
    const toggleCart = () => {
        setCartVisible(false);
    }

    const handleCheckout = () => {
        if (cartItems.length > 0) {
            navigate('/checkout');
        } else {
            alert('El carrito está vacío. Agrega productos antes de proceder al pago.');
        }
    }


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
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .trim();
  };
    

return (
  <div className="flex items-center justify-center w-full z-[1000]">
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
            className="fixed top-0 right-0 sm:w-1/4 lg:w-[350px] w-full h-full bg-[#E8E8E8] p-4 gap-4 gap-y-6 flex flex-col z-[1000] overflow-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center flex-row justify-start w-full p-2 gap-x-5">
                <svg className=" h-5 sm:ml-2 sm:h-6 cursor-pointer hover:scale-110 transition" role="button"
                  onClick={toggleCart} viewBox="0 0 24 24">
                  <path d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="#000000"></path>
                </svg>
                <h2 className="text-[16px] font-bold sm:text-2xl">Carrito</h2>  
              </div>

              <div className="mt-3 sm:mt-1 w-full h-[2px] bg-gradient-to-r from-transparent via-[#252525] to-transparent" />

              {/* Lista de productos */}
              {cartItems.map((camiseta, index) => {
                const imagenPrincipal = camiseta.img?.length > 0 ? camiseta.img[camiseta.img.length - 1] : null;
                return (
                    <div 
                        key={index}
                        className="mt-3 flex flex-row items-center border-2 rounded-2xl shadow p-2 gap-2 w-[90%] mx-auto cursor-pointer bg-white transform transition-all duration-300 ease-in-out hover:scale-110"
                    >
                        <Link to={`/${camiseta.category}/${generarSlug(camiseta.name)}`} className="flex items-center">
                            {imagenPrincipal && (
                                <img
                                    src={imagenPrincipal}
                                    alt={camiseta.name}
                                    className="w-[80px] h-[80px] object-contain rounded"
                                />
                            )}
                        </Link>
                        
                        <div className="relative flex flex-row items-center justify-start w-full">
                            <Link to={`/${camiseta.category}/${generarSlug(camiseta.name)}`} className="flex items-center">
                                <div className="flex flex-col items-start justify-start">
                                    <h2 className="font-bold text-sm">
                                        {camiseta.team} {camiseta.driver ? camiseta.driver : camiseta.year}
                                    </h2>
                                    <span className="text-xs text-gray-500">
                                        {camiseta.type} - ${camiseta.price} USD {camiseta.quantity < 2 ? '' : ` x ${camiseta.quantity}`}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {camiseta.size ? `Talla: ${camiseta.size}` : ''}
                                    </span>
                                </div>
                            </Link>

                            <svg 
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:scale-110 transition" 
                                role="button"
                                onClick={() => deleteItem(index)}
                                viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                            >
                                <path fillRule="evenodd" clipRule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="#000000"></path>
                            </svg>
                        </div>
                    </div>
                );
            })}

              {/* Total y botón */}
              <div className="absolute bottom-0 flex flex-col items-center justify-start mt-4 w-full">
                <div className="flex flex-row items-center justify-start w-full gap-2 bg-[#e0e0e0] rounded-t-2xl p-2 shadow-lg">
                  <p className='text-[14px] sm:text-[16px]'>Tu compra: ${precioTotal} USD</p>
                  <p className="text-gray-500 italic text-[10px] sm:text-[12px] ml-2">
                    {tasaCOP
                      ? `= ${(precioTotal * tasaCOP).toLocaleString('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                        })}`
                      : ' (Cargando tasa...)'} COP
                  </p>
                </div>
                <div className="w-full">
                  <button
                    className="bg-[#292F36] text-white w-full px-4 py-2 hover:bg-[#1a1a1a] transition"
                    onClick={handleCheckout}
                  >
                    {cartItems.length > 0 ? 'Proceder al pago' : 'Carrito vacío'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </div>
)}

export default Cart