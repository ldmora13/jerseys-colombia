import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { 
    Mail, 
    Lock, 
    ArrowLeft, 
    CheckCircle, 
    AlertCircle, 
    Key,
    Shield,
    Loader2,
    Eye,
    EyeOff
} from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState({ text: "", type: "" });
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isRecovery, setIsRecovery] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    // Escucha los cambios de sesión
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === "PASSWORD_RECOVERY") {
                    setIsRecovery(true);
                    setMessage({ text: "", type: "" });
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Validación de contraseña
    const validatePassword = (password) => {
        if (password.length < 8) {
            return "La contraseña debe tener al menos 8 caracteres";
        }
        if (!/[A-Z]/.test(password)) {
            return "La contraseña debe contener al menos una mayúscula";
        }
        if (!/[a-z]/.test(password)) {
            return "La contraseña debe contener al menos una minúscula";
        }
        if (!/[0-9]/.test(password)) {
            return "La contraseña debe contener al menos un número";
        }
        return null;
    };

    // Enviar correo de reset
    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setMessage({ text: "Por favor ingresa tu correo electrónico", type: "error" });
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setMessage({ text: "Por favor ingresa un correo válido", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + "/forgot-password",
            });
            if (error) throw error;
            setMessage({ 
                text: "¡Correo enviado! Revisa tu bandeja de entrada para restablecer tu contraseña.", 
                type: "success" 
            });
            setEmail("");
        } catch (error) {
            setMessage({ text: error.message || "Error al enviar el correo", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    // Actualizar contraseña después de redirección
    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (!newPassword.trim() || !confirmPassword.trim()) {
            setMessage({ text: "Por favor completa todos los campos", type: "error" });
            return;
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setMessage({ text: passwordError, type: "error" });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ text: "Las contraseñas no coinciden", type: "error" });
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });
            if (error) throw error;
            
            setMessage({ text: "¡Contraseña actualizada con éxito!", type: "success" });
            setTimeout(() => navigate("/"), 2000);
        } catch (error) {
            setMessage({ text: error.message || "Error al actualizar la contraseña", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-20 w-32 h-32 bg-blue-300 rounded-full animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-300 rounded-full animate-bounce"></div>
                <div className="absolute top-1/2 left-10 w-24 h-24 bg-indigo-300 rounded-full animate-ping"></div>
            </div>

            <div className="relative w-full max-w-md mt-5">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/")}
                    className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver al inicio
                </button>

                {/* Main Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                    
                    {!isRecovery ? (
                        /* Request Password Reset Form */
                        <>
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                                        <Key className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold text-white text-center">
                                    ¿Olvidaste tu contraseña?
                                </h2>
                                <p className="text-blue-100 text-center mt-2">
                                    No te preocupes, te enviaremos instrucciones para restablecerla
                                </p>
                            </div>

                            <form onSubmit={handleResetPassword} className="p-8 space-y-6">
                                {/* Email Input */}
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="tu@email.com"
                                        className="w-full h-14 px-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                        autoComplete="email"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-5 h-5" />
                                            Enviar Instrucciones
                                        </>
                                    )}
                                </button>

                                {/* Message Alert */}
                                {message.text && (
                                    <div className={`p-4 rounded-2xl flex items-center gap-3 ${
                                        message.type === "success"
                                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                                            : "bg-gradient-to-r from-red-50 to-pink-50 border border-red-200"
                                    }`}>
                                        {message.type === "success" ? (
                                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                                        )}
                                        <p className={`text-sm ${
                                            message.type === "success" ? "text-green-800" : "text-red-800"
                                        }`}>
                                            {message.text}
                                        </p>
                                    </div>
                                )}

                                {/* Info Box */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
                                    <div className="flex gap-3">
                                        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-blue-800 font-semibold mb-1">
                                                Información importante
                                            </p>
                                            <ul className="text-xs text-blue-700 space-y-1">
                                                <li>• El enlace de recuperación expira en 1 hora</li>
                                                <li>• Revisa tu carpeta de spam si no lo ves</li>
                                                <li>• Solo funciona si el correo está registrado</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </>
                    ) : (
                        /* New Password Form */
                        <>
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                                        <Lock className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold text-white text-center">
                                    Nueva Contraseña
                                </h2>
                                <p className="text-green-100 text-center mt-2">
                                    Crea una contraseña segura para tu cuenta
                                </p>
                            </div>

                            <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
                                {/* New Password Input */}
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-green-600" />
                                        Nueva Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Mínimo 8 caracteres"
                                            className="w-full h-14 px-4 pr-12 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password Input */}
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-green-600" />
                                        Confirmar Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repite tu contraseña"
                                            className="w-full h-14 px-4 pr-12 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Requirements */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
                                    <p className="text-sm font-semibold text-blue-800 mb-2">
                                        Requisitos de la contraseña:
                                    </p>
                                    <ul className="text-xs text-blue-700 space-y-1">
                                        <li className={newPassword.length >= 8 ? "text-green-600 font-semibold" : ""}>
                                            • Al menos 8 caracteres
                                        </li>
                                        <li className={/[A-Z]/.test(newPassword) ? "text-green-600 font-semibold" : ""}>
                                            • Una letra mayúscula
                                        </li>
                                        <li className={/[a-z]/.test(newPassword) ? "text-green-600 font-semibold" : ""}>
                                            • Una letra minúscula
                                        </li>
                                        <li className={/[0-9]/.test(newPassword) ? "text-green-600 font-semibold" : ""}>
                                            • Un número
                                        </li>
                                    </ul>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Actualizando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Actualizar Contraseña
                                        </>
                                    )}
                                </button>

                                {/* Message Alert */}
                                {message.text && (
                                    <div className={`p-4 rounded-2xl flex items-center gap-3 ${
                                        message.type === "success"
                                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                                            : "bg-gradient-to-r from-red-50 to-pink-50 border border-red-200"
                                    }`}>
                                        {message.type === "success" ? (
                                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                                        )}
                                        <p className={`text-sm ${
                                            message.type === "success" ? "text-green-800" : "text-red-800"
                                        }`}>
                                            {message.text}
                                        </p>
                                    </div>
                                )}
                            </form>
                        </>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-gray-600 mt-6">
                    ¿Recordaste tu contraseña?{" "}
                    <button
                        onClick={() => navigate("/")}
                        className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                    >
                        Iniciar sesión
                    </button>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;