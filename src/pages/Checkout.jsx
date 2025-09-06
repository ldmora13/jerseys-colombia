import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';

const Checkout = () => {
    const { cartItems } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    const [itemsToCheckout, setItemsToCheckout] = useState([]);

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
    
    // Estado para el formulario
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

    const handleSubmit = (e) => {
      e.preventDefault();
    };

    if (itemsToCheckout.length === 0) {
        return <div className="flex items-center justify-center h-screen">Cargando...</div>;
    }

    return (
        <div className="bg-[#e8e8e8] min-h-screen">
            <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
                
                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12">
                    
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
                              <button className='group relative w-full md:w-[250px] h-10 flex items-center justify-center bg-[#252525] hover:text-black text-white font-bold gap-2 cursor-pointer shadow-md overflow-hidden transition-all duration-300 active:translate-x-1 active:translate-y-1 before:content-[""] before:absolute before:w-[250px] before:h-[130px] before:top-0 before:left-[-100%] before:bg-white before:transition-all before:duration-300 before:mix-blend-difference hover:before:transform hover:before:translate-x-full hover:before:-translate-y-1/2 hover:before:rounded-none'>
                                  <span className='relative z-10'>Añadir al carrito</span>
                                  <svg className='relative z-10 h-4' viewBox="0 0 24 24"><path className='group-hover:fill-black transition-colors duration-200' d="M2.08416 2.7512C2.22155 2.36044 2.6497 2.15503 3.04047 2.29242L3.34187 2.39838C3.95839 2.61511 4.48203 2.79919 4.89411 3.00139C5.33474 3.21759 5.71259 3.48393 5.99677 3.89979C6.27875 4.31243 6.39517 4.76515 6.4489 5.26153C6.47295 5.48373 6.48564 5.72967 6.49233 6H17.1305C18.8155 6 20.3323 6 20.7762 6.57708C21.2202 7.15417 21.0466 8.02369 20.6995 9.76275L20.1997 12.1875C19.8846 13.7164 19.727 14.4808 19.1753 14.9304C18.6236 15.38 17.8431 15.38 16.2821 15.38H10.9792C8.19028 15.38 6.79583 15.38 5.92943 14.4662C5.06302 13.5523 4.99979 12.5816 4.99979 9.64L4.99979 7.03832C4.99979 6.29837 4.99877 5.80316 4.95761 5.42295C4.91828 5.0596 4.84858 4.87818 4.75832 4.74609C4.67026 4.61723 4.53659 4.4968 4.23336 4.34802C3.91052 4.18961 3.47177 4.03406 2.80416 3.79934L2.54295 3.7075C2.15218 3.57012 1.94678 3.14197 2.08416 2.7512Z" fill="#ffffff" /><path className='group-hover:fill-black transition-colors duration-200' d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z" fill="#ffffff" /> <path className='group-hover:fill-black transition-colors duration-200' d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z" fill="#ffffff" /></svg>
                              </button>
                            </div>
                            
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;