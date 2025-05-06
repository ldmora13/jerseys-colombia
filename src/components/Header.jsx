import React, {useRef, useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import logo from "../assets/football-jersey.svg";
import googlelogo from "../assets/google.svg";


const Header = () => {

    const navigate = useNavigate();
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    {/* Login and reset password */}
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userNameFull, setUserNameFull] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [userName, setUserName] = useState("");

    {/* Dropdown */}
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const [menuOpen, setMenuOpen] = useState(false);
    


    const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Login exitoso:", user);
    } catch (error) {
        console.error("Error al iniciar sesión:", error.message);
        setError("Correo o contraseña incorrectos.");
    }
    };

    const handleGoogleLogin = async (e) => {
    e.preventDefault();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Usuario logueado con Google:", user);
    } catch (error) {
        console.error("Error en login con Google", error);
    }
    };

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
        return () => document.removeEventListener("click", handleClickOutside);
        }, [setDropdownVisible]);

      useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            const displayName = user.displayName || user.email || "Usuario";
            setUserName(displayName.split(" ")[0]);
            setUserNameFull(displayName);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
    
          }
        });
    
        return () => unsubscribe();
      }, []);
    

  return (
    <div>
        <header className="bg-[#E8E8E8] p-4 w-full z-[1000] top-0 left-0 h-[70px] border-b-[2px] border-transparent fixed">
            <div className="max-w-[1200px] mx-auto px-5 sm:-mt-4.5 flex items-center flex-wrap justify-between md:flex-nowrap">
                {/* Logo */}
                <div className="flex items-center">
                    <a onClick={() => navigate("/")} className="cursor-pointer">
                        <img src={logo} alt="logo" className="md:h-[70px] h-[40px]" />
                    </a>
                </div>

                {/* Hamburger */}
                <button className='md:hidden block' onClick={() => setMenuOpen(!menuOpen)}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                {/* Nav */}
                <nav className={`w-full mt-10 md:mt-0 md:flex md:justify-center ${menuOpen ? "block" : "hidden"} `}>
                    <ul className="flex flex-col md:flex-row items-center gap-4 md:gap-10 text-[#050315]">
                        <li>
                            <a onClick={() => navigate("/futbol")} className="cursor-pointer font-medium py-2 px-3 rounded-sm transition-all duration-300 ease-in-out hover:bg-[#00ff2a] active:text-[#4a6cf7] active:bg-green-100">
                                Fútbol
                            </a>
                        </li>
                        <li>
                            <a onClick={() => navigate("/nba")} className="cursor-pointer font-medium py-2 px-3 rounded-sm transition-all duration-300 ease-in-out hover:bg-[#EE6730] active:text-[#4a6cf7] active:bg-red-100">
                                Basketball
                            </a>
                        </li>
                        <li>
                            <a onClick={() => navigate("/f1")} className="cursor-pointer font-medium py-2 px-3 rounded-sm transition-all duration-300 ease-in-out hover:text-white hover:bg-black active:text-[#4a6cf7] active:bg-gray-200">
                                Fórmula 1
                            </a>
                        </li>
                    </ul>
                    {/* Search bar */}
                    <div className={`flex justify-center items-center mt-4 md:hidden`}>
                        <div className='w-fit'>
                            <input
                                type="text" 
                                placeholder="Buscar"
                                name="text"
                                id="search"
                                className="h-[45px] px-4 rounded-[13px] bg-[#F3F3F3] font-semibold outline-none focus:shadow-[0_0_10px_rgba(45,64,75,1)]"
                            />
                        </div>      
                    </div>
                    {/* Login button + dropdown */}
                    <div className={`relative md:hidden mt-5`}>
                        <div ref={buttonRef} onClick={() => setDropdownVisible(!dropdownVisible)}
                            className="w-full h-[45px] md:w-[131px] rounded-[15px] cursor-pointer">
                            {/* Dynamic Button */}
                            <div className="w-full h-[43px] rounded-[13px] bg-[#3B92BA] flex items-center justify-center gap-2 text-white font-semibold transition transform duration-200 ease-in-out hover:scale-105 hover:shadow-xl active:scale-95 active:bg-[#c9ffd3] active:text-[#3B92BA]">
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
                                <div ref={dropdownRef} className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] rounded-xl p-4 z-[999] transition-all bg-[#A4CEAC] ">
                                    {isAuthenticated ? (
                                    <div id="card" className="rounded-[25px] w-full max-w-sm sm:max-w-md md:max-w-lg h-auto transition-all duration-300 hover:shadow-[0_0_30px_1px_rgba(0,255,117,0.3)] mx-auto" style={{ backgroundImage: "linear-gradient(163deg, #C9FCD4 0%, #C9FCD4 100%)" }}>
                                        <div id="card2" className="w-full h-auto rounded-[25px] transition-all duration-200 hover:scale-[0.98] hover:rounded-[30px] ">
                                            <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 p-4 sm:p-5 md:p-6 bg-[#a4ceac] rounded-[25px]">
                                                <div className="flex flex-col gap-3 sm:gap-4 items-center justify-center">
                                                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
                                                        className="w-[24px] sm:w-[26px] md:w-[27px] h-[24px] sm:h-[26px] md:h-[27px] fill-white">
                                                        <path d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"></path>
                                                    </svg>
                                                    <p className="text-white text-[18px] sm:text-[20px] md:text-[22px] ">{userNameFull}</p>
                                                </div>
                                                <div className="flex flex-col">
                                                    <button onClick={() => navigate("/profile")} className="bg-[#252525] text-center p-2 mb-3 rounded-md  text-white hover:bg-[#AFFCBE] hover:text-black">
                                                        Perfil
                                                    </button>
                                                    <button className="p-2 mb-3 rounded-md bg-[#252525] text-white hover:bg-[#AFFCBE] hover:text-black">
                                                        Compras
                                                    </button>
                                                    <div className="mt-3 mb-3 bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff2a] to-transparent">
                                                    </div>
                                                    <button className="p-2  rounded-md bg-[#252525] text-white hover:bg-[#32ff54] hover:text-black">
                                                        Soporte
                                                    </button>
                                                    <div className="mt-3 mb-3 bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff2a] to-transparent">
                                                    </div>
                                                    <button onClick={() => auth.signOut()} className="p-2 rounded-md bg-[#252525] text-white hover:bg-[#DA544A] hover:text-white">
                                                        Salir
                                                    </button>
                                                </div>
                                            </div> 
                                        </div>
                                    </div>
                                    ): (
                                    <div id="card" className="rounded-[25px] w-full max-w-sm sm:max-w-md md:max-w-lg h-auto mx-auto transition-all duration-300 hover:shadow-[0_0_30px_1px_rgba(0,255,117,0.3)]" style={{ backgroundImage: "linear-gradient(163deg, #C9FCD4 0%, #C9FCD4 100%)",}}>
                                        <div id="card2" className="w-full h-auto rounded-[25px] transition-all duration-200 hover:scale-[0.98] hover:rounded-[30px]">
                                        {/* Form */}
                                            <form id="form" className="flex flex-col gap-5 sm:gap-6 p-4 sm:p-5 md:p-6 bg-[#a4ceac] rounded-[25px]">
                                            <p id="heading" className="text-center text-[1.1em] sm:text-[1.2em] text-white "> Iniciar sesión </p>

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
                                            <div className="flex flex-col sm:flex-row sm:justify-around gap-3 text-white">
                                                <button onClick={handleLogin} className="p-2 px-4 rounded-md bg-[#252525] hover:bg-black transition">
                                                Iniciar sesión
                                                </button>
                                                <button type="button" onClick={handleGoogleLogin} id="btn-google" className="p-2 px-4 rounded-md bg-[#252525] hover:bg-black flex items-center justify-center">
                                                    <img src={googlelogo} className="w-[30px] sm:w-[35px]" alt="Google login" />
                                                </button>
                                            </div>
                                            {error && <p className="text-red-600 text-sm text-center">{error}</p>} 
                                            
                                            <button onClick={() => navigate("/register")} className="text-center p-2 rounded-md bg-[#252525] text-white hover:bg-[#AFFCBE] hover:text-black">
                                                Registrarse
                                            </button>
                                            <button className="p-2 rounded-md bg-[#252525] text-white hover:bg-[#DA544A] hover:text-black" onClick={() => navigate("/forgot-password")}>
                                                ¿Olvidó su contraseña?
                                            </button>
                                            </form>
                                        </div>
                                    </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    
                </nav>

                {/* Search bar */}
                <div className={`md:flex hidden flex-col md:flex-row md:items-center items-center gap-4 md:gap-6 w-full md:w-auto mt-4 md:mt-0  `}>
                    <div className='w-full md:w-[300px]'>
                        <input
                            type="text"
                            placeholder="Buscar"
                            name="text"
                            id="search"
                            className="h-[45px] px-4 rounded-[13px] bg-[#F3F3F3] font-semibold outline-none focus:shadow-[0_0_10px_rgba(45,64,75,1)]"
                        />
                    </div>      
                </div>
                {/* Login button + dropdown */}
                <div className={`relative md:flex hidden`}>
                    <div ref={buttonRef} onClick={() => setDropdownVisible(!dropdownVisible)}
                        className="w-full h-[45px] md:w-[131px] rounded-[15px] cursor-pointer">
                        {/* Dynamic Button */}
                        <div className="w-full h-[43px] rounded-[13px] bg-[#3B92BA] flex items-center justify-center gap-2 text-white font-semibold transition transform duration-200 ease-in-out hover:scale-105 hover:shadow-xl active:scale-95 active:bg-[#c9ffd3] active:text-[#3B92BA]">
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
                            <div ref={dropdownRef} className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] rounded-xl p-4 z-[999] transition-all bg-[#A4CEAC] ">
                                {isAuthenticated ? (
                                <div id="card" className="rounded-[25px] w-full max-w-sm sm:max-w-md md:max-w-lg h-auto transition-all duration-300 hover:shadow-[0_0_30px_1px_rgba(0,255,117,0.3)] mx-auto" style={{ backgroundImage: "linear-gradient(163deg, #C9FCD4 0%, #C9FCD4 100%)" }}>
                                    <div id="card2" className="w-full h-auto rounded-[25px] transition-all duration-200 hover:scale-[0.98] hover:rounded-[30px] ">
                                        <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 p-4 sm:p-5 md:p-6 bg-[#a4ceac] rounded-[25px]">
                                            <div className="flex flex-col gap-3 sm:gap-4 items-center justify-center">
                                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
                                                    className="w-[24px] sm:w-[26px] md:w-[27px] h-[24px] sm:h-[26px] md:h-[27px] fill-white">
                                                    <path d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"></path>
                                                </svg>
                                                <p className="text-white text-[18px] sm:text-[20px] md:text-[22px] ">{userNameFull}</p>
                                            </div>
                                            <div className="flex flex-col">
                                                <button onClick={() => navigate("/profile")} className="bg-[#252525] text-center p-2 mb-3 rounded-md  text-white hover:bg-[#AFFCBE] hover:text-black">
                                                    Perfil
                                                </button>
                                                <button className="p-2 mb-3 rounded-md bg-[#252525] text-white hover:bg-[#AFFCBE] hover:text-black">
                                                    Compras
                                                </button>
                                                <div className="mt-3 mb-3 bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff2a] to-transparent">
                                                </div>
                                                <button className="p-2  rounded-md bg-[#252525] text-white hover:bg-[#32ff54] hover:text-black">
                                                    Soporte
                                                </button>
                                                <div className="mt-3 mb-3 bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff2a] to-transparent">
                                                </div>
                                                <button onClick={() => auth.signOut()} className="p-2 rounded-md bg-[#252525] text-white hover:bg-[#DA544A] hover:text-white">
                                                    Salir
                                                </button>
                                            </div>
                                        </div> 
                                    </div>
                                </div>
                                ): (
                                <div id="card" className="rounded-[25px] w-full max-w-sm sm:max-w-md md:max-w-lg h-auto mx-auto transition-all duration-300 hover:shadow-[0_0_30px_1px_rgba(0,255,117,0.3)]" style={{ backgroundImage: "linear-gradient(163deg, #C9FCD4 0%, #C9FCD4 100%)",}}>
                                    <div id="card2" className="w-full h-auto rounded-[25px] transition-all duration-200 hover:scale-[0.98] hover:rounded-[30px]">
                                    {/* Form */}
                                        <form id="form" className="flex flex-col gap-5 sm:gap-6 p-4 sm:p-5 md:p-6 bg-[#a4ceac] rounded-[25px]">
                                        <p id="heading" className="text-center text-[1.1em] sm:text-[1.2em] text-white "> Iniciar sesión </p>

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
                                        <div className="flex flex-col sm:flex-row sm:justify-around gap-3 text-white">
                                            <button onClick={handleLogin} className="p-2 px-4 rounded-md bg-[#252525] hover:bg-black transition">
                                            Iniciar sesión
                                            </button>
                                            <button type="button" onClick={handleGoogleLogin} id="btn-google" className="p-2 px-4 rounded-md bg-[#252525] hover:bg-black flex items-center justify-center">
                                                <img src={googlelogo} className="w-[30px] sm:w-[35px]" alt="Google login" />
                                            </button>
                                        </div>
                                        {error && <p className="text-red-600 text-sm text-center">{error}</p>} 
                                        
                                        <button onClick={() => navigate("/register")} className="text-center p-2 rounded-md bg-[#252525] text-white hover:bg-[#AFFCBE] hover:text-black">
                                            Registrarse
                                        </button>
                                        <button className="p-2 rounded-md bg-[#252525] text-white hover:bg-[#DA544A] hover:text-black" onClick={() => navigate("/forgot-password")}>
                                            ¿Olvidó su contraseña?
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
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff2a] to-transparent">
            </div>
        </header>
    </div>
  )
}

export default Header