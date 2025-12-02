import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import SEO from '../components/SEO';
import AlertGlobal from '../components/AlertGlobal';
import Loader from '../components/Loader';
import Filter from '../components/Filter';
import Footer from '../components/Footer';
import { 
    BadgeCheck, 
    ChevronLeft, 
    ChevronRight,
    Filter as FilterIcon,
    Grid3x3,
    Heart,
    ShoppingCart,
    Tag,
    TrendingUp,
    Sparkles,
    Trophy,
    Globe
} from 'lucide-react';

const WorldCup2026 = ({ cartVisible, setCartVisible }) => {
    const seoData = {
        title: 'Camisetas Mundial 2026',
        description: 'Compra las camisetas oficiales del Mundial 2026. Colombia, Italia, Portugal, Argentina, Brasil y más selecciones. Ediciones Player y Fan con envío gratis en Colombia.',
        keywords: 'camisetas mundial 2026, world cup 2026, camisetas selecciones, italia 2026, portugal 2026, argentina 2026, brasil 2026, jerseys mundial, camisetas futbol mundial, camiseta mundial 2026 colombia',
        url: `${window.location.origin}/mundial-2026`,
        type: 'website'
    };

    const [alert, setAlert] = useState({
        show: false,
        message: '',
        severity: 'success',
        title: ''
    });

    const { cartItems, setCartItems } = useCart();
    const { wishlistItems, setWishlistItems, setWishlistVisible } = useWishlist();

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const topRef = useRef(null);
    
    const [camisetas, setCamisetas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState('new');

    const [filterVisible, setFilterVisible] = useState(false);
    const [selectedSizes, setSelectedSizes] = useState({});
    
    const itemsPerPage = 15;
    const currentPage = parseInt(searchParams.get('page')) || 1;

    const [search, setSearch] = useState('');
    const [stockSelected, setStockSelected] = useState('Todo');
    const [promoSelected, setPromoSelected] = useState('Todo');
    const [categorySelected, setCategorySelected] = useState('Todo');
    const [yearRange, setYearRange] = useState([1950, 2026]);

    const [tasaCOP, setTasaCOP] = useState(null);

    const categoryMap = {
        'Fan': 'fan',
        'Player': 'player',
        'Women': 'women',
    };

    const camisetasFiltradas = camisetas.filter((camiseta) => {
        const searchLower = search.toLowerCase();
        const matchSearch =
            (camiseta.name || '').toLowerCase().includes(searchLower) ||
            (camiseta.team || '').toLowerCase().includes(searchLower) ||
            (search && camiseta.year && camiseta.year.toString().includes(searchLower));

        let matchStock = true;
        if (stockSelected === 'En stock') matchStock = camiseta.stock === 'Disponible';
        else if (stockSelected === 'Agotado') matchStock = camiseta.stock !== 'Disponible';

        let matchPromo = true;
        if (promoSelected === 'En oferta') matchPromo = camiseta.year >= 2026;

        let matchYear = true;
        if (yearRange && yearRange.length === 2) {
            matchYear = camiseta.year >= yearRange[0] && camiseta.year <= yearRange[1];
        }

        let matchCat = true;
        if (categorySelected !== 'Todo') {
            const singular = categoryMap[categorySelected] || categorySelected;
            matchCat = camiseta.type === singular || camiseta.category === singular;
        }

        return matchSearch && matchStock && matchPromo && matchYear && matchCat;
    });

    const addToCart = (product) => {
        const selectedSize = selectedSizes[product.name];

        if (!selectedSize) {
            setAlert({
                show: true,
                message: "Selecciona una talla antes de agregar al carrito.",
                severity: "error",
                title: "Talla requerida"
            });
            return;
        }

        setCartItems(prevCart => {
            const index = prevCart.findIndex(
                item =>
                    item.name === product.name &&
                    item.team === product.team &&
                    item.year === product.year &&
                    item.size === selectedSize
            );

            if (index !== -1) {
                const updatedCart = [...prevCart];
                updatedCart[index].quantity += 1;
                return updatedCart;
            } else {
                return [...prevCart, { ...product, quantity: 1, size: selectedSize }];
            }
        });

        setAlert({
            show: true,
            message: "Producto añadido al carrito correctamente.",
            severity: "success",
            title: "¡Añadido!"
        });
        setCartVisible(true);
    };

    const toggleWishlist = (product) => {
        const productName = product.name;
        setWishlistItems(prevItems => {
            if (prevItems.includes(productName)) {
                return prevItems.filter(item => item !== productName);
            } else {
                setWishlistVisible(true);
                return [...prevItems, productName];
            }
        });
    };

    const totalPages = Math.ceil(camisetasFiltradas.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const camisetasPagina = camisetasFiltradas.slice(startIndex, endIndex);

    const goToPage = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setSearchParams({ page: pageNumber.toString() });
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleOrderChange = (event) => {
        const value = event.target.value;
        setOrder(value);

        let sorted = [...camisetas];

        if (value === 'new') {
            sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
        } else if (value === 'lowCost') {
            sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (value === 'highCost') {
            sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        }

        setCamisetas(sorted);
    };

    useEffect(() => {
        const fetchCamisetas = async () => {
            try {
                const { data, error } = await supabase
                    .from('futbol')
                    .select('name, img, team, category, year, index, price, stock, provider, deporte, type')
                    .ilike('name', '%World_Cup%')
                    .gte('year', 2025)
                    .range(0, 200)
                    .order('team', { ascending: true });
                if (error) {
                    console.error('Error al cargar camisetas del Mundial 2026:', error);
                } else {
                    console.log(data.length)
                    setCamisetas(data);
                }
            } catch (err) {
                console.error('Error al cargar camisetas del Mundial 2026:', err);
            } finally {
                setTimeout(() => setLoading(false), 1500);
            }
        };

        fetchCamisetas();
    }, []);


    useEffect(() => {
        const fetchTasa = async () => {
            try {
                const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                const data = await res.json();
                setTasaCOP(data.rates.COP);
            } catch (err) {
                console.error('Error obteniendo tasa de cambio:', err);
            }
        };
        fetchTasa();
        const interval = setInterval(fetchTasa, 300000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (currentPage !== 1) {
            setSearchParams({ page: '1' });
        }
    }, [search, stockSelected, promoSelected, categorySelected, yearRange]);

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
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
            <SEO {...seoData} />
            <div className='relative'>
                <AlertGlobal alert={alert} setAlert={setAlert} />
            </div>

            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-white z-[2000]">
                    <Loader />
                </div>
            )}

            <Filter
                filterVisible={filterVisible}
                setFilterVisible={setFilterVisible}
                search={search}
                setSearch={setSearch}
                stockSelected={stockSelected}
                setStockSelected={setStockSelected}
                promoSelected={promoSelected}
                setPromoSelected={setPromoSelected}
                yearRange={yearRange}
                setYearRange={setYearRange}
                categorySelected={categorySelected}
                setCategorySelected={setCategorySelected}
            />

            {/* Hero Section */}
            <div ref={topRef} className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 pt-24 pb-16 mt-20">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm animate-bounce">
                            <Trophy className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                            🏆 Mundial 2026 🏆
                        </h1>
                        <p className="text-xl md:text-2xl mb-6 text-yellow-100">
                            Edición Especial - Colección Exclusiva
                        </p>
                        <p className="text-lg md:text-xl mb-8 text-white/90">
                            +{camisetasFiltradas.length} camisetas de las mejores selecciones del mundo
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            {[
                                "Edición Mundial 2026",
                                "Versiones Player & Fan",
                                "Logos Oficiales", 
                                "Envío Gratis 5+"
                            ].map((feature, index) => (
                                <span key={index} className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                                    <BadgeCheck className="w-4 h-4" />
                                    {feature}
                                </span>
                            ))}
                        </div>
                        
                        {/* World Cup Info */}
                        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Globe className="w-6 h-6 text-white" />
                                <h3 className="text-xl font-bold text-white">Mundial FIFA 2026</h3>
                            </div>
                            <p className="text-white/90 mb-2">🇺🇸 Estados Unidos • 🇨🇦 Canadá • 🇲🇽 México</p>
                            <p className="text-sm text-white/80">11 de junio - 19 de julio, 2026</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                
                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20">
                    <button
                        onClick={() => setFilterVisible(true)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 shadow-lg"
                    >
                        <FilterIcon className="w-5 h-5" />
                        Filtrar
                    </button>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <label className="text-gray-700 font-medium hidden md:block">Ordenar:</label>
                        <select
                            value={order}
                            onChange={handleOrderChange}
                            className="flex-1 md:flex-initial px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300"
                        >
                            <option value="new">Más Nuevos</option>
                            <option value="lowCost">Precio: Menor</option>
                            <option value="highCost">Precio: Mayor</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                        <span className="px-3 py-2 bg-white rounded-lg shadow-sm">
                            <Grid3x3 className="w-5 h-5 text-yellow-600" />
                        </span>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
                    {camisetasPagina.map((camiseta, index) => {
                        const slug = generarSlug(camiseta.name);
                        const imagenes = camiseta.img || [];
                        const imagenPrincipal = imagenes.length > 0 ? imagenes[imagenes.length - 1] : null;
                        const imagenSecundaria = imagenes.length > 1 ? imagenes[imagenes.length - 2] : null;

                        return (
                            <div
                                key={index}
                                className="group bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 relative"
                            >
                                {/* World Cup Badge */}
                                <div className="absolute top-2 left-2 z-10">
                                    <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                        <Trophy className="w-3 h-3" />
                                        MUNDIAL 2026
                                    </div>
                                </div>

                                <Link to={`/futbol/${slug}`} className="block">
                                    <div className="relative h-[280px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                                        {imagenPrincipal && (
                                            <img
                                                src={imagenPrincipal}
                                                alt={camiseta.name}
                                                className="w-full h-full object-cover absolute top-0 left-0 opacity-100 group-hover:opacity-0 transition-opacity duration-500"
                                            />
                                        )}
                                        {imagenSecundaria && (
                                            <img
                                                src={imagenSecundaria}
                                                alt={`${camiseta.name} alt`}
                                                className="w-full h-full object-cover absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                            />
                                        )}
                                        
                                        <div className="absolute top-12 left-3">
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                camiseta.stock === 'Disponible' 
                                                    ? 'bg-green-500 text-white' 
                                                    : 'bg-red-500 text-white'
                                            }`}>
                                                {camiseta.stock}
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleWishlist(camiseta);
                                            }}
                                            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
                                        >
                                            <Heart
                                                className={`w-5 h-5 ${
                                                    wishlistItems.includes(camiseta.name)
                                                        ? 'fill-red-500 text-red-500'
                                                        : 'text-gray-600'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </Link>

                                <div className="p-4">
                                    <Link to={`/futbol/${slug}`}>
                                        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 hover:text-yellow-600 transition-colors capitalize">
                                            {camiseta.team} {camiseta.year} {camiseta.category === 'manga_larga' ? 'Manga Larga' : camiseta.category} {camiseta.type} edition
                                        </h3>
                                    </Link>

                                    <div className="flex items-baseline gap-2 mb-3">
                                        <p className="text-2xl font-bold text-yellow-600">${camiseta.price}</p>
                                        <span className="text-sm text-gray-500">USD</span>
                                    </div>

                                    {tasaCOP && (
                                        <p className="text-xs text-gray-500 mb-3">
                                            {(camiseta.price * tasaCOP).toLocaleString('es-CO', {
                                                style: 'currency',
                                                currency: 'COP'
                                            })} COP
                                        </p>
                                    )}

                                    <select
                                        value={selectedSizes[camiseta.name] || ''}
                                        onChange={(e) => {
                                            setSelectedSizes(prev => ({
                                                ...prev,
                                                [camiseta.name]: e.target.value
                                            }));
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full mb-2 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300"
                                    >
                                        <option value="">Seleccionar talla</option>
                                        <option value="S">S</option>
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                        <option value="XL">XL</option>
                                        <option value="XXL">XXL</option>
                                    </select>

                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            addToCart(camiseta);
                                        }}
                                        className="w-full h-10 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Añadir
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col items-center gap-6 mb-12">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-yellow-500 hover:text-yellow-600 transition-all duration-300 shadow-lg"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-2">
                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNumber = index + 1;
                                    const isCurrentPage = pageNumber === currentPage;
                                    
                                    if (
                                        pageNumber === 1 ||
                                        pageNumber === totalPages ||
                                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => goToPage(pageNumber)}
                                                className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 ${
                                                    isCurrentPage
                                                        ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-xl scale-110'
                                                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-yellow-500 hover:text-yellow-600 shadow-lg'
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    } else if (
                                        pageNumber === currentPage - 2 ||
                                        pageNumber === currentPage + 2
                                    ) {
                                        return <span key={pageNumber} className="text-gray-400">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-yellow-500 hover:text-yellow-600 transition-all duration-300 shadow-lg"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-gray-600 font-medium">
                            Página {currentPage} de {totalPages} - Mostrando {startIndex + 1}-{Math.min(endIndex, camisetasFiltradas.length)} de {camisetasFiltradas.length} productos
                        </p>
                    </div>
                )}

                {/* Info Section */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl p-8 border border-yellow-200">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                                <Trophy className="w-6 h-6 text-yellow-600" />
                                Edición Especial Mundial 2026
                            </h2>
                            <ul className="space-y-3">
                                {[
                                    "Diseños oficiales del Mundial 2026",
                                    "Versiones Player y Fan disponibles",
                                    "Logos y escudos de alta calidad",
                                    "Envío gratis en pedidos de 5+ productos"
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <BadgeCheck className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                                <Globe className="w-6 h-6 text-orange-600" />
                                Selecciones Disponibles
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Encuentra las camisetas de las mejores selecciones: Italia, Portugal, Argentina, Brasil, España, Alemania, Francia y muchas más.
                            </p>
                            <p className="text-gray-700">
                                Prepárate para el torneo más grande del mundo con las camisetas oficiales de las selecciones participantes.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default WorldCup2026;