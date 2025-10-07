import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { 
    Mail, 
    MessageSquare, 
    Send, 
    Phone,
    MapPin,
    Clock,
    Headphones,
    CheckCircle,
    AlertCircle,
    User,
    Loader2,
    ChevronDown,
    HelpCircle,
    Shield,
    Truck,
    CreditCard,
    Package
} from 'lucide-react';

const Soporte = () => {
    const navigate = useNavigate();
    const [pending, setPending] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        subject: '',
        message: ''
    });
    const [activeCategory, setActiveCategory] = useState('general');
    const [expandedFaq, setExpandedFaq] = useState(null);

    const categories = [
        { id: 'general', label: 'General', icon: HelpCircle },
        { id: 'orders', label: 'Pedidos', icon: Package },
        { id: 'shipping', label: 'Envíos', icon: Truck },
        { id: 'payments', label: 'Pagos', icon: CreditCard }
    ];

    const faqs = {
        general: [
            {
                question: '¿Cómo puedo crear una cuenta?',
                answer: 'Puedes crear una cuenta haciendo clic en el botón de "Iniciar Sesión" en la parte superior. También puedes usar tu cuenta de Google para registrarte rápidamente.'
            },
            {
                question: '¿Los productos son originales?',
                answer: 'Sí, todos nuestros jerseys son de calidad Fan Premium con licencia oficial. Incluyen logos bordados y materiales de alta calidad.'
            },
            {
                question: '¿Puedo personalizar mi jersey?',
                answer: 'Sí, para jerseys de fútbol puedes agregar nombre y número por $5 USD adicionales. La personalización se hace con tecnología de termoestampado de alta calidad.'
            }
        ],
        orders: [
            {
                question: '¿Cómo puedo rastrear mi pedido?',
                answer: 'Una vez que tu pedido sea enviado, recibirás un email con el número de rastreo. También puedes ver el estado en la sección "Mis Compras" de tu cuenta.'
            },
            {
                question: '¿Puedo cancelar mi pedido?',
                answer: 'Puedes cancelar tu pedido dentro de las primeras 24 horas después de realizarlo. Contacta a nuestro equipo de soporte lo antes posible.'
            },
            {
                question: '¿Qué hago si mi pedido llega dañado?',
                answer: 'Si tu pedido llega con algún defecto o daño, contáctanos dentro de 48 horas con fotos del problema. Te enviaremos un reemplazo sin costo adicional.'
            }
        ],
        shipping: [
            {
                question: '¿Cuánto tarda el envío?',
                answer: 'El tiempo de envío estándar es de 25 - 30 días hábiles a las principales ciudades del país'
            },
            {
                question: '¿El envío es gratis?',
                answer: 'Sí, el envío es gratis en pedidos de 5 o más productos a toda Colombia. Para menos productos, el costo de envío se calcula en el checkout.'
            },
            {
                question: '¿Envían a mi ciudad?',
                answer: 'Enviamos a todo Colombia. El tiempo de entrega puede variar según tu ubicación, pero llegamos a todas las ciudades y municipios del país.'
            }
        ],
        payments: [
            {
                question: '¿Qué métodos de pago aceptan?',
                answer: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard, AmEx), PayPal, PSE, Nequi y Bancolombia'
            },
            {
                question: '¿Es seguro pagar en línea?',
                answer: 'Sí, todos nuestros pagos están protegidos con encriptación SSL de 256 bits. No almacenamos información de tarjetas y cumplimos con estándares PCI.'
            },
            {
                question: '¿Puedo pagar en cuotas?',
                answer: 'Sí, si pagas con tarjeta de crédito, puedes diferir el pago en cuotas según las opciones que te ofrezca tu banco emisor.'
            }
        ]
    };

    const contactMethods = [
        {
            icon: Mail,
            title: 'Email',
            value: 'soporte@jerseyscol.com',
            description: 'Respuesta en 24 horas',
            color: 'from-blue-500 to-indigo-600'
        },
        {
            icon: Phone,
            title: 'WhatsApp',
            value: '+57 3224156590',
            description: 'Lun a Vie, 9am - 6pm',
            color: 'from-green-500 to-emerald-600'
        },
        {
            icon: MapPin,
            title: 'Ubicación',
            value: 'Medellín, Antioquia',
            description: 'Colombia',
            color: 'from-purple-500 to-violet-600'
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPending(true);
        setFeedback({ message: '', type: '' });

        if (!formData.email || !formData.name || !formData.message) {
            setFeedback({ 
                message: 'Por favor completa todos los campos requeridos.', 
                type: 'error' 
            });
            setPending(false);
            return;
        }

        try {
            const { error } = await supabase
                .from('support_tickets')
                .insert({ 
                    email: formData.email,
                    name: formData.name,
                    subject: formData.subject || 'Consulta general',
                    message: formData.message,
                    category: activeCategory
                });

            if (error) throw error;

            setFeedback({ 
                message: '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.', 
                type: 'success' 
            });
            setFormData({ email: '', name: '', subject: '', message: '' });
            
            setTimeout(() => {
                setFeedback({ message: '', type: '' });
            }, 5000);

        } catch (error) {
            setFeedback({ 
                message: `Hubo un error al enviar tu mensaje: ${error.message}`, 
                type: 'error' 
            });
        } finally {
            setPending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-x-hidden w-full">
            
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 pt-24 pb-16 mt-20 w-full">
                <div className="container mx-auto px-4 max-w-7xl w-full">
                    <motion.div 
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                            <Headphones className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Centro de Soporte</h1>
                        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto px-4">
                            ¿Necesitas ayuda? Estamos aquí para ti. Encuentra respuestas rápidas o contáctanos directamente.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 md:py-12 max-w-7xl w-full">
                
                {/* Contact Methods */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12 -mt-12 md:-mt-24 w-full">
                    {contactMethods.map((method, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 hover:shadow-3xl transition-all duration-300 group w-full"
                        >
                            <div className={`w-14 h-14 bg-gradient-to-r ${method.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                <method.icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{method.title}</h3>
                            <p className="text-gray-600 font-medium mb-1 break-words">{method.value}</p>
                            <p className="text-sm text-gray-500">{method.description}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 w-full">
                    
                    {/* FAQ Section */}
                    <div className="lg:col-span-3 w-full">
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden w-full">
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                                    <HelpCircle className="w-6 h-6 md:w-7 md:h-7" />
                                    Preguntas Frecuentes
                                </h2>
                                <p className="text-green-100 mt-1 text-sm md:text-base">Encuentra respuestas rápidas aquí</p>
                            </div>

                            {/* Category Tabs */}
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 w-full overflow-x-auto">
                                <div className="flex gap-2 pb-2 min-w-max">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 text-sm md:text-base ${
                                                activeCategory === cat.id
                                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <cat.icon className="w-4 h-4" />
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* FAQ List */}
                            <div className="p-4 md:p-6 space-y-3 w-full">
                                {faqs[activeCategory]?.map((faq, index) => (
                                    <div 
                                        key={index}
                                        className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200 hover:border-green-300 transition-all duration-300 w-full"
                                    >
                                        <button
                                            onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                            className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-800 hover:bg-white/50 transition-colors duration-200"
                                        >
                                            <span className="pr-4 text-sm md:text-base">{faq.question}</span>
                                            <ChevronDown className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-transform duration-300 ${
                                                expandedFaq === index ? 'rotate-180' : ''
                                            }`} />
                                        </button>
                                        <div className={`overflow-hidden transition-all duration-300 ${
                                            expandedFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}>
                                            <div className="px-4 pb-4 text-gray-700 leading-relaxed bg-white border-t border-gray-200">
                                                <p className="pt-4 text-sm md:text-base">{faq.answer}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2 w-full">
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden lg:sticky lg:top-24 w-full">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                                    <MessageSquare className="w-6 h-6 md:w-7 md:h-7" />
                                    Contáctanos
                                </h2>
                                <p className="text-blue-100 mt-1 text-sm md:text-base">Te responderemos pronto</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5 w-full">
                                {/* Name Input */}
                                <div className="w-full">
                                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4 text-blue-600" />
                                        Nombre completo *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Tu nombre"
                                        required
                                        className="w-full h-12 px-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                                    />
                                </div>

                                {/* Email Input */}
                                <div className="w-full">
                                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                        Correo electrónico *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="tu@email.com"
                                        required
                                        className="w-full h-12 px-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                                    />
                                </div>

                                {/* Subject Input */}
                                <div className="w-full">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Asunto (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        placeholder="¿Sobre qué quieres consultar?"
                                        className="w-full h-12 px-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm md:text-base"
                                    />
                                </div>

                                {/* Message Textarea */}
                                <div className="w-full">
                                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-blue-600" />
                                        Mensaje *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        placeholder="Cuéntanos cómo podemos ayudarte..."
                                        required
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none text-sm md:text-base"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={pending}
                                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
                                >
                                    {pending ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Enviar Mensaje
                                        </>
                                    )}
                                </button>

                                {/* Feedback Message */}
                                {feedback.message && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 rounded-2xl flex items-center gap-3 w-full ${
                                            feedback.type === 'success'
                                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                                                : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'
                                        }`}
                                    >
                                        {feedback.type === 'success' ? (
                                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                                        )}
                                        <p className={`text-sm ${
                                            feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                            {feedback.message}
                                        </p>
                                    </motion.div>
                                )}

                                {/* Info Box */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200 w-full">
                                    <div className="flex gap-3">
                                        <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-blue-800 font-semibold mb-1">
                                                Tiempo de respuesta
                                            </p>
                                            <p className="text-xs text-blue-700">
                                                Respondemos en menos de 24 horas hábiles
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Additional Help Section */}
                <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-200">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-1">¿Necesitas más ayuda?</h3>
                                <p className="text-gray-600">Revisa nuestras políticas y guías completas</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/politicas')}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                        >
                            Ver Políticas
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Soporte;