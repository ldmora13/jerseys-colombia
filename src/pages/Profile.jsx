import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

import { useWishlist } from '../context/WishlistContext';
import { 
    Loader2, 
    Save, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Lock,
    ShoppingBag,
    Heart,
    Settings,
    LogOut,
    CheckCircle,
    AlertCircle,
    Edit3,
    X,
    Camera,
    Shield
} from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const { wishlistItems, setWishlistItems, setWishlistVisible } = useWishlist();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('info');
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        phone: '',
        address: {
            address: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'Colombia'
        }
    });
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    

    const tabs = [
        { id: 'info', label: 'Información Personal', icon: User },
        { id: 'orders', label: 'Mis Pedidos', icon: ShoppingBag },
        { id: 'wishlist', label: 'Lista de Deseos', icon: Heart },
        { id: 'security', label: 'Seguridad', icon: Shield }
    ];

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate('/');
                return;
            }
            setUser(user);

            const { data: customerProfile, error } = await supabase
                .from('customers')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Error al cargar el perfil:", error);
                setFeedback({ message: 'No se pudo cargar tu perfil.', type: 'error' });
            }

            if (customerProfile) {
                setProfile({
                    name: customerProfile.name || user.user_metadata?.full_name || '',
                    phone: customerProfile.phone || '',
                    address: customerProfile.address || { 
                        address: '', 
                        city: '', 
                        state: '',
                        postalCode: '',
                        country: 'Colombia'
                    }
                });
            }
            setLoading(false);
        };

        fetchProfile();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [name]: value
            }
        }));
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFeedback({ message: '', type: '' });

        try {
            const { data: { user: updatedUser }, error: userError } = await supabase.auth.updateUser({
                data: { full_name: profile.name }
            });
            if (userError) throw userError;

            const { error: profileError } = await supabase
                .from('customers')
                .upsert({
                    id: user.id,
                    name: profile.name,
                    phone: profile.phone,
                    address: profile.address
                }, { onConflict: 'id' });
            
            if (profileError) throw profileError;

            setFeedback({ message: '¡Perfil actualizado con éxito!', type: 'success' });
            setUser(updatedUser);
            setIsEditing(false);

            setTimeout(() => {
                setFeedback({ message: '', type: '' });
            }, 3000);

        } catch (error) {
            setFeedback({ message: `Error al actualizar: ${error.message}`, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    if (loading && !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                <p className="text-xl text-gray-700 font-semibold">Cargando perfil...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl mt-20">
                
                {/* Header with User Info */}
                <div className="mb-8">
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 h-32 relative">
                            <div className="absolute -bottom-16 left-8">
                                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full border-8 border-white shadow-2xl flex items-center justify-center">
                                    <User className="w-16 h-16 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="pt-20 pb-8 px-8">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                        {profile.name || 'Usuario'}
                                    </h1>
                                    <p className="text-gray-600 flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        {user?.email}
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="mt-4 md:mt-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="mb-8">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-2 flex overflow-x-auto gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feedback Alert */}
                {feedback.message && (
                    <div className={`mb-6 p-4 rounded-2xl shadow-lg flex items-center gap-3 animate-fade-in ${
                        feedback.type === 'success' 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
                            : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'
                    }`}>
                        {feedback.type === 'success' ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        )}
                        <p className={`font-medium ${
                            feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
                        }`}>
                            {feedback.message}
                        </p>
                        <button
                            onClick={() => setFeedback({ message: '', type: '' })}
                            className="ml-auto"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                )}

                {/* Tab Content */}
                <div className="space-y-6">
                    {activeTab === 'info' && (
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">Información Personal</h2>
                                            <p className="text-blue-100">Actualiza tus datos personales</p>
                                        </div>
                                    </div>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all duration-300"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            Editar
                                        </button>
                                    )}
                                </div>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="p-8">
                                <div className="space-y-6">
                                    {/* Email (Read Only) */}
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-blue-600" />
                                            Correo Electrónico
                                        </label>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full h-14 px-4 rounded-2xl bg-gray-100 border-2 border-gray-200 text-gray-600 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-600" />
                                            Nombre Completo
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={profile.name}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="Ej: Juan Pérez"
                                            className={`w-full h-14 px-4 rounded-2xl border-2 transition-all duration-300 ${
                                                isEditing
                                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                    : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                            }`}
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-blue-600" />
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profile.phone}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="+57 300 123 4567"
                                            className={`w-full h-14 px-4 rounded-2xl border-2 transition-all duration-300 ${
                                                isEditing
                                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                    : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                            }`}
                                        />
                                    </div>

                                    {/* Address Section */}
                                    <div className="pt-6 border-t border-gray-200">
                                        <div className="flex items-center gap-2 mb-6">
                                            <MapPin className="w-5 h-5 text-purple-600" />
                                            <h3 className="text-xl font-bold text-gray-800">Dirección de Envío</h3>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Full Address */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Dirección Completa
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={profile.address.address}
                                                    onChange={handleAddressChange}
                                                    disabled={!isEditing}
                                                    placeholder="Calle 123 #45-67, Apto 101"
                                                    className={`w-full h-14 px-4 rounded-2xl border-2 transition-all duration-300 ${
                                                        isEditing
                                                            ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500'
                                                            : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                                    }`}
                                                />
                                            </div>

                                            {/* City and State */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Ciudad / Municipio
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={profile.address.city}
                                                        onChange={handleAddressChange}
                                                        disabled={!isEditing}
                                                        placeholder="Medellín"
                                                        className={`w-full h-14 px-4 rounded-2xl border-2 transition-all duration-300 ${
                                                            isEditing
                                                                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500'
                                                                : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                                        }`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Departamento
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        value={profile.address.state}
                                                        onChange={handleAddressChange}
                                                        disabled={!isEditing}
                                                        placeholder="Antioquia"
                                                        className={`w-full h-14 px-4 rounded-2xl border-2 transition-all duration-300 ${
                                                            isEditing
                                                                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500'
                                                                : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                                        }`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Postal Code and Country */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Código Postal
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="postalCode"
                                                        value={profile.address.postalCode}
                                                        onChange={handleAddressChange}
                                                        disabled={!isEditing}
                                                        placeholder="050001"
                                                        className={`w-full h-14 px-4 rounded-2xl border-2 transition-all duration-300 ${
                                                            isEditing
                                                                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500'
                                                                : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                                        }`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        País
                                                    </label>
                                                    <select
                                                        name="country"
                                                        value={profile.address.country}
                                                        onChange={handleAddressChange}
                                                        disabled={!isEditing}
                                                        className={`w-full h-14 px-4 rounded-2xl border-2 transition-all duration-300 ${
                                                            isEditing
                                                                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500'
                                                                : 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <option value="Colombia">Colombia</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {isEditing && (
                                        <div className="flex gap-4 pt-6">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="flex-1 h-14 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-2xl transition-all duration-300"
                                            >
                                                <X className="w-5 h-5" />
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="flex-1 h-14 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                {saving ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Guardando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-5 h-5" />
                                                        Guardar Cambios
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                            <div className="text-center py-16">
                                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Historial de Pedidos</h3>
                                <p className="text-gray-600">Aquí aparecerán tus pedidos realizados</p>
                                <button
                                    onClick={() => navigate('/compras')}
                                    className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                                >
                                    Explorar Productos
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'wishlist' && (
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                            <div className="text-center py-16">
                                <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Lista de Deseos</h3>
                                <p className="text-gray-600">Guarda tus productos favoritos para más tarde</p>
                                <button
                                    onClick={() => setWishlistVisible(true)}
                                    className="mt-6 px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-semibold hover:from-pink-600 hover:to-rose-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                                >
                                    Descubrir Jerseys
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Seguridad</h2>
                                        <p className="text-green-100">Gestiona la seguridad de tu cuenta</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                                    <div className="flex items-center gap-4 mb-4">
                                        <Lock className="w-8 h-8 text-blue-600" />
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">Cambiar Contraseña</h3>
                                            <p className="text-sm text-gray-600">Actualiza tu contraseña regularmente</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/forgot-password')}
                                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                                    >
                                        Restablecer Contraseña
                                    </button>
                                </div>

                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                                    <div className="flex items-center gap-4">
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">Cuenta Verificada</h3>
                                            <p className="text-sm text-gray-600">Tu email está verificado y tu cuenta es segura</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;