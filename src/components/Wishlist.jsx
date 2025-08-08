import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const Wishlist = ({ 
    wishlistVisible, setWishlistVisible,
    wishlistItems, setWishlistItems 
}) => {
 
    const wishlistRef = useRef(null)

  return (
    <div className='flex items-center justify-center w-full z-[1000]'>
        <AnimatePresence>
            
            {wishlistVisible && (
                <>
                <motion.div 
                    className='fixed top-0 right-0 w-full h-full bg-black/50 z-[1000]'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />
                    <motion.div ref={wishlistRef} 
                        className='fixed top-15 right-20 sm:w-1/4 w-1/2 h-auto bg-[#E8E8E8] p-4 gap-4 gap-y-6 flex flex-col z-[1000] overflow-auto'
                        initial={{ y: '-100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '-100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                        <div className='fixed top-0 left-0 bg-white w-5 h-5'>

                        </div>
                        <h2 className='text-xl font-bold mb-4'>Lista de deseos</h2>
                        {wishlistItems.length > 0 ? (
                            wishlistItems.map(item => (
                                <div key={item.id} className='mb-2'>
                                    <p>{item.name}</p>
                                </div>
                            ))
                        ) : (
                            <p>No items in wishlist</p>
                        )}
                        <button 
                            onClick={() => setWishlistVisible(false)} 
                            className='mt-4 bg-blue-500 text-white px-4 py-2 rounded'>
                            Close
                        </button>
                </motion.div>
                </>
            )}
        </AnimatePresence>
        
    </div>
  )
}

export default Wishlist