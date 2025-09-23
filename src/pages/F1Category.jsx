import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCategorySEO } from '../hooks/useSEO';
import SEO from '../components/SEO';

const F1Category = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredTeams, setFeaturedTeams] = useState([]);
  
  const seoData = useCategorySEO('F1', products);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('f1')
        .select('*')
        .order('index', { ascending: false });
      
      if (!error) {
        setProducts(data);
        
        const teams = [...new Set(data.map(p => p.team))];
        setFeaturedTeams(teams.slice(0, 12));
      }
      setLoading(false);
    };
    
    fetchProducts();
  }, []);

  const generarSlugOptimizado = (product) => {
    let team = product.team || '';
    let year = product.year || '';
    let type = product.type || '';
    
    team = team.replace(/\s+(FC|CF|AC|SC|United|City|Real|Club)\s*/gi, '');
    
    let parts = [team, year];
    if (type && !['fan', 'player', 'jersey'].includes(type.toLowerCase())) {
      parts.push(type);
    }
    
    return parts
      .filter(Boolean)
      .join('-')
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {seoData && <SEO {...seoData} />}
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Jerseys de F1 Originales
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            +{products.length} jerseys de los mejores equipos del mundo
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-white/20 px-4 py-2 rounded-full">✅ Calidad Premium</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">✅ Logos Bordados</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">✅ Personalización</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">✅ Envío Gratis 5+</span>
          </div>
        </div>
      </div>

      {/* Equipos Destacados */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Equipos Más Populares de Fórmula 1
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {featuredTeams.map((team, index) => {
            const teamProducts = products.filter(p => p.team === team);
            const featuredProduct = teamProducts[0];
            
            return (
              <Link
                key={index}
                to={`/futbol/${generarSlugOptimizado(featuredProduct)}`}
                className="group bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-4 text-center"
              >
                <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                  <img
                    src={featuredProduct?.img?.[0] || '/placeholder.jpg'}
                    alt={`Jersey ${team}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                  {team}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {teamProducts.length} jerseys disponibles
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Información SEO */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              ¿Por qué elegir nuestros jerseys de f1?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Calidad Premium</h3>
                  <p className="text-gray-600">100% Poliéster, Tela piqué de alta densidad, Transpirable, Resistente al lavado</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Envío Gratis</h3>
                  <p className="text-gray-600">Envío gratuito en pedidos de 5 o más productos a toda Colombia.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Pago Seguro</h3>
                  <p className="text-gray-600">Acepta tarjetas, PayPal y pago contraentrega en toda Colombia.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Texto SEO */}
          <div className="prose max-w-none">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Jerseys de Formula 1 de los Mejores Equipos del Mundo
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              En Jerseys Colombia encontrarás la colección más amplia de jerseys de Formula 1 originales de todos los equipos. Nuestros jerseys incluyen equipos de la Fórmula 1 como Mercedes, Red Bull, Ferrari, McLaren, Alpine, Aston Martin, Williams, Alfa Romeo, Haas y muchos más.
            </p>
            
            <h4 className="text-xl font-semibold mb-3 text-gray-800">
              Temporadas Actuales y Retro
            </h4>
            <p className="text-gray-700 leading-relaxed">
              Ofrecemos tanto jerseys de las temporadas actuales como jerseys retro clásicos. Todos nuestros productos cuentan con la calidad Fan Premium, con logos bordados y detalles oficiales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default F1Category;