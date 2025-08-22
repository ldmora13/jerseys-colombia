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
                const { data, error } = await supabase
                    .from('f1')
                    .select('name, price, img, category')
                    .in('name', wishlistItems);

                if (error) {
                    console.error("Error fetching wishlist products:", error);
                    setProducts([]);
                } else {
                    setProducts(data);
                }
                setLoading(false);
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
                        className="fixed top-20 right-5 sm:w-1/4 w-3/4 max-h-[70vh] bg-white flex flex-col shadow-2xl z-[1000] rounded-lg"
                        initial={{ y: "-100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}>

                        {/* Header */}
                        <div className="bg-white w-full p-4 border-b-[0.5px] flex flex-row justify-between items-center rounded-t-lg">
                            <h2 className="text-sm sm:text-xl font-semibold">Lista de deseos</h2>
                            <p onClick={() => setWishlistVisible(false)}
                                className='text-sm sm:text-xl text-gray-400 hover:text-black cursor-pointer font-bold'>x</p>
                        </div>

                        {/* Contenido */}
                        <div className="w-full h-full p-2 overflow-y-auto bg-[#E8E8E8]">
                            {loading ? (
                                <p className='p-4'>Cargando...</p>
                            ) : products.length > 0 ? (
                                products.map((product) => (
                                    <div key={product.name} className="flex items-center justify-between w-full p-2 border-b">
                                        <Link to={`/${product.category}/${generarSlug(product.name)}`} className="flex items-center gap-4">
                                            <img 
                                                src={product.img && product.img.length > 0 ? product.img[product.img.length - 1] : 'https://via.placeholder.com/50'} 
                                                alt={product.name}
                                                className='w-16 h-16 object-cover rounded-md'
                                            />
                                            <div>
                                                <p className='text-sm sm:text-xl'>{product.name}</p>
                                                <p className='text-blue-500'>${product.price} USD</p>
                                            </div>
                                        </Link>
                                        <button 
                                            onClick={() => removeFromWishlist(product.name)}
                                            className='text-red-500 hover:text-red-700 font-bold text-xl p-2'>
                                            &times;
                                        </button>
                                    </div>
                                ))
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