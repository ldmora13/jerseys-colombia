import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import CryptoJS from 'crypto-js';
import BoldButton from '../components/BoldButton';
import { Loader2 } from 'lucide-react';
import { calculateShippingCost } from '../utils/shippingUtils';

const Checkout = () => {
    const { cartItems } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    const [itemsToCheckout, setItemsToCheckout] = useState([]);
    const [tasaCOP, setTasaCOP] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        address: '',
        city: '',
        country: 'Colombia',
        postalCode: '',
        phone: ''
    });
    const [paymentData, setPaymentData] = useState(null);
    const [isPreparing, setIsPreparing] = useState(false);

    const [user, setUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    const [subtotal, setSubtotal] = useState(0)

    const shippingCost = useMemo(() => {
        return calculateShippingCost(itemsToCheckout);
    }, [itemsToCheckout]);

    const totalProductCount = useMemo(() => {
        return itemsToCheckout.reduce((total, item) => total + (item.quantity || 1), 0);
    }, [itemsToCheckout]);

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

    useEffect(() => {
        if (location.state?.items) {
            setItemsToCheckout(location.state.items);
        } 
        else if (cartItems.length > 0) {
            setItemsToCheckout(cartItems);
        }
        else {
            navigate('/');
        }
    }, [location.state, cartItems, navigate]);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                setFormData((prev) => ({ 
                    ...prev, 
                    email: currentUser.email, 
                    fullName: currentUser.user_metadata?.full_name || '' 
                }));
            }
            setIsLoadingUser(false); 
        };

        getSession();
    }, []);

    useEffect(() => {
        if (!isLoadingUser && !user) {
            alert("Por favor, inicia sesión para continuar con la compra.");
        }
    }, [user, isLoadingUser]);

    useEffect(() => {
        const newSubtotal = itemsToCheckout.reduce((total, item) => {
            let itemPrice = item.price;
            if(item.customName || item.customNumber) { itemPrice += 5; }
            return total + itemPrice * item.quantity;
        }, 0);
        setSubtotal(newSubtotal);
    }, [itemsToCheckout]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePreparePayment = async () => {
        setIsPreparing(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-pending-order', {
                body: {
                    customerInfo: { ...formData, userId: user?.id },
                    itemsToCheckout,
                    subtotal,
                    shippingCost,
                    tasaCOP
                },
            });

            if (error) throw error;
            setPaymentData(data); 

        } catch (error) {
            console.error("Error al preparar el pago:", error);
            alert("Hubo un error al preparar tu orden. Por favor, intenta de nuevo.");
        } finally {
            setIsPreparing(false);
        }
    };

    const getShippingMessage = () => {
        if (totalProductCount >= 5) {
            return "¡Envío GRATIS!";
        } else if (totalProductCount === 4) {
            return "¡Solo 1 producto más para envío gratis!";
        } else if (totalProductCount === 3) {
            return "¡Solo 2 productos más para envío gratis!";
        } else if (totalProductCount === 2) {
            return "¡Solo 3 productos más para envío gratis!";
        } else {
            return "¡Solo 4 productos más para envío gratis!";
        }
    };

    if (isLoadingUser || itemsToCheckout.length === 0) {
        return <div className="flex items-center justify-center h-screen">Cargando...</div>;
    }

    return (
        <div className="h-min-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-45">
            <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
                <form className="flex flex-col lg:flex-row gap-12">
                    {/* Columna Izquierda: Formulario de Datos */}
                    <div className="w-full lg:w-2/3">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-6">Información de Contacto y Envío</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="sm:col-span-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                                    <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección de Envío</label>
                                    <input type="text" name="address" id="address" value={formData.address} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ciudad</label>
                                    <input type="text" name="city" id="city" value={formData.city} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                                </div>
                                <div>
                                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Código Postal</label>
                                    <input type="text" name="postalCode" id="postalCode" value={formData.postalCode} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                                    <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Resumen de la Orden */}
                    <div className="w-full lg:w-1/3">  
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-6">Resumen de tu Orden</h2>
                            <div className="space-y-4">
                                {itemsToCheckout.map(item => (
                                    <div key={`${item.name}-${item.size}-${item.customName}-${item.customNumber}`} className="flex items-center gap-4 border-b pb-4">
                                        <img src={item.img[0]} alt={item.name} className="w-20 h-20 object-contain rounded-md bg-gray-100" />
                                        <div className="flex-grow text-sm">
                                            <p className="font-semibold">
                                                {item.name.replace(/[_-]/g, " ")}
                                            </p>
                                            <p className="text-gray-600">Talla: {item.size}</p>
                                            {item.customName && <p className="text-gray-600">Nombre: {item.customName}</p>}
                                            {item.customNumber && <p className="text-gray-600">Número: {item.customNumber}</p>}
                                            <p className="text-gray-600">Cantidad: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold text-sm">${(item.price + ((item.customName || item.customNumber) ? 5 : 0)).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                             <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-700 font-medium">
                                    Total de productos: {totalProductCount}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    {getShippingMessage()}
                                </p>
                            </div>
                            <div className="mt-6 pt-6 border-t space-y-2">
                                <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)} USD</span></div>
                                <div className="flex justify-between">
                                    <span>Envío</span>
                                    <span className={shippingCost === 0 ? 'text-green-600 font-semibold' : ''}>
                                        {shippingCost === 0 ? 'GRATIS' : `$${shippingCost.toFixed(2)} USD`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center font-bold text-lg mt-5">
                                  <span>Total</span>
                                  <span className='flex flex-col items-center justify-center'>${(subtotal + shippingCost).toFixed(2)} USD 
                                    <span className='text-sm font-medium text-gray-500'>{tasaCOP ? ` ${((subtotal + shippingCost) * tasaCOP).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}` : ' (Cargando tasa...)'} COP </span>
                                  </span>
                                </div>
                            </div>
                             <div className='flex items-center justify-center mt-5'>
                                {!paymentData ? (
                                    <div className="w-full">
                                        <button type='button'
                                            onClick={handlePreparePayment} 
                                            disabled={isPreparing} 
                                            className='group relative w-full h-10 flex items-center justify-center bg-black hover:text-black text-white font-bold gap-2 cursor-pointer shadow-md overflow-hidden transition-all duration-300 active:translate-x-1 active:translate-y-1 before:content-[""] before:absolute before:w-full before:h-[130px] before:top-0 before:left-[-100%] before:bg-white before:transition-all before:duration-300 before:mix-blend-difference hover:before:transform hover:before:translate-x-full hover:before:-translate-y-1/2 hover:before:rounded-none'>
                                                <span className='relative z-10'>{isPreparing ? <Loader2 className="animate-spin" /> : 'Continuar al pago'}</span>
                                            <svg className='relative z-10 h-3 ' viewBox="0 0 576 512"><path className='fill-white group-hover:fill-black transition-colors duration-200' d="M512 80c8.8 0 16 7.2 16 16v32H48V96c0-8.8 7.2-16 16-16H512zm16 144V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V224H528zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm56 304c-13.3 0-24 10.7-24 24s10.7 24 24 24h48c13.3 0 24-10.7 24-24s-10.7-24-24-24H120zm128 0c-13.3 0-24 10.7-24 24s10.7 24 24 24H360c13.3 0 24-10.7 24-24s-10.7-24-24-24H248z"/></svg>
                                        </button>
                                    </div>
                                ) : (
                                    <BoldButton
                                        orderId={paymentData.orderId}
                                        amount={paymentData.amount}
                                        description="Compra en Jerseys Colombia"
                                        integritySignature={paymentData.integritySignature}
                                        customerData={
                                            { 
                                                email: formData.email, fullName: formData.fullName 
                                                }}
                                        billingAddress={{ address: formData.address, city: formData.city, country: "CO" }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;