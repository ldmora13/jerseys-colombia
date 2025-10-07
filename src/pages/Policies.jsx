import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO';
import { 
  Shield, 
  Cookie, 
  RefreshCw, 
  Truck, 
  CreditCard, 
  Users, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Eye,
  Lock,
  Globe,
  Calendar,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

const Policies= () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('privacidad');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const seoData = {
    title: 'Políticas y Términos - Jerseys Colombia',
    description: 'Conoce nuestras políticas de privacidad, términos de servicio, política de cookies y más información legal importante.',
    keywords: 'políticas, privacidad, términos, cookies, devoluciones, jerseys colombia',
    url: `${window.location.origin}/politicas`
  };

  const sections = [
    {
      id: 'privacidad',
      title: 'Política de Privacidad',
      icon: Shield,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'cookies',
      title: 'Política de Cookies',
      icon: Cookie,
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'devoluciones',
      title: 'Devoluciones y Reembolsos',
      icon: RefreshCw,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'envios',
      title: 'Envíos y Entregas',
      icon: Truck,
      color: 'from-purple-500 to-violet-600'
    },
    {
      id: 'pagos',
      title: 'Métodos de Pago',
      icon: CreditCard,
      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 'terminos',
      title: 'Términos de Servicio',
      icon: FileText,
      color: 'from-gray-600 to-gray-800'
    }
  ];

  const faqs = [
    {
      question: '¿Cómo protegen mis datos personales?',
      answer: 'Utilizamos encriptación SSL de 256 bits y cumplimos con estándares internacionales de protección de datos. Nunca compartimos información personal con terceros sin consentimiento.'
    },
    {
      question: '¿Puedo solicitar la eliminación de mis datos?',
      answer: 'Sí, tienes derecho a solicitar la eliminación completa de tus datos personales en cualquier momento contactándonos por email o WhatsApp.'
    },
    {
      question: '¿Qué pasa si mi producto llega defectuoso?',
      answer: 'Ofrecemos cambio gratuito en caso de defectos de fábrica. Solo contacta nuestro soporte dentro de 48 horas de recibido el producto.'
    },
    {
      question: '¿Cuánto tiempo tengo para devolver un producto?',
      answer: 'Tienes 15 días calendario desde la fecha de entrega para solicitar devoluciones, siempre que el producto esté en condiciones originales.'
    }
  ];

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderPrivacidad = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Política de Privacidad</h2>
            <p className="text-blue-600 font-medium">Última actualización: Enero 2025</p>
          </div>
        </div>

        <div className="prose max-w-none text-gray-700 space-y-6">
          <div className="bg-white/70 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <Eye className="w-6 h-6 text-blue-600" />
              Información que Recopilamos
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Datos de cuenta:</strong> Nombre, email, contraseña encriptada</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Información de envío:</strong> Dirección, teléfono, ciudad</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Historial de compras:</strong> Productos adquiridos, fechas, montos</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Datos de navegación:</strong> Cookies, preferencias, dispositivo usado</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/70 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-blue-600" />
              Cómo Protegemos tu Información
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Encriptación SSL</h4>
                <p className="text-green-700 text-sm">Todos los datos se transmiten con encriptación de 256 bits</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Servidores Seguros</h4>
                <p className="text-purple-700 text-sm">Infraestructura protegida con múltiples capas de seguridad</p>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">Acceso Limitado</h4>
                <p className="text-orange-700 text-sm">Solo personal autorizado puede acceder a datos sensibles</p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Auditorías Regulares</h4>
                <p className="text-blue-700 text-sm">Revisiones periódicas de seguridad y protección</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              Tus Derechos
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <span className="text-gray-700"><strong>Acceso:</strong> Solicitar copia de toda tu información personal</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <span className="text-gray-700"><strong>Rectificación:</strong> Corregir datos incorrectos o incompletos</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <span className="text-gray-700"><strong>Eliminación:</strong> Solicitar la eliminación completa de tus datos</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                <span className="text-gray-700"><strong>Portabilidad:</strong> Obtener tus datos en formato transferible</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCookies = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-8 border border-orange-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Cookie className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Política de Cookies</h2>
            <p className="text-orange-600 font-medium">Mejoramos tu experiencia</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/70 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4">¿Qué son las Cookies?</h3>
            <p className="text-gray-700 mb-4">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web. 
              Nos ayudan a mejorar tu experiencia de navegación y personalizar el contenido.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Cookies Esenciales</h4>
                <p className="text-blue-700 text-sm">Necesarias para el funcionamiento básico del sitio</p>
                <div className="mt-2 px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full inline-block">
                  Siempre Activas
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Cookies de Rendimiento</h4>
                <p className="text-green-700 text-sm">Analizar cómo usas el sitio para mejorarlo</p>
                <div className="mt-2 px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full inline-block">
                  Opcional
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Cookies de Marketing</h4>
                <p className="text-purple-700 text-sm">Personalizar anuncios y contenido relevante</p>
                <div className="mt-2 px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full inline-block">
                  Opcional
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Gestión de Cookies</h3>
            <p className="text-gray-700 mb-4">
              Puedes controlar y configurar las cookies según tus preferencias:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                <Globe className="w-6 h-6 text-gray-600" />
                <span className="text-gray-700">Configuración del navegador para bloquear cookies</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                <Eye className="w-6 h-6 text-gray-600" />
                <span className="text-gray-700">Panel de preferencias en nuestro sitio web</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                <Mail className="w-6 h-6 text-gray-600" />
                <span className="text-gray-700">Contacto directo para solicitar eliminación</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDevoluciones = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <RefreshCw className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Devoluciones y Reembolsos</h2>
            <p className="text-green-600 font-medium">Tu satisfacción es nuestra prioridad</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/70 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-green-600" />
              Plazos para Devoluciones
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
                <h4 className="text-lg font-semibold text-orange-800 mb-3">Producto Defectuoso</h4>
                <div className="space-y-2">
                  <p className="text-orange-700"><strong>Plazo:</strong> 48 horas</p>
                  <p className="text-orange-700"><strong>Condición:</strong> Evidencia fotográfica</p>
                  <p className="text-orange-700"><strong>Costo:</strong> Completamente gratis</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Proceso de Devolución</h3>
            <div className="space-y-4">
              {[
                { step: 1, title: "Contacta Soporte", desc: "Envía WhatsApp o email con tu número de orden", color: "blue" },
                { step: 2, title: "Evaluación", desc: "Revisamos tu solicitud en máximo 24 horas", color: "green" },
                { step: 3, title: "Autorización", desc: "Te enviamos la etiqueta de devolución gratuita", color: "purple" },
                { step: 4, title: "Envío", desc: "Empaca el producto y programa la recolección", color: "orange" },
                { step: 5, title: "Procesamiento", desc: "Recibimos y procesamos tu devolución", color: "red" },
                { step: 6, title: "Reembolso", desc: "Reembolso o cambio en 5-7 días hábiles", color: "indigo" }
              ].map((item, index) => (
                <div key={index} className={`flex items-center gap-4 p-4 bg-gradient-to-r from-${item.color}-50 to-${item.color}-100 rounded-xl border border-${item.color}-200`}>
                  <div className={`w-12 h-12 bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold">{item.step}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{item.title}</h4>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              Productos No Retornables
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Productos personalizados con nombre y número</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Artículos dañados por mal uso del cliente</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Productos con más de 15 días de entrega</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEnvios = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-3xl p-8 border border-purple-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Envíos y Entregas</h2>
            <p className="text-purple-600 font-medium">Llevamos tus jerseys favoritos hasta tu puerta</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/70 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Opciones de Envío</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 relative">
                <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  GRATIS
                </div>
                <h4 className="text-lg font-semibold text-green-800 mb-3">Envío Estándar</h4>
                <div className="space-y-2 text-green-700">
                  <p><strong>Tiempo:</strong> 25 - 30 días hábiles</p>
                  <p><strong>Costo:</strong> Gratis en 5+ productos</p>
                  <p><strong>Seguimiento:</strong> Incluido</p>
                  <p><strong>Cobertura:</strong> Todo Colombia</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Proceso de Entrega</h3>
            <div className="space-y-4">
              {[
                { icon: CheckCircle, title: "Procesamiento", desc: "Tu orden se procesa en 1-3 días hábiles", time: "1-3 días" },
                { icon: Truck, title: "Envío", desc: "El producto sale de nuestro almacén internacional", time: "Día 4" },
                { icon: Globe, title: "Tránsito", desc: "En camino hacia Colombia con seguimiento incluido", time: "15 - 20 días" },
                { icon: MapPin, title: "Entrega Final", desc: "Mensajería nacional hasta tu dirección", time: "5-8 días" }
              ].map((step, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{step.title}</h4>
                    <p className="text-gray-600 text-sm">{step.desc}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-purple-600 font-semibold text-sm">{step.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPagos = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-3xl p-8 border border-pink-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Métodos de Pago</h2>
            <p className="text-pink-600 font-medium">Paga de forma segura y conveniente</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/70 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Opciones de Pago Disponibles</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-green-600" />
                  Pasarelas de pago
                </h4>
                <div className="space-y-3">
                  {[
                    { name: 'PayPal', desc: 'Pago seguro internacional', color: 'from-blue-500 to-blue-600' },
                    { name: 'Bold', desc: 'Débito desde tu banco', color: 'from-red-500 to-red-600' },
                    { name: 'Bancolombia', desc: 'Transferencia directa', color: 'from-yellow-500 to-yellow-600' }
                  ].map((method, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <div className={`w-8 h-8 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center shadow-md`}>
                        <span className="text-white font-bold text-xs">{method.name.charAt(0)}</span>
                      </div>
                      <div>
                        <span className="text-gray-800 font-medium block">{method.name}</span>
                        <span className="text-gray-600 text-sm">{method.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-600" />
              Seguridad en Pagos
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 text-center">
                <Lock className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-green-800 mb-2">Encriptación SSL</h4>
                <p className="text-green-700 text-sm">Certificado de seguridad 256-bit</p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 text-center">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-blue-800 mb-2">PCI Compliant</h4>
                <p className="text-blue-700 text-sm">Estándares internacionales</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200 text-center">
                <Eye className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-purple-800 mb-2">Monitoreo 24/7</h4>
                <p className="text-purple-700 text-sm">Detección de fraude automática</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTerminos = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 border border-gray-300">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Términos de Servicio</h2>
            <p className="text-gray-600 font-medium">Condiciones de uso de la plataforma</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/70 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Uso Aceptable</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Permitido
                  </h4>
                  <ul className="space-y-2 text-green-700 text-sm">
                    <li>• Comprar productos para uso personal</li>
                    <li>• Crear una cuenta por persona</li>
                    <li>• Compartir productos en redes sociales</li>
                    <li>• Contactar soporte para dudas</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Prohibido
                  </h4>
                  <ul className="space-y-2 text-red-700 text-sm">
                    <li>• Revender productos sin autorización</li>
                    <li>• Crear múltiples cuentas</li>
                    <li>• Usar bots para compras automatizadas</li>
                    <li>• Compartir credenciales de acceso</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/70 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Responsabilidades</h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">Del Usuario</h4>
                <ul className="space-y-2 text-blue-700 text-sm">
                  <li>• Proporcionar información veraz y actualizada</li>
                  <li>• Mantener la confidencialidad de su cuenta</li>
                  <li>• Cumplir con las políticas de devoluciones</li>
                  <li>• Notificar cualquier uso no autorizado</li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-3">De Jerseys Colombia</h4>
                <ul className="space-y-2 text-purple-700 text-sm">
                  <li>• Entregar productos según especificaciones</li>
                  <li>• Mantener la seguridad de datos personales</li>
                  <li>• Procesar devoluciones según políticas</li>
                  <li>• Brindar soporte técnico y comercial</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <Info className="w-6 h-6 text-yellow-600" />
              Limitaciones de Responsabilidad
            </h3>
            <p className="text-gray-700 mb-4">
              Jerseys Colombia no se hace responsable por:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Demoras en aduanas o procesos de importación fuera de nuestro control</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Daños causados por uso inadecuado de los productos</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Pérdidas indirectas o consecuenciales</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Interrupciones temporales del servicio por mantenimiento</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeSection) {
      case 'privacidad': return renderPrivacidad();
      case 'cookies': return renderCookies();
      case 'devoluciones': return renderDevoluciones();
      case 'envios': return renderEnvios();
      case 'pagos': return renderPagos();
      case 'terminos': return renderTerminos();
      default: return renderPrivacidad();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <SEO {...seoData} />
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-500 rounded-full animate-bounce"></div>
          </div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Políticas y Términos
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-300">
                Tu confianza es nuestra prioridad. Conoce nuestras políticas transparentes.
              </p>
              <div className="flex justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-1 flex flex-wrap gap-1">
                  {sections.slice(0, 3).map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        activeSection === section.id 
                          ? 'bg-white text-gray-800 shadow-lg' 
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      <section.icon className="w-5 h-5" />
                      <span className="hidden md:block">{section.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="flex top-20 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-6">
            <div className="flex overflow-x-auto scrollbar-hide py-4 gap-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                    activeSection === section.id 
                      ? `bg-gradient-to-r ${section.color} text-white shadow-xl` 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span>{section.title}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div id={activeSection}>
              {renderContent()}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Preguntas Frecuentes</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Las dudas más comunes sobre nuestras políticas
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full flex justify-between items-center p-6 text-left font-semibold text-gray-800 hover:bg-white/50 transition-all duration-300"
                  >
                    <span className="text-lg">{faq.question}</span>
                    <div className={`transform transition-transform duration-300 ${expandedFaq === index ? 'rotate-180' : ''}`}>
                      {expandedFaq === index ? 
                        <ChevronUp className="w-6 h-6 text-blue-600" /> : 
                        <ChevronDown className="w-6 h-6 text-gray-400" />
                      }
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ${expandedFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-6 text-gray-700 leading-relaxed border-t border-gray-200 pt-4">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto text-white">
              <h2 className="text-4xl font-bold mb-6">¿Tienes más preguntas?</h2>
              <p className="text-xl mb-8 text-blue-100">
                Nuestro equipo está disponible para resolver cualquier duda adicional
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Mail className="w-8 h-8 mx-auto mb-4 text-blue-200" />
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-blue-200 text-sm">soporte@jerseyscol.com</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <Phone className="w-8 h-8 mx-auto mb-4 text-blue-200" />
                  <h3 className="font-semibold mb-2">WhatsApp</h3>
                  <p className="text-blue-200 text-sm">+57 322 415 6590</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <MapPin className="w-8 h-8 mx-auto mb-4 text-blue-200" />
                  <h3 className="font-semibold mb-2">Ubicación</h3>
                  <p className="text-blue-200 text-sm">Medellín, Antioquia</p>
                </div>
              </div>

              <button a
                onClick={() => navigate('/soporte')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-2xl font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl"
              >
                <Mail className="w-5 h-5" />
                Contactar Soporte
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Policies;