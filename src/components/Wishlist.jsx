import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useWishlist } from '../context/WishlistContext'
import { supabase } from '../lib/supabaseClient'

const Wishlist = () => {

    const { wishlistVisible, setWishlistVisible, wishlistItems, setWishlistItems } = useWishlist();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const wishlistRef = useRef(null); 
  
    // Función para generar slugs 
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

    // Función para eliminar un item
    const removeFromWishlist = (productName) => {
        setWishlistItems(prevItems => prevItems.filter(item => item !== productName));
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

                    // 2. Buscar en la tabla 'nba'
                    const { data: nbaData, error: nbaError } = await supabase
                        .from('nba')
                        .select('name, price, team, year, img, deporte')
                        .in('name', wishlistItems);

                    if (nbaError) console.error("Error buscando en NBA:", nbaError);
                    if (nbaData) allProducts.push(...nbaData.map(p => ({ ...p, sport_path: p.deporte })));

                    // 3. Buscar en la tabla 'futbol'
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
    <div className='flex items-center justify-center w-full z-[1000]'>
        <AnimatePresence>
            {wishlistVisible && (
                <>
                <motion.div 
                    className='fixed top-0 right-0 w-full h-full z-[1000]'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />
                    <motion.div ref={wishlistRef}
                        className="fixed top-20 right-5 sm:w-1/4 w-3/4 max-h-[70vh] flex flex-col shadow-2xl z-[1000] rounded-lg"
                        initial={{ y: "-100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}>

                        {/* Header */}
                        <div className=" w-full bg-gradient-to-br from-blue-50 to-indigo-100 p-4 border-b-[0.5px] flex flex-row justify-between items-center rounded-t-lg">
                            <h2 className="text-sm sm:text-xl font-semibold">Lista de deseos</h2>
                            <button 
                                onClick={() => setWishlistVisible(false)}
                                className='text-gray-500 hover:text-black font-bold hover:scale-110 text-xl p-2 transition-all duration-200'>
                                &times;
                            </button>
                        </div>

                        {/* Contenido */}
                        <div className="w-full h-full p-2 overflow-y-auto bg-indigo-100">
                            {loading ? (
                                <p className='p-4'>Cargando...</p>
                            ) : products.length > 0 ? (
                                products.map((product) => {
                                    const link = product.deporte === 'f1' ? product.category : product.deporte;
                                    const nombre = product.deporte === 'futbol' ? product.team + ' ' + product.year : product.name;
                                    return (
                                        <div key={product.name} className="flex items-center justify-between w-full p-2 border-b">
                                            <Link to={`/${link}/${generarSlug(product.name)}`} className="flex items-center gap-4">
                                                <img 
                                                    src={product.img && product.img.length > 0 ? product.img[product.img.length - 1] : 'https://via.placeholder.com/50'} 
                                                    alt={product.name}
                                                    className='w-16 h-16 object-cover rounded-md'
                                                />
                                                <div>
                                                    <p className='text-sm'>{nombre}</p>
                                                    <p className='text-blue-400'>${product.price} USD</p>
                                                </div>
                                            </Link>
                                            <button 
                                                onClick={() => removeFromWishlist(product.name)}
                                                className='text-red-500 hover:text-red-700 font-bold text-xl p-2'>
                                                &times;
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className='p-4'>Tu lista de deseos está vacía.</p>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    </div>
  )
}

export default Wishlist;