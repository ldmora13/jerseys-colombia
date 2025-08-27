import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Slider } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion';

const Filter = ({
  filterVisible, setFilterVisible,
  search, setSearch,
  stockSelected, setStockSelected,
  promoSelected, setPromoSelected,
  categorySelected, setCategorySelected,
  yearRange, setYearRange
}) => {

  const navigate = useNavigate();
  const location = useLocation();
  const filterRef = useRef(null);

  // Definir las categorías basadas en la ruta
  const getCategorias = (pathname) => {
    if (pathname.includes("/F1")) return ["Todo", "Jerseys", "Polos", "Hoodies"];
    if (pathname.includes("/NBA")) return ["Todo", "Jerseys", "Shorts"];
    if (pathname.includes("/futbol")) return ["Todo", "Fan", "Player", "Windbreaker"];
    return ["Todo"];
  };

  const [categorias, setCategorias] = useState(getCategorias(location.pathname));
  useEffect(() => {
    setCategorias(getCategorias(location.pathname));
  }, [location.pathname]);

    const toggleFilter = () => {
        setFilterVisible(false);
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                filterVisible &&
                filterRef.current &&
                !filterRef.current.contains(event.target)
            ) {
                setFilterVisible(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [filterVisible, setFilterVisible]);


  return (
    <div className='flex items-center justify-center w-full z-[1000]'>
        <AnimatePresence>
            {filterVisible && (
                <>

                    <motion.div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[900]"
                        onClick={() => setFilterVisible(false)} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                    <motion.div ref={filterRef}
                        className='fixed top-0 left-0 sm:w-1/3 w-full h-full bg-[#E8E8E8] p-4 gap-4 gap-y-6 flex flex-col z-[1000] overflow-auto'
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}>

                        <div className='flex flex-col items-center'>
                            <div className='flex items-center flex-row justify-between w-full p-2'>
                                <h2 className='text-[16px] font-bold sm:text-2xl'>Filtros disponibles</h2>
                                <p onClick={toggleFilter}
                                    className='text-2xl sm:text-3xl text-gray-400 hover:text-black cursor-pointer'>x</p>
                            </div>
                        <div className="mt-3 sm:mt-1 w-full h-[2px] bg-gradient-to-r from-transparent via-[#252525] to-transparent">
                        </div>
                        </div>
                        {/* Filter bar */}
                        <div className='flex flex-col items-start w-full mt-5'>
                            <div className='w-[90%] sm:h-full '>
                                <form>
                                    <input
                                        type='text'
                                        placeholder="Buscar"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="h-auto py-2 sm:py-0 sm:h-[45px] w-full px-4 rounded-[13px] bg-[#F3F3F3] font-semibold outline-none focus:shadow-[0_0_10px_rgba(45,64,75,1)]"
                                    />
                                </form>    
                            </div>      
                        </div>
                        <div className='mt-2 sm:mt-5 flex items-start justify-b etween flex-col w-full'>
                            <div className='flex flex-row w-full gap-3'>
                                <div className='mt-1 h-3 w-1 sm:h-5 sm:w-2 bg-[#252525]'></div>
                                <h3 className='text-sm sm:text-[20px]'>Stock</h3>
                            </div>
                            <div className='flex flex-row items-center justify-start w-full sm:gap-x-8 gap-x-2 mt-2 text-black'>
                                {['Todo', 'Disponible'].map((stock) => (
                                    <div
                                    key={stock}
                                    className={`sm:p-2 p-2 h-auto sm:px-5 rounded-[12px] border-2 border-[#252525] cursor-pointer transition
                                        ${stockSelected === stock ? 'bg-[#252525] text-white scale-110' : 'hover:bg-[#252525] hover:text-white hover:scale-110'}`}
                                    role='button'
                                    onClick={() => setStockSelected(stock)}>
                                    <p className='text-[12px] sm:text-[16px]'>{stock}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='mt-2 sm:mt-5 flex items-start justify-between flex-col w-full'>
                            <div className='flex flex-row w-full gap-3'>
                                <div className='mt-1 h-3 w-1 sm:h-5 sm:w-2 bg-[#252525]'></div>
                                <h3 className='text-sm sm:text-[20px]'>Promociones</h3>
                            </div>
                            <div className='flex flex-row items-center justify-start w-full sm:gap-x-8 gap-x-2 mt-2 text-black'>
                                {['Todo', 'En oferta'].map((promo) => (
                                    <div
                                    key={promo}
                                    className={`sm:p-2 p-2 h-auto sm:px-5 rounded-[12px] border-2 border-[#252525] cursor-pointer transition
                                        ${promoSelected === promo ? 'bg-[#252525] text-white scale-110' : 'hover:bg-[#252525] hover:text-white hover:scale-110'}`}
                                    role='button'
                                    onClick={() => setPromoSelected(promo)}
                                    >
                                    <p className='text-[12px] sm:text-[16px]'>{promo}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='mt-2 sm:mt-5 flex items-start justify-between flex-col w-full'>
                            <div className='flex flex-row w-full gap-3'>
                                <div className='mt-1 h-3 w-1 sm:h-5 sm:w-2 bg-[#252525]'></div>
                                <h3 className='text-sm sm:text-[20px]'>Año</h3>
                            </div>
                            <div className='flex flex-col items-center justify-start w-[80%] sm:w-[350px] sm:gap-x-8 mt-2 text-black'>
                                <Slider
                                    value={yearRange}
                                    onChange={(e, newValue) => setYearRange(newValue)}
                                    valueLabelDisplay="auto"
                                    step={10}
                                    marks
                                    min={1950}
                                    max={2025}
                                    color='black'
                                    className='w-full'
                                />
                            </div>
                        </div>
                        <div className='mt-2 sm:mt-5 flex items-start justify-between flex-col w-full'>
                            <div className='flex flex-row w-full gap-3'>
                                <div className='mt-1 h-3 w-1 sm:h-5 sm:w-2 bg-[#252525]'></div>
                                <h3 className='text-sm sm:text-[20px]'>Categoria</h3>
                            </div>
                            <div className='flex flex-row items-center justify-start w-full sm:gap-x-8 gap-x-2 mt-2 text-black'>
                                {categorias.map((cat) => (
                                    <div
                                    key={cat}
                                    className={`sm:p-2 p-2 h-auto sm:px-5 rounded-[12px] border-2 border-[#252525] cursor-pointer transition
                                        ${categorySelected === cat ? 'bg-[#252525] text-white scale-110' : 'hover:bg-[#252525] hover:text-white hover:scale-110'}`}
                                    role='button'
                                    onClick={() => setCategorySelected(cat)}>
                                    <p className='text-[12px] sm:text-[16px]'>{cat}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                </motion.div>
            </>
            )}
        </AnimatePresence>
    </div>
  )
}

export default Filter