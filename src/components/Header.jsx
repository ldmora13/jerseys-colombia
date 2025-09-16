import React, {useRef, useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient';
import { useWishlist } from '../context/WishlistContext';

import Alert from '@mui/material/Alert';
import { AlertTitle } from "@mui/material";
import logo from "../assets/football-jersey.svg";
import googlelogo from "../assets/google.svg";


const Header = ({setCartVisible}) => {

    const { setWishlistVisible } = useWishlist();

    const navigate = useNavigate();
    const [query, setQuery] = useState("");

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
    const [error, setError] = useState("");

    {/* Dropdown */}
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    {/* Menú hamburger */}
    const [menuOpen, setMenuOpen] = useState(false);
    const navRef = useRef(null);
    const buttonNav = useRef(null);


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

        if (dropdownVisible) {
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
    }, [dropdownVisible, setDropdownVisible]);

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
        <header className="bg-blue-200 p-4 w-full z-[999] top-0 left-0 h-[70px] border-b-[2px] border-transparent fixed">
            <div className="max-w-[1200px] mx-auto px-5 sm:-mt-1.5 flex items-center flex-wrap justify-between md:flex-nowrap">
                {/* Logo */}
                <div className="flex items-center">
                    <a onClick={() => navigate("/")} className="cursor-pointer">
                        <img src={logo} alt="logo" className="h-[40px]" />
                    </a>
                </div>

                <div className='md:hidden fixed right-20 flex items-center gap-x-3 '>
                    <svg className='h-8 w-auto cursor-pointer' onClick={() => setWishlistVisible(true)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z" fill="#292F36">
                        </path>
                    </svg>
                    <svg className='h-8 w-auto cursor-pointer' onClick={() => setCartVisible(true)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.23737 2.28845C1.84442 2.15746 1.41968 2.36983 1.28869 2.76279C1.15771 3.15575 1.37008 3.58049 1.76303 3.71147L2.02794 3.79978C2.70435 4.02524 3.15155 4.17551 3.481 4.32877C3.79296 4.47389 3.92784 4.59069 4.01426 4.71059C4.10068 4.83049 4.16883 4.99538 4.20785 5.33722C4.24907 5.69823 4.2502 6.17 4.2502 6.883L4.2502 9.55484C4.25018 10.9224 4.25017 12.0247 4.36673 12.8917C4.48774 13.7918 4.74664 14.5497 5.34855 15.1516C5.95047 15.7535 6.70834 16.0124 7.60845 16.1334C8.47542 16.25 9.57773 16.25 10.9453 16.25H18.0002C18.4144 16.25 18.7502 15.9142 18.7502 15.5C18.7502 15.0857 18.4144 14.75 18.0002 14.75H11.0002C9.56479 14.75 8.56367 14.7484 7.80832 14.6468C7.07455 14.5482 6.68598 14.3677 6.40921 14.091C6.17403 13.8558 6.00839 13.5398 5.9034 13H16.0222C16.9817 13 17.4614 13 17.8371 12.7522C18.2128 12.5045 18.4017 12.0636 18.7797 11.1817L19.2082 10.1817C20.0177 8.2929 20.4225 7.34849 19.9779 6.67422C19.5333 5.99996 18.5058 5.99996 16.4508 5.99996H5.74526C5.73936 5.69227 5.72644 5.41467 5.69817 5.16708C5.64282 4.68226 5.52222 4.2374 5.23112 3.83352C4.94002 3.42965 4.55613 3.17456 4.1137 2.96873C3.69746 2.7751 3.16814 2.59868 2.54176 2.38991L2.23737 2.28845Z" fill="#292F36"></path> 
                        <path d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z" fill="#292F36"></path>
                        <path d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z" fill="#292F36"></path> 
                    </svg>
                </div>

                <nav className="relative">
                    {/* Botón hamburguesa*/}
                    <button ref={buttonNav} aria-label='Abrir menú' className="md:hidden block" onClick={() => setMenuOpen(!menuOpen)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Menú hamburguesa*/}
                    {menuOpen && (
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[998]" onClick={() => setMenuOpen(false)} >
                        <div ref={navRef} onClick={(e) => e.stopPropagation()}
                            className="absolute top-0 left-0 w-full h-screen z-[999] flex flex-col items-center text-white gap-6 pt-20">
                            
                            <button onClick={() => setMenuOpen(false)} className="absolute top-4 right-4 h-[45px] px-6 rounded-[13px] bg-[#ffffff] text-black font-semibold transition transform duration-200 ease-in-out hover:scale-105 hover:shadow-xl active:scale-95 active:bg-[#c9ffd3] active:text-[#3B92BA]">
                                Regresar
                            </button>
                            {/* Lista de enlaces */}
                            <ul className="flex flex-col items-center gap-3 bg-white/80 rounded-xl shadow-md px-6 py-4 w-full max-w-xs mx-auto mb-4">
                                <li>
                                    <a onClick={() => navigate("/futbol")}
                                        className="block cursor-pointer text-center font-medium py-2 px-4 rounded-lg transition-all duration-200 ease-in-out text-[#252525]  hover:scale-105 hover:shadow-xl active:scale-95 active:bg-[#c9ffd3]">
                                        Fútbol
                                    </a>
                                </li>
                                <li>
                                    <a onClick={() => navigate("/NBA")}
                                        className="block cursor-pointer text-center font-medium py-2 px-4 rounded-lg transition-all duration-200 ease-in-out text-[#252525] hover:scale-105 hover:shadow-xl active:scale-95 active:bg-[#c9ffd3]">
                                        Basketball
                                    </a>
                                </li>
                                <li>
                                    <a onClick={() => navigate("/F1")} 
                                        className="block cursor-pointer text-center font-medium py-2 px-4 rounded-lg transition-all duration-200 ease-in-out text-[#252525] hover:scale-105 hover:shadow-xl active:scale-95 active:bg-[#c9ffd3]">
                                        Fórmula 1
                                    </a>
                                </li>
                            </ul>

                            {/* Barra de búsqueda */}
                            <div className="w-full px-4 flex-row">
                                <form className='flex items-center gap-2' onSubmit={handleQuery}>
                                    <input type="text" 
                                        placeholder="Buscar" value={query} onChange={(e) => setQuery(e.target.value)}
                                        className="h-[45px] flex-1 px-4 text-black rounded-[13px] bg-[#F3F3F3] font-semibold outline-none focus:shadow-[0_0_10px_rgba(45,64,75,1)]"/>
                                    <button type="submit" className="h-[45px] px-6 rounded-[13px] bg-[#252525] text-white font-semibold transition transform duration-200 ease-in-out hover:scale-105 hover:shadow-xl active:scale-95 active:bg-[#c9ffd3] active:text-[#3B92BA]">
                                        Buscar
                                    </button>
                                </form>
                            </div>

                            {/* Botón de login */}
                            <div className={`relative w-[50%]`}>
                                <div ref={buttonRef} onClick={() => setDropdownVisible(!dropdownVisible)}
                                    className="w-full h-[45px] md:w-[131px] rounded-[15px] cursor-pointer">
                                    {/* Dynamic Button */}
                                    <div className="w-full h-[43px] rounded-[13px] bg-[#252525] flex items-center justify-center gap-2 text-white font-semibold transition transform duration-200 ease-in-out hover:scale-105 hover:shadow-xl active:scale-95 active:bg-[#c9ffd3] active:text-[#3B92BA]">
                                        <svg aria-hidden="true" viewBox="0 0 24 24" className="w-[24px] h-[24px] fill-white">
                                            <path d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"></path>
                                        </svg>
                                        <p>{isAuthenticated ? userName : "Login"}</p>
                                    </div>
                                </div>

                                {/* Dropdown */}
                                {dropdownVisible && (
                                    <>
                                        <div className="fixed inset-0 bg-black/30 z-[998]" 
                                            onClick={() => setDropdownVisible(false)}>
                                        </div>
                                        <div ref={dropdownRef} className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] rounded-xl p-4 z-[999] transition-all">
                                            {/* Alert*/}
                                            {alert.show && (
                                                <Alert className="fixed rounded-[25px] z-[999]" severity={alert.severity} onClose={() => setAlert({ ...alert, show: false })}>
                                                    <AlertTitle>{alert.severity === "error" ? "Error" : "Éxito"}</AlertTitle>
                                                    {alert.message}
                                                </Alert>
                                            )}
                                                {isAuthenticated ? (
                                                <div id="card" className="rounded-[25px] w-full max-w-sm sm:max-w-md md:max-w-lg h-auto transition-all duration-300 bg-blue-200 mx-auto">
                                                    <div id="card2" className="w-full h-auto rounded-[25px] transition-all duration-200 hover:scale-[0.98] hover:rounded-[30px] ">
                                                        <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 p-4 sm:p-5 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-[25px]">
                                                        <div className="flex flex-col gap-3 sm:gap-4 items-center justify-center">
                                                            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
                                                                className="w-[24px] sm:w-[26px] md:w-[27px] h-[24px] sm:h-[26px] md:h-[27px] fill-black">
                                                                <path d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"></path>
                                                            </svg>
                                                            <p className="text-black text-[18px] sm:text-[20px] md:text-[22px] ">{userNameFull}</p>
                                                        </div>
                                                        <div className="flex flex-col text-white">
                                                            <button onClick={() => navigate("/profile")} className="text-center p-2 mb-3 rounded-md bg-[#252525]  hover:bg-black">
                                                                Perfil
                                                            </button>
                                                            <button onClick={() => navigate("/compras")} className="p-2 mb-3 rounded-md bg-[#252525] hover:bg-black">
                                                                Compras
                                                            </button>
                                                            <button onClick={() => navigate("/soporte")} className="p-2  rounded-md bg-[#252525] hover:bg-black">
                                                                Soporte
                                                            </button>
                                                            <div className="mt-3 mb-3 bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#252525] to-transparent">
                                                            </div>
                                                            <button onClick={async () => { await supabase.auth.signOut(); setIsAuthenticated(false); setDropdownVisible(false); }} 
                                                                className="p-2 rounded-md bg-[#252525] hover:bg-black">
                                                                Salir
                                                            </button>
                                                        </div>
                                                    </div> 
                                                </div>
                                            </div>
                                            ): (
                                            <div id="card" className="rounded-[25px] w-full max-w-sm sm:max-w-md md:max-w-lg h-auto mx-auto transition-all duration-300 hover:shadow-[0_0_30px_1px_rgba(0,255,117,0.3)]" style={{ backgroundImage: "linear-gradient(163deg, #bebebe 0%, #bebebe 100%)",}}>
                                                <div id="card2" className="w-full h-auto rounded-[25px] transition-all duration-200 hover:scale-[0.98] hover:rounded-[30px]">
                                                {/* Form */}
                                                    <form id="form" className="flex flex-col gap-5 sm:gap-6 p-4 sm:p-5 md:p-6 bg-[#e0e0e0] rounded-[25px]">
                                                    <p id="heading" className="text-center text-[1.1em] sm:text-[1.2em] text-black"> Iniciar sesión </p>

                                                    {/* Email input */}
                                                    <div className="flex items-center gap-3 bg-[#252525] p-3 rounded-[15px]">
                                                        <svg className="h-[1.2em] w-[1.2em] sm:h-[1.3em] sm:w-[1.3em] fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z" />
                                                        </svg>
                                                        <input id="email" className="bg-transparent border-none outline-none w-full text-[#d3d3d3] text-sm sm:text-base" type="email" placeholder="Email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)}/>
                                                    </div>

                                                    {/* Password input */}
                                                    <div className="flex items-center gap-3 bg-[#252525] p-3 rounded-[15px]">
                                                        <svg className="h-[1.2em] w-[1.2em] sm:h-[1.3em] sm:w-[1.3em] fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                                                        </svg>
                                                        <input id="password" className="bg-transparent border-none outline-none w-full text-[#d3d3d3] text-sm sm:text-base" type="password" placeholder="Password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} />
                                                    </div>

                                                    {/* Buttons */}
                                                    <div className="flex flex-col gap-3 text-white">
                                                        <button onClick={handleLogin} className="p-2 rounded-md bg-[#252525] hover:bg-black">
                                                        Iniciar sesión
                                                        </button>
                                                        <div className='mt-4 h-1 w-full border-0 bg-gradient-to-r from-transparent via-[#252525] to-transparent'></div>
                                                        <button onClick={() => navigate("/register")} className=" mt-4 p-2 rounded-md bg-[#252525] hover:bg-black">
                                                        Registrarse
                                                        </button>
                                                        <button className="p-2 rounded-md bg-[#252525] hover:bg-[#DA544A] hover:text-black" onClick={() => navigate("/forgot-password")}>
                                                            ¿Olvidó su contraseña?
                                                        </button>
                                                    </div>
                                                    <div className='flex justify-between items-center mt-4'>
                                                        <div className='h-1 w-[20%] border-0 bg-gradient-to-r from-[#252525] to-transparent'></div>
                                                        <p className='text-center text-black text-sm'>O inicia sesión con</p>
                                                        <div className='h-1 w-[20%] border-0 bg-gradient-to-l from-[#252525] to-transparent'></div>
                                                    </div>
                                                    <button type="button" onClick={handleGoogleLogin} id="btn-google" className="p-2 px-4 rounded-md bg-[#252525] hover:bg-black flex items-center justify-center">
                                                            <img src={googlelogo} className="w-[30px] sm:w-[35px]" alt="Google login" />
                                                    </button>
                                                    </form>
                                                </div>
                                            </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    )}

                    {/* Menú principal */}
                    <ul className="hidden md:flex items-center gap-10">
                        <li>
                            <a onClick={() => navigate("/futbol")} 
                                className="cursor-pointer font-medium py-2 px-3 rounded-sm scale-110 transition-all duration-300 ease-in-out ">
                                Fútbol
                            </a>
                        </li>
                        <li>
                            <a onClick={() => navigate("/NBA")}
                                className="cursor-pointer font-medium py-2 px-3 rounded-sm scale-110 transition-all duration-300 ease-in-out ">
                                Basketball
                            </a>
                        </li>
                        <li>
                            <a onClick={() => navigate("/F1")}
                                className="cursor-pointer font-medium py-2 px-3 rounded-sm scale-110 transition-all duration-300 ease-in-out ">
                                Fórmula 1
                            </a>
                        </li>
                    </ul>
                </nav>

                {/* Search bar */}
                <div className={`md:flex hidden flex-col md:flex-row md:items-center items-center gap-4 md:gap-6 w-full md:w-auto mt-4 md:mt-0  `}>
                    <div className='w-full md:w-[300px]'>
                        <form className='hidden md:flex' onSubmit={handleQuery}>
                            <input
                                type='text'
                                placeholder="Buscar"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="h-[45px] w-full px-4 rounded-[13px] bg-blue-50 font-semibold outline-none focus:shadow-[0_0_10px_rgba(45,64,75,1)]"
                            />
                        </form>    
                    </div>      
                </div>
                <div className='md:flex gap-x-6 hidden items-center'>
                    <svg className='h-8 w-auto cursor-pointer'  onClick={() => setWishlistVisible(true)} viewBox="0 0 24 24" fill="none">
                        <path d="M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z" fill="#292F36">
                        </path>
                    </svg>
                    <svg className='h-8 w-auto cursor-pointer' onClick={() => setCartVisible(true)} viewBox="0 0 24 24" fill="none">
                            <path d="M2.23737 2.28845C1.84442 2.15746 1.41968 2.36983 1.28869 2.76279C1.15771 3.15575 1.37008 3.58049 1.76303 3.71147L2.02794 3.79978C2.70435 4.02524 3.15155 4.17551 3.481 4.32877C3.79296 4.47389 3.92784 4.59069 4.01426 4.71059C4.10068 4.83049 4.16883 4.99538 4.20785 5.33722C4.24907 5.69823 4.2502 6.17 4.2502 6.883L4.2502 9.55484C4.25018 10.9224 4.25017 12.0247 4.36673 12.8917C4.48774 13.7918 4.74664 14.5497 5.34855 15.1516C5.95047 15.7535 6.70834 16.0124 7.60845 16.1334C8.47542 16.25 9.57773 16.25 10.9453 16.25H18.0002C18.4144 16.25 18.7502 15.9142 18.7502 15.5C18.7502 15.0857 18.4144 14.75 18.0002 14.75H11.0002C9.56479 14.75 8.56367 14.7484 7.80832 14.6468C7.07455 14.5482 6.68598 14.3677 6.40921 14.091C6.17403 13.8558 6.00839 13.5398 5.9034 13H16.0222C16.9817 13 17.4614 13 17.8371 12.7522C18.2128 12.5045 18.4017 12.0636 18.7797 11.1817L19.2082 10.1817C20.0177 8.2929 20.4225 7.34849 19.9779 6.67422C19.5333 5.99996 18.5058 5.99996 16.4508 5.99996H5.74526C5.73936 5.69227 5.72644 5.41467 5.69817 5.16708C5.64282 4.68226 5.52222 4.2374 5.23112 3.83352C4.94002 3.42965 4.55613 3.17456 4.1137 2.96873C3.69746 2.7751 3.16814 2.59868 2.54176 2.38991L2.23737 2.28845Z" fill="#292F36"></path> 
                            <path d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z" fill="#292F36"></path>
                            <path d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z" fill="#292F36"></path> 
                        
                    </svg>
                </div>
                {/* Login button + dropdown */}
                <div className={`relative md:flex hidden`}>
                    <div ref={buttonRef} onClick={() => setDropdownVisible(!dropdownVisible)}
                        className="w-full h-[45px] md:w-[131px] rounded-[15px] cursor-pointer">
                        {/* Dynamic Button */}
                        <div className="w-full h-[43px] rounded-[13px] bg-[#252525] flex items-center justify-center gap-2 text-white font-semibold transition transform duration-200 ease-in-out hover:scale-105 hover:shadow-xl active:scale-95 active:bg-[#c9ffd3] active:text-[#3B92BA]">
                            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[24px] h-[24px] fill-white">
                                <path d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"></path>
                            </svg>
                            <p>{isAuthenticated ? userName : "Login"}</p>
                        </div>
                    </div>

                    {/* Dropdown */}
                    {dropdownVisible && (
                        <>
                            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[998]" 
                                onClick={() => setDropdownVisible(false)}>
                            </div>
                            <div ref={dropdownRef} className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] rounded-xl p-4 z-[999] transition-all">
                                    {/* Alert*/}
                                    {alert.show && (
                                        <Alert className="top-10 -left-100 fixed rounded-2xl z-[999] w-[90%]" severity={alert.severity}>
                                            <AlertTitle>{alert.severity === "error" ? "Error" : "Éxito"}</AlertTitle>
                                            {alert.message}
                                        </Alert>
                                    )}
                                    {isAuthenticated ? (
                                    <div id="card" className="rounded-[25px] w-full max-w-sm sm:max-w-md md:max-w-lg h-auto transition-all duration-300 bg-blue-200 hover:shadow-[0_0_30px_1px_rgba(0,255,117,0.3)] mx-auto">
                                        <div id="card2" className="w-full h-auto rounded-[25px] transition-all duration-200 hover:scale-[0.98] hover:rounded-[30px] ">
                                            <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 p-4 sm:p-5 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-[25px]">
                                            <div className="flex flex-col gap-3 sm:gap-4 items-center justify-center">
                                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
                                                    className="w-[24px] sm:w-[26px] md:w-[27px] h-[24px] sm:h-[26px] md:h-[27px] fill-black">
                                                    <path d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"></path>
                                                </svg>
                                                <p className="text-black text-[18px] sm:text-[20px] md:text-[22px] ">{userNameFull}</p>
                                            </div>
                                            <div className="flex flex-col text-white">
                                                <button onClick={() => navigate("/profile")} className="bg-[#252525] text-center p-2 mb-3 rounded-md hover:bg-black">
                                                    Perfil
                                                </button>
                                                <button onClick={() => navigate("/compras")} className="p-2 mb-3 rounded-md bg-[#252525] hover:bg-black">
                                                    Compras
                                                </button>
                                                <button onClick={() => navigate("/soporte")} className="p-2 rounded-md bg-[#252525] hover:bg-black">
                                                    Soporte
                                                </button>
                                                <div className="mt-3 mb-3 bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#252525] to-transparent">
                                                </div>
                                                <button onClick={async () => { await supabase.auth.signOut(); setIsAuthenticated(false); setDropdownVisible(false); }}
                                                    className="p-2 rounded-md bg-[#252525] text-white hover:bg-[#DA544A]">
                                                    Salir
                                                </button>
                                            </div>
                                        </div> 
                                    </div>
                                </div>
                                ): (
                                <div id="card" className="rounded-[25px] w-full max-w-sm sm:max-w-md md:max-w-lg h-auto mx-auto transition-all duration-300 bg-blue-200 hover:shadow-[0_0_30px_1px_rgba(0,255,117,0.3)]">
                                    <div id="card2" className="w-full h-auto rounded-[25px] transition-all duration-200 hover:scale-[0.98] hover:rounded-[30px]">
                                    {/* Form */}
                                        <form id="form" className="flex flex-col gap-5 sm:gap-6 p-4 sm:p-5 md:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-[25px]">
                                        <p id="heading" className="text-center text-[1.1em] sm:text-[1.2em] text-black"> Iniciar sesión </p>

                                        {/* Email input */}
                                        <div className="flex items-center gap-3 bg-[#252525] p-3 rounded-[15px]">
                                            <svg className="h-[1.2em] w-[1.2em] sm:h-[1.3em] sm:w-[1.3em] fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z" />
                                            </svg>
                                            <input id="email" className="bg-transparent border-none outline-none w-full text-[#d3d3d3] text-sm sm:text-base" type="email" placeholder="Email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)}/>
                                        </div>

                                        {/* Password input */}
                                        <div className="flex items-center gap-3 bg-[#252525] p-3 rounded-[15px]">
                                            <svg className="h-[1.2em] w-[1.2em] sm:h-[1.3em] sm:w-[1.3em] fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                                            </svg>
                                            <input id="password" className="bg-transparent border-none outline-none w-full text-[#d3d3d3] text-sm sm:text-base" type="password" placeholder="Password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} />
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex flex-col gap-3 text-white">
                                            <button onClick={handleLogin} className="p-2 rounded-md bg-[#252525] hover:bg-black">
                                            Iniciar sesión
                                            </button>
                                            <div className='mt-4 h-1 w-full border-0 bg-gradient-to-r from-transparent via-[#252525] to-transparent'></div>
                                            <button onClick={() => navigate("/register")} className=" mt-4 p-2 rounded-md bg-[#252525] hover:bg-black">
                                            Registrarse
                                            </button>
                                            <button className="p-2 rounded-md bg-[#252525] hover:bg-[#DA544A] hover:text-black" onClick={() => navigate("/forgot-password")}>
                                                ¿Olvidó su contraseña?
                                            </button>
                                        </div>
                                        <div className='flex justify-between items-center mt-4'>
                                            <div className='h-1 w-[20%] border-0 bg-gradient-to-r from-transparent to-[#252525]'></div>
                                            <p className='text-center text-black text-sm'>O inicia sesión con</p>
                                            <div className='h-1 w-[20%] border-0 bg-gradient-to-r from-[#252525] to-transparent'></div>
                                        </div>
                                        <button type="button" onClick={handleGoogleLogin} id="btn-google" className="p-2 px-4 rounded-md bg-[#252525] hover:bg-black flex items-center justify-center">
                                                <img src={googlelogo} className="w-[30px] sm:w-[35px]" alt="Google login" />
                                        </button>
                                        </form>
                                    </div>
                                </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#2f3545] to-transparent">
            </div>
        </header>
    </div>
  )
}

export default Header