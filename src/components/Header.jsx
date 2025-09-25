import React, {useRef, useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

import Alert from '@mui/material/Alert';
import { AlertTitle } from "@mui/material";
import logo from "../assets/football-jersey.svg";
import googlelogo from "../assets/google.svg";
import { Search, Heart, ShoppingCart, User, Menu, X, ChevronDown, Mail, Lock } from 'lucide-react';


const Header = ({setCartVisible}) => {

    const { setWishlistVisible } = useWishlist();
    const { cartItems, loading: cartLoading } = useCart();
    const { wishlistItems, loading: wishlistLoading } = useWishlist();    

    const navigate = useNavigate();
    const [query, setQuery] = useState("");

    const [showHeader, setShowHeader] = useState(true);
    const lastScrollY = useRef(window.scrollY);

    const [alert, setAlert] = useState({
        show: false,
        message: "",
        severity: "success",
    });

    {/* Login and reset password */}
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userNameFull, setUserNameFull] = useState("");
    const [userName, setUserName] = useState("");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    {/* Dropdown */}
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    {/* Menú hamburger */}
    const [menuOpen, setMenuOpen] = useState(false);
    const navRef = useRef(null);
    const buttonNav = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
                setShowHeader(false);
            } else {
                setShowHeader(true);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setAlert({
            show: true,
            message: "Todos los campos son obligatorios.",
            severity: "error",
            });
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setAlert({
            show: true,
            message: "Error al iniciar sesión. Verifica tus credenciales.",
            severity: "error",
            });
        } else {
            const user = data.user;
            setIsAuthenticated(true);
            setUserNameFull(user.user_metadata.full_name || user.email);
            setUserName((user.user_metadata.full_name || user.email).split(" ")[0]);
        }
    };

    const handleGoogleLogin = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
            redirectTo: window.location.origin,
            },
        });

        if (error) {
            console.error(error);
        } else {
            console.log("Redirigiendo");
        }
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsAuthenticated(true);
                setUserNameFull(user.user_metadata?.full_name || user.email);
                setUserName((user.user_metadata?.full_name || user.email).split(" ")[0]);
            } else {
                setIsAuthenticated(false);
                setUserNameFull("");
                setUserName("");
            }
        };
        getUser();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setIsAuthenticated(true);
                setUserNameFull(session.user.user_metadata?.full_name || session.user.email);
                setUserName((session.user.user_metadata?.full_name || session.user.email).split(" ")[0]);
            } else {
                setIsAuthenticated(false);
                setUserNameFull("");
                setUserName("");
            }
        });

        return () => {
            listener?.subscription?.unsubscribe();
        };
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !buttonRef.current.contains(event.target)
            ) {
                setDropdownVisible(false);
            }
        }

        document.addEventListener("click", handleClickOutside);

        if (dropdownVisible || menuOpen) {
            document.body.classList.add('overflow-hidden');
            document.documentElement.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
            document.documentElement.classList.remove('overflow-hidden');
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
            document.body.classList.remove('overflow-hidden');
            document.documentElement.classList.remove('overflow-hidden');
        };
    }, [dropdownVisible, setDropdownVisible, menuOpen]);

    const handleQuery = (e) => {
        e.preventDefault();

        if (query.trim() !== "") {
            navigate(`/searchs/${query}`);
        } else {
            setAlert({
                show: true,
                message: "Error en la busqueda",
                severity: "error",
            });
        }
    }
    

  return (
    <div>
        <header className={`backdrop-blur-xl bg-white/95 shadow-xl border-b border-white/20 w-full z-[999] top-0 left-0 h-25 fixed transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="max-w-[1400px] mx-auto px-5 pt-5 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center group">
                    <a 
                        onClick={() => navigate("/")} 
                        className="cursor-pointer flex items-center gap-3 transform hover:scale-105 transition-all duration-300"
                    >
                        <div className="relative">
                            <img src={logo} alt="logo" className="h-[45px] w-auto group-hover:rotate-12 transition-transform duration-300" />
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                        </div>
                        <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Jerseys Colombia
                        </span>
                    </a>
                </div>

                {/* Navigation - Desktop */}
                <nav className="hidden md:flex items-center">
                    <ul className="flex items-center gap-8">
                        <li>
                            <a 
                                onClick={() => navigate("/futbol")} 
                                className="cursor-pointer relative group font-semibold text-gray-700 hover:text-blue-600 transition-all duration-300"
                                >
                                <span className="relative z-10 flex items-center gap-2 px-4 py-2">
                                    ⚽ Fútbol
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg opacity-0 group-hover:opacity-10 transform scale-0 group-hover:scale-100 transition-all duration-300"></div>
                                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-blue-500 group-hover:w-full transition-all duration-300"></div>
                            </a>
                        </li>
                        <li>
                            <a 
                                onClick={() => navigate("/nba")}
                                className="cursor-pointer relative group font-semibold text-gray-700 hover:text-orange-600 transition-all duration-300"
                            >
                                <span className="relative z-10 flex items-center gap-2 px-4 py-2">
                                    🏀 NBA
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg opacity-0 group-hover:opacity-10 transform scale-0 group-hover:scale-100 transition-all duration-300"></div>
                                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-red-500 group-hover:w-full transition-all duration-300"></div>
                            </a>
                        </li>
                        <li>
                            <a 
                                onClick={() => navigate("/f1")}
                                className="cursor-pointer relative group font-semibold text-gray-700 hover:text-purple-600 transition-all duration-300"
                            >
                                <span className="relative z-10 flex items-center gap-2 px-4 py-2">
                                    🏎️ Fórmula 1
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-lg opacity-0 group-hover:opacity-10 transform scale-0 group-hover:scale-100 transition-all duration-300"></div>
                                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-indigo-500 group-hover:w-full transition-all duration-300"></div>
                            </a>
                        </li>
                    </ul>
                </nav>

                {/* Search bar - Desktop */}
                <div className="hidden md:flex items-center">
                    <form onSubmit={handleQuery} className="relative group">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors duration-300 w-5 h-5" />
                            <input
                                type='text'
                                placeholder="Buscar tu jersey"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-[320px] h-[48px] pl-12 pr-4 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-300 hover:shadow-lg"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                    </form>    
                </div>

                {/* Actions - Desktop */}
                <div className='hidden md:flex items-center gap-6'>
                    {/* Wishlist */}
                    <button 
                        onClick={() => setWishlistVisible(true)}
                        className="relative group p-3 rounded-2xl bg-gradient-to-r from-pink-50 to-red-50 hover:from-pink-100 hover:to-red-100 border border-pink-200 hover:border-red-300 transition-all duration-300 transform hover:scale-110"
                    >
                        <Heart className="w-6 h-6 text-pink-600 group-hover:text-red-600 transition-colors duration-300" />
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{wishlistLoading ? '' : wishlistItems.length}</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-red-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    </button>

                    {/* Cart */}
                    <button 
                        onClick={() => setCartVisible(true)}
                        className="relative group p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-indigo-300 transition-all duration-300 transform hover:scale-110"
                    >
                        <ShoppingCart className="w-6 h-6 text-blue-600 group-hover:text-indigo-600 transition-colors duration-300" />
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{cartLoading ? '' : cartItems.length}</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    </button>

                    {/* User Menu */}
                    <div className="relative">
                        <button 
                            ref={buttonRef} 
                            onClick={() => setDropdownVisible(!dropdownVisible)}
                            className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                        >
                            <User className="w-5 h-5" />
                            <span className="hidden xl:block">{isAuthenticated ? userName : "Login"}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${dropdownVisible ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Mobile Actions */}
                <div className='md:hidden flex items-center gap-4'>
                    <button 
                        onClick={() => setWishlistVisible(true)}
                        className="relative p-2 rounded-xl bg-pink-50 border border-pink-200"
                    >
                        <Heart className="w-6 h-6 text-pink-600" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{wishlistLoading ? '' : wishlistItems.length}</span>
                        </div>
                    </button>
                    <button 
                        onClick={() => setCartVisible(true)}
                        className="relative p-2 rounded-xl bg-blue-50 border border-blue-200"
                    >
                        <ShoppingCart className="w-6 h-6 text-blue-600" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{cartLoading ? '' : cartItems.length}</span>
                        </div>
                    </button>
                    
                    {/* Hamburger Menu */}
                    <button 
                        ref={buttonNav} 
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-2 rounded-xl bg-gray-900 text-white hover:bg-gray-700 transition-colors duration-300"
                    >
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998]" onClick={() => setMenuOpen(false)}>
                        <div 
                            ref={navRef} 
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-0 right-0 w-full max-w-sm h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 shadow-2xl transform translate-x-0 transition-transform duration-300"
                        >
                            <div className="p-6 space-y-6 pt-20">
                                {/* Close button */}
                                <button 
                                    onClick={() => setMenuOpen(false)}
                                    className="absolute top-4 right-4 p-3 bg-white/80 rounded-xl shadow-lg hover:bg-white transition-colors duration-300"
                                >
                                    <X className="w-6 h-6 text-gray-600" />
                                </button>

                                {/* Navigation Links */}
                                <div className="space-y-4">
                                    <a 
                                        onClick={() => {navigate("/futbol"); setMenuOpen(false)}}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 hover:bg-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl">
                                            ⚽
                                        </div>
                                        <span className="font-semibold text-gray-800">Fútbol</span>
                                    </a>
                                    <a 
                                        onClick={() => {navigate("/nba"); setMenuOpen(false)}}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 hover:bg-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white text-xl">
                                            🏀
                                        </div>
                                        <span className="font-semibold text-gray-800">NBA</span>
                                    </a>
                                    <a 
                                        onClick={() => {navigate("/f1"); setMenuOpen(false)}}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 hover:bg-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl">
                                            🏎️
                                        </div>
                                        <span className="font-semibold text-gray-800">Fórmula 1</span>
                                    </a>
                                </div>

                                {/* Search */}
                                <form onSubmit={(e) => {handleQuery(e); setMenuOpen(false)}} className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Buscar jerseys..."
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/70 border border-gray-200 font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-xl"
                                    >
                                        Buscar
                                    </button>
                                </form>

                                {/* User Login */}
                                <div className="pt-4">
                                    <button 
                                        ref={buttonRef} 
                                        onClick={() => setDropdownVisible(!dropdownVisible)}
                                        className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 text-white font-semibold shadow-xl transform hover:scale-105 transition-all duration-300"
                                    >
                                        <User className="w-5 h-5" />
                                        <span>{isAuthenticated ? userName : "Iniciar Sesión"}</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${dropdownVisible ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Login/User Dropdown */}
                {dropdownVisible && (
                    <>
                        <div className="fixed inset-0 bg-black/30 z-[998] h-screen" onClick={() => setDropdownVisible(false)}></div>
                        <div 
                            ref={dropdownRef} 
                            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-[420px] h-full z-[999] transition-all duration-300"
                        >
                            {/* Alert */}
                            {alert.show && (
                                <Alert className="mb-4 rounded-2xl shadow-xl" severity={alert.severity} onClose={() => setAlert({ ...alert, show: false })}>
                                    <AlertTitle>{alert.severity === "error" ? "Error" : "Éxito"}</AlertTitle>
                                    {alert.message}
                                </Alert>
                            )}

                            {isAuthenticated ? (
                                /* Authenticated User Card */
                                <div className="bg-white rounded-3xl shadow-2xl border mt-2 md:mt-20 border-white/20 p-8">
                                    <div className="text-center mb-8">
                                        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                            <User className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{userNameFull}</h3>
                                        <p className="text-gray-600">Bienvenido de vuelta</p>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { label: "Perfil", action: () => navigate("/profile") || setDropdownVisible(false), icon: User },
                                            { label: "Mis Compras", action: () => navigate("/compras") || setDropdownVisible(false), icon: ShoppingCart },
                                            { label: "Soporte", action: () => navigate("/soporte") || setDropdownVisible(false), icon: Mail }
                                        ].map((item, index) => (
                                            <button
                                                key={index}
                                                onClick={item.action}
                                                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
                                            >
                                                <item.icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                                                <span className="font-medium text-gray-700 group-hover:text-blue-600">{item.label}</span>
                                            </button>
                                        ))}
                                        
                                        <div className="my-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                                        
                                        <button
                                            onClick={async () => { 
                                                await supabase.auth.signOut(); 
                                                setIsAuthenticated(false); 
                                                setDropdownVisible(false); 
                                            }}
                                            className="w-full p-4 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-600 font-semibold hover:from-red-100 hover:to-pink-100 hover:border-red-300 transition-all duration-300"
                                        >
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Login Form */
                                <div className="bg-white rounded-3xl mt-1 md:mt-20 shadow-2xl border border-white/20 p-8">
                                    <div className="text-center mb-8">
                                        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                            <User className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Iniciar Sesión</h3>
                                        <p className="text-gray-600">Accede a tu cuenta</p>
                                    </div>

                                    <form className="space-y-6">
                                        {/* Email Input */}
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 w-5 h-5 transition-colors duration-300" />
                                            <input
                                                type="email"
                                                placeholder="Correo electrónico"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-300"
                                            />
                                        </div>

                                        {/* Password Input */}
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 w-5 h-5 transition-colors duration-300" />
                                            <input
                                                type="password"
                                                placeholder="Contraseña"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-50 border border-gray-200 font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-300"
                                            />
                                        </div>

                                        {/* Buttons */}
                                        <div className="space-y-4">
                                            <button
                                                onClick={handleLogin}
                                                type="button"
                                                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-xl"
                                            >
                                                Iniciar Sesión
                                            </button>

                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
                                                <span className="text-gray-500 text-sm">o</span>
                                                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
                                            </div>

                                            <button
                                                onClick={handleGoogleLogin}
                                                type="button"
                                                className="w-full h-14 bg-white border-2 border-gray-200 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
                                            >
                                                <img src={googlelogo} className="w-6 h-6" alt="Google" />
                                                Continuar con Google
                                            </button>

                                            <div className="grid grid-cols-2 gap-3 pt-2">
                                                <button
                                                    onClick={() => navigate("/register") || setDropdownVisible(false)}
                                                    type="button"
                                                    className="h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300"
                                                >
                                                    Registrarse
                                                </button>
                                                <button
                                                    onClick={() => navigate("/forgot-password") || setDropdownVisible(false)}
                                                    type="button"
                                                    className="h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300"
                                                >
                                                    ¿Olvidaste?
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </header>
    </div>
  )
}

export default Header