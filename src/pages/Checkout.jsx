import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { calculateShippingCost } from '../utils/shippingUtils';
import { calculateItemPrice, calculateSubtotal } from '../utils/priceCalculations';

import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';

import AlertGlobal from '../components/AlertGlobal';

import BoldButton from '../components/BoldButton';
import PayPalButton from '../components/PaypalButton';
import WompiButton from '../components/WompiButton';

import {
    Loader2, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    CreditCard, 
    ShoppingBag, 
    Truck,
    CheckCircle,
    Package,
    Gift,
    Shield,
    Lock,
    ChevronRight,
    IdCard,
    Tag,
    Check,
    X
} from 'lucide-react';

import LogoBancolombia from '../assets/LogoBancolombia.png';


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
        typeLegalId: '',
        legalId: '',
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

    const [discountCode, setDiscountCode] = useState('');
    const [isValidatingCode, setIsValidatingCode] = useState(false);
    const [appliedDiscount, setAppliedDiscount] = useState(null);

    const shippingCost = useMemo(() => {
        return calculateShippingCost(itemsToCheckout);
    }, [itemsToCheckout]);

    const totalProductCount = useMemo(() => {
        return itemsToCheckout.reduce((total, item) => total + (item.quantity || 1), 0);
    }, [itemsToCheckout]);

    const discountAmount = appliedDiscount?.discountAmount || 0;
    const finalTotal = Math.max(0, subtotal + shippingCost - discountAmount);

    const isFormValid = () => {
        const basicValidation = (
            formData.email.trim() &&
            formData.fullName.trim() &&
            formData.address.trim() &&
            formData.city.trim() &&
            formData.state.trim() &&
            formData.country.trim() &&
            formData.postalCode.trim() &&
            formData.phone.trim()
        );
        
        if (selectedPaymentMethod === 'wompi') {
            return basicValidation && 
                formData.typeLegalId.trim() && 
                formData.legalId.trim();
        }
    
    return basicValidation;
};

    const isEmailValid = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateDiscountCode = async () => {
        if (!discountCode.trim()) {
            setAlert({
                show: true,
                message: "Por favor ingresa un código de descuento",
                severity: "warning",
            });
            return;
        }

        setIsValidatingCode(true);
        try {
            const { data, error } = await supabase.functions.invoke('validate-discount-code', {
                body: {
                    code: discountCode.toUpperCase(),
                    subtotal: subtotal,
                    userId: user?.id
                }
            });

            if (error) throw error;

            if (data.valid) {
                setAppliedDiscount(data);
                setAlert({
                    show: true,
                    message: data.message || "¡Código aplicado correctamente!",
                    severity: "success",
                });
            } else {
                setAlert({
                    show: true,
                    message: data.message || "Código no válido",
                    severity: "error",
                });
            }
        } catch (error) {
            console.error("Error validating discount code:", error);
            setAlert({
                show: true,
                message: "Error al validar el código. Intenta nuevamente.",
                severity: "error",
            });
        } finally {
            setIsValidatingCode(false);
        }
    };

    const removeDiscountCode = () => {
        setAppliedDiscount(null);
        setDiscountCode('');
        setAlert({
            show: true,
            message: "Código de descuento removido",
            severity: "info",
        });
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
            let message = "Por favor completa todos los campos antes de continuar.";
            
            if (selectedPaymentMethod === 'wompi' && (!formData.typeLegalId || !formData.legalId)) {
                message = "Para pagar con Wompi debes ingresar tu documento de identidad.";
            }
            
            setAlert({
                show: true,
                message: message,
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
        
        const cleanPhone = formData.phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            setAlert({
                show: true,
                message: "Por favor ingresa un número de teléfono válido (mínimo 10 dígitos).",
                severity: "error",
            });
            return;
        }
        
        // Validar documento de identidad para Wompi
        if (selectedPaymentMethod === 'wompi') {
            if (!formData.legalId || formData.legalId.length < 6) {
                setAlert({
                    show: true,
                    message: "Por favor ingresa un número de documento válido.",
                    severity: "error",
                });
                return;
            }
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
            return { text: "¡Envío GRATIS!", color: "from-green-500 to-emerald-600" };
        } else {
            const remaining = 5 - totalProductCount;
            return { 
                text: `¡Solo ${remaining} producto${remaining > 1 ? 's' : ''} más para envío gratis!`, 
                color: "from-orange-500 to-red-600" 
            };
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
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                <p className="text-xl text-gray-700 font-semibold">Cargando tu carrito...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className='relative'>
                <AlertGlobal alert={alert} setAlert={setAlert}/>
            </div>
            
            {user != null ? (
                <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl mt-5">
                    {/* Progress Steps */}
                    <div className="mb-12">
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            {[
                                { number: 1, text: "Información", icon: User, active: true },
                                { number: 2, text: "Revisión", icon: ShoppingBag, active: true },
                                { number: 3, text: "Pago", icon: CreditCard, active: false }
                            ].map((step, index) => (
                                <React.Fragment key={index}>
                                    <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 ${
                                        step.active 
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl' 
                                            : 'bg-white/70 text-gray-600 border border-gray-200'
                                    }`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            step.active ? 'bg-white/20' : 'bg-gray-100'
                                        }`}>
                                            {step.active ? (
                                                <step.icon className="w-5 h-5" />
                                            ) : (
                                                <span className="font-bold">{step.number}</span>
                                            )}
                                        </div>
                                        <span className="font-semibold hidden sm:block">{step.text}</span>
                                    </div>
                                    {index < 2 && (
                                        <ChevronRight className="w-6 h-6 text-gray-400 hidden md:block" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Columna Izquierda: Formulario */}
                        <div className="w-full lg:w-2/3 space-y-6">
                            {/* User Info Card */}
                            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                            <User className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">Información Personal</h2>
                                            <p className="text-blue-100">Usa datos verídicos para recibir tus compras</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Full Name */}
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <User className="w-4 h-4 text-blue-600" />
                                                Nombre completo
                                            </label>
                                            <input 
                                                type='text' 
                                                name='fullName' 
                                                value={formData.fullName} 
                                                onChange={handleInputChange}
                                                placeholder="Ej: Juan Pérez Quintero"
                                                className="w-full h-14 px-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <IdCard className="w-4 h-4 text-blue-600" />
                                                Tipo de documento
                                            </label>
                                            <select 
                                                name="typeLegalId" 
                                                value={formData.typeLegalId}
                                                onChange={handleInputChange}
                                                className="w-full h-14 px-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            >
                                                <option value="">Selecciona...</option>
                                                <option value="CC">Cédula de Ciudadanía (CC)</option>
                                                <option value="CE">Cédula de Extranjería (CE)</option>
                                                <option value="TI">Tarjeta de Identidad (TI)</option>
                                                <option value="NIT">NIT</option>
                                                <option value="PP">Pasaporte (PP)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <IdCard className="w-4 h-4 text-blue-600" />
                                                Número de documento
                                            </label>
                                            <input 
                                                type="text"
                                                name="legalId" 
                                                value={formData.legalId} 
                                                onChange={handleInputChange}
                                                placeholder="123456789"
                                                maxLength="15"
                                                className="w-full h-14 px-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                {selectedPaymentMethod === 'wompi' && '* Requerido para pago con Wompi'}
                                            </p>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-blue-600" />
                                                Correo electrónico
                                            </label>
                                            <input 
                                                type="email" 
                                                name="email" 
                                                value={formData.email} 
                                                onChange={handleInputChange}
                                                placeholder="correo@ejemplo.com"
                                                className="w-full h-14 px-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-blue-600" />
                                                Teléfono
                                            </label>
                                            <input 
                                                type="tel" 
                                                name="phone" 
                                                value={formData.phone} 
                                                onChange={handleInputChange}
                                                placeholder="+57 300 123 4567"
                                                className="w-full h-14 px-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            />
                                        </div>

                                        {/* Address */}
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-blue-600" />
                                                Dirección completa
                                            </label>
                                            <input 
                                                type="text" 
                                                name="address" 
                                                value={formData.address} 
                                                onChange={handleInputChange}
                                                placeholder="Calle 123 #45-67, Apto 101"
                                                className="w-full h-14 px-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            />
                                        </div>

                                        {/* City */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Ciudad / Municipio
                                            </label>
                                            <input 
                                                type="text" 
                                                name="city" 
                                                value={formData.city} 
                                                onChange={handleInputChange}
                                                placeholder="Medellín"
                                                className="w-full h-14 px-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            />
                                        </div>

                                        {/* State */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Departamento
                                            </label>
                                            <input 
                                                type="text" 
                                                name="state" 
                                                value={formData.state} 
                                                onChange={handleInputChange}
                                                placeholder="Antioquia"
                                                className="w-full h-14 px-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            />
                                        </div>

                                        {/* Postal Code */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Código postal
                                            </label>
                                            <input 
                                                type="text" 
                                                name="postalCode" 
                                                value={formData.postalCode} 
                                                onChange={handleInputChange}
                                                placeholder="050001"
                                                className="w-full h-14 px-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            />
                                        </div>

                                        {/* Country */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                País
                                            </label>
                                            <select 
                                                name="country" 
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                className="w-full h-14 px-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            >
                                                <option>Colombia</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                            <CreditCard className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">Método de Pago</h2>
                                            <p className="text-purple-100">Elige tu método preferido</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 space-y-4">
                                    {/* PayPal Option */}
                                    <label 
                                        htmlFor="paypal-payment"
                                        className={`group flex items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                                            selectedPaymentMethod === 'paypal'
                                                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg'
                                                : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50'
                                        }`}
                                    >
                                        <input
                                            id="paypal-payment"
                                            name="payment-method"
                                            type="radio"
                                            value="paypal"
                                            checked={selectedPaymentMethod === 'paypal'}
                                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                            className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                            selectedPaymentMethod === 'paypal'
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg'
                                                : 'bg-gray-200 group-hover:bg-blue-600'
                                        }`}>
                                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill={selectedPaymentMethod === 'paypal' ? 'white' : '#003087'}>
                                                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a.5.5 0 0 1-.5-.5v-.5c0-.276.224-.5.5-.5s.5.224.5.5v.5a.5.5 0 0 1-.5.5z"/>
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-800 text-lg">PayPal</h3>
                                            <p className="text-sm text-gray-600">Pago seguro internacional</p>
                                            <span className="inline-block mt-2 px-2 py-1 bg-green-100 rounded-lg text-xs font-semibold text-green-700 border border-green-200">
                                                Protección del comprador
                                            </span>
                                        </div>
                                        {selectedPaymentMethod === 'paypal' && (
                                            <CheckCircle className="w-6 h-6 text-blue-600" />
                                        )}
                                    </label>
                                    <label 
                                        htmlFor="wompi-payment"
                                        className={`group flex items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                                            selectedPaymentMethod === 'wompi'
                                                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg'
                                                : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50'
                                        }`}
                                    >
                                        <input
                                            id="wompi-payment"
                                            name="payment-method"
                                            type="radio"
                                            value="wompi"
                                            checked={selectedPaymentMethod === 'wompi'}
                                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                            className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                            selectedPaymentMethod === 'wompi'
                                                ? 'bg-gradient-to-r from-gray-200 to-gray-300 shadow-lg'
                                                : 'bg-gray-200 group-hover:bg-gray-300'
                                        }`}>
                                            <img src={LogoBancolombia} className={`w-7 h-7 ${
                                                selectedPaymentMethod === 'wompi' ? 'text-white' : 'text-gray-600 group-hover:text-white'
                                            }`} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-800 text-lg">Wompi</h3>
                                            <p className="text-sm text-gray-600">Pagos a través de productos Bancolombia</p>
                                            <div className="flex gap-2 mt-2">
                                                {['Nequi', 'Bancolombia', 'QR'].map((method, index) => (
                                                    <span key={index} className="px-2 py-1 bg-white rounded-lg text-xs font-semibold text-gray-700 border border-gray-200">
                                                        {method}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {selectedPaymentMethod === 'wompi' && (
                                            <CheckCircle className="w-6 h-6 text-blue-600" />
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Security Info */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Shield className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                                            Pago 100% Seguro
                                            <Lock className="w-4 h-4" />
                                        </h3>
                                        <p className="text-green-700 text-sm">
                                            Tus datos están protegidos con encriptación SSL de 256 bits. Nunca almacenamos información de tarjetas de crédito.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Resumen */}
                        <div className="w-full lg:w-1/3">
                            <div className="flex top-24">
                                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                                <ShoppingBag className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">Tu Orden</h2>
                                                <p className="text-purple-100">{itemsToCheckout.length} producto{itemsToCheckout.length > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Products List */}
                                    <div className="p-6 max-h-96 overflow-y-auto">
                                        <div className="space-y-4">
                                            {itemsToCheckout.map((item, index) => (
                                                <div key={`${item.name}-${item.size}-${index}`} className="group bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                                                    <div className="flex gap-4">
                                                        <div className="relative">
                                                            <img 
                                                                src={item.img && item.img.length > 0 ? item.img[item.img.length - 1] : 'https://via.placeholder.com/50'} 
                                                                className="w-20 h-20 object-contain rounded-xl bg-white shadow-md" 
                                                                alt={item.name}
                                                            />
                                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                                                <span className="text-white font-bold text-xs">{item.quantity}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-gray-800 text-sm truncate">
                                                                {item.name.replace(/[_-]/g, " ")}
                                                            </h3>
                                                            <div className="space-y-1 mt-1">
                                                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                                                    <Package className="w-3 h-3" />
                                                                    Talla: {item.size}
                                                                </p>
                                                                {item.customName && (
                                                                    <p className="text-xs text-gray-600 flex items-center gap-1">
                                                                        <Gift className="w-3 h-3" />
                                                                        {item.customName}
                                                                    </p>
                                                                )}
                                                                {item.customNumber && (
                                                                    <p className="text-xs text-gray-600">
                                                                        #{item.customNumber}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-gray-800">${calculateItemPrice(item).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Shipping Banner */}
                                    <div className="px-6 pb-4">
                                        <div className={`bg-gradient-to-r ${getShippingMessage().color} rounded-2xl p-4 text-white shadow-lg`}>
                                            <div className="flex items-center gap-3">
                                                <Truck className="w-6 h-6 flex-shrink-0" />
                                                <div>
                                                    <p className="font-semibold text-sm">Total: {totalProductCount} producto{totalProductCount > 1 ? 's' : ''}</p>
                                                    <p className="text-xs text-white/90">{getShippingMessage().text}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Código de Descuento */}
                                    <div className="px-6 pb-4">
                                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Tag className="w-5 h-5 text-amber-600" />
                                                <h3 className="font-bold text-gray-800">Código de Descuento</h3>
                                            </div>
                                            
                                            {!appliedDiscount ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={discountCode}
                                                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                                        placeholder="INGRESA TU CÓDIGO"
                                                        className="flex-1 h-12 px-4 rounded-xl bg-white border-2 border-amber-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                                                        disabled={isValidatingCode}
                                                    />
                                                    <button
                                                        onClick={validateDiscountCode}
                                                        disabled={isValidatingCode || !discountCode.trim()}
                                                        className="px-2 md:px-6 h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                    >
                                                        {isValidatingCode ? (
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                            <Check className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between bg-white rounded-xl p-3 border-2 border-green-300">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                                            <div>
                                                                <p className="font-bold text-gray-800 text-sm">{discountCode}</p>
                                                                <p className="text-xs text-gray-600">{appliedDiscount.description}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={removeDiscountCode}
                                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <X className="w-5 h-5 text-red-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Totals */}
                                    <div className="px-6 pb-6 space-y-4">
                                        <div className="space-y-3 py-4 border-t border-gray-200">
                                            <div className="flex justify-between text-gray-700">
                                                <span>Subtotal</span>
                                                <span className="font-semibold">${subtotal.toFixed(2)} USD</span>
                                            </div>
                                            
                                            {appliedDiscount && (
                                                <div className="flex justify-between text-green-600">
                                                    <span className="flex items-center gap-2">
                                                        <Tag className="w-4 h-4" />
                                                        Descuento
                                                    </span>
                                                    <span className="font-semibold">-${discountAmount.toFixed(2)} USD</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between text-gray-700">
                                                <span className="flex items-center gap-2">
                                                    <Truck className="w-4 h-4" />
                                                    Envío
                                                </span>
                                                <span className={`font-semibold ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                                                    {shippingCost === 0 ? 'GRATIS' : `${shippingCost.toFixed(2)} USD`}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-700 font-bold text-lg">Total</span>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-gray-800">${finalTotal.toFixed(2)}</p>
                                                    <p className="text-xs text-gray-600">USD</p>
                                                </div>
                                            </div>
                                            {tasaCOP && (
                                                <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                                                    <span className="text-gray-600 text-sm">Equivalente en COP</span>
                                                    <span className="font-semibold text-gray-700 text-sm">
                                                        {(finalTotal * tasaCOP).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Payment Button */}
                                        {!paymentData ? (
                                            <button 
                                                type='button'
                                                onClick={handlePreparePayment} 
                                                disabled={isPreparing}
                                                className='w-full h-14 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                                            >
                                                {isPreparing ? (
                                                    <>
                                                        <Loader2 className="animate-spin w-5 h-5" />
                                                        Procesando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="w-5 h-5" />
                                                        Continuar al Pago Seguro
                                                        <ChevronRight className="w-5 h-5" />
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <div className="space-y-4">
                                                {selectedPaymentMethod === 'bold' ? (
                                                    <BoldButton
                                                        orderId={paymentData.orderId}
                                                        amount={paymentData.amount}
                                                        description="Compra en Jerseys Colombia"
                                                        integritySignature={paymentData.integritySignature}
                                                        customerData={{ 
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
                                                ) : selectedPaymentMethod === 'paypal' ? (
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
                                                ) : (
                                                    <WompiButton
                                                        orderId={paymentData.orderId}
                                                        amount={paymentData.amount}
                                                        description="Compra en Jerseys Colombia"
                                                        reference={paymentData.reference}
                                                        customerData={{
                                                            email: formData.email,
                                                            fullName: formData.fullName,
                                                            legalId: formData.legalId,
                                                            typeLegalId: formData.typeLegalId
                                                        }}
                                                        billingAddress={{
                                                            address: formData.address,
                                                            city: formData.city,
                                                            state: formData.state,
                                                            postalCode: formData.postalCode,
                                                            country: "CO",
                                                            phone: formData.phone
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        )}

                                        {/* Trust Badges */}
                                        <div className="grid grid-cols-3 gap-2 pt-4">
                                            {[
                                                { icon: Shield, text: "Pago Seguro" },
                                                { icon: Lock, text: "SSL 256-bit" },
                                                { icon: CheckCircle, text: "Verificado" }
                                            ].map((badge, index) => (
                                                <div key={index} className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-xl">
                                                    <badge.icon className="w-4 h-4 text-green-600" />
                                                    <span className="text-[10px] text-gray-600 text-center">{badge.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="min-h-screen flex items-center justify-center px-4 mt-50">
                    <div className="text-center max-w-md">
                        <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce">
                            <User className="w-16 h-16 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Debes iniciar sesión</h2>
                        <p className="text-gray-600 mb-8 text-lg">
                            Para garantizar la seguridad de tus pagos y un mejor servicio, necesitas iniciar sesión
                        </p>
                        <div className="space-y-4">
                            <button 
                                onClick={() => navigate('/')} 
                                className='w-full h-14 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300'
                            >
                                <User className="w-5 h-5" />
                                Ir a Iniciar Sesión
                            </button>
                            <button 
                                onClick={() => navigate('/register')} 
                                className='w-full h-14 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300'
                            >
                                Crear Cuenta Nueva
                            </button>
                        </div>
                        
                        {/* Benefits */}
                        <div className="mt-12 grid grid-cols-1 gap-4">
                            {[
                                { icon: Shield, title: "Pagos Seguros", desc: "Protección total en transacciones" },
                                { icon: Truck, title: "Seguimiento", desc: "Rastrea tu pedido en tiempo real" },
                                { icon: Gift, title: "Ofertas Exclusivas", desc: "Descuentos para usuarios registrados" }
                            ].map((benefit, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <benefit.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-gray-800">{benefit.title}</h3>
                                        <p className="text-sm text-gray-600">{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;