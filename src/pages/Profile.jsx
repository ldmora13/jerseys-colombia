import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save } from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({
        name: '',
        phone: '',
        address: {
            address: '',
            city: '',
            postalCode: ''
        }
    });
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate('/login');
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
                    name: customerProfile.name || '',
                    phone: customerProfile.phone || '',
                    address: customerProfile.address || { address: '', city: '', postalCode: '' }
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
        setLoading(true);
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

        } catch (error) {
            setFeedback({ message: `Error al actualizar: ${error.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !user) {
        return <div className="flex items-center justify-center min-h-screen">Cargando perfil...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8 pt-24 max-w-2xl">
                <h1 className="text-4xl font-bold mb-8 text-center">Mi Perfil</h1>
                <form onSubmit={handleProfileUpdate} className="bg-gradient-to-br from-blue-100 to-indigo-200 p-8 rounded-lg shadow-md space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" value={user?.email || ''} disabled
                            className="mt-1 block w-full p-2 border border-blue-50 rounded-md bg-blue-50 cursor-not-allowed" />
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                        <input type="text" id="name" name="name" value={profile.name} onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border border-blue-50 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                     <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <input type="tel" id="phone" name="phone" value={profile.phone} onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border border-blue-50 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    
                    <div className="pt-4 border-t">
                        <h2 className="text-lg font-semibold mb-2">Dirección de Envío</h2>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección</label>
                            <input type="text" id="address" name="address" value={profile.address.address} onChange={handleAddressChange}
                                className="mt-1 block w-full p-2 border border-blue-50 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ciudad</label>
                                <input type="text" id="city" name="city" value={profile.address.city} onChange={handleAddressChange}
                                    className="mt-1 block w-full p-2 border border-blue-50 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Código Postal</label>
                                <input type="text" id="postalCode" name="postalCode" value={profile.address.postalCode} onChange={handleAddressChange}
                                    className="mt-1 block w-full p-2 border border-blue-50 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                         </div>
                    </div>

                    <div className="flex justify-end">
                        <button onClick={()=> navigate('/')} className='group relative w-full h-10 flex items-center justify-center bg-black hover:text-black text-white font-bold gap-2 cursor-pointer shadow-md overflow-hidden transition-all duration-300 active:translate-x-1 active:translate-y-1 before:content-[""] before:absolute before:w-full before:h-[130px] before:top-0 before:left-[-100%] before:bg-white before:transition-all before:duration-300 before:mix-blend-difference hover:before:transform hover:before:translate-x-full hover:before:-translate-y-1/2 hover:before:rounded-none'>
                            <span className='relative z-10 flex flex-row items-center gap-2'>
                                {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                    Guardar cambios
                            </span>
                        </button>
                    </div>
                </form>
                {feedback.message && (
                    <div className={`mt-4 text-center p-3 rounded-lg ${feedback.type === 'success' ? 'bg-white text-black' : 'bg-white text-red-800'}`}>
                        {feedback.message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;