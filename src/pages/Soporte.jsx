import React, { useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import {supabase} from '../lib/supabaseClient'


const Soporte = () => {

    const [pending, setPending] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });

   const handleSubmit = async (e) => {
        e.preventDefault();
        setPending(true);
        setFeedback({ message: '', type: '' });

        const formData = new FormData(e.target);
        const email = formData.get('email');
        const message = formData.get('message');

        try {
            const { error } = await supabase
                .from('support_tickets')
                .insert({ email, message });

            if (error) {
                throw error;
            }

            setFeedback({ message: '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.', type: 'success' });
            e.target.reset(); 
        } catch (error) {
            setFeedback({ message: `Hubo un error al enviar tu mensaje: ${error.message}`, type: 'error' });
        } finally {
            setPending(false);
        }
    };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <h1 className="text-6xl font-normal mb-16 text-center text-black">Soporte</h1>
            <form onSubmit={handleSubmit} className="space-y-12 text-black">
            <div className="space-y-4">
                <label htmlFor="email" className="block text-xl text-gray-800">
                    Correo electrónico
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Ingrese su email"
                    required
                    className="w-full bg-white rounded-xl p-4 text-xl border-0 focus:ring-1 focus:ring-gray-400 placeholder:text-gray-600"
                />
            </div>

            <div className="space-y-4">
                <label htmlFor="message" className="block text-xl text-gray-800">
                    ¿En que le podemos ayudar?
                </label>
                <textarea
                id="message"
                name="message"
                placeholder="Ingrese su mensaje"
                required
                rows={6}
                className="w-full bg-white rounded-xl p-4 text-xl border-0 focus:ring-1 focus:ring-gray-400 placeholder:text-gray-600 resize-none"
                />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <button
                    type="submit"
                    className="bg-white hover:bg-gray-100 cursor-pointer text-black px-8 py-4 rounded-full text-xl font-medium inline-flex items-center justify-center gap-2 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:hover:bg-gray-200 min-w-[180px] h-[60px] w-full sm:w-auto"
                    >
                    {pending ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            <span>Enviar mensaje</span>
                            <ArrowRight className="w-6 h-6" />
                        </>
                    )}
                </button>
            </div>
        </form>
        {feedback.message && (
            <div className={`mt-6 text-center p-4 rounded-lg ${feedback.type === 'success' ? 'bg-white text-black' : 'bg-white text-red-500'}`}>
                {feedback.message}
            </div>
        )}
      </div>
    </div>
  )
}

export default Soporte