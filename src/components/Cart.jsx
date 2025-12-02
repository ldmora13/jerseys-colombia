import React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import AlertGlobal from './AlertGlobal';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

import { calculateShippingCost } from '../utils/shippingUtils';
import { calculateItemPrice, calculateSubtotal } from '../utils/priceCalculations';

import {
    ShoppingCart,
    X,
    Trash2,
    Plus,
    Minus,
    Package,
    Truck,
    CreditCard,
    Shield,
    CheckCircle,
    Tag,
    Gift,
    ExternalLink,
    ArrowRight,
    Sparkles
} from 'lucide-react';

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

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prev) => 
      prev.map((item, i) => i === index ? { ...item, quantity: newQuantity } : item)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleCart = () => {
    setCartVisible(false);
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      setCartVisible(false)
      navigate('/checkout');
    } else {
      setAlert({ 
        show: true, 
        message: "Añade productos al carrito antes de continuar", 
        severity: "error", 
        title: "Carrito vacío" 
      });
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
        return <> {producto.team} {producto.category} {producto.type} {producto.year}</>;
      default:
        return <> {producto.name}</>;
    }
  };

  const getShippingMessage = () => {
    if (totalProductCount >= 5) {
      return { text: "¡Envío GRATIS!", color: "from-green-500 to-emerald-600", icon: CheckCircle };
    } else {
      const remaining = 5 - totalProductCount;
      return { 
        text: `¡${remaining} más para envío gratis!`, 
        color: "from-orange-500 to-red-600",
        icon: Truck
      };
    }
  };

  const shippingInfo = getShippingMessage();
  const ShippingIcon = shippingInfo.icon;

  return (
    cartVisible && (
      <div className="fixed inset-0 z-[1000] flex items-start justify-end p-4 pt-5">
        <AlertGlobal alert={alert} setAlert={setAlert} />
        <AnimatePresence>
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[999]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCartVisible(false)}
              />

              {/* Cart Panel */}
              <motion.div
                ref={cartRef}
                className="relative w-full sm:w-[440px] max-h-[90dvh] flex flex-col bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl z-[1000] border border-white/20 overflow-hidden"
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Carrito</h2>
                        <p className="text-blue-100 text-sm">
                          {cartItems.length} producto{cartItems.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={toggleCart}
                      className='w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-300 group'>
                      <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                  </div>

                  {/* Clear Cart Button */}
                  {cartItems.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="w-full h-10 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      Vaciar Carrito
                    </button>
                  )}
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-blue-50 to-indigo-50">
                  {cartItems.length > 0 ? (
                    <div className="space-y-3">
                      {cartItems.map((producto, index) => {
                        const imagenPrincipal = producto.img?.length > 0 ? producto.img[producto.img.length - 1] : null;
                        const categoria = producto.deporte.toLowerCase();
                        
                        return (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            className="group bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100"
                          >
                            <div className="flex gap-4">
                              {/* Product Image */}
                              <Link 
                                to={`/${categoria}/${generarSlug(producto.name)}`} 
                                onClick={() => setCartVisible(false)} 
                                className="flex-shrink-0 relative"
                              >
                                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-md group-hover:scale-105 transition-transform duration-300">
                                  {imagenPrincipal && (
                                    <img src={imagenPrincipal} alt={producto.name} className="w-full h-full object-contain" />
                                  )}
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                  <span className="text-white font-bold text-xs">{producto.quantity}</span>
                                </div>
                              </Link>

                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <Link 
                                  to={`/${categoria}/${generarSlug(producto.name)}`} 
                                  onClick={() => setCartVisible(false)}
                                  className="block group-hover:text-blue-600 transition-colors duration-300"
                                >
                                  <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-1">
                                    {renderProductTitle(producto)}
                                  </h3>
                                </Link>

                                <div className="space-y-1 mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full font-semibold">
                                      {producto.category}
                                    </span>
                                    {producto.size && (
                                      <span className="text-xs text-gray-600 flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        {producto.size}
                                      </span>
                                    )}
                                  </div>
                                  {producto.customName && (
                                    <p className="text-xs text-purple-600 font-medium flex items-center gap-1">
                                      <Gift className="w-3 h-3" />
                                      {producto.customName} #{producto.customNumber}
                                    </p>
                                  )}
                                  {producto.competitionPatch && (
                                      <p className="text-xs text-blue-600 flex items-center gap-1 font-medium">
                                          🏆 Parche: {producto.competitionPatch}
                                      </p>
                                  )}
                                </div>

                                <div className="flex items-center justify-between">
                                  <p className="text-xl font-bold text-blue-600">
                                    ${calculateItemPrice(producto)}
                                  </p>

                                  {/* Quantity Controls */}
                                  <div className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-1">
                                    <button
                                      onClick={() => updateQuantity(index, producto.quantity - 1)}
                                      className="w-7 h-7 rounded-lg bg-white hover:bg-blue-50 flex items-center justify-center transition-colors duration-300 shadow-sm"
                                    >
                                      <Minus className="w-3 h-3 text-gray-700" />
                                    </button>
                                    <span className="w-8 text-center font-bold text-gray-800">{producto.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(index, producto.quantity + 1)}
                                      className="w-7 h-7 rounded-lg bg-white hover:bg-blue-50 flex items-center justify-center transition-colors duration-300 shadow-sm"
                                    >
                                      <Plus className="w-3 h-3 text-gray-700" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Delete Button */}
                              <button 
                                onClick={() => deleteItem(index)}
                                className='w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all duration-300 group/btn border border-red-200 flex-shrink-0'>
                                <Trash2 className="w-4 h-4 text-red-600 group-hover/btn:scale-110 transition-transform duration-300" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Empty Cart */
                    <div className="flex flex-col items-center justify-center h-full py-16">
                      <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                        <ShoppingCart className="w-16 h-16 text-blue-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">Carrito Vacío</h3>
                      <p className='text-gray-600 text-center mb-6 px-4'>
                        Agrega productos para comenzar tu compra
                      </p>
                      <button
                        onClick={() => setCartVisible(false)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center gap-2"
                      >
                        <Sparkles className="w-5 h-5" />
                        Explorar Productos
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer - Summary and Checkout */}
                {cartItems.length > 0 && (
                  <div className="bg-white border-t border-blue-100">
                    {/* Shipping Banner */}
                    <div className={`bg-gradient-to-r ${shippingInfo.color} p-4`}>
                      <div className="flex items-center gap-3 text-white">
                        <ShippingIcon className="w-6 h-6 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            {totalProductCount} producto{totalProductCount > 1 ? 's' : ''} en tu carrito
                          </p>
                          <p className="text-xs text-white/90">{shippingInfo.text}</p>
                        </div>
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div className="p-4 space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-gray-700">
                          <span className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Subtotal
                          </span>
                          <span className="font-semibold">${precioTotal.toFixed(2)} USD</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span className="flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            Envío
                          </span>
                          <span className={`font-semibold ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                            {shippingCost === 0 ? 'GRATIS' : `$${shippingCost.toFixed(2)} USD`}
                          </span>
                        </div>
                      </div>

                      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

                      {/* Total */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-700 font-bold text-lg">Total</span>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-800">
                              ${(precioTotal + shippingCost).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-600">USD</p>
                          </div>
                        </div>
                        {tasaCOP && (
                          <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                            <span className="text-gray-600 text-sm">En COP</span>
                            <span className="font-semibold text-gray-700 text-sm">
                              {((precioTotal + shippingCost) * tasaCOP).toLocaleString('es-CO', { 
                                style: 'currency', 
                                currency: 'COP' 
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Checkout Button */}
                      <button 
                        onClick={handleCheckout}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                      >
                        <CreditCard className="w-5 h-5" />
                        Proceder al Pago
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </>
          
        </AnimatePresence>
      </div>
    )
  );
};

export default Cart;