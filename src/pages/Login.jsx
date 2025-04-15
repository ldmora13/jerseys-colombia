import React, { useEffect, useState, useRef } from "react";
import logo from "../assets/football-jersey.svg";
import googlelogo from "../assets/google.svg";
import { auth, provider, storage } from "../lib/firebaseConfig"; 
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getDownloadURL, ref } from "firebase/storage";
import { useNavigate} from "react-router-dom";


const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Login exitoso:", user);
      navigate("/main"); // Redirige al usuario después del login
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      setError("Correo o contraseña incorrectos.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Usuario logueado con Google:", user);
      navigate("/main");
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
  }, []);

  return (
    
    <div>
        <header className="p-4 relative w-full z-[1000] top-0 left-0 h-[70px] border-b-[2px] border-transparent">
          <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between h-full">
            
            {/* Logo */}
            <div className="flex items-center">
            <a href="/">
              <img src={logo} alt="logo" className="h-[40px]"/>
            </a>
            </div>

            {/* Nav */}
            <nav className="flex-1 flex justify-center">
              <ul className="flex gap-10 text-[#050315]">
                <li>
                  <a href="#"className="font-medium py-2 px-3 rounded-sm transition-all duration-300 ease-in-out hover:bg-[#00ff2a] active:text-[#4a6cf7] active:bg-green-100">
                    Fútbol
                  </a>
                </li>
                <li>
                  <a href="#" className="font-medium py-2 px-3 rounded-sm transition-all duration-300 ease-in-out hover:bg-[#EE6730] active:text-[#4a6cf7] active:bg-red-100">
                    Basketball
                  </a>
                </li>
                <li>
                  <a href="#" className="font-medium py-2 px-3 rounded-sm transition-all duration-300 ease-in-out hover:text-white hover:bg-black active:text-[#4a6cf7] active:bg-gray-200">
                    Fórmula 1
                  </a>
                </li>
              </ul>
            </nav>

            {/* Search bar*/}
            <div className="w-[300px] h-[45px] rounded-[15px] cursor-pointer flex items-center justify-center outline-none">
              <input type="text" placeholder="Buscar" name="text" id="search" className="w-[298px] h-[43px] px-4 rounded-[13px] ml-0.5 bg-[#C9FCD4] font-semibold outline-none focus:shadow-[0_0_10px_rgba(45,64,75,1)] focus:ring-0"/>
            </div>

            {/* Login button + dropdown */}
            <div className="flex items-center gap-5">
              <div className="flex gap-3 relative">
                <div ref={buttonRef} onClick={() => setDropdownVisible(!dropdownVisible)} className="w-[131px] h-[45px] ml-2 rounded-[15px] cursor-pointer focus:outline-none">
                  
                  {/* Login Button */}
                  <div className="w-[127px] h-[43px] rounded-[13px] bg-[#A4CEAC] flex items-center justify-center gap-[15px] text-white font-semibold hover:shadow-xl active:bg-[#c9ffd3]">
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[27px] h-[27px] fill-white">
                      <g data-name="Layer 2" id="Layer_2">
                        <path d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"></path>
                      </g>
                    </svg>
                    <p id="text-login">Login</p>
                  </div>
                </div>

                {dropdownVisible && (
                  <div ref={dropdownRef} className="absolute top-[60px] right-0 w-[400px] rounded-xl p-4 z-[999]">
                    
                    {/* Background Cards */}
                    <div id="card" className="rounded-[25px] w-full h-auto transition-all duration-300 hover:shadow-[0_0_30px_1px_rgba(0,255,117,0.3)]" style={{ backgroundImage: "linear-gradient(163deg, #C9FCD4 0%, #C9FCD4 100%)",}}>
                      <div id="card2" className="w-full h-auto rounded-[25px] transition-all duration-200 hover:scale-[0.98] hover:rounded-[30px]">
                        {/* Form */}
                        <form id="form" className="flex flex-col gap-6 p-6 bg-[#a4ceac] rounded-[25px]">
                          <p id="heading" className="text-center text-[1.2em]"> Iniciar sesión </p>

                          {/* Email input */}
                          <div className="flex items-center gap-3 bg-[#252525] p-3 rounded-[15px]">
                            <svg className="h-[1.3em] w-[1.3em] fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                              <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z" />
                            </svg>
                            <input id="email" className="bg-transparent border-none outline-none w-full text-[#d3d3d3]" type="email" placeholder="Email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)}/>
                          </div>

                          {/* Password input */}
                          <div className="flex items-center gap-3 bg-[#252525] p-3 rounded-[15px]">
                            <svg className="h-[1.3em] w-[1.3em] fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                            </svg>
                            <input id="password" className="bg-transparent border-none outline-none w-full text-[#d3d3d3]" type="password" placeholder="Password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} />
                          </div>

                          {/* Buttons */}
                          <div className="flex justify-around text-white">
                            <button onClick={handleLogin} className="p-2 px-4 rounded-md bg-[#252525] hover:bg-black transition">
                              Iniciar sesión
                            </button>
                            <button onClick={handleGoogleLogin} id="btn-google" className="p-2 px-4 rounded-md bg-[#252525] text-white hover:bg-black transition">
                              <img src={googlelogo} className="w-[40px]" alt="Google login"/>
                            </button>
                          </div>
                          {error && <p className="text-red-600 text-sm text-center">{error}</p>} 
                          
                          <button onClick={() => navigate("/register")} className="text-center p-2 rounded-md bg-[#252525] text-white hover:bg-[#AFFCBE] hover:text-black">
                            Registrarse
                          </button>
                          <button className="p-2 rounded-md bg-[#252525] text-white hover:bg-[#DA544A] hover:text-black">
                            ¿Olvidó su contraseña?
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff2a] to-transparent">
			    </div>
        </header>
        <main className="items-center content-center">
          <h1>Hola </h1>
        </main>
    </div>
  );
};

export default Login;