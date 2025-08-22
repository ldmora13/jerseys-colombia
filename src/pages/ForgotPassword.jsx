import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/football-jersey.svg";
import { supabase } from "../lib/supabaseClient"; // 👈 Asegúrate de tenerlo configurado

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  // Escucha los cambios de sesión
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setIsRecovery(true);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Enviar correo de reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:5173/forgot-password", // 👈 tu ruta
      });
      if (error) throw error;
      setMessage("Correo de recuperación enviado.");
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  // Actualizar contraseña después de redirección
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setMessage("Contraseña actualizada con éxito.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <div
        id="card"
        className="flex justify-center items-center rounded-[25px] w-[500px] h-[400px]"
        style={{
          backgroundImage:
            "linear-gradient(163deg, #C9FCD4 0%, #AFFCBE 100%)",
        }}
      >
        <div
          id="card2"
          className="rounded-0 w-[500px] h-[400px] transition-all duration-200 hover:scale-[0.98]"
        >
          {!isRecovery ? (
            <form
              onSubmit={handleResetPassword}
              className="flex flex-col gap-6 p-6 bg-[#A4CEAC] rounded-[25px] h-full w-full"
            >
              <img src={logo} alt="logo" className="h-[40px]" />
              <p className="text-center text-2xl -mt-5">Jerseys Colombia</p>
              <p id="heading" className="text-center text-[1.2em]">
                Reset de la contraseña
              </p>

              <div className="flex items-center gap-3 bg-[#252525] p-3 rounded-[15px]">
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-[#d3d3d3]"
                  type="email"
                  placeholder="Email"
                  autoComplete="off"
                />
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="flex items-center justify-center text-center w-[300px] p-2 rounded-md bg-[#252525] text-white hover:bg-[#AFFCBE] hover:text-black"
                >
                  Enviar correo de restablecimiento
                </button>
              </div>
              {message && <p className="mt-4 text-center">{message}</p>}
            </form>
          ) : (
            <form
              onSubmit={handleUpdatePassword}
              className="flex flex-col gap-6 p-6 bg-[#A4CEAC] rounded-[25px] h-full w-full"
            >
              <p className="text-center text-xl">Nueva contraseña</p>
              <input
                type="password"
                placeholder="Escribe tu nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-[#252525] text-white p-3 rounded-[15px]"
              />
              <button
                type="submit"
                className="flex items-center justify-center text-center w-[300px] p-2 rounded-md bg-[#252525] text-white hover:bg-[#AFFCBE] hover:text-black"
              >
                Actualizar contraseña
              </button>
              {message && <p className="mt-4 text-center">{message}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
