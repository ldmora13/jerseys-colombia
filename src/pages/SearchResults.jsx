import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { supabase } from '../lib/supabaseClient';

import Loader from '../components/Loader';
import Footer from '../components/Footer';
import AlertGlobal from '../components/AlertGlobal';

import { 
  Search, 
  Filter as FilterIcon, 
  X, 
  ShoppingBag, 
  TrendingUp,
  Package,
  AlertCircle,
  Grid3x3,
  List,
  ChevronDown
} from 'lucide-react';

const SearchResults = () => {

  const { query } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance', 'price-low', 'price-high', 'newest'
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

        const [f1Res, nbaRes, futbolRes] = await Promise.all([f1Query, nbaQuery, futbolQuery]);

        if (f1Res.error) throw f1Res.error;
        if (nbaRes.error) throw nbaRes.error;
        if (futbolRes.error) throw futbolRes.error;
        
        const f1Data = f1Res.data.map(item => ({ ...item, page: 'F1' }));
        const nbaData = nbaRes.data.map(item => ({ ...item, page: 'NBA' }));
        const futbolData = futbolRes.data.map(item => ({ ...item, page: 'futbol' }));

        let allResults = [...f1Data, ...nbaData, ...futbolData];
        
        // Apply sorting
        if (sortBy === 'price-low') {
          allResults.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortBy === 'price-high') {
          allResults.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortBy === 'newest') {
          allResults.sort((a, b) => (b.year || 0) - (a.year || 0));
        }

        setResults(allResults);

      } catch (err) {
        setAlert({
          show: true,
          message: "Error realizando la búsqueda",
          severity: "error",
        });
        setError("No se pudieron cargar los resultados.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, sortBy]); 

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 z-[2000]">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 pt-24 pb-16 mt-15">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Search className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Resultados de tu búsqueda</h1>
                <p className="text-blue-100 text-lg mt-1">
                  Buscando: <span className="font-semibold">"{query}"</span>
                </p>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-white">
                <Package className="w-5 h-5" />
                <span className="font-semibold">
                  {results.length} producto{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-10 pl-4 pr-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none cursor-pointer"
                  >
                    <option value="relevance" className="bg-gray-800">Más Relevante</option>
                    <option value="price-low" className="bg-gray-800">Precio: Menor a Mayor</option>
                    <option value="price-high" className="bg-gray-800">Precio: Mayor a Menor</option>
                    <option value="newest" className="bg-gray-800">Más Recientes</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                </div>

                {/* View Toggle */}
                <div className="flex gap-2 bg-white/20 backdrop-blur-sm rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'bg-white text-blue-600 shadow-lg' 
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'bg-white text-blue-600 shadow-lg' 
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className='relative mb-6'>
            <AlertGlobal alert={alert} setAlert={setAlert} />
          </div>
          
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}
          
          {results.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'
            }>
              {results.map((item, index) => {
                const slug = generarSlug(item.name);
                const imagenPrincipal = item.img && item.img.length > 0 ? item.img[item.img.length - 1] : '';

                if (viewMode === 'grid') {
                  return (
                    <div 
                      key={`${item.page}-${index}`}
                      className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    >
                      <Link to={`/${item.page}/${slug}`} className="block">
                        <div className="relative h-[300px] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                          {imagenPrincipal && (
                            <img
                              src={imagenPrincipal}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          )}
                          <div className="absolute top-3 right-3">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                              {item.page}
                            </div>
                          </div>
                        </div>
                      </Link>
                      <div className="p-4">
                        <p className='font-bold text-gray-800 mb-2 line-clamp-2'>
                          {item.page === 'F1' && `${item.type || ''} de ${item.team || ''} ${item.year || ''}`}
                          {item.page === 'NBA' && `${item.category || ''} ${item.player || ''} ${item.team || ''} ${item.year || ''}`}
                          {item.page === 'futbol' && `${item.team || ''} ${item.year || ''} ${item.category || ''}`}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className='text-2xl font-bold text-blue-600'>${item.price}</p>
                          <span className="text-sm text-gray-500">USD</span>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <Link 
                      key={`${item.page}-${index}`}
                      to={`/${item.page}/${slug}`}
                      className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 flex"
                    >
                      <div className="relative w-48 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100">
                        {imagenPrincipal && (
                          <img
                            src={imagenPrincipal}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        )}
                      </div>
                      <div className="flex-1 p-6 flex items-center justify-between">
                        <div>
                          <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                            {item.page}
                          </div>
                          <h3 className='font-bold text-xl text-gray-800 mb-2'>
                            {item.page === 'F1' && `${item.type || ''} de ${item.team || ''} ${item.year || ''}`}
                            {item.page === 'NBA' && `${item.category || ''} ${item.player || ''} ${item.team || ''} ${item.year || ''}`}
                            {item.page === 'futbol' && `${item.team || ''} ${item.year || ''} ${item.category || ''}`}
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className='text-3xl font-bold text-blue-600'>${item.price}</p>
                          <span className="text-sm text-gray-500">USD</span>
                        </div>
                      </div>
                    </Link>
                  );
                }
              })}
            </div>
          ) : (
            !loading && (
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-16">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Search className="w-16 h-16 text-gray-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    No se encontraron resultados
                  </h2>
                  <p className="text-gray-600 text-lg mb-8">
                    Intenta con otros términos de búsqueda o explora nuestras categorías
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => navigate('/futbol')}
                      className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg"
                    >
                      Fútbol
                    </button>
                    <button
                      onClick={() => navigate('/nba')}
                      className="flex-1 h-12 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg"
                    >
                      NBA
                    </button>
                    <button
                      onClick={() => navigate('/f1')}
                      className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg"
                    >
                      F1
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SearchResults;