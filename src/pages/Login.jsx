import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

import Loader from "../components/Loader.jsx"
import Footer from "../components/Footer.jsx";

import SEO from '../components/SEO';
import {supabase} from "../lib/supabaseClient"
import { ChevronDown, ChevronUp, ChevronRight, Star, Shield, Truck, CreditCard, Award, Users, Globe, Package, Trophy } from 'lucide-react';

const Login = () => {
  
   const seoData = {
    title: 'Jerseys Colombia - Jerseys de la Selección Colombiana de Fútbol',
    description: 'La mejor tienda de jerseys oficiales en Colombia. Encuentra todas las camisetas de la Selección Colombiana de Fútbol. Calidad premium, envío gratis y personalización disponible.',
    keywords: 'jerseys colombia, camisetas de futbol de colombia, jerseys retro, deportes colombia',
    url: window.location.origin,
    image: `${window.location.origin}/og-home.jpg`
  };

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Supabase data
  const [camisetasFutbol, setCamisetasFutbol] = useState([])
  const [retro, setRetro] = useState([])
  const [special, setSpecial] = useState([])
  const [worldcup, setWorldcup] = useState([])

   const [totalProducts, setTotalProducts] = useState(0);

  // Animation states
  const [hoveredIndexFutbol, setHoveredIndexFutbol] = useState(null);
  const [hoveredIndexRetro, setHoveredIndexRetro] = useState(null);
  const [hoveredIndexSpecial, setHoveredIndexSpecial] = useState(null);
  const [hoveredIndexWorldcup, setHoveredIndexWorldcup] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  // FAQ
  const [isAtTop, setIsAtTop] = useState(false);
  const topRef = useRef(null);
  const categoryRef = useRef(null);
  const [activa, setActiva] = useState(null);

  const preguntas = [
    {
      pregunta: '¿Cuánto tiempo demora en llegar mi pedido?',
      respuesta: 'El tiempo estimado de exportación es de 2 días, el tiempo de envío depende del país de destino, pero en general es de 15 a 20 días hábiles.'
    },
    {
      pregunta: '¿Cómo sé mi talla?',
      respuesta: 'Las tallas son las estandarizadas por el sistema internacional, aún así puedes consultar la tabla de tallas en cada producto.'
    },
    {
      pregunta: '¿Puedo devolver mi pedido?',
      respuesta: 'Sí, puedes devolver tu pedido en un plazo de 15 días desde la fecha de entrega. Para más información, consulta nuestra política de devoluciones.'
    },
    {
      pregunta: '¿Cómo puedo pagar?',
      respuesta: 'Aceptamos tarjetas de crédito y débito, PayPal y transferencias bancarias. Todo se realiza a través de portales totalmente seguros y estandarizados.'
    },
    {
      pregunta: '¿Cómo puedo saber dónde está mi pedido?',
      respuesta: 'Una vez que tu pedido haya sido enviado, recibirás un correo electrónico con un enlace de seguimiento para ver el estado en tiempo real.'
    } 
  ];

  const features = [
    {
      icon: Shield,
      title: "Calidad Premium",
      description: "Materiales de primera calidad con logos bordados y acabados profesionales",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Truck,
      title: "Envío Gratis",
      description: "Envío gratuito en pedidos de 5+ productos a toda Colombia",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Award,
      title: "Personalización",
      description: "Agrega tu nombre y número favorito por solo $5 USD adicionales",
      color: "from-purple-500 to-violet-600"
    },
    {
      icon: CreditCard,
      title: "Pago Seguro",
      description: "Múltiples métodos de pago seguros y confiables",
      color: "from-orange-500 to-red-600"
    }
  ];

  const stats = [
    { number: "5000+", label: "Clientes Satisfechos", icon: Users },
    { number: "50+", label: "Productos Únicos", icon: Package },
    { number: "10000+", label: "Productos importados", icon: Globe },
    { number: "4.9", label: "Rating Promedio", icon: Star }
  ];

  const togglePregunta = (index) => {
    setActiva(activa === index ? null : index);
  };

  useEffect(() => {
    const fetchCamisetas = async () => {
      try {
        const [retro] = await Promise.all([
          supabase
            .from('futbol')
            .select('name, img, team, year, index, category, type')
            .order('year', { ascending: true })
            .limit(3)
          ]);
        const [special] = await Promise.all([
          supabase
            .from('futbol')
            .select('name, img, team, year, index, category, type')
            .eq('category', 'special')
            .order('year', { ascending: false })
            .limit(3),
        ]);

        const [worldcup] = await Promise.all([
          supabase
            .from('futbol')
            .select('name, img, team, year, index, category, type')
            .eq('category', 'home')
            .order('year', { ascending: false })
            .limit(3),
        ]);

        // Get total count for stats
        const [futbolCount] = await Promise.all([
          supabase.from('futbol').select('*', { count: 'exact', head: true })
        ]);

        const total = (futbolCount.count || 0);
        setTotalProducts(total);
  
        if (retro.error || special.error || worldcup.error) {
          console.error('Error en Fútbol:', retro.error || special.error || worldcup.error);
        } else {
          setRetro(retro.data);
          setSpecial(special.data);
          setWorldcup(worldcup.data);
        }
  
      } catch (err) {
        console.error('Error al cargar camisetas:', err)
      } finally {
        setTimeout(() => {
          setLoading(false)
        }, 1000)
      }
    }
  
    fetchCamisetas()
  }, [])

  const handleScroll = () => {
    if (isAtTop) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      categoryRef.current.scrollIntoView({ behavior: 'smooth' });
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

  return (
    <div>
      <SEO {...seoData} />
      
      {/* LOADER */}
      {loading && (
        <div className="bg-white fixed inset-0 flex items-center justify-center bg-opacity-90 z-[2000]">
          <Loader />
        </div>
      )}

      <main className="min-h-screen">
        {/* HERO SECTION */}
        <section ref={topRef} className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-blue-300 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-300 rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 left-10 w-24 h-24 bg-indigo-300 rounded-full animate-ping"></div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10 pt-20 mt-20">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-fade-in">
                Jerseys Colombia
              </h1>
              <p className="text-2xl md:text-3xl mb-8 text-gray-700 font-light">
                La experiencia definitiva en camisetas oficiales de la Selección Colombia
              </p>
              <p className="text-lg md:text-xl mb-12 text-gray-600 max-w-2xl mx-auto">
                Descubre la mayor colección de camisetas autenticas de la Seleccón Colombia. 
                Calidad premium, diseños exclusivos y envío a toda Colombia.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 shadow-lg">
                    <stat.icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-gray-800">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleScroll}
                className="md:inline-flex hidden mb-5 items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold text-lg shadow-2xl transform hover:scale-105 hover:shadow-3xl transition-all duration-300 group"
              >
                Explorar Colección
                <ChevronDown className="w-5 h-5 group-hover:animate-bounce" />
              </button>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-20 mt-5 md:mt-0 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-gray-800">¿Por qué elegir Jerseys Colombia?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Nos especializamos en ofrecerte la mejor experiencia de compra con productos de calidad excepcional
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className={`relative p-8 rounded-3xl bg-gradient-to-br ${feature.color} text-white transform transition-all duration-500 hover:scale-110 hover:rotate-2 shadow-xl hover:shadow-2xl`}
                >
                  <div className={`absolute inset-0 bg-white/10 rounded-3xl transition-opacity duration-300 ${hoveredFeature === index ? 'opacity-100' : 'opacity-0'}`}></div>
                  <div className="relative z-10">
                    <feature.icon className="w-12 h-12 mb-4 transform transition-transform duration-300 hover:scale-110" />
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-white/90 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES SECTION */}
        <section ref={categoryRef} className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-gray-800">Nuestras Categorías</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Explora nuestra colección exclusiva de camisetas de la Selección Colombia: retros y actuales, históricas y de edición limitada. Calidad premium garantizada.
              </p>
            </div>

            <div  className="flex md:flex-row flex-col justify-center items-center gap-10 w-full">
              {/* retro Container */}
              <div 
                onClick={() => navigate("/retro")} 
                className="group relative overflow-hidden w-[350px] h-[500px] rounded-3xl bg-gradient-to-br from-green-200 via-blue-200 to-indigo-200 shadow-2xl cursor-pointer transform hover:scale-105 transition-all duration-500 hover:shadow-3xl"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
                  <div className="relative z-20 p-8 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Retro</h3>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    {retro.map((camiseta, index) => {

                      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
                        const BUCKET = "camisetas";

                        const buildImageUrl = (path) =>
                        `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

                        const imagenPrincipal = camiseta.img?.[camiseta.img.length - 1]
                        ? buildImageUrl(camiseta.img[camiseta.img.length - 1])
                        : null;

                      return (
                        <div 
                          key={index} 
                          onMouseEnter={() => setHoveredIndexRetro(index)} 
                          onMouseLeave={() => setHoveredIndexRetro(null)} 
                          onClick={(e) => e.stopPropagation()} 
                          className={`flex items-center bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg cursor-pointer transform transition-all duration-300 hover:shadow-xl
                            ${hoveredIndexRetro === null ? '' : hoveredIndexRetro === index ? 'scale-105 shadow-2xl' : 'scale-95 opacity-70'}
                          `}
                        >
                          <Link to={`/futbol/${generarSlug(camiseta.name)}`} className="flex items-center w-full">
                            {imagenPrincipal && (
                              <img
                                src={imagenPrincipal}
                                alt={camiseta.name}
                                className="w-16 h-16 object-cover rounded-xl shadow-md"
                              />
                            )}
                            <div className="ml-4">
                              <h4 className="font-semibold text-gray-800">{camiseta.team}</h4>
                              <p className="text-sm text-gray-600">{camiseta.year} - <span>{camiseta.type}</span></p>
                            </div>
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div 
                onClick={() => navigate("/special")} 
                className="group relative overflow-hidden w-[350px] h-[500px] rounded-3xl bg-gradient-to-br from-green-200 via-blue-200 to-indigo-200 shadow-2xl cursor-pointer transform hover:scale-105 transition-all duration-500 hover:shadow-3xl"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
                  <div className="relative z-20 p-8 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Especial</h3>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    {special.map((camiseta, index) => {

                      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
                        const BUCKET = "camisetas";

                        const buildImageUrl = (path) =>
                        `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

                        const imagenPrincipal = camiseta.img?.[camiseta.img.length - 1]
                        ? buildImageUrl(camiseta.img[camiseta.img.length - 1])
                        : null;

                      return (
                        <div 
                          key={index} 
                          onMouseEnter={() => setHoveredIndexSpecial(index)} 
                          onMouseLeave={() => setHoveredIndexSpecial(null)} 
                          onClick={(e) => e.stopPropagation()} 
                          className={`flex items-center bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg cursor-pointer transform transition-all duration-300 hover:shadow-xl
                            ${hoveredIndexSpecial === null ? '' : hoveredIndexSpecial === index ? 'scale-105 shadow-2xl' : 'scale-95 opacity-70'}
                          `}
                        >
                          <Link to={`/futbol/${generarSlug(camiseta.name)}`} className="flex items-center w-full">
                            {imagenPrincipal && (
                              <img
                                src={imagenPrincipal}
                                alt={camiseta.name}
                                className="w-16 h-16 object-cover rounded-xl shadow-md"
                              />
                            )}
                            <div className="ml-4">
                              <h4 className="font-semibold text-gray-800">{camiseta.team}</h4>
                              <p className="text-sm text-gray-600">{camiseta.year} - <span>{camiseta.type}</span></p>
                            </div>
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div 
                onClick={() => navigate("/worldcup")} 
                className="group relative overflow-hidden w-[350px] h-[500px] rounded-3xl bg-gradient-to-br from-green-200 via-blue-200 to-indigo-200 shadow-2xl cursor-pointer transform hover:scale-105 transition-all duration-500 hover:shadow-3xl"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
                  <div className="relative z-20 p-8 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Mundial</h3>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    {worldcup.map((camiseta, index) => {

                      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
                      const BUCKET = "camisetas";

                      const buildImageUrl = (path) =>
                      `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

                      const imagenPrincipal = camiseta.img?.[camiseta.img.length - 1]
                      ? buildImageUrl(camiseta.img[camiseta.img.length - 1])
                      : null;

                      return (
                        <div 
                          key={index} 
                          onMouseEnter={() => setHoveredIndexWorldcup(index)} 
                          onMouseLeave={() => setHoveredIndexWorldcup(null)} 
                          onClick={(e) => e.stopPropagation()} 
                          className={`flex items-center bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg cursor-pointer transform transition-all duration-300 hover:shadow-xl
                            ${hoveredIndexWorldcup === null ? '' : hoveredIndexWorldcup === index ? 'scale-105 shadow-2xl' : 'scale-95 opacity-70'}
                          `}
                        >
                          <Link to={`/futbol/${generarSlug(camiseta.name)}`} className="flex items-center w-full">
                            {imagenPrincipal && (
                              <img
                                src={imagenPrincipal}
                                alt={camiseta.name}
                                className="w-16 h-16 object-cover rounded-xl shadow-md"
                              />
                            )}
                            <div className="ml-4">
                              <h4 className="font-semibold text-gray-800">{camiseta.team} </h4>
                              <p className="text-sm text-gray-600">{camiseta.year} - <span>{camiseta.type}</span></p>
                            </div>
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                ¿Listo para encontrar tu jersey perfecto?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Únete a miles de fanáticos que ya visten sus colores favoritos con nuestras camisetas premium
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/futbol')}
                  className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl"
                >
                  Ver Selección Colombia
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-gray-800">Preguntas Frecuentes</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Resolvemos las dudas más comunes para que tengas la mejor experiencia de compra
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {preguntas.map((item, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
                  <button
                    onClick={() => togglePregunta(index)}
                    className="w-full flex justify-between items-center p-6 text-left font-semibold text-gray-800 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <span className="text-lg">{item.pregunta}</span>
                    <div className={`transform transition-transform duration-300 ${activa === index ? 'rotate-180' : ''}`}>
                      {activa === index ? <ChevronUp size={24} className="text-blue-600" /> : <ChevronDown size={24} className="text-gray-400" />}
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ${activa === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-6 text-gray-700 leading-relaxed border-t border-gray-100 pt-4">
                      {item.respuesta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Floating Action Button */}
        <button
          onClick={handleScroll} 
          type="button"
          className={`fixed ${isAtTop ? "bottom-8 opacity-100" : "bottom-8 opacity-80"} right-8 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group`}
        >
          <div className={`transform transition-transform duration-300 ${isAtTop ? 'rotate-0' : 'rotate-180'}`}>
            <ChevronUp size={24} className="group-hover:animate-bounce" />
          </div>
        </button>
      </main>
      
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Login;