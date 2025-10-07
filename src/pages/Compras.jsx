import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { 
    Loader2, 
    Package, 
    AlertCircle, 
    Calendar,
    DollarSign,
    ShoppingBag,
    Truck,
    CheckCircle,
    Clock,
    X,
    ChevronRight,
    ExternalLink,
    Tag
} from 'lucide-react';
import OrderTracker from "../components/OrderTracker";

const Compras = () => {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const statusConfig = {
        'pending': { label: 'Pendiente', color: 'from-yellow-500 to-orange-500', icon: Clock },
        'processing': { label: 'Procesando', color: 'from-blue-500 to-indigo-500', icon: Package },
        'shipped': { label: 'Enviado', color: 'from-purple-500 to-violet-500', icon: Truck },
        'completed': { label: 'Completado', color: 'from-green-500 to-emerald-500', icon: CheckCircle },
        'cancelled': { label: 'Cancelado', color: 'from-red-500 to-pink-500', icon: X }
    };

    const getProductPath = (productDetails) => {
        const sport = productDetails?.sport?.toLowerCase();
        const category = productDetails?.category?.toLowerCase();
        
        if (sport === 'f1') return 'f1';
        if (sport === 'nba') return 'nba';
        return 'futbol';
    };

    useEffect(() => {
        const fetchOrders = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/');
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        id,
                        created_at,
                        shipping_status,
                        total,
                        currency,
                        tracker_id,
                        payment_method,
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
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
                <Loader2 className="w-12 h-12 md:w-16 md:h-16 animate-spin text-blue-600 mb-4" />
                <p className="text-lg md:text-xl text-gray-700 font-semibold text-center">Cargando tus compras...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-200 p-8 md:p-12 max-w-md w-full">
                    <AlertCircle className="w-12 h-12 md:w-16 md:h-16 mx-auto text-red-600 mb-4" />
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-2">Error al Cargar</h2>
                    <p className="text-red-600 text-center text-sm md:text-base">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-x-hidden w-full">
            <div className="container mx-auto px-4 py-6 md:py-8 pt-20 md:pt-24 max-w-7xl mt-20 w-full">
                
                {/* Header */}
                <div className="mb-8 md:mb-12 w-full">
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden w-full">
                        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 md:p-8">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white truncate">Mis Compras</h1>
                                    <p className="text-blue-100 mt-1 text-sm md:text-base">
                                        {orders.length > 0 
                                            ? `${orders.length} pedido${orders.length > 1 ? 's' : ''} realizado${orders.length > 1 ? 's' : ''}`
                                            : 'Historial de pedidos'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {orders.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-16 w-full">
                        <div className="text-center max-w-md mx-auto">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
                                <Package className="w-12 h-12 md:w-16 md:h-16 text-blue-600" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Aún no tienes compras</h2>
                            <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8">
                                ¡Explora nuestros productos y haz tu primer pedido!
                            </p>
                            <button 
                                onClick={() => navigate('/futbol')} 
                                className='w-full h-12 md:h-14 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-sm md:text-base'
                            >
                                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                                Ir a Comprar
                                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 w-full">
                        {/* Order List */}
                        <div className="lg:col-span-2 space-y-4 md:space-y-6 w-full">
                            {orders.map(order => {
                                const status = statusConfig[order.shipping_status?.toLowerCase()] || statusConfig['pending'];
                                const StatusIcon = status.icon;
                                
                                return (
                                    <div 
                                        key={order.id} 
                                        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden hover:shadow-3xl transition-all duration-300 w-full"
                                    >
                                        {/* Order Header */}
                                        <div className={`bg-gradient-to-r ${status.color} p-4 md:p-6`}>
                                            <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
                                                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <StatusIcon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-white font-bold text-base md:text-xl truncate">
                                                            Orden #{order.id}
                                                        </p>
                                                        <p className="text-white/80 text-xs md:text-sm flex items-center gap-2">
                                                            <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                                            <span className="truncate">
                                                                {new Date(order.created_at).toLocaleDateString('es-CO', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="bg-white/20 backdrop-blur-sm px-3 md:px-4 py-2 rounded-xl flex-shrink-0">
                                                    <span className="text-white font-semibold text-xs md:text-sm">{status.label}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Details */}
                                        <div className="p-4 md:p-6 w-full">
                                            {/* Total and Tracking */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6 w-full">
                                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 md:p-4 rounded-2xl border border-green-200 w-full">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                                            <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-green-700 font-medium">Total Pagado</p>
                                                            <p className="text-base md:text-lg font-bold text-green-800 truncate">
                                                                {order.currency === 'USD' 
                                                                    ? `$${parseFloat(order.total).toFixed(2)} USD`
                                                                    : parseFloat(order.total).toLocaleString('es-CO', { 
                                                                        style: 'currency', 
                                                                        currency: 'COP' 
                                                                    })
                                                                }
                                                            </p>
                                                            {order.payment_method && (
                                                                <p className="text-xs text-green-600 capitalize mt-1 truncate">
                                                                    Vía {order.payment_method}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {order.tracker_id && (
                                                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-3 md:p-4 rounded-2xl border border-purple-200 w-full">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                                                <Truck className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs text-purple-700 font-medium">Nº Rastreo</p>
                                                                <p className="text-base md:text-lg font-bold text-purple-800 font-mono truncate">
                                                                    {order.tracker_id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Items */}
                                            <div className="w-full">
                                                <h3 className="font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                                                    <Package className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
                                                    Artículos del Pedido ({order.order_items?.length || 0})
                                                </h3>
                                                <div className="space-y-3 w-full">
                                                    {order.order_items && order.order_items.length > 0 ? (
                                                        order.order_items.map((item, index) => {
                                                            const basePath = getProductPath(item.product_details);
                                                            const productSlug = item.product_details?.slug || '';
                                                            const productLink = productSlug ? `/${basePath}/${productSlug}` : null;
                                                            const imagenes = item.product_details.img
                                                            const imagen = imagenes.length > 0 ? imagenes[imagenes.length - 1] : null;

                                                            return (
                                                                <div 
                                                                    key={index}
                                                                    className="group bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-3 md:p-4 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 w-full"
                                                                >
                                                                    <div className="flex gap-3 md:gap-4">
                                                                        {/* Product Image */}
                                                                        <div className="relative flex-shrink-0">
                                                                            <img 
                                                                                src={imagen}
                                                                                alt={item.product_name}
                                                                                className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-xl bg-white shadow-md"
                                                                            />
                                                                            <div className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                                                                <span className="text-white font-bold text-xs">{item.quantity}</span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Product Info */}
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-start justify-between gap-2">
                                                                                <div className="min-w-0 flex-1">
                                                                                    <h4 className="font-bold text-gray-800 mb-1 truncate text-sm md:text-base">
                                                                                        {item.product_name}
                                                                                    </h4>
                                                                                    <div className="space-y-1">
                                                                                        <p className="text-xs md:text-sm text-gray-600 flex items-center gap-2">
                                                                                            <Tag className="w-3 h-3 flex-shrink-0" />
                                                                                            Talla: {item.size}
                                                                                        </p>
                                                                                        {item.custom_name && (
                                                                                            <p className="text-xs md:text-sm text-purple-600 font-medium truncate">
                                                                                                ⭐ {item.custom_name} #{item.custom_number}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-right flex-shrink-0">
                                                                                    <p className="font-bold text-gray-800 text-sm md:text-base">
                                                                                        {order.currency === 'USD'
                                                                                            ? `$${parseFloat(item.price_at_purchase).toFixed(2)}`
                                                                                            : parseFloat(item.price_at_purchase).toLocaleString('es-CO', { 
                                                                                                style: 'currency', 
                                                                                                currency: 'COP' 
                                                                                            })
                                                                                        }
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500">c/u</p>
                                                                                </div>
                                                                            </div>

                                                                            {/* Link to Product */}
                                                                            {productLink && (
                                                                                <Link
                                                                                    to={productLink}
                                                                                    className="mt-2 md:mt-3 inline-flex items-center gap-2 text-xs md:text-sm text-blue-600 hover:text-blue-700 font-semibold group-hover:gap-3 transition-all duration-300"
                                                                                >
                                                                                    Ver producto
                                                                                    <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                                                                                </Link>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="text-center py-6 md:py-8 text-gray-500 w-full">
                                                            <AlertCircle className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 text-gray-400" />
                                                            <p className="text-sm md:text-base">No se encontraron artículos en esta orden</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Sidebar - Order Tracker */}
                        <div className="lg:col-span-1 w-full">
                            <div className="lg:sticky lg:top-24 w-full">
                                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden w-full">
                                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 md:p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Truck className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg md:text-xl font-bold text-white">Rastreo</h2>
                                                <p className="text-purple-100 text-xs md:text-sm">Sigue tu pedido</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 md:p-6 w-full">
                                        <OrderTracker />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Compras;