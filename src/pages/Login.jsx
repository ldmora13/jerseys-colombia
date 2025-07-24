import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader.jsx"
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import {supabase} from "../lib/supabaseClient"
import { ChevronDown, ChevronUp } from 'lucide-react';


const BASE_URL = 'https://nnungauvdtershilojxj.supabase.co/storage/v1/object/public/camisetas-futbol/'

const Login = () => {

  const [loading, setLoading] = useState(true);

  {/* Auth */}
  const navigate = useNavigate();

  {/* Supabase */}
  const [camisetasFutbol, setCamisetasFutbol] = useState([])
  const [camisetasNBA, setCamisetasNBA] = useState([])
  const [camisetasF1, setCamisetasF1] = useState([])

   {/* Blur */}
  const [hoveredIndexFutbol, setHoveredIndexFutbol] = useState(null);
  const [hoveredIndexNBA, setHoveredIndexNBA] = useState(null);
  const [hoveredIndexF1, setHoveredIndexF1] = useState(null);

  {/* Preguntas frecuentes*/}
  const [isAtTop, setIsAtTop] = useState(false);
  const topRef = useRef(null);
  const preguntasRef = useRef(null);
  const [activa, setActiva] = useState(null);
  const preguntas = [
    {
      pregunta: '¿Cuanto tiempo demora en llegar mi pedido?',
      respuesta: 'El tiempo estimado de exportacion es de 2 días, el tiempo de envio depende del país de destino, pero en general es de 15 a 20 días hábiles.'
    },
    {
      pregunta: '¿Como se mi talla?',
      respuesta: 'Las tallas son las estandarizadas por el sistema internacional, aún así puedes consultar la tabla de tallas en cada producto.'
    },
    {
      pregunta: '¿Puedo devolver mi pedido?',
      respuesta: 'Si, puedes devolver tu pedido en un plazo de 15 días desde la fecha de entrega. Para más información, consulta nuestra política de devoluciones.'
    },
    {
      pregunta: '¿Como puedo pagar?',
      respuesta: 'Aceptamos tarjetas de crédito y débito, PayPal y transferencias bancarias. Todo se realiza a través de portales totalmente seguros y estandarizados. Puedes elegir tu método de pago preferido al finalizar la compra.'
    },
    {
      pregunta: '¿Como puedo saber donde está mi pedido?',
      respuesta: 'Una vez que tu pedido haya sido enviado, recibirás un correo electrónico con un enlace de seguimiento. Puedes usar ese enlace para ver el estado de tu pedido en tiempo real o si lo prefieres, puedes consultar el estado de tu pedido en la sección "Compras" de tu cuenta.'
    } 

  ]

  const togglePregunta = (index) => {
    setActiva(activa === index ? null : index);
  };


  useEffect(() => {
    const fetchCamisetas = async () => {
      try {
        const [futbolRes, nbaRes, f1Res] = await Promise.all([
          supabase
            .from('selecciones')
            .select('name, img, country, year, index')
            .order('year', { ascending: true })
            .limit(3),
  
          supabase
            .from('nba')
            .select('name, img, team, year, index, player')
            .order('year', { ascending: true })
            .limit(3),
  
          supabase
            .from('f1')
            .select('name, img, team, year, index, driver')
            .order('year', { ascending: true })
            .limit(3)
        ])
  
        if (futbolRes.error) console.error('Error en Fútbol:', futbolRes.error)
        else setCamisetasFutbol(futbolRes.data)
  
        if (nbaRes.error) console.error('Error en NBA:', nbaRes.error)
        else setCamisetasNBA(nbaRes.data)
  
        if (f1Res.error) console.error('Error en F1:', f1Res.error)
        else setCamisetasF1(f1Res.data)
  
      } catch (err) {
        console.error('Error al cargar camisetas:', err)
      } finally {
        
        setTimeout(() => {
          setLoading(false)
        }, 1500)
      }
    }
  
    fetchCamisetas()
  }, [])


  const handleScroll = () => {
    if (isAtTop) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      preguntasRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    setIsAtTop(!isAtTop);
  };

  useEffect(() => {
    const handleScrollPosition = () => {
      const scrollY = window.scrollY;
      setIsAtTop(scrollY > 100); 
    };
    window.addEventListener("scroll", handleScrollPosition);
    return () => window.removeEventListener("scroll", handleScrollPosition);
  }, []);


  return (
    <div>
       {/* LOADER SUPERPUESTO */}
       {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-[2000]">
          <Loader />
        </div>
      )}

      {/* Header */}
      <Header/>


      <main className="bg-[#E8E8E8] flex items-center md:justify-start h-full w-full p-[20px] flex-col mt-20">
        <div className="mt-2 flex md:flex-row flex-col justify-center items-center gap-10 w-full">

          {/* Contenedor 1 */}
          <div onClick={() => navigate("/futbol")} className="group flex flex-col items-center justify-center  w-[300px] h-[400px] rounded-2xl bg-[#e0e0e0]"
           style={{ boxShadow: '15px 15px 30px #bebebe, -15px -15px 30px #ffffff' }}>
            <p className="-mt-4 mb-2 text-center text-[16px] font-semibold cursor-pointer">Fútbol</p>
            <div className="flex flex-col gap-4 overflow-visible">
              {camisetasFutbol.map((camiseta, index) => {
                const imagenes = camiseta.img || []
                const imagenPrincipal = imagenes.length > 0 ? imagenes[imagenes.length - 1] : null

                return (
                  <div key={index} onMouseEnter={() => setHoveredIndexFutbol(index)} onMouseLeave={() => setHoveredIndexFutbol(null)}  onClick={(e) => {e.stopPropagation(); navigate("/");}}
                   className={`flex flex-row items-center border rounded shadow p-2 gap-2 w-[250px] mx-auto cursor-pointer 
                    transform transition-all duration-300 ease-in-out
                    ${hoveredIndexFutbol === null ? '' : hoveredIndexFutbol === index ? 'scale-110 blur-0' : 'scale-90 blur-[2px]'}
                  `}>
                    {imagenPrincipal && (
                      <img
                        src={imagenPrincipal}
                        alt={camiseta.name}
                        className="w-[80px] h-[80px] object-cover rounded"
                      />
                    )}
                    <div className="mx-2 flex flex-col">
                      <h2>{camiseta.country} {camiseta.year}</h2>
                    </div>
                    
                  </div>
                )
              })}
            </div>
          </div>
          {/* Contenedor 2 */}
          <div onClick={() => navigate("/nba")} className="group flex flex-col items-center justify-center  w-[300px] h-[400px] rounded-2xl bg-[#e0e0e0]" 
              style={{ boxShadow: '15px 15px 30px #bebebe, -15px -15px 30px #ffffff' }}>
            <p className="cursor-pointer -mt-4 mb-2 text-center text-[16px] font-semibold">NBA</p>
            <div className="flex flex-col gap-4 overflow-visible">
              {camisetasNBA.map((camiseta, index) => {
                const imagenes = camiseta.img || []
                const imagenPrincipal = imagenes.length > 0 ? imagenes[imagenes.length - 1] : null

                return (
                  <div key={index} onMouseEnter={() => setHoveredIndexNBA(index)} onMouseLeave={() => setHoveredIndexNBA(null)}
                   className={`flex flex-row items-center border rounded shadow p-2 gap-2 w-[250px] mx-auto cursor-pointer 
                    transform transition-all duration-300 ease-in-out
                    ${hoveredIndexNBA === null ? '' : hoveredIndexNBA === index ? 'scale-110 blur-0' : 'scale-90 blur-[2px]'}
                  `}>
                    {imagenPrincipal && ( 
                      <img
                        src={imagenPrincipal}
                        alt={camiseta.name}
                        className="mx-2 w-[80px] h-[80px] object-cover rounded"
                      />
                    )}
                    <div className="flex flex-col">
                      <h2>{camiseta.player ? camiseta.player : camiseta.team} {camiseta.year}</h2>
                    </div>
                    
                  </div>
                )
              })}
            </div>
          </div>

          {/* Contenedor 3 */}
          <div onClick={() => navigate("/f1")} className="group flex flex-col items-center justify-center  w-[300px] h-[400px] rounded-2xl bg-[#e0e0e0]" 
              style={{ boxShadow: '15px 15px 30px #bebebe, -15px -15px 30px #ffffff' }}>
            <p className="cursor-pointer -mt-4 mb-2 text-center text-[16px] font-semibold">F1</p>
            <div className="flex flex-col gap-4 overflow-visible">
              {camisetasF1.map((camiseta, index) => {
                const imagenes = camiseta.img || []
                const imagenPrincipal = imagenes.length > 0 ? imagenes[imagenes.length - 1] : null

                return (
                  <div key={index} onMouseEnter={() => setHoveredIndexF1(index)} onMouseLeave={() => setHoveredIndexF1(null)}
                   className={`flex flex-row items-center border rounded shadow p-2 gap-2 w-[250px] mx-auto cursor-pointer 
                    transform transition-all duration-300 ease-in-out
                    ${hoveredIndexF1 === null ? '' : hoveredIndexF1 === index ? 'scale-110 blur-0' : 'scale-90 blur-[2px]'}
                  `}>
                    {imagenPrincipal && ( 
                      <img
                        src={imagenPrincipal}
                        alt={camiseta.name}
                        className="w-[80px] h-[80px] object-contain rounded"
                      />
                    )}
                    <div className="flex flex-col">
                      <h2>{camiseta.team} {camiseta.driver ? camiseta.driver : camiseta.year}</h2>
                    </div>
                    
                  </div>
                )
              })}
            </div>
          </div>
          
        </div>
        <button
          onClick={handleScroll} type="button"
          className={`fixed hidden md:flex ${
            isAtTop ? "opacity-0" : "bottom-15"
          } left-1/2 transform -translate-x-1/2 cursor-pointer z-10 px-6 py-2 overflow-hidden border-2 border-gray-200 rounded-full bg-gray-50 text-gray-800 text-lg font-semibold group shadow-xl
            before:absolute before:w-0 before:h-full before:top-0 before:left-0 before:bg-[#252525] before:transition-all before:duration-500 before:rounded-full
            hover:before:w-full hover:text-white`}>
          <span className="relative z-10 flex items-center gap-2">
            {isAtTop ? "↑ Volver" : "Explorar ↓"}
          </span>
        </button>
        <div className="mt-30 min-h-screen flex items-center justify-center relative flex-col">
          {/* Sección de preguntas frecuentes */}
          <div ref={preguntasRef} className="py-16">
            <h1 className="pt-20 text-2xl font-bold text-center mb-6">Preguntas frecuentes</h1>
            <div  className="max-w-[400px] mx-auto p-4 space-y-4">
              {preguntas.map((item, index) => (
                <div key={index} className="border rounded-lg shadow-sm">
                  <button
                    onClick={() => togglePregunta(index)}
                    className="w-full flex justify-between items-center p-4 text-left font-medium"
                  >
                    {item.pregunta}
                    {activa === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {activa === index && (
                    <div className="px-4 pb-4 text-gray-700 animate-fade-in">
                      {item.respuesta}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <footer > 
        <Footer />
      </footer>
    </div>
  );
};

export default Login;