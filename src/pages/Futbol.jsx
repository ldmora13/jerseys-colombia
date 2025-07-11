import React, {useEffect, useState, useRef} from 'react';
import {useNavigate } from 'react-router-dom';
import Loader from "../components/Loader.jsx";
import Header from '../components/Header.jsx';


const Futbol = () => {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  
  return (
    <div>
      {/* LOADER SUPERPUESTO */ }
        {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-[2000]">
          <Loader />
        </div>
      )}
      <Header />
      <main className="bg-[#E8E8E8] flex items-center justify-start h-full w-full p-[20px] flex-col">
        <div className=''>
          <h1>Jerseys de Fútbol</h1>
          <div>
            <div></div>
            
          </div>
        </div>
      </main>

    </div>
  )
}


export default Futbol;