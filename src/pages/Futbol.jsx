import React, {useEffect, useState, useRef} from 'react';
import {useNavigate, useLocation } from 'react-router-dom';
import Loader from "../components/Loader.jsx";
import Header from '../components/Header.jsx';
import Filter from '../components/Filter.jsx';
import { supabase } from '../lib/supabaseClient.js';



const Futbol = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const [camisetasFutbol, setCamisetasFutbol] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState('');

  const handleOrderChange = (event) => {
    setOrder(event.target.value);
  }

  useEffect(() => {
    const fetchCamisetasFutbol = async () => {
      try {
        const futbolRes = await supabase
          .from('selecciones')
          .select('name, img, type, year, index, category, country, type, price, stock')
          .order('year', { ascending: true })
          .limit(20);

        if (futbolRes.error) {
          console.error('Error en Futbol:', futbolRes.error);
        } else {
          setCamisetasFutbol(futbolRes.data);
        }
      } catch (err) {
        console.error('Error al cargar camisetas de futbol:', err);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    }
    fetchCamisetasFutbol();
  }, []);
  
  return (
    <div className="flex overflow-hidden">
      <div className="flex-1">
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-[2000]">
            <Loader />
          </div>
        )}
        <Filter filterVisible={filterVisible} setFilterVisible={setFilterVisible} />
        <Header />
        <main className="mt-20 flex flex-col items-center w-screen h-screen p-4 text-black overflow-hidden  ">
          <div className='flex flex-col items-center w-auto h-auto'>
            <svg className='h-12' fill="#000000" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 500.152 500.152" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M463.776,116.236c-9.688-30.68-32.52-54.76-62.656-66.056l-79.048-29.648V2.076h-144v18.456l-79.048,29.64 c-30.136,11.304-52.968,35.376-62.656,66.056L0,231.412l95.44,28.632l18.632-62.128v300.16h272v-300.16l18.64,62.12l95.44-28.632 L463.776,116.236z M306.072,18.076v6.112L292.4,51.532l-23.752,7.92l25.856-41.376H306.072z M275.632,18.076l-25.56,40.904 l-25.568-40.904H275.632z M194.072,18.076h11.568l25.856,41.376l-23.752-7.92l-13.672-27.344V18.076z M130.072,482.076v-185.56 c12.52,9.52,21.88,22.864,26.336,38.144l43,147.416H130.072z M171.768,330.188c-6.504-22.32-21.616-41.232-41.696-52.76v-73.96 l6.928,5.936c21.68,18.584,36.056,44.36,40.464,72.584l22.792,145.864L171.768,330.188z M370.072,482.076h-69.336l43-147.416 c4.456-15.28,13.816-28.624,26.336-38.144V482.076z M370.072,277.428c-20.08,11.52-35.184,30.432-41.696,52.76l-28.488,97.664 l22.792-145.864c4.408-28.216,18.784-54,40.464-72.584l6.928-5.936V277.428z M392.024,162.076h-21.952v20.32l-17.336,14.864 c-24.576,21.064-40.856,50.28-45.856,82.264l-31.656,202.552h-50.312l-31.648-202.56c-5-31.984-21.28-61.192-45.856-82.264 l-17.336-14.856v-20.32H108.12l-23.408,78.04l-64.56-19.368l5.808-18.384l53.92,15.408l4.4-15.384L30.776,187.1l20.856-66.048 c8.192-25.96,27.52-46.336,53.016-55.896l77.496-29.064l14.264,28.52l53.664,17.896l53.672-17.888l14.264-28.52l77.496,29.064 C421,74.724,440.328,95.1,448.52,121.06l20.856,66.048l-53.504,15.288l4.4,15.384l53.92-15.408L480,220.756l-64.56,19.368 L392.024,162.076z"></path> </g> </g> </g></svg>
            <h1 className='font-bold text-2xl'>Jerseys de Fútbol</h1>
          </div>
          <div className='flex flex-row items-center justify-between w-[70%] h-auto p-4 mt-4'>
            <div onClick={() => setFilterVisible(true)} className='hover:bg-[#252525] hover:text-white hover:scale-110 transition p-2 px-5 rounded-[12px] border-2 border-[#252525] cursor-pointer' role='button'>
                <p>Filtrar</p>
            </div>
            <form  action="">
              <label className='mr-2'>Ordenar por</label>
              <select name="" id="" className='p-2 px-5 rounded-[12px] border-2 border-[#252525] text-black' value={order} onChange={handleOrderChange}>
                <option value="year">Relevantes</option>
                <option value="lowCost">Menor precio</option>
                <option value="highCost">Mayor precio</option>
              </select>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}


export default Futbol;