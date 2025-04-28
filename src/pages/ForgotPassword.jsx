import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation} from "react-router-dom";
import logo from "../assets/football-jersey.svg";
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from "../lib/firebaseConfig";


const ForgotPassword = () => {

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
        await sendPasswordResetEmail(auth, email);
        setMessage("Correo enviado")
    }catch (error){
        setMessage("Error: "+ error.message)
        }
    }
    
    return(
        <div className="h-screen w-screen flex justify-center items-center">
                    <div id="card" className="flex justify-center items-center rounded-[25px] w-[500px] h-[400px]" style={{backgroundImage: 'linear-gradient(163deg, #C9FCD4 0%, #AFFCBE 100%)',}}>
                        <div id="card2" className="rounded-0 w-[500px] h-[400px] transition-all duration-200 hover:scale-[0.98] hover:rouded-[30px]">
                        
                            <form onSubmit={handleResetPassword} className="flex flex-col gap-6 p-6 bg-[#A4CEAC] rounded-[25px] h-full w-full">
                                <img src={logo} alt="logo" className="h-[40px]" />
                                <p className="text-center text-2xl -mt-5">Jerseys Colombia</p>
                                <p id="heading" className="text-center text-[1.2em]">Reset de la contraseña</p>

                                <div className="flex items-center gap-3 bg-[#252525] p-3 rounded-[15px]">
                                    <svg className="h-[1.3em] w-[1.3em] fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"></path>
                                    </svg>
                                    <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent border-none outline-none w-full text-[#d3d3d3]" type="email" placeholder="Email" autoComplete="off" />
                                </div>
                                <div className="flex justify-center">
                                    <button type="submit" className="flex items-center justify-center text-center w-[300px] p-2 rounded-md bg-[#252525] text-white hover:bg-[#AFFCBE] hover:text-black">
                                        Enviar correo de restablecimiento
                                    </button>
                                </div>
                                {message && <p className="mt-4 text-center">{message}</p>}
                            </form>
                        </div>
                    </div>
                </div>
    )
}

export default ForgotPassword;