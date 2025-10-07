import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import { 
    User, 
    Mail, 
    Lock, 
    Eye, 
    EyeOff,
    ShoppingBag,
    CheckCircle,
    AlertCircle,
    Sparkles,
    Shield,
    Truck,
    CreditCard
} from "lucide-react";

const Register = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({
        show: false,
        message: "",
        severity: "success",
    });

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!email || !password || !name || !lastname) {
            setAlert({
                show: true,
                message: "Todos los campos son obligatorios.",
                severity: "error",
            });
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setAlert({
                show: true,
                message: "La contraseña debe tener al menos 6 caracteres.",
                severity: "error",
            });
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: `${name} ${lastname}`,
                    name: name,
                    lastname: lastname
                }
            }
        });

        setLoading(false);

        if (error) {
            if (error.message.includes("duplicate key value") || error.message.includes("already registered")) {
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
        } else {
            setAlert({
                show: true,
                message: "¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.",
                severity: "success",
            });
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        }
    };

    const handleGoogleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/login'
            }
        });

        if (error) {
            console.error(error);
            setAlert({
                show: true,
                message: "Error al conectar con Google. Inténtalo de nuevo.",
                severity: "error",
            });
        }
    };

    const benefits = [
        { icon: ShoppingBag, text: "Acceso exclusivo a ofertas" },
        { icon: Truck, text: "Envío gratis en 5+ productos" },
        { icon: Shield, text: "Compras 100% seguras" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 overflow-x-hidden w-full">
            
            {/* Alert */}
            {alert.show && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
                >
                    <div className={`backdrop-blur-xl rounded-2xl shadow-2xl border-2 p-4 ${
                        alert.severity === "error"
                            ? "bg-red-50/95 border-red-300"
                            : "bg-green-50/95 border-green-300"
                    }`}>
                        <div className="flex items-center gap-3">
                            {alert.severity === "error" ? (
                                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                            ) : (
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className={`font-bold text-sm ${
                                    alert.severity === "error" ? "text-red-800" : "text-green-800"
                                }`}>
                                    {alert.severity === "error" ? "Error" : "¡Éxito!"}
                                </p>
                                <p className={`text-sm ${
                                    alert.severity === "error" ? "text-red-700" : "text-green-700"
                                }`}>
                                    {alert.message}
                                </p>
                            </div>
                            <button
                                onClick={() => setAlert({ ...alert, show: false })}
                                className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-25">
                
                {/* Left Side - Branding */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden lg:flex flex-col justify-center p-8 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20"
                >
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                        <ShoppingBag className="w-10 h-10 text-white" />
                    </div>
                    
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Únete a Jerseys Colombia
                    </h1>
                    
                    <p className="text-xl text-gray-600 mb-8">
                        Descubre los mejores jerseys deportivos con calidad premium y personalización exclusiva
                    </p>

                    <div className="space-y-4">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200"
                            >
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <benefit.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-gray-800 font-semibold">{benefit.text}</span>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            <p className="font-bold text-purple-900">¡Oferta de Bienvenida!</p>
                        </div>
                        <p className="text-purple-700 text-sm">
                            10% de descuento en tu primera compra al registrarte hoy
                        </p>
                    </div>
                </motion.div>

                {/* Right Side - Form */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8 w-full"
                >
                    <div className="mb-6 md:mb-8">
                        <div className="lg:hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg mx-auto">
                            <ShoppingBag className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center lg:text-left">Crear Cuenta</h2>
                        <p className="text-gray-600 mt-2 text-center lg:text-left text-sm md:text-base">
                            Completa tus datos para comenzar
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4 md:space-y-5">
                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nombre *
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Tu nombre"
                                    required
                                    className="w-full h-12 md:h-14 pl-12 pr-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                                />
                            </div>
                        </div>

                        {/* Lastname Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Apellido *
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={lastname}
                                    onChange={(e) => setLastname(e.target.value)}
                                    placeholder="Tu apellido"
                                    required
                                    className="w-full h-12 md:h-14 pl-12 pr-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Correo Electrónico *
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    required
                                    className="w-full h-12 md:h-14 pl-12 pr-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Contraseña *
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    className="w-full h-12 md:h-14 pl-12 pr-12 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 md:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-sm md:text-base"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creando cuenta...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Crear Cuenta
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500 font-medium">
                                    O continúa con
                                </span>
                            </div>
                        </div>

                        {/* Google Button */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full h-12 md:h-14 bg-white border-2 border-gray-300 hover:border-blue-400 hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 text-sm md:text-base"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continuar con Google
                        </button>

                        {/* Login Link */}
                        <div className="text-center pt-4">
                            <p className="text-gray-600 text-sm md:text-base">
                                ¿Ya tienes cuenta?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/", { state: { showDropdown: true } })}
                                    className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
                                >
                                    Inicia Sesión
                                </button>
                            </p>
                        </div>
                    </form>

                    {/* Terms */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                        <p className="text-xs text-gray-600 text-center">
                            Al registrarte, aceptas nuestros{" "}
                            <button
                                onClick={() => navigate("/politicas")}
                                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                            >
                                Términos y Condiciones
                            </button>
                            {" "}y{" "}
                            <button
                                onClick={() => navigate("/politicas")}
                                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                            >
                                Política de Privacidad
                            </button>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;