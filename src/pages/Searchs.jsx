import React, {useEffect, useState} from 'react'
import { useLocation } from 'react-router-dom'
import {supabase} from '../lib/supabaseClient'
import Header from '../components/Header'
import Loader from '../components/Loader'


const Searchs = () => {
    
    const location = useLocation();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState();
    const [futbol, setFutbol] = useState([]);
    const [nba, setNba] = useState([]);
    const [f1, setF1] = useState([]);

    const queryParams = new URLSearchParams(location.search);
    const search = queryParams.get('search');

    useEffect(() => {
        const buscar = async () => {
        setLoading(true);
            try {
            const [resFutbol, resNba, resF1] = await Promise.all([
            supabase.from("selecciones").select("*").ilike("nombre", `%${busqueda}%`),
            supabase.from("NBA-1").select("*").ilike("nombre", `%${busqueda}%`),
            supabase.from("F1").select("*").ilike("nombre", `%${busqueda}%`)
        ]);

        if (resFutbol.error) console.error('Error en Fútbol:', resFutbol.error)
        else setFutbol(resFutbol.data)

        if (resNba.error) console.error('Error en NBA:', resNba.error)
        else setNba(resNba.data)

        if (resF1.error) console.error('Error en F1:', resF1.error)
        else setF1(resF1.data)

        } catch (error) {
            console.error('Error al buscar:', error);
        } finally {
            setLoading(false);
        }
    }
    }, [search]);
  

    return (
        <div>
            {/* LOADER SUPERPUESTO */}
            {loading && (
            <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-[2000]">
                <Loader />
            </div>
            )} 
            {/* HEADER */}
            <Header />

            

        </div>
    )
}

export default Searchs