import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Header from '../components/Header';
import Loader from '../components/Loader';

const F1 = () => {

  const [camisetasF1, setCamisetasF1] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('');


  useEffect(() => {
    const fetchCamisetasF1 = async () => {
      try {
        const f1Res = await supabase
          .from('F1')
          .select('name, img, team, year, index, driver')
          .order('year', { ascending: true })
          .limit(100);

        if (f1Res.error) {
          console.error('Error en F1:', f1Res.error);
        } else {
          setCamisetasF1(f1Res.data);
        }
      } catch (err) {
        console.error('Error al cargar camisetas F1:', err);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    };
    fetchCamisetasF1();
  }, []);

  const camisetasFiltradas = camisetasF1.filter((camiseta) => {
  const texto = `${camiseta.name} ${camiseta.team} ${camiseta.year} ${camiseta.driver}`.toLowerCase();
  return texto.includes(filtro.toLowerCase());
  });

 return (
    <div className="flex overflow-x-hidden">
      {/* Sidebar de filtro */}
      <div
        className="mt-22 hidden md:flex flex-col items-center justify-start w-[260px] h-[400px] rounded-2xl bg-[#e0e0e0] ml-8"
        style={{ boxShadow: '15px 15px 30px #bebebe, -15px -15px 30px #ffffff' }}
      >
        <h3 className="mt-6 mb-2 font-bold text-lg">Filtrar</h3>
        <input
          type="text"
          placeholder="Buscar"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="rounded p-2 w-[80%] border mb-4"
        />
        <p className="text-xs text-gray-500 px-4 text-center">
          Escribe parte del nombre, año, team o piloto para filtrar los resultados.
        </p>
      </div>

      <div className="flex-1">
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-[2000]">
            <Loader />
          </div>
        )}
        <Header />
        <main className="bg-[#E8E8E8] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 items-start mt-15 justify-center min-h-screen w-full ml-[50px] p-[20px]">
          {camisetasFiltradas.map((camiseta, index) => {
            const imagenes = camiseta.img || [];
            const imagenPrincipal = imagenes.length > 0 ? imagenes[imagenes.length - 1] : null;

            return (
              <div
                key={index}
                className="mt-4 flex flex-col items-center justify-center w-[220px] h-[300px] rounded-2xl bg-[#e0e0e0]"
                style={{ boxShadow: '15px 15px 30px #bebebe, -15px -15px 30px #ffffff' }}
              >
                {imagenPrincipal && (
                  <img
                    src={imagenPrincipal}
                    alt={camiseta.name}
                    className="w-[200px] object-contain rounded mb-2"
                  />
                )}
                <div className="w-full flex flex-col items-center">
                  <h2 className="font-bold text-center">{camiseta.team} {camiseta.driver ? camiseta.driver : camiseta.year}</h2>
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
};

export default F1;