import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import CryptoJS from 'crypto-js';
import BoldButton from '../components/BoldButton';

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


    const [user, setUser] = useState(null);
    const [subtotal, setSubtotal] = useState(0); 
    const shippingCost = 15;

    const orderId = `order_${Date.now()}`;
    
    const amount = Math.round((subtotal + shippingCost) * tasaCOP);
    const currency = "COP";
    const secret = import.meta.env.VITE_BOLD_INTEGRITY_SECRET;
    const signatureString = `${orderId}${amount}${currency}${secret}`;
    const integritySignature = CryptoJS.SHA256(signatureString).toString();

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
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error obteniendo sesión:", error);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        setFormData((prev) => ({ ...prev, email: session.user.email, fullName: session.user.user_metadata.full_name }));
      }
    };

    getSession();
  }, []);

    useEffect(() => {
        const newSubtotal = itemsToCheckout.reduce((total, item) => {
            let itemPrice = item.price;
            if(item.customName || item.customNumber) {
                itemPrice += 5; 
            }
            return total + itemPrice * item.quantity;
        }, 0);
        setSubtotal(newSubtotal);
    }, [itemsToCheckout]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const paymentData = useMemo(() => {
        // No calcular nada hasta que tengamos la tasa de cambio
        if (!tasaCOP || subtotal === 0) {
            return {
                orderId: null,
                amount: 0,
                integritySignature: null,
                isReady: false // Añadimos una bandera para saber si estamos listos
            };
        }

        const orderId = `order_${Date.now()}`;
        const totalUSD = subtotal + shippingCost;
        const amountInCOP = Math.round(totalUSD * tasaCOP);
        const currency = "COP";
        const secret = import.meta.env.VITE_BOLD_INTEGRITY_SECRET;
        const signatureString = `${orderId}${amountInCOP}${currency}${secret}`;
        const integritySignature = CryptoJS.SHA256(signatureString).toString();

        return { orderId, amount: amountInCOP, integritySignature, isReady: true };

    }, [subtotal, shippingCost, tasaCOP]);

    if (itemsToCheckout.length === 0) {
        return <div className="flex items-center justify-center h-screen">Cargando...</div>;
    }

    return (
        <div className="bg-[#e8e8e8] min-h-screen">
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
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-gray-600">Talla: {item.size}</p>
                                            {item.customName && <p className="text-gray-600">Nombre: {item.customName}</p>}
                                            {item.customNumber && <p className="text-gray-600">Número: {item.customNumber}</p>}
                                            <p className="text-gray-600">Cantidad: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold text-sm">${(item.price + ((item.customName || item.customNumber) ? 5 : 0)).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-6 border-t space-y-2">
                                <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)} USD</span></div>
                                <div className="flex justify-between"><span>Envío</span><span>${shippingCost.toFixed(2)} USD</span></div>
                                <div className="flex justify-between items-center font-bold text-lg">
                                  <span>Total</span>
                                  <span className='flex flex-col items-center justify-center'>${(subtotal + shippingCost).toFixed(2)} USD 
                                    <span className='text-sm font-medium text-gray-300'>{tasaCOP ? ` ${((subtotal + shippingCost) * tasaCOP).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}` : ' (Cargando tasa...)'} COP </span>
                                  </span>
                                </div>
                            </div>
                            <div className='flex items-center justify-center mt-5'>
                                <BoldButton
                                    orderId={orderId}
                                    amount={amount}
                                    description="Compra en Jerseys Colombia"
                                    integritySignature={integritySignature}
                                    customerData={formData}
                                    billingAddress={{
                                        address: formData.address,
                                        city: formData.city,
                                        zipCode: formData.postalCode,
                                        state: "Colombia",
                                        country: "CO"
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;