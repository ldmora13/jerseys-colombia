import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from '@mui/material/Alert';
import { AlertTitle } from "@mui/material";
import logo from "../assets/football-jersey.svg"
import googlelogo from "../assets/google.svg"

import { app, auth } from "../lib/firebaseConfig";
import { getAuth, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";



const Register = () => {

    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [alert, setAlert] = useState({
        show: false,
        message: "",
        severity: "success",
    });
  
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!email || !password || !name || !lastname) {
          setAlert({
            show: true,
            message: "Todos los campos son obligatorios.",
            severity: "error",
          });
          return;
        }
    
        if (password.length < 6) {
          setAlert({
            show: true,
            message: "La contraseña debe tener al menos 6 caracteres.",
            severity: "error",
          });
          return;
        }
    
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password, name);
          const user = userCredential.user;
    
          await updateProfile(user, {
            displayName: `${name} ${lastname}`,
          });
          navigate("/login");
        } catch (error) {
          if (error.code === "auth/email-already-in-use") {
            setAlert({
              show: true,
              message: "El correo ya está en uso. Por favor, usa otro.",
              severity: "error",
            });
          } else {
            setAlert({
              show: true,
              message: "Error en el registro. Inténtalo de nuevo.",
              severity: "error",
            });
          }
        }
      };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
          navigate("/login")
        } catch (error) {
          console.error(error);
        }
      };
    
    return (
        <div className="h-screen w-screen flex justify-center items-center">
            {alert.show && (
                <Alert severity={alert.severity} variant="filled" className="absolute top-5 left-1/2 transform -translate-x-1/2 w-[300px] z-50" onClose={() => setAlert({ ...alert, show: false })}>
                    <AlertTitle>{alert.severity === "error" ? "Error" : "Éxito"}</AlertTitle>
                    {alert.message}
                </Alert>
            )}
            <div id="card" className="flex justify-center items-center rounded-[25px] w-[250px] h-[300px] md:w-[500px] md:h-[600px] " style={{backgroundImage: 'linear-gradient(163deg, #BEBEBE 0%, #BEBEBE 100%)',}}>
                <div id="card2" className="rounded-0 w-[500px] h-[600px] transition-all duration-200 hover:scale-[0.98] hover:rouded-[30px]">
                
                    <form onSubmit={handleRegister} className=" text-black flex flex-col gap-6 p-6 bg-[#e0e0e0] rounded-[25px] h-full w-full">
                        <img src={logo} alt="logo" className="h-[50px]" />
                        <p className="text-center text-[1.2em] -mt-5">Registro</p>

                        <div className="flex items-center gap-3 bg-[#252525] p-2 rounded-[15px]">
                            <svg className="h-[1.3em] w-[1.3em]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="#ffffff"></path>
                                <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="#ffffff"></path>
                            </svg>
                            <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-transparent border-none outline-none w-full text-[#d3d3d3]" type="text" placeholder="Nombres" autoComplete="off"/>
                        </div>
                        <div className="flex items-center gap-3 bg-[#252525] -mt-5 p-2 rounded-[15px]">
                            <svg className="h-[1.3em] w-[1.3em]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="#ffffff"></path>
                                <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="#ffffff"></path>
                            </svg>
                            <input id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} className="bg-transparent border-none outline-none w-full text-[#d3d3d3]" type="text" placeholder="Apellido" autoComplete="off" />
                        </div>

                        <div className="flex items-center gap-3 bg-[#252525] p-2 rounded-[15px]">
                            <svg className="h-[1.3em] w-[1.3em] fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"></path>
                            </svg>
                            <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent border-none outline-none w-full text-[#d3d3d3]" type="email" placeholder="Email" autoComplete="off" />
                        </div>
                        <div className="flex items-center gap-3 -mt-5 bg-[#252525] p-2 rounded-[15px]">
                            <svg className="h-[1.3em] w-[1.3em] fill-white" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
                            </svg>
                            <input id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-transparent border-none outline-none w-full text-[#d3d3d3]" type="password" placeholder="Password" autoComplete="off"/>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center gap-4">
                            <button type="submit" className="p-2 px-4 rounded-md bg-[#252525] text-white hover:bg-black ">
                            Registrarse
                            </button>
                            <button type="button" onClick={() => navigate("/", { state: { showDropdown: true } })} className="text-white flex items-center justify-center text-center w-[300px] p-2 rounded-md bg-[#252525] hover:bg-black">
                                ¿Ya tienes cuenta?
                            </button> 
                        </div>
                        <div className='flex justify-between items-center'>
                          <div className='h-1 w-[20%] border-0 bg-gradient-to-l from-[#252525] to-transparent'></div>
                          <p className='text-center text-black text-sm'>O inicia sesión con</p>
                          <div className='h-1 w-[20%] border-0 bg-gradient-to-r from-[#252525] to-transparent'></div>
                        </div>
                        <div className="flex justify-center">
                          <button onClick={handleGoogleLogin} id="btn-google" className="p-2 px-4 rounded-md bg-[#252525] text-white hover:bg-black">
                            <img src={googlelogo} className="w-[40px]" alt="Google login"/>
                          </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Register;