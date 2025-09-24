import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Loader2, Package, AlertCircle } from 'lucide-react';
import OrderTracker from "../components/OrderTracker";

const Compras = () => {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        id,
                        created_at,
                        status,
                        total,
                        tracker_id,
                        order_items (
                            product_name,
                            quantity,
                            price_at_purchase,
                            size,
                            custom_name,
                            custom_number,
                            product_details
                        )
                    `)
                    .eq('customer_id', user.id)
                    .order('created_at', { ascending: false });
                    console.log("Respuesta de Supabase:", data, error);
                if (error) throw error;
                setOrders(data || []);
            } catch (err) {
                setError('No se pudieron cargar tus órdenes.');
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="mt-4 text-lg">Cargando tus compras...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-red-600">
                <AlertCircle className="w-12 h-12" />
                <p className="mt-4 text-lg">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 gap-x-5 py-8 pt-24 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-center">Mis Compras</h1>
                
                {orders.length === 0 ? (
                    <div className="text-center py-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg shadow-md">
                        <Package className="w-16 h-16 mx-auto text-black" />
                        <h2 className="mt-4 text-2xl font-semibold">Aún no tienes compras</h2>
                        <p className="text-gray-600 mt-2">¡Explora nuestros productos y haz tu primer pedido!</p>
                        <div className="mt-6 flex justify-center w-1/2 mx-auto">
                            <button onClick={()=> navigate('/')} className='group relative w-full h-10 flex items-center justify-center bg-black hover:text-black text-white font-bold gap-2 cursor-pointer shadow-md overflow-hidden transition-all duration-300 active:translate-x-1 active:translate-y-1 before:content-[""] before:absolute before:w-full before:h-[130px] before:top-0 before:left-[-100%] before:bg-white before:transition-all before:duration-300 before:mix-blend-difference hover:before:transform hover:before:translate-x-full hover:before:-translate-y-1/2 hover:before:rounded-none'>
                                <span className='relative z-10'>Ir a comprar</span>
                                <svg className='relative z-10 h-3 ' viewBox="0 0 576 512"><path className='fill-white group-hover:fill-black transition-colors duration-200' d="M512 80c8.8 0 16 7.2 16 16v32H48V96c0-8.8 7.2-16 16-16H512zm16 144V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V224H528zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm56 304c-13.3 0-24 10.7-24 24s10.7 24 24 24h48c13.3 0 24-10.7 24-24s-10.7-24-24-24H120zm128 0c-13.3 0-24 10.7-24 24s10.7 24 24 24H360c13.3 0 24-10.7 24-24s-10.7-24-24-24H248z"/></svg>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 gap-x-6 flex ">
                        <div className='w-full md:w-1/2'>
                            <div className='flex gap-2'>
                                <OrderTracker />
                            </div>
                        </div>
                        {orders.map(order => (
                            <div key={order.id} className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg shadow-md overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b flex flex-col md:flex-row justify-between items-start sm:items-center gap-2">
                                    <div>
                                        <p className="font-bold text-lg">Orden #{order.id}</p>
                                        <p className="text-sm text-gray-600">
                                            Fecha: {new Date(order.created_at).toLocaleDateString('es-CO')}
                                        </p>
                                        <p>Numero de rastreo: {order.tracker_id}</p>
                                    </div>
                                    <div className="flex flex-col sm:items-end gap-2">
                                        <p className="font-bold text-lg">
                                            Total: {order.total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold mb-3">Artículos del pedido:</h3>
                                    <ul className="space-y-3">
                                        {order.order_items.map((item, index) => {
                                            const categoryForLink = item.product_details?.sport === 'futbol' ? 'futbol' : item.product_details?.sport;
                                            const productLink = `/${categoryForLink}/${item.product_details?.slug}`;
                                            <Link to={productLink} key={index} className="block hover:bg-gray-50 transition-colors">
                                            <li key={item.product_name} className="flex justify-between items-start text-sm border-b pb-2">
                                                <div>
                                                    <p className="font-semibold">{item.product_name} (x{item.quantity})</p>
                                                    <p className="text-gray-500">Talla: {item.size}</p>
                                                    {item.custom_name && (
                                                        <p className="text-gray-500">Personalización: {item.custom_name} #{item.custom_number}</p>
                                                    )}
                                                </div>
                                                <p className="font-medium">
                                                    {item.price_at_purchase.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} c/u
                                                </p>
                                                <p className='font-bold'>Número de rastreo: <span>{item.tracker_id}</span></p>
                                            </li>
                                           </Link>
                                           
                                        })}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Compras;