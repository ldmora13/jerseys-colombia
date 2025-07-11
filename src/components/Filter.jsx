import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Slider } from '@mui/material'

const Filter = ({filterVisible, setFilterVisible}) => {

    const navigate = useNavigate();
    const location = useLocation();
    const filterRef = useRef(null);


    let categorias = ["Todo"];
    if (location.pathname.includes("/f1")){
        categorias = ["Todo", "Jerseys", "Polos", "Hoodies"];
    } else if (location.pathname.includes("/nba")){
        categorias = ["Todo", "Jerseys", "Shorts"];
    }else if (location.pathname.includes("/futbol")){
        categorias = ["Todo", "Fans", "Players", "Chaquetas"];
    }

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
        {filterVisible && (
            <>
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[900]"
                onClick={() => setFilterVisible(false)} />
                <div ref={filterRef}
                    className='fixed top-0 left-0 w-1/3 h-full bg-white p-4 gap-4 gap-y-6 flex flex-col z-[1000] overflow-auto'>
                    <div className='flex flex-col items-center'>
                        <div className='flex items-center flex-row justify-between w-full p-6'>
                            <h2 className='font-bold text-2xl'>Filtros disponibles</h2>
                            <svg className='h-6 cursor-pointer hover:scale-110 transition' role='button' onClick={toggleFilter} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                <g id="SVGRepo_iconCarrier">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z" fill="#000000"></path>
                                </g>
                            </svg>
                        </div>
                <div className="mt-3 w-full h-[2px] bg-gradient-to-r from-transparent via-[#252525] to-transparent">
                </div>
                </div>
                {/* Filter bar */}
                <div className='flex flex-col items-start gap-6 w-full mt-5'>
                    <div className='w-[350px] '>
                        <form>
                            <input
                                type='text'
                                placeholder="Buscar"
                                className="h-[45px] w-full px-4 rounded-[13px] bg-[#F3F3F3] font-semibold outline-none focus:shadow-[0_0_10px_rgba(45,64,75,1)]"
                            />
                        </form>    
                    </div>      
                </div>
                <div className='mt-5 flex items-start justify-between flex-col w-full'>
                    <div className='flex flex-row w-full gap-3'>
                        <div className='mt-1 h-5 w-2 bg-[#252525]'></div>
                        <h3 className='text-[20px]'>Stock</h3>
                    </div>
                    <div className='flex flex-row items-center justify-start w-full gap-x-8 mt-2 text-black'>
                        <div className='hover:bg-[#252525] hover:text-white hover:scale-110 transition p-2 px-5 rounded-[12px] border-2 border-[#252525] cursor-pointer' role='button'>
                            <p>Todo</p>
                        </div>
                        <div className='hover:bg-[#252525] hover:text-white hover:scale-110 transition p-2 px-5 rounded-[12px] border-2 border-[#252525] cursor-pointer' role='button'>
                            <p>En stock</p>
                        </div>
                        <div className='hover:bg-[#252525] hover:text-white hover:scale-110 transition p-2 px-5 rounded-[12px] border-2 border-[#252525] cursor-pointer' role='button'>
                            <p>Agotado</p>
                        </div>
                    </div>
                </div>
                <div className='mt-5 flex items-start justify-between flex-col w-full'>
                    <div className='flex flex-row w-full gap-3'>
                        <div className='mt-1 h-5 w-2 bg-[#252525]'></div>
                        <h3 className='text-[20px]'>Promociones</h3>
                    </div>
                    <div className='flex flex-row items-center justify-start w-full gap-x-8 mt-2 text-black'>
                        <div className='hover:bg-[#252525] hover:text-white hover:scale-110 transition p-2 px-5 rounded-[12px] border-2 border-[#252525] cursor-pointer' role='button'>
                            <p>Todo</p>
                        </div>
                        <div className='hover:bg-[#252525] hover:text-white hover:scale-110 transition p-2 px-5 rounded-[12px] border-2 border-[#252525] cursor-pointer' role='button'>
                            <p>En oferta</p>
                        </div>
                    </div>
                </div>
                <div className='mt-5 flex items-start justify-between flex-col w-full'>
                    <div className='flex flex-row w-full gap-3'>
                        <div className='mt-1 h-5 w-2 bg-[#252525]'></div>
                        <h3 className='text-[20px]'>Año</h3>
                    </div>
                    <div className='flex flex-col items-center justify-start w-[350px] gap-x-8 mt-2 text-black'>
                        <Slider
                            defaultValue={[2000, 2025]}
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
                <div className='mt-5 flex items-start justify-between flex-col w-full'>
                    <div className='flex flex-row w-full gap-3'>
                        <div className='mt-1 h-5 w-2 bg-[#252525]'></div>
                        <h3 className='text-[20px]'>Categoria</h3>
                    </div>
                    <div className='flex flex-row items-center justify-start w-full gap-x-8 mt-2 text-black'>
                        {categorias.map((cat) => (
                        <div
                            key={cat}
                            className='hover:bg-[#252525] hover:text-white hover:scale-110 transition p-2 px-5 rounded-[12px] border-2 border-[#252525] cursor-pointer'
                            role='button'>
                            <p>{cat}</p>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
        </>
        )}
    </div>
  )
}

export default Filter