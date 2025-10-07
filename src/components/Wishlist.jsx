import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useWishlist } from '../context/WishlistContext'
import { supabase } from '../lib/supabaseClient'
import { 
    Heart, 
    X, 
    Trash2, 
    ShoppingCart, 
    Package,
    Sparkles,
    ExternalLink
} from 'lucide-react'

const Wishlist = () => {

    const { wishlistVisible, setWishlistVisible, wishlistItems, setWishlistItems } = useWishlist();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const wishlistRef = useRef(null); 
  
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

    const removeFromWishlist = (productName) => {
        setWishlistItems(prevItems => prevItems.filter(item => item !== productName));
    };

    const clearWishlist = () => {
        setWishlistItems([]);
    };

    useEffect(() => {
        const fetchWishlistProducts = async () => {
            if (wishlistVisible && wishlistItems.length > 0) {
                setLoading(true);
                
                try {
                    let allProducts = [];

                    const { data: f1Data, error: f1Error } = await supabase
                        .from('f1')
                        .select('name, price, team, year, img, category, deporte')
                        .in('name', wishlistItems);
                    
                    if (f1Error) console.error("Error buscando en F1:", f1Error);
                    if (f1Data) allProducts.push(...f1Data.map(p => ({ ...p, sport_path: 'f1' })));

                    const { data: nbaData, error: nbaError } = await supabase
                        .from('nba')
                        .select('name, price, team, year, img, deporte')
                        .in('name', wishlistItems);

                    if (nbaError) console.error("Error buscando en NBA:", nbaError);
                    if (nbaData) allProducts.push(...nbaData.map(p => ({ ...p, sport_path: p.deporte })));

                    const { data: futbolData, error: futbolError } = await supabase
                        .from('futbol')
                        .select('name, price, team, year, img, deporte')
                        .in('name', wishlistItems);
                    
                    if (futbolError) console.error("Error buscando en Futbol:", futbolError);
                    if (futbolData) allProducts.push(...futbolData.map(p => ({ ...p, sport_path: p.deporte })));

                    setProducts(allProducts);

                } catch (error) {
                    console.error("Error general al buscar productos de la wishlist:", error);
                    setProducts([]);
                } finally {
                    setLoading(false);
                }

            } else {
                setProducts([]);
            }
        };

        fetchWishlistProducts();
    }, [wishlistVisible, wishlistItems]);


    useEffect(() => {
        function handleClickOutside(event) {
            if (
                wishlistVisible &&
                wishlistRef.current &&
                !wishlistRef.current.contains(event.target)
            ) {
                setWishlistVisible(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [wishlistVisible, setWishlistVisible]);

    
    if (!wishlistVisible) return null;

  return (
    <div className='fixed inset-0 z-[1000] flex items-start justify-end p-4 pt-20'>
        <AnimatePresence>
            {wishlistVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        className='fixed inset-0 bg-black/30 backdrop-blur-sm z-[999]'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setWishlistVisible(false)}
                    />
                    
                    {/* Wishlist Panel */}
                    <motion.div 
                        ref={wishlistRef}
                        className="relative w-full sm:w-[420px] max-h-[85vh] flex flex-col bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl z-[1000] border border-white/20 overflow-hidden"
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <Heart className="w-6 h-6 text-white fill-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Lista de Deseos</h2>
                                        <p className="text-pink-100 text-sm">
                                            {products.length} producto{products.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setWishlistVisible(false)}
                                    className='w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-300 group'>
                                    <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                            </div>

                            {/* Clear All Button */}
                            {products.length > 0 && (
                                <button
                                    onClick={clearWishlist}
                                    className="w-full h-10 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Vaciar Lista
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-pink-50 to-rose-50">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-64">
                                    <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mb-4"></div>
                                    <p className='text-gray-600 font-medium'>Cargando tus favoritos...</p>
                                </div>
                            ) : products.length > 0 ? (
                                <div className="space-y-3">
                                    {products.map((product) => {
                                        const link = product.deporte === 'f1' ? product.category.toLowerCase() : product.deporte.toLowerCase();
                                        const nombre = product.deporte === 'futbol' ? product.team + ' ' + product.year : product.name;
                                        
                                        return (
                                            <motion.div 
                                                key={product.name}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                className="group bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100"
                                            >
                                                <div className="flex gap-4">
                                                    {/* Product Image */}
                                                    <Link onClick={() => setWishlistVisible(false)}
                                                        to={`/${link}/${generarSlug(product.name)}`}
                                                        className="flex-shrink-0 relative"
                                                    >
                                                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-md group-hover:scale-105 transition-transform duration-300">
                                                            <img 
                                                                src={product.img && product.img.length > 0 ? product.img[product.img.length - 1] : 'https://via.placeholder.com/96'} 
                                                                alt={product.name}
                                                                className='w-full h-full object-cover'
                                                            />
                                                        </div>
                                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
                                                            <Heart className="w-3 h-3 text-white fill-white" />
                                                        </div>
                                                    </Link>

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <Link onClick={() => setWishlistVisible(false)}
                                                            to={`/${link}/${generarSlug(product.name)}`}
                                                            className="block group-hover:text-pink-600 transition-colors duration-300"
                                                        >
                                                            <h3 className='font-bold text-gray-800 mb-1 line-clamp-2 text-sm'>
                                                                {nombre}
                                                            </h3>
                                                        </Link>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-xs px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full font-semibold">
                                                                {product.deporte?.toUpperCase()}
                                                            </span>
                                                            <span className="text-xs text-gray-500">{product.year}</span>
                                                        </div>
                                                        <p className='text-xl font-bold text-pink-600'>${product.price} <span className="text-xs text-gray-500">USD</span></p>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex flex-col gap-2">
                                                        <button 
                                                            onClick={() => removeFromWishlist(product.name)}
                                                            className='w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all duration-300 group/btn border border-red-200'>
                                                            <Trash2 className="w-4 h-4 text-red-600 group-hover/btn:scale-110 transition-transform duration-300" />
                                                        </button>
                                                        <Link onClick={() => setWishlistVisible(false)}
                                                            to={`/${link}/${generarSlug(product.name)}`}
                                                            className='w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-all duration-300 group/btn border border-blue-200'
                                                        >
                                                            <ExternalLink className="w-4 h-4 text-blue-600 group-hover/btn:scale-110 transition-transform duration-300" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* Empty State */
                                <div className="flex flex-col items-center justify-center h-full py-16">
                                    <div className="w-32 h-32 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full flex items-center justify-center mb-6">
                                        <Heart className="w-16 h-16 text-pink-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Lista Vacía</h3>
                                    <p className='text-gray-600 text-center mb-6 px-4'>
                                        Aún no has agregado productos a tu lista de deseos
                                    </p>
                                    <button
                                        onClick={() => setWishlistVisible(false)}
                                        className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl font-semibold hover:from-pink-700 hover:to-rose-700 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center gap-2"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        Explorar Productos
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer with CTA */}
                        {products.length > 0 && (
                            <div className="bg-white border-t border-pink-100 p-4">
                                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4 text-center">
                                    <p className="text-sm text-gray-600 mb-3">
                                        ¿Listo para comprar tus favoritos?
                                    </p>
                                    <button
                                        onClick={() => setWishlistVisible(false)}
                                        className="w-full h-12 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-semibold hover:from-pink-700 hover:to-rose-700 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        Continuar Comprando
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    </div>
  )
}

export default Wishlist;