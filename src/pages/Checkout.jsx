import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { calculateShippingCost } from '../utils/shippingUtils';
import { calculateItemPrice, calculateSubtotal } from '../utils/priceCalculations';

import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';

import AlertGlobal from '../components/AlertGlobal';
import BoldButton from '../components/BoldButton';
import PayPalButton from '../components/PayPalButton';

import { Loader2, User, CreditCard } from 'lucide-react';


const Checkout = () => {

    const [alert, setAlert] = useState({
        show: false,
        message: '',
        severity: '',
        title: ''
    });
    
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
        state: '',
        country: 'Colombia',
        postalCode: '',
        phone: ''
    });
    const [paymentData, setPaymentData] = useState(null);
    const [isPreparing, setIsPreparing] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bold');

    const [user, setUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    const [subtotal, setSubtotal] = useState(0)

    const shippingCost = useMemo(() => {
        return calculateShippingCost(itemsToCheckout);
    }, [itemsToCheckout]);

    const totalProductCount = useMemo(() => {
        return itemsToCheckout.reduce((total, item) => total + (item.quantity || 1), 0);
    }, [itemsToCheckout]);

    const isFormValid = () => {
        return (
            formData.email.trim() &&
            formData.fullName.trim() &&
            formData.address.trim() &&
            formData.city.trim() &&
            formData.state.trim() &&
            formData.country.trim() &&
            formData.postalCode.trim() &&
            formData.phone.trim()
        );
    };

    const isEmailValid = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

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
        const newSubtotal = itemsToCheckout.reduce((total, item) => {
            const itemPrice = calculateItemPrice(item);
            return total + itemPrice * item.quantity;
        }, 0);
        setSubtotal(newSubtotal);
    }, [itemsToCheckout]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePreparePayment = async () => {
        if (!isFormValid()) {
            setAlert({
                show: true,
                message: "Por favor completa todos los campos antes de continuar.",
                severity: "error",
            });
        return;
        }
        
        if (!isEmailValid(formData.email)) {
            setAlert({
                show: true,
                message: "Por favor ingresa un email válido.",
                severity: "error",
            });
            return;
        }   

        setIsPreparing(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-pending-order', {
                body: {
                    customerInfo: { ...formData, userId: user?.id },
                    itemsToCheckout,
                    subtotal,
                    shippingCost,
                    tasaCOP,
                    paymentMethod: selectedPaymentMethod
                },
            });

            if (error) throw error;
            setPaymentData(data); 

        } catch (error) {
            console.error("Error al preparar el pago:", error);
            setAlert({
                show: true,
                message: "Inicia sesión para continuar con la compra.",
                severity: "error",
            });
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

    const handlePayPalSuccess = (order, data) => {
        console.log('PayPal payment successful:', order);
    };

    const handlePayPalError = (error) => {
        console.error('PayPal payment error:', error);
        setAlert({
            show: true,
            message: "Error al procesar el pago con PayPal. Por favor intenta nuevamente.",
            severity: "error",
        });
    };

    if (isLoadingUser || itemsToCheckout.length === 0) {
        return <div className="flex items-center justify-center h-screen">Cargando...</div>;
    }

    return (
        <div className="min-h-screen">
            <div className='relative'>
                <AlertGlobal alert={alert} setAlert={setAlert}/>
            </div>
            {user != null ? (
                <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
                    <form className="flex flex-col lg:flex-row gap-12">
                        {/* Columna Izquierda: Formulario de Datos */}
                        <div className="w-full lg:w-2/3 bg-gradient-to-br from-blue-100 to-indigo-200 p-8 rounded-lg shadow-md text-black">
                            <div className="pb-12">

                                <h2 className="text-lg font-semibold text-black">Información personal</h2>
                                <p className="mt-1 text-sm/6 text-gray-500">Use datos verídicos donde pueda recibir sus compras</p>
                                
                                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div className="sm:col-span-4">
                                        <label htmlFor="first-name" className="block text-sm/6 font-medium ">Nombre completo</label>
                                        <div className="mt-2">
                                            <input id='first-name' type='text' name='fullName' value={formData.fullName} onChange={handleInputChange} className="block w-full rounded-md bg-white/50 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"/>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label htmlFor="phone" className="block text-sm/6 font-medium">Número de teléfono</label>
                                        <div className="mt-2">
                                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange}  className="block w-full rounded-md bg-white/50 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"/>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-4">
                                        <label htmlFor="email" className="block text-sm/6 font-medium">Email</label>
                                        <div className="mt-2">
                                            <input id="email" type="email" name="email" value={formData.email} onChange={handleInputChange} className="block w-full rounded-md bg-white/50 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"/>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2 sm:col-start-1">
                                        <label htmlFor="city" className="block text-sm/6 font-medium">Ciudad / Municipio</label>
                                        <div className="mt-2">
                                            <input id="city" type="text" name="city" value={formData.city} onChange={handleInputChange}  className="block w-full rounded-md bg-white/50 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="region" className="block text-sm/6 font-medium">Departamento</label>
                                        <div className="mt-2">
                                            <input id="region" type="text" name="state" value={formData.state} onChange={handleInputChange} className="block w-full rounded-md bg-white/50 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="postal-code" className="block text-sm/6 font-medium">Código postal</label>
                                        <div className="mt-2">
                                            <input type="text" name="postalCode" id="postalCode" value={formData.postalCode} onChange={handleInputChange} className="block w-full rounded-md bg-white/50 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="country" className="block text-sm/6 font-medium">País</label>
                                        <div className="mt-2 grid grid-cols-1">
                                            <select id="country" name="country" className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/50 py-1.5 pr-8 pl-3 text-base outline-1 -outline-offset-1 outline-white/10 *:bg-gray-800 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6">
                                                <option>Colombia</option>
                                            </select>
                                            <svg viewBox="0 0 16 16" fill="currentColor" data-slot="icon" aria-hidden="true" className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4">
                                            <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label htmlFor="street-address" className="block text-sm/6 font-medium">Dirección</label>
                                        <div className="mt-2">
                                            <input id="street-address" type="text" name="address" autoComplete="street-address" value={formData.address} onChange={handleInputChange} className="block w-full rounded-md bg-white/50 px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sección de selección de método de pago */}
                            <div className="border-t pt-8">
                                <h3 className="text-lg font-semibold text-black mb-4">Método de pago</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <input
                                            id="bold-payment"
                                            name="payment-method"
                                            type="radio"
                                            value="bold"
                                            checked={selectedPaymentMethod === 'bold'}
                                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                        <label htmlFor="bold-payment" className="ml-3 flex items-center">
                                            <CreditCard className="h-5 w-5 mr-2" />
                                            <span className="text-sm font-medium text-gray-900">Tarjeta de Crédito/Débito (Bold)</span>
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="paypal-payment"
                                            name="payment-method"
                                            type="radio"
                                            value="paypal"
                                            checked={selectedPaymentMethod === 'paypal'}
                                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                        <label htmlFor="paypal-payment" className="ml-3 flex items-center">
                                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="#003087">
                                                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a.5.5 0 0 1-.5-.5v-.5c0-.276.224-.5.5-.5s.5.224.5.5v.5a.5.5 0 0 1-.5.5z"/>
                                            </svg>
                                            <span className="text-sm font-medium text-gray-900">PayPal</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Resumen de la Orden */}
                        <div className="w-full lg:w-1/3">  
                            <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-6 rounded-lg shadow-md">
                                <h2 className="text-2xl font-semibold mb-6">Resumen de tu Orden</h2>
                                <div className="space-y-4">
                                    {itemsToCheckout.map(item => (
                                        <div key={`${item.name}-${item.size}-${item.customName}-${item.customNumber}`} className="flex items-center gap-4 border-b pb-4">
                                            <img src={item.img && item.img.length > 0 ? item.img[item.img.length - 1] : 'https://via.placeholder.com/50'} className="w-20 h-20 object-contain rounded-md bg-blue-50" />
                                            <div className="flex-grow text-sm">
                                                <p className="font-semibold">
                                                    {item.name.replace(/[_-]/g, " ")}
                                                </p>
                                                <p className="text-gray-600">Talla: {item.size}</p>
                                                {item.customName && <p className="text-gray-600">Nombre: {item.customName}</p>}
                                                {item.customNumber && <p className="text-gray-600">Número: {item.customNumber}</p>}
                                                <p className="text-gray-600">Cantidad: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold text-sm">${calculateItemPrice(item).toFixed(2)}</p>
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
                                            {shippingCost === 0 ? 'GRATIS' : `${shippingCost.toFixed(2)} USD`}
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
                                        <div className="w-full space-y-4">
                                            {selectedPaymentMethod === 'bold' ? (
                                                <BoldButton
                                                    orderId={paymentData.orderId}
                                                    amount={paymentData.amount}
                                                    description="Compra en Jerseys Colombia"
                                                    integritySignature={paymentData.integritySignature}
                                                    customerData={
                                                        { 
                                                            email: formData.email, 
                                                            fullName: formData.fullName 
                                                        }}
                                                    billingAddress={{ 
                                                        address: formData.address, 
                                                        city: formData.city, 
                                                        state: formData.state, 
                                                        country: "CO" 
                                                    }}
                                                />
                                            ) : (
                                                <PayPalButton
                                                    orderId={paymentData.orderId}
                                                    amount={subtotal + shippingCost}
                                                    description="Compra en Jerseys Colombia"
                                                    customerData={{
                                                        email: formData.email,
                                                        fullName: formData.fullName
                                                    }}
                                                    billingAddress={{
                                                        address: formData.address,
                                                        city: formData.city,
                                                        state: formData.state,
                                                        postalCode: formData.postalCode,
                                                        country: "CO"
                                                    }}
                                                    onSuccess={handlePayPalSuccess}
                                                    onError={handlePayPalError}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-md min-h-screen">
                    <User className="w-16 h-16 mt-20 mx-auto text-black" />
                    <h2 className="mt-4 text-2xl font-semibold">Debes iniciar sesión</h2>
                    <p className="text-gray-600 mt-2">Para que tus pagos sean seguros, lo mejor es inciar sesión</p>
                    <div className="mt-6 flex justify-center w-1/2 mx-auto">
                        <button onClick={() => navigate('/')} className='group relative w-full h-10 flex items-center justify-center bg-black hover:text-black text-white font-bold gap-2 cursor-pointer shadow-md overflow-hidden transition-all duration-300 active:translate-x-1 active:translate-y-1 before:content-[""] before:absolute before:w-full before:h-[130px] before:top-0 before:left-[-100%] before:bg-white before:transition-all before:duration-300 before:mix-blend-difference hover:before:transform hover:before:translate-x-full hover:before:-translate-y-1/2 hover:before:rounded-none'>
                            <span className='relative z-10'>Regresar</span>
                        </button>
                    </div>
                </div>
            )}
           
        </div>
    );
};

export default Checkout;