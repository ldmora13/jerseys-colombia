import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Slider } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  Filter as FilterIcon,
  Calendar,
  Tag,
  Package,
  Sparkles,
  TrendingUp,
  RefreshCw
} from 'lucide-react'

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

  const getCategorias = (pathname) => {
    if (pathname.includes("/F1") || pathname.includes("/f1")) return ["Todo", "Jerseys", "Polos", "Hoodies"];
    if (pathname.includes("/NBA") || pathname.includes("/nba")) return ["Todo", "Jerseys", "Shorts"];
    if (pathname.includes("/Futbol") || pathname.includes("/futbol")) return ["Todo", "Fan", "Player", "Women", "Windbreaker"];
    return ["Todo"];
  };

  const [categorias, setCategorias] = useState(getCategorias(location.pathname));
  
  useEffect(() => {
    setCategorias(getCategorias(location.pathname));
  }, [location.pathname]);

  const toggleFilter = () => {
    setFilterVisible(false);
  }

  const resetFilters = () => {
    setSearch("");
    setStockSelected("Todo");
    setPromoSelected("Todo");
    setCategorySelected("Todo");
    setYearRange([1950, 2025]);
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
    filterVisible && (
        <div className='fixed inset-0 z-[1000] flex items-start justify-start'>
            <AnimatePresence>
                <>
                    {/* Backdrop */}
                    <motion.div 
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[999]"
                    onClick={() => setFilterVisible(false)} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    />
                    
                    {/* Filter Panel */}
                    <motion.div 
                    ref={filterRef}
                    className='fixed top-0 left-0 w-full sm:w-[420px] h-full bg-white/95 backdrop-blur-xl shadow-2xl z-[1000] overflow-auto border-r border-white/20'
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                    {/* Header */}
                    <div className='sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 shadow-lg'>
                        <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-3'>
                            <div className='w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center'>
                            <FilterIcon className='w-6 h-6 text-white' />
                            </div>
                            <div>
                            <h2 className='text-2xl font-bold text-white'>Filtros</h2>
                            <p className='text-blue-100 text-sm'>Personaliza tu búsqueda</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleFilter}
                            className='w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-300 group'
                        >
                            <X className='w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300' />
                        </button>
                        </div>

                        {/* Reset Button */}
                        <button
                        onClick={resetFilters}
                        className='w-full h-10 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300'
                        >
                        <RefreshCw className='w-4 h-4' />
                        Limpiar Filtros
                        </button>
                    </div>

                    {/* Filter Content */}
                    <div className='p-6 space-y-8'>
                        
                        {/* Search Bar */}
                        <div>
                        <label className='flex items-center gap-2 text-sm font-bold text-gray-700 mb-3'>
                            <Search className='w-5 h-5 text-blue-600' />
                            Buscar Producto
                        </label>
                        <div className='relative'>
                            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                            <input
                            type='text'
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 placeholder-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                        </div>

                        {/* Stock Filter */}
                        <div>
                        <label className='flex items-center gap-2 text-sm font-bold text-gray-700 mb-3'>
                            <Package className='w-5 h-5 text-green-600' />
                            Disponibilidad
                        </label>
                        <div className='flex gap-3'>
                            {['Todo', 'Disponible'].map((stock) => (
                            <button
                                key={stock}
                                onClick={() => setStockSelected(stock)}
                                className={`flex-1 h-12 rounded-2xl font-semibold transition-all duration-300 border-2 ${
                                stockSelected === stock 
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-600 shadow-lg scale-105' 
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50'
                                }`}
                            >
                                {stock}
                            </button>
                            ))}
                        </div>
                        </div>

                        {/* Promotions Filter */}
                        <div>
                        <label className='flex items-center gap-2 text-sm font-bold text-gray-700 mb-3'>
                            <Sparkles className='w-5 h-5 text-orange-600' />
                            Promociones
                        </label>
                        <div className='flex gap-3'>
                            {['Todo', 'En oferta'].map((promo) => (
                            <button
                                key={promo}
                                onClick={() => setPromoSelected(promo)}
                                className={`flex-1 h-12 rounded-2xl font-semibold transition-all duration-300 border-2 ${
                                promoSelected === promo 
                                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-600 shadow-lg scale-105' 
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                                }`}
                            >
                                {promo}
                            </button>
                            ))}
                        </div>
                        </div>

                        {/* Year Range Filter */}
                        <div>
                        <label className='flex items-center gap-2 text-sm font-bold text-gray-700 mb-3'>
                            <Calendar className='w-5 h-5 text-purple-600' />
                            Rango de Años
                        </label>
                        <div className='bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border-2 border-purple-200'>
                            <div className='flex justify-between mb-4'>
                            <div className='text-center'>
                                <p className='text-xs text-purple-600 font-medium mb-1'>Desde</p>
                                <div className='px-4 py-2 bg-white rounded-xl shadow-md'>
                                <span className='text-2xl font-bold text-purple-700'>{yearRange[0]}</span>
                                </div>
                            </div>
                            <div className='flex items-center'>
                                <div className='w-8 h-0.5 bg-purple-300'></div>
                            </div>
                            <div className='text-center'>
                                <p className='text-xs text-purple-600 font-medium mb-1'>Hasta</p>
                                <div className='px-4 py-2 bg-white rounded-xl shadow-md'>
                                <span className='text-2xl font-bold text-purple-700'>{yearRange[1]}</span>
                                </div>
                            </div>
                            </div>
                            <Slider
                            value={yearRange}
                            onChange={(e, newValue) => setYearRange(newValue)}
                            valueLabelDisplay="auto"
                            step={5}
                            marks={[
                                { value: 1950, label: '1950' },
                                { value: 1980, label: '80' },
                                { value: 2000, label: '2000' },
                                { value: 2025, label: '2025' }
                            ]}
                            min={1950}
                            max={2025}
                            sx={{
                                color: '#9333ea',
                                '& .MuiSlider-thumb': {
                                backgroundColor: '#fff',
                                border: '3px solid #9333ea',
                                '&:hover': {
                                    boxShadow: '0 0 0 8px rgba(147, 51, 234, 0.16)',
                                },
                                },
                                '& .MuiSlider-track': {
                                backgroundColor: '#9333ea',
                                border: 'none',
                                },
                                '& .MuiSlider-rail': {
                                backgroundColor: '#e9d5ff',
                                },
                                '& .MuiSlider-mark': {
                                backgroundColor: '#9333ea',
                                },
                                '& .MuiSlider-markLabel': {
                                fontSize: '10px',
                                color: '#7e22ce',
                                },
                            }}
                            />
                        </div>
                        </div>

                        {/* Category Filter */}
                        <div>
                        <label className='flex items-center gap-2 text-sm font-bold text-gray-700 mb-3'>
                            <Tag className='w-5 h-5 text-pink-600' />
                            Categoría
                        </label>
                        <div className='grid grid-cols-2 gap-3'>
                            {categorias.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategorySelected(cat)}
                                className={`h-12 rounded-2xl font-semibold transition-all duration-300 border-2 ${
                                categorySelected === cat 
                                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-pink-600 shadow-lg scale-105' 
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                                }`}
                            >
                                {cat}
                            </button>
                            ))}
                        </div>
                        </div>

                        {/* Active Filters Summary */}
                        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200'>
                        <h3 className='font-bold text-gray-800 mb-3 flex items-center gap-2'>
                            <TrendingUp className='w-5 h-5 text-blue-600' />
                            Filtros Activos
                        </h3>
                        <div className='space-y-2 text-sm'>
                            {search && (
                            <div className='flex items-center justify-between p-2 bg-white rounded-lg'>
                                <span className='text-gray-600'>Búsqueda:</span>
                                <span className='font-semibold text-blue-600'>"{search}"</span>
                            </div>
                            )}
                            {stockSelected !== 'Todo' && (
                            <div className='flex items-center justify-between p-2 bg-white rounded-lg'>
                                <span className='text-gray-600'>Stock:</span>
                                <span className='font-semibold text-green-600'>{stockSelected}</span>
                            </div>
                            )}
                            {promoSelected !== 'Todo' && (
                            <div className='flex items-center justify-between p-2 bg-white rounded-lg'>
                                <span className='text-gray-600'>Promo:</span>
                                <span className='font-semibold text-orange-600'>{promoSelected}</span>
                            </div>
                            )}
                            {categorySelected !== 'Todo' && (
                            <div className='flex items-center justify-between p-2 bg-white rounded-lg'>
                                <span className='text-gray-600'>Categoría:</span>
                                <span className='font-semibold text-pink-600'>{categorySelected}</span>
                            </div>
                            )}
                            {(yearRange[0] !== 1950 || yearRange[1] !== 2025) && (
                            <div className='flex items-center justify-between p-2 bg-white rounded-lg'>
                                <span className='text-gray-600'>Años:</span>
                                <span className='font-semibold text-purple-600'>{yearRange[0]} - {yearRange[1]}</span>
                            </div>
                            )}
                            {!search && stockSelected === 'Todo' && promoSelected === 'Todo' && categorySelected === 'Todo' && yearRange[0] === 1950 && yearRange[1] === 2025 && (
                            <p className='text-gray-500 text-center py-4'>Sin filtros aplicados</p>
                            )}
                        </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className='sticky bottom-0 bg-white border-t border-gray-200 p-4'>
                        <button
                        onClick={toggleFilter}
                        className='w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2'
                        >
                        <FilterIcon className='w-5 h-5' />
                        Aplicar Filtros
                        </button>
                    </div>
                    </motion.div>
                </>
            </AnimatePresence>
        </div>
    )
  )
}

export default Filter