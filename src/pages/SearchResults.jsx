import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import { supabase } from '../lib/supabaseClient';

import Loader from '../components/Loader';
import Footer from '../components/Footer';
import AlertGlobal from '../components/AlertGlobal';

const SearchResults = () => {

  const { query } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({
          show: false,
          message: "",
          severity: "success",
    });

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

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;

      setLoading(true);
      setError(null);

      try {

        const safeQuery = query.replace(/[%_]/g, ""); 
        const f1Query = supabase
          .from("f1")
          .select("*")
          .or(`name.ilike.%${safeQuery}%,team.ilike.%${safeQuery}%,driver.ilike.%${safeQuery}%`);

        const nbaQuery = supabase
          .from("nba")
          .select("*")
          .or(`name.ilike.%${safeQuery}%,team.ilike.%${safeQuery}%,player.ilike.%${safeQuery}%`);

        const futbolQuery = supabase
          .from("futbol")
          .select("*")
          .or(`name.ilike.%${safeQuery}%,team.ilike.%${safeQuery}%`);

        // Buscar en paralelo
        const [f1Res, nbaRes, futbolRes] = await Promise.all([f1Query, nbaQuery, futbolQuery]);

        if (f1Res.error) throw f1Res.error;
        if (nbaRes.error) throw nbaRes.error;
        if (futbolRes.error) throw futbolRes.error;
        
        // Combinar los resultados
        const f1Data = f1Res.data.map(item => ({ ...item, page: 'F1' }));
        const nbaData = nbaRes.data.map(item => ({ ...item, page: 'NBA' }));
        const futbolData = futbolRes.data.map(item => ({ ...item, page: 'futbol' }));

        const allResults = [...f1Data, ...nbaData, ...futbolData];
        setResults(allResults);

      } catch (err) {
            setAlert({
                show: true,
                message: "Error realizando la busqueda",
                severity: "error",
                }
            );
        setError("No se pudieron cargar los resultados.");
        } finally {
            setLoading(false);
        }
    };

    fetchResults();
  }, [query]); 

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 bg-opacity-90 z-[2000]">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <main className="flex flex-col items-center w-full min-h-screen p-4 pt-24 text-black">
        <h1 className="text-3xl font-bold mb-6">Resultados para: <span className='text-blue-600'>"{query}"</span></h1>

        {error && <p className="text-red-500">{error}</p>}
        <div className='relative'>
            <AlertGlobal alert={alert} setAlert={setAlert} />
        </div>
        
        {results.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl'>
            {results.map((item, index) => {
              const slug = generarSlug(item.name);
              const imagenPrincipal = item.img && item.img.length > 0 ? item.img[item.img.length - 1] : '';

              return (
                <div key={`${item.page}-${index}`}
                     className="flex flex-col overflow-hidden items-center justify-start w-full h-auto rounded-2xl bg-white border-2 border-[#252525] hover:scale-105 transition-transform"
                     style={{ boxShadow: '15px 15px 30px #bebebe, -15px -15px 30px #ffffff' }}>
                  <Link to={`/${item.page}/${slug}`} className="w-full">
                    <div className="w-full h-[300px] relative rounded-t-2xl overflow-hidden bg-[#f3f3f3] border-b-2 border-b-[#252525]">
                      {imagenPrincipal && (
                        <img
                          src={imagenPrincipal}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </Link>
                  <div className="flex flex-col items-start w-full p-3">
                    <p className='font-semibold capitalize'>
                      {/* Lógica para mostrar el título correctamente */}
                      {item.page === 'F1' && `${item.type || ''} de ${item.team || ''} ${item.year || ''}`}
                      {item.page === 'NBA' && `${item.category || ''} ${item.player || ''} ${item.team || ''} ${item.year || ''}`}
                      {item.page === 'futbol' && `${item.team || ''} ${item.year || ''} ${item.category || ''}`}
                    </p>
                    <p className='text-blue-500 mt-1'>${item.price} USD</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !loading && <p>No se encontraron resultados para tu búsqueda.</p>
        )}
      </main>
      <Footer />
    </>
  );
};

export default SearchResults;