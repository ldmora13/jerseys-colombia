import React, { useEffect, useState, useRef } from "react";
import logo from "../assets/football-jersey.svg";
import {  getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";


const Main = () => {
    const auth = getAuth();
    const [userName, setUserName] = useState("");
    const [UserNameFull, setUserNameFull] = useState("");
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            const displayName = user.displayName || user.email || "Usuario";
            setUserName(displayName.split(" ")[0]);
            setUserNameFull(displayName);

        }
        });

        return () => unsubscribe();
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

                <div className="flex items-center gap-5">
                    <div className="flex gap-3 relative">
                        <div ref={buttonRef} onClick={() => setDropdownVisible(!dropdownVisible)} className="w-[131px] h-[45px] ml-2 rounded-[15px] cursor-pointer focus:outline-none">
                        {/* Dashboard Button */}
                            <div className="w-[127px] h-[43px] rounded-[13px] bg-[#A4CEAC] flex items-center justify-center gap-[15px] text-white font-semibold hover:shadow-xl active:bg-[#c9ffd3]">
                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[27px] h-[27px] fill-white">
                                <g data-name="Layer 2" id="Layer_2">
                                    <path d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"></path>
                                </g>
                                </svg>
                                <p>{userName}</p>
                            </div>
                        </div>

                        {dropdownVisible && (
                        <div ref={dropdownRef} className="absolute top-[60px] right-0 w-[400px] rounded-xl p-4 z-[999]">
                            {/* Background Cards */}
                            <div id="card" className="rounded-[25px] w-full h-auto transition-all duration-300 hover:shadow-[0_0_30px_1px_rgba(0,255,117,0.3)]" style={{ backgroundImage: "linear-gradient(163deg, #C9FCD4 0%, #C9FCD4 100%)",}}>
                                <div id="card2" className="w-full h-auto rounded-[25px] transition-all duration-200 hover:scale-[0.98] hover:rounded-[30px]">
                                    
                                    <div className="flex flex-col gap-6 p-6 bg-[#a4ceac] rounded-[25px]">
                                        <div className="flex flex-col gap-4 items-center justify-center">
                                            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[27px] h-[27px] fill-white">
                                            <g data-name="Layer 2" id="Layer_2">
                                                <path d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"></path>
                                            </g>
                                            </svg>
                                            <p className="text-white text-[20px] ">{UserNameFull}</p>
                                        </div>
                                        <div className="flex flex-col">
                                            
                                            <button onClick={() => navigate("/")} className="bg-[#252525] text-center p-2 mb-3 rounded-md  text-white hover:bg-[#AFFCBE] hover:text-black">
                                                Perfil
                                            </button>
                                            <button className="p-2 mb-3 rounded-md bg-[#252525] text-white hover:bg-[#AFFCBE] hover:text-black">
                                                Compras
                                            </button>

                                            <div className="mt-3 mb-3 bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff2a] to-transparent">
                                            </div>

                                            <button className="p-2  rounded-md bg-[#252525] text-white hover:bg-[#AFFCBE] hover:text-black">
                                                Soporte
                                            </button>

                                            <div className="mt-3 mb-3 bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff2a] to-transparent">
                                            </div>
                                            <button className="p-2 rounded-md bg-[#252525] text-white hover:bg-[#DA544A] hover:text-white">
                                                Salir
                                            </button>
                                        </div>
                                    </div>
                                    
                                    
                                </div>
                            </div>
                        </div>
                        )}
                        
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff2a] to-transparent">
                </div>
            </div>
        </header>
    </div>
  );
};

export default Main;
