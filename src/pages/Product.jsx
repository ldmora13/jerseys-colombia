import React, {useEffect, useRef, useState, useMemo} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useSEO } from '../hooks/useSEO';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion } from 'framer-motion';

import Loader from '../components/Loader';
import AlertGlobal from '../components/AlertGlobal';
import SEO from '../components/SEO';
import SizeRules from '../components/SizeRules';

import { 
    Heart, 
    ShoppingCart, 
    Share2, 
    Ruler,
    Package,
    Truck,
    Shield,
    CreditCard,
    Star,
    ChevronLeft,
    ChevronRight,
    Check,
    Gift,
    MessageCircle,
} from 'lucide-react';

const generarSlugDesdeNombre = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const Product = ({ cartVisible, setCartVisible }) => {
    const { cartItems, setCartItems } = useCart();
    const { wishlistItems, setWishlistItems, setWishlistVisible } = useWishlist();
    const { category, name } = useParams();
    const navigate = useNavigate();
    
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tasaCOP, setTasaCOP] = useState(null);
    const url = window.location.href;
    const topRef = useRef(null);
    const [sizeRulesVisible, setSizeRulesVisible] = useState(false);

    const [selectedSize, setSelectedSize] = useState(null);
    const [customName, setCustomName] = useState('');
    const [customNumber, setCustomNumber] = useState('');
    
    const [imagenPrincipal, setImagenPrincipal] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [miniaturas, setMiniaturas] = useState([]);
    
    const [alert, setAlert] = useState({
        show: false,
        message: '', 
        severity: '', 
        title: '' 
    });

    const seoData = useSEO(producto, category, name);

    useEffect(() => {
        if (producto && producto.img && producto.img.length > 0) {
            setImagenPrincipal(producto.img[producto.img.length - 1]); 
            setMiniaturas(producto.img);
            setCurrentImageIndex(producto.img.length - 1);
        }
    }, [producto]);

    useEffect(() => {
      const fetchProducto = async () => {
        setLoading(true);
        let table = category.toLowerCase();
        
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
            console.error('Error al buscar el producto:', error);
            setProducto(null);
        } else {
            const encontrado = data.find((p) => {
                const slugDelNombre = generarSlugDesdeNombre(p.name);
                return slugDelNombre === name;
            });
            
            if (encontrado) {
                let sportIdentifier = encontrado.deporte || encontrado.category;
                setProducto({ ...encontrado, sport: sportIdentifier.toLowerCase() });
            } else {
                setProducto(null);
            }
          }
          setTimeout(() => { setLoading(false); }, 500);
      };
      fetchProducto();
    }, [category, name]);

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

    const addToCart = (product) => {
        if (!selectedSize) {
            setAlert({ show: true, message: "Selecciona una talla antes de agregar al carrito.", severity: "error", title: "Talla no seleccionada" });
            return;
        }
        setCartItems(prevCart => {
            const index = prevCart.findIndex(item => 
                item.name === product.name && 
                item.size === selectedSize && 
                (item.customName || '') === customName && 
                (item.customNumber || '') === customNumber
            );
            if (index !== -1) {
                const updatedCart = [...prevCart];
                updatedCart[index].quantity += 1;
                return updatedCart;
            } else {
                return [...prevCart, { ...product, quantity: 1, size: selectedSize, customName, customNumber }];
            }
        });
        let message = `${product.name} talla (${selectedSize}) añadido al carrito.`;
        if (customName || customNumber) {
            message = `${product.name} (${selectedSize}) con personalización añadido.`;
        }
        setAlert({ show: true, message, severity: "success", title: '¡Añadido!' });
        setCartVisible(true);
    };
    
    const toggleWishlist = (product) => {
        const productName = product.name;
        setWishlistItems(prevItems => {
            if (prevItems.includes(productName)) {
                return prevItems.filter(item => item !== productName);
            } else {
                setWishlistVisible(true);
                return [...prevItems, productName];
            }
        });
    };
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setAlert({
            show: true,
            message: "URL copiada con éxito",
            severity: "success",
            title: "¡Copiado en el portapapeles!",
            });
            setTimeout(() => setAlert({ show: false, message: "", severity: "", title: "" }), 5000);
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };
    const goToCheckout = (product) => {
        if (!selectedSize) {
            setAlert({ show: true, message: "Selecciona una talla antes de ir al pago", severity: "error", title: "Talla no seleccionada" });
            return;
        }
        const itemForCheckout = { ...product, quantity: 1, size: selectedSize, customName, customNumber };
        navigate('/checkout', { state: { items: [itemForCheckout] } });
    };

    const nextImage = () => {
        const nextIndex = (currentImageIndex + 1) % miniaturas.length;
        setCurrentImageIndex(nextIndex);
        setImagenPrincipal(miniaturas[nextIndex]);
    };

    const prevImage = () => {
        const nextIndex = currentImageIndex === 0 ? miniaturas.length - 1 : currentImageIndex - 1;
        setCurrentImageIndex(nextIndex);
        setImagenPrincipal(miniaturas[nextIndex]);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 z-[2000]">
                <Loader />
            </div>
        );
    }

    if (!producto) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <Package className="w-24 h-24 mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Producto no encontrado</h2>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (    
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
            {seoData && <SEO {...seoData} />}
            <div className='relative'>
                <AlertGlobal alert={alert} setAlert={setAlert} />
            </div>
            <SizeRules sizeRulesVisible={sizeRulesVisible} setSizeRulesVisible={setSizeRulesVisible} />

            <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl mt-5">
                
                {/* Breadcrumbs */}
                <nav className="flex mb-6 text-sm">
                    <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">Inicio</Link>
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                    <Link to={`/${category}`} className="text-gray-600 hover:text-blue-600 transition-colors capitalize">{category}</Link>
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                    <span className="text-gray-900 font-medium">{producto.team || producto.name}</span>
                </nav>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    
                    {/* Left Column - Images */}
                    <div className="space-y-6">
                        {/* Main Image */}
                        <div className="relative group bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                            <div className="aspect-square">
                                <motion.img 
                                    key={imagenPrincipal}
                                    src={imagenPrincipal} 
                                    alt={producto.name}
                                    className="w-full h-full object-contain p-8"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>

                            {/* Navigation Arrows */}
                            {miniaturas.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                                    >
                                        <ChevronLeft className="w-6 h-6 text-gray-800" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                                    >
                                        <ChevronRight className="w-6 h-6 text-gray-800" />
                                    </button>
                                </>
                            )}

                            {/* Image Counter */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                                {currentImageIndex + 1} / {miniaturas.length}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {miniaturas.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {miniaturas.map((url, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setImagenPrincipal(url);
                                            setCurrentImageIndex(index);
                                        }}
                                        className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                                            currentImageIndex === index
                                                ? 'border-blue-500 scale-110 shadow-lg'
                                                : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                    >
                                        <img src={url} alt={`Vista ${index + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { icon: Shield, text: "Calidad Premium" },
                                { icon: Truck, text: "Envío Gratis 5+" },
                                { icon: Package, text: "Empaque Seguro" },
                                { icon: CreditCard, text: "Pago Seguro" }
                            ].map((badge, index) => (
                                <div key={index} className="bg-white rounded-2xl p-4 text-center shadow-lg border border-gray-100">
                                    <badge.icon className="w-6 h-6 mx-auto mb-2 text-green-600" />
                                    <p className="text-xs font-semibold text-gray-700">{badge.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Product Info */}
                    <div className="space-y-6">
                        
                        {/* Header Card */}
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                            
                            {/* Sport Badge & Wishlist */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-full">
                                        {producto.sport?.toUpperCase()}
                                    </span>
                                    {producto.sport === 'futbol' && producto.type && (
                                        <span className={`px-4 py-2 text-white text-sm font-bold rounded-full ${
                                            producto.type.toLowerCase() === 'player' 
                                                ? 'bg-gradient-to-r from-yellow-500 to-orange-600' 
                                                : 'bg-gradient-to-r from-green-500 to-emerald-600'
                                        }`}>
                                            {producto.type.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleWishlist(producto)}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                            wishlistItems.includes(producto.name)
                                                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg scale-110'
                                                : 'bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                                        }`}
                                    >
                                        <Heart className={`w-5 h-5 ${wishlistItems.includes(producto.name) ? 'fill-current' : ''}`} />
                                    </button>
                                     <button onClick={copyToClipboard}
                                        className="w-12 h-12 bg-gray-100 hover:bg-blue-50 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                        <Share2 className="w-5 h-5 text-gray-600 hover:text-blue-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Product Title */}
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                {producto.sport === 'f1' && `${producto.team} ${producto.driver || producto.year}`}
                                {producto.sport === 'nba' && `${producto.team} ${producto.player || producto.year}`}
                                {producto.sport === 'futbol' && `${producto.team} ${producto.category} ${producto.type} ${producto.year}`}
                            </h1>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600">(4.8/5 - 127 reviews)</span>
                            </div>

                            {/* Price */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 border border-green-200">
                                <div className="flex items-baseline gap-3 mb-2">
                                    <span className="text-4xl font-bold text-gray-900">${producto.price}</span>
                                    <span className="text-xl text-gray-600">USD</span>
                                </div>
                                {tasaCOP && (
                                    <p className="text-gray-600">
                                        {(producto.price * tasaCOP).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} COP
                                    </p>
                                )}
                            </div>

                            {/* Size Selection */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-lg font-bold text-gray-800">Talla</label>
                                    <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                                        <Ruler className="w-4 h-4" />
                                        Guía de tallas
                                    </button>
                                </div>
                                <div className="grid grid-cols-5 gap-3">
                                    {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`h-14 rounded-2xl font-bold text-lg transition-all duration-300 ${
                                                selectedSize === size
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Personalization (for football) */}
                            {producto.sport === 'futbol' && (
                                <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Gift className="w-5 h-5 text-purple-600" />
                                        Personaliza tu Jersey 
                                        <span className="text-sm text-purple-600">+$5 USD</span>
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                            <input
                                                type="text"
                                                placeholder="Ej: MESSI"
                                                value={customName}
                                                onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                                                maxLength={12}
                                                className="w-full h-12 px-4 rounded-xl bg-white border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition-all duration-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                                            <input
                                                type="number"
                                                placeholder="Ej: 10"
                                                value={customNumber}
                                                onChange={(e) => setCustomNumber(e.target.value)}
                                                onInput={(e) => { e.target.value = e.target.value.slice(0, 2) }}
                                                className="w-full h-12 px-4 rounded-xl bg-white border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={() => goToCheckout(producto)}
                                    className="w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                                >
                                    <CreditCard className="w-6 h-6" />
                                    Comprar Ahora
                                </button>
                                <button
                                    onClick={() => addToCart(producto)}
                                    className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                    Añadir al Carrito
                                </button>
                            </div>

                            {/* Stock & Shipping Info */}
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                                    <Check className="w-5 h-5 text-green-600" />
                                    <span className="text-green-800 font-medium">En stock - Envío inmediato</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <Truck className="w-5 h-5 text-blue-600" />
                                    <span className="text-blue-800 text-sm">Envío gratis en pedidos de 5+ productos</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Card */}
                <div className=" mt-10 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Package className="w-6 h-6 text-blue-600" />
                        Detalles del Producto
                    </h2>
                    {producto.type === 'player' ? (
                        <div className="space-y-4">
                            {[
                                { label: "Material", value: "Poliéster, a menudo en combinación con elastano (spandex)"},
                                { label: "Tecnología", value: "Tecnología antihumedad avanzada (como Dri-FIT, HEAT.RDY, AEROREADY, etc.)"},
                                { label: "Logos", value: "Logos y escudos termosellados (3D)"},
                                { label: "Año", value: producto.year },
                                { label: "Categoría", value: producto.type},
                                { label: "Descripción", value: producto.name.replaceAll('_', ' ')}
                            ].map((detail, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                    <span className="text-gray-600 font-medium">{detail.label}</span>
                                    <span className="text-gray-900 font-semibold">{detail.value}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {[
                                { label: "Material", value: "100% Poliéster premium" },
                                { label: "Tecnología", value: "Dri-FIT transpirable" },
                                { label: "Logos", value: "Bordados de alta calidad" },
                                { label: "Año", value: producto.year },
                                { label: "Categoría", value: producto.category },
                                { label: "Descripción", value: producto.name.replaceAll('_', ' ')}
                            ].map((detail, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                    <span className="text-gray-600 font-medium">{detail.label}</span>
                                    <span className="text-gray-900 font-semibold">{detail.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Reviews Section */}
                <div className="mt-16 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <MessageCircle className="w-7 h-7 text-blue-600" />
                        Opiniones de Clientes
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { name: "Carlos M.", rating: 5, comment: "Excelente calidad, los logos están perfectos.", date: "Hace 2 días" },
                            { name: "María L.", rating: 5, comment: "Llegó rápido y en perfecto estado. Muy recomendado.", date: "Hace 1 semana" },
                            { name: "Andrés P.", rating: 4, comment: "Buena calidad precio. La personalización quedó perfecta.", date: "Hace 2 semanas" }
                        ].map((review, index) => (
                            <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold text-gray-900">{review.name}</span>
                                    <div className="flex">
                                        {[...Array(review.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-700 text-sm mb-3">{review.comment}</p>
                                <span className="text-xs text-gray-500">{review.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Product;