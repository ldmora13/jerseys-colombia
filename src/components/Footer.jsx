import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Phone, MapPin,  Heart, Shield, Truck, Award, ChevronRight } from 'lucide-react'

const Footer = () => {
    const navigate = useNavigate()

    const footerLinks = {
        productos: [
            { name: 'Jerseys de Fútbol', path: '/futbol' },
            { name: 'Jerseys NBA', path: '/nba' },
            { name: 'Fórmula 1', path: '/f1' },
        ],
        empresa: [
            { name: 'Sobre Nosotros', path: '/about' },
            { name: 'Contacto', path: '/soporte' },
        ],
        soporte: [
            { name: 'Guía de Tallas', path: '/tallas' },
            { name: 'Envíos y Devoluciones', path: '/politicas' },
            { name: 'Soporte Técnico', path: '/soporte' }
        ],
        legal: [
            { name: 'Políticas de Privacidad', path: '/politicas' },
            { name: 'Términos y Condiciones', path: '/politicas' },
            { name: 'Garantías', path: '/politicas' }
        ]
    }

    const features = [
        {
            icon: Shield,
            title: "Calidad Premium",
            description: "Materiales de primera calidad"
        },
        {
            icon: Truck,
            title: "Envío Gratis",
            description: "En pedidos de 5+ productos"
        },
        {
            icon: Award,
            title: "Personalización",
            description: "Agrega tu nombre favorito"
        },
        {
            icon: Heart,
            title: "Satisfacción",
            description: "100% garantizada"
        }
    ]

    const contactInfo = [
        {
            icon: Phone,
            title: "WhatsApp",
            info: "+57 3207707997",
            action: () => window.open("https://wa.me/+573207707997", "_blank")
        },
        {
            icon: MapPin,
            title: "Ubicación",
            info: "Medellín, Antioquia, Colombia",
            action: () => {}
        }
      
    ]

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 right-10 w-24 h-24 bg-indigo-500 rounded-full animate-ping"></div>
        </div>

        {/* Top Divider */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>

        {/* Features Section */}
        <div className="relative z-10 border-b border-gray-700/50">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div key={index} className="group text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                <feature.icon className="w-8 h-8 text-white" />
                            </div>
                            <h4 className="text-lg font-semibold mb-2 text-white">{feature.title}</h4>
                            <p className="text-gray-400 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Main Footer Content */}
        <div className="relative z-10 container mx-auto px-6 py-16">
            <div className="grid lg:grid-cols-5 md:grid-cols-3 gap-12">
                
                {/* Brand Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                            <span className="text-2xl">⚽</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Jerseys Colombia
                            </h3>
                            <p className="text-gray-400 text-sm">Pasión por el deporte</p>
                        </div>
                    </div>
                    
                    <p className="text-gray-300 leading-relaxed">
                        La experiencia definitiva en jerseys deportivos oficiales. Calidad premium, diseños exclusivos y envío a toda Colombia.
                    </p>
                </div>

                {/* Products Links */}
                <div className="space-y-6">
                    <h4 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
                        Productos
                    </h4>
                    <ul className="space-y-3">
                        {footerLinks.productos.map((link, index) => (
                            <li key={index}>
                                <a
                                    onClick={() => navigate(link.path)}
                                    className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer group transition-all duration-300"
                                >
                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Company Links */}
                <div className="space-y-6">
                    <h4 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-gradient-to-b from-green-500 to-blue-600 rounded-full"></span>
                        Empresa
                    </h4>
                    <ul className="space-y-3">
                        {footerLinks.empresa.map((link, index) => (
                            <li key={index}>
                                <a
                                    onClick={() => navigate(link.path)}
                                    className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer group transition-all duration-300"
                                >
                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Support Links */}
                <div className="space-y-6">
                    <h4 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></span>
                        Soporte
                    </h4>
                    <ul className="space-y-3">
                        {footerLinks.soporte.map((link, index) => (
                            <li key={index}>
                                <a
                                    onClick={() => navigate(link.path)}
                                    className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer group transition-all duration-300"
                                >
                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact Section */}
                <div className="space-y-6">
                    <h4 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></span>
                        Contacto
                    </h4>
                    <div className="space-y-4">
                        {contactInfo.map((contact, index) => (
                            <div key={index} className="group cursor-pointer" onClick={contact.action}>
                                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        <contact.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">{contact.title}</p>
                                        <p className="text-white font-medium">{contact.info}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        
        {/* Legal Links Section */}
        <div className="relative z-10 border-t border-gray-700/50">
          <div className='group cursor-pointer items-center justify-center flex mt-4 '>
            <div className='flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300'>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-5 h-5 text-white" />
              </div>
              <div onClick={() => window.location.href = "mailto:soporte@jerseyscol.com"}>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Email</p>
                  <p className="text-white font-medium">soporte@jerseyscol.com</p>
              </div>
            </div> 
          </div>
            <div className="container mx-auto px-6 py-8">
                <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
                    {footerLinks.legal.map((link, index) => (
                        <React.Fragment key={index}>
                            <a
                                onClick={() => navigate(link.path)}
                                className="text-gray-400 hover:text-white cursor-pointer transition-colors duration-300 text-sm font-medium"
                            >
                                {link.name}
                            </a>
                            {index < footerLinks.legal.length - 1 && (
                                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
        {/* Bottom Bar */}
        <div className="relative z-10 bg-black/30 backdrop-blur-sm">
            <div className="container mx-auto px-6 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            © 2025 Jerseys Colombia. Todos los derechos reservados.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-gray-400 text-sm">
                            Hecho con <Heart className="inline w-4 h-4 text-red-500 animate-pulse" /> en Colombia
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Gradient Bottom */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
    </footer>
  )
}

export default Footer