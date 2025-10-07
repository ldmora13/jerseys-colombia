import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { 
    Heart, 
    Users, 
    Globe, 
    Package,
    Award,
    Truck,
    Shield,
    Target,
    Sparkles,
    TrendingUp,
    CheckCircle,
    Star,
    Mail,
    Phone
} from 'lucide-react';

const About = () => {
    const navigate = useNavigate();

    const seoData = {
        title: 'Sobre Nosotros - Jerseys Colombia',
        description: 'Conoce la historia de Jerseys Colombia, tu tienda de confianza para jerseys deportivos de fútbol, NBA y F1. Calidad premium, envío gratis y pasión por el deporte.',
        keywords: 'sobre nosotros, jerseys colombia, historia, equipo, misión, visión',
        url: `${window.location.origin}/about`
    };

    const stats = [
        { number: "5000+", label: "Clientes Felices", icon: Users },
        { number: "2000+", label: "Productos Únicos", icon: Package },
        { number: "15", label: "Países Alcanzados", icon: Globe },
        { number: "4.9/5", label: "Rating Promedio", icon: Star }
    ];

    const values = [
        {
            icon: Shield,
            title: "Calidad Garantizada",
            description: "Todos nuestros productos son de calidad Fan/Player Premium con materiales de primera.",
            color: "from-blue-500 to-indigo-600"
        },
        {
            icon: Heart,
            title: "Pasión por el Deporte",
            description: "Somos fanáticos del deporte. Entendemos lo que significa llevar los colores de tu equipo favorito.",
            color: "from-red-500 to-pink-600"
        },
        {
            icon: Truck,
            title: "Envío Confiable",
            description: "Envío gratis en pedidos de 5+ productos y seguimiento en tiempo real para que estés tranquilo.",
            color: "from-green-500 to-emerald-600"
        },
        {
            icon: Award,
            title: "Satisfacción Total",
            description: "Tu satisfacción es nuestra prioridad. Garantizamos calidad o te devolvemos tu dinero.",
            color: "from-purple-500 to-violet-600"
        }
    ];

    const timeline = [
        {
            year: "2025",
            title: "El Comienzo",
            description: "Nace Jerseys Colombia con la visión de ofrecer jerseys deportivos de calidad a precios accesibles para todos los fanáticos colombianos."
        },
        {
            year: "2025",
            title: "Expansión de Catálogo",
            description: "Incorporamos jerseys de NBA y Fórmula 1, convirtiéndonos en la tienda más completa de Colombia en deportes."
        },
        {
            year: "2026",
            title: "Visión Global",
            description: "Expandimos nuestras operaciones con envíos internacionales y nuevas alianzas con proveedores premium."
        }
    ];

    const team = [
        {
            name: "Luis David Mora",
            role: "Fundador & CEO",
            description: "Apasionado de los deportes con más de 5 años de experiencia en el desarrollo web, e-commerce y atención al usuario",
            gradient: "from-blue-500 to-indigo-600"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <SEO {...seoData} />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 pt-24 pb-20 mt-20">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full animate-bounce"></div>
                    <div className="absolute top-1/2 left-10 w-24 h-24 bg-white rounded-full animate-ping"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div 
                        className="text-center max-w-4xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                            <Heart className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Sobre Nosotros</h1>
                        <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
                            Somos más que una tienda de jerseys. Somos una comunidad de fanáticos apasionados 
                            que viven y respiran el deporte cada día.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="container mx-auto px-4 -mt-16 relative z-20 mb-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 text-center hover:scale-105 transition-transform duration-300"
                        >
                            <stat.icon className="w-10 h-10 mx-auto mb-4 text-blue-600" />
                            <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                            <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Story Section */}
            <section className="container mx-auto px-4 mb-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">Nuestra Historia</h2>
                        </div>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p>
                                Jerseys Colombia nació en 2025 de la pasión de un grupo de amigos fanáticos del deporte 
                                que no encontraban jerseys de calidad a precios justos en Colombia.
                            </p>
                            <p>
                                Comenzamos con una pequeña selección de jerseys de fútbol, pero rápidamente nos dimos 
                                cuenta de que había una demanda enorme de productos deportivos auténticos en el país.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">Nuestra Misión</h2>
                        </div>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p>
                                Democratizar el acceso a jerseys deportivos de calidad premium en Colombia y 
                                Latinoamérica, permitiendo que cada fanático pueda llevar los colores de su 
                                equipo o ídolo favorito con orgullo.
                            </p>
                            <p>
                                Nos comprometemos a ofrecer productos auténticos, precios justos, envío confiable 
                                y un servicio al cliente excepcional que supere las expectativas.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="container mx-auto px-4 mb-20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestros Valores</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Los principios que guían cada decisión que tomamos
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {values.map((value, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 hover:scale-105 transition-all duration-300"
                        >
                            <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg`}>
                                <value.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{value.title}</h3>
                            <p className="text-gray-600 text-center leading-relaxed">{value.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Timeline Section */}
            <section className="container mx-auto px-4 mb-20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestro Recorrido</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        La evolución de Jerseys Colombia a través de los años
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    {timeline.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            className="relative mb-12 last:mb-0"
                        >
                            <div className="flex items-start gap-6">
                                <div className="flex-shrink-0">
                                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                                        <span className="text-white font-bold text-lg">{item.year}</span>
                                    </div>
                                </div>
                                <div className="flex-1 bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                    <p className="text-gray-700 leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                            {index < timeline.length - 1 && (
                                <div className="absolute left-10 top-20 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 to-indigo-600 -z-10"></div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Team Section */}
            <section className="container mx-auto px-4 mb-20 max-w-lg">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestro Equipo</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Las personas apasionadas detrás de Jerseys Colombia
                    </p>
                </div>

                <div className="grid items-center justify-center">
                    {team.map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden hover:scale-105 transition-all duration-300"
                        >
                            <div className={`h-32 bg-gradient-to-r ${member.gradient}`}></div>
                            <div className="p-8 text-center">
                                <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto -mt-16 mb-4 border-4 border-white shadow-lg flex items-center justify-center">
                                    <Users className="w-12 h-12 text-gray-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                                <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
                                <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Quality Types Section */}
            <section className="container mx-auto px-4 mb-20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Dos niveles de calidad</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Elige entre calidad Fan o Player según tus necesidades y presupuesto
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Fan Quality */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden hover:scale-105 transition-all duration-300"
                    >
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Star className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Calidad FAN</h3>
                            <p className="text-blue-100">Para verdaderos fanáticos</p>
                        </div>
                        <div className="p-8">
                            <div className="text-center mb-6">
                                <span className="text-4xl font-bold text-blue-600">Desde $20</span>
                                <span className="text-gray-600 ml-2">USD</span>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    "100% Poliéster premium",
                                    "Logos y escudos bordados",
                                    "Tecnología Dri-FIT",
                                    "Corte ergonómico",
                                    "Resistente al lavado",
                                    "Ideal para uso diario"
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* Player Quality */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-yellow-400 overflow-hidden hover:scale-105 transition-all duration-300 relative"
                    >
                        <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold z-10">
                            PREMIUM
                        </div>
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-6 text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Calidad PLAYER</h3>
                            <p className="text-yellow-100">Versión profesional</p>
                        </div>
                        <div className="p-8">
                            <div className="text-center mb-6">
                                <span className="text-4xl font-bold text-orange-600">Desde $25</span>
                                <span className="text-gray-600 ml-2">USD</span>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    "Logos y escudos grabados",
                                    "Misma tela que usan jugadores",
                                    "Tecnología de ventilación",
                                    "Fit ajustado profesional",
                                    "Máxima durabilidad",
                                    "Detalles premium exclusivos"
                                ].map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </div>

                {/* Comparison Note */}
                <div className="mt-8 max-w-3xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                    <p className="text-center text-gray-700 leading-relaxed">
                        <strong className="text-blue-600">💡 Consejo:</strong> La calidad <strong>Player</strong> tiene logos y números 
                        <strong className="text-orange-600"> grabados con tecnología de termoimpresión</strong>, mientras que la calidad 
                        <strong className="text-blue-600"> Fan</strong> tiene logos <strong>bordados</strong>. Ambas son de excelente calidad, 
                        pero Player ofrece la experiencia más cercana a lo que usan los profesionales miestras que Fan provee mayor durabilidad.
                    </p>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="container mx-auto px-4 mb-20">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border border-green-200">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                            <TrendingUp className="w-8 h-8 text-green-600" />
                            ¿Por Qué Elegirnos?
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            "Calidad Fan y Player disponible",
                            "Envío gratis en 5+ productos",
                            "Personalización disponible",
                            "Atención al cliente 24/7",
                            "Garantía de satisfacción",
                            "Pagos 100% seguros"
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-md">
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                <span className="text-gray-700 font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 mb-20">
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-center shadow-2xl">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        ¿Listo para unirte a nuestra comunidad?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Miles de fanáticos ya confían en nosotros. Descubre por qué somos la mejor opción 
                        para tus jerseys deportivos.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={() => navigate('/futbol')}
                            className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl"
                        >
                            Explorar Productos
                        </button>
                        <button 
                            onClick={() => navigate('/soporte')}
                            className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-bold hover:bg-white/30 transform hover:scale-105 transition-all duration-300 border-2 border-white/50"
                        >
                            Contáctanos
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;