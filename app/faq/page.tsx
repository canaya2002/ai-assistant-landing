"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ChevronDown, ChevronUp, Home, HelpCircle, Shield, Download, Star, MessageCircle, ArrowRight, Bot, Lightbulb, Clock, Users, Code } from 'lucide-react';

const NuroFAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth > 768) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const categories = [
    { id: 'all', name: 'Todas las Preguntas', icon: HelpCircle, count: 25 },
    { id: 'general', name: 'General', icon: Bot, count: 8 },
    { id: 'installation', name: 'Instalación', icon: Download, count: 5 },
    { id: 'privacy', name: 'Privacidad', icon: Shield, count: 4 },
    { id: 'features', name: 'Funcionalidades', icon: Star, count: 6 },
    { id: 'technical', name: 'Soporte Técnico', icon: Code, count: 2 }
  ];

  const faqData = [
    // General
    {
      id: 1,
      category: 'general',
      question: '¿Qué es NURO?',
      answer: 'NURO es un asistente de inteligencia artificial avanzado que analiza tu pantalla en tiempo real y proporciona respuestas contextuales. Funciona completamente offline procesando todo localmente en tu dispositivo para garantizar máxima privacidad.'
    },
    {
      id: 2,
      category: 'general',
      question: '¿NURO es gratuito?',
      answer: 'Sí, NURO ofrece una versión gratuita con funcionalidades completas para uso personal. También tenemos planes profesionales para empresas que requieren funciones avanzadas y soporte prioritario.'
    },
    {
      id: 3,
      category: 'general',
      question: '¿En qué se diferencia NURO de otros asistentes de IA?',
      answer: 'NURO es único porque: 1) Procesa todo localmente - cero datos enviados a servidores, 2) Analiza visualmente tu pantalla para dar respuestas contextuales, 3) Funciona completamente offline, 4) Respuesta promedio de 50ms, 5) Privacidad garantizada al 100%.'
    },
    {
      id: 4,
      category: 'general',
      question: '¿Qué idiomas soporta NURO?',
      answer: 'Actualmente NURO soporta español, inglés, francés, alemán, italiano y portugués. Estamos trabajando en agregar más idiomas en futuras actualizaciones.'
    },
    {
      id: 5,
      category: 'general',
      question: '¿Puedo usar NURO para trabajo comercial?',
      answer: 'Absolutamente. NURO es perfecto para uso comercial y empresarial. Ofrecemos licencias comerciales con funciones avanzadas, soporte prioritario 24/7 y opciones de personalización para equipos.'
    },
    {
      id: 6,
      category: 'general',
      question: '¿NURO funciona con cualquier aplicación?',
      answer: 'Sí, NURO puede analizar cualquier contenido visible en tu pantalla, incluyendo navegadores web, documentos, aplicaciones de escritorio, videos, imágenes y más. Es completamente universal.'
    },
    {
      id: 7,
      category: 'general',
      question: '¿Hay límites en el uso gratuito?',
      answer: 'La versión gratuita permite hasta 100 consultas mensuales. Para uso ilimitado, considera nuestro plan profesional que también incluye funciones avanzadas y soporte prioritario.'
    },
    {
      id: 8,
      category: 'general',
      question: '¿Cómo puedo contactar soporte?',
      answer: 'Puedes contactarnos via email a support@nuro-technologies.com, a través del chat en vivo en nuestra web, o creando un ticket en nuestro portal de soporte. Respondemos en menos de 24 horas.'
    },

    // Installation
    {
      id: 9,
      category: 'installation',
      question: '¿Qué requisitos necesita mi computadora?',
      answer: 'NURO requiere: Windows 10 (1903+) o Windows 11, mínimo 4GB RAM (recomendado 8GB), 200MB de espacio libre, y procesador de 64 bits. No requiere conexión a internet para funcionar.'
    },
    {
      id: 10,
      category: 'installation',
      question: 'Windows Defender bloquea la instalación, ¿es seguro?',
      answer: 'Es completamente normal. Windows muestra esta advertencia porque NURO no tiene firma digital costosa. La aplicación es 100% segura. Simplemente haz clic en "More info" y luego "Run anyway" para continuar.'
    },
    {
      id: 11,
      category: 'installation',
      question: '¿Puedo instalar NURO en múltiples dispositivos?',
      answer: 'Sí, puedes instalar NURO en todos tus dispositivos personales. Para uso empresarial con múltiples licencias, contáctanos para obtener un descuento por volumen.'
    },
    {
      id: 12,
      category: 'installation',
      question: '¿Cómo actualizo NURO?',
      answer: 'NURO se actualiza automáticamente en segundo plano. También puedes verificar actualizaciones manualmente desde la configuración o descargando la última versión desde nuestra web.'
    },
    {
      id: 13,
      category: 'installation',
      question: '¿Cómo desinstalo NURO?',
      answer: 'Ve a Configuración > Apps > NURO > Desinstalar, o usa el Panel de Control de Windows. Todos los datos locales se eliminarán completamente, pero puedes exportar tu configuración antes de desinstalar.'
    },

    // Privacy
    {
      id: 14,
      category: 'privacy',
      question: '¿NURO envía mis datos a servidores?',
      answer: 'No, nunca. NURO procesa todo localmente en tu dispositivo. Cero capturas de pantalla, cero datos personales, cero transmisiones a servidores externos. Tu privacidad es nuestra máxima prioridad.'
    },
    {
      id: 15,
      category: 'privacy',
      question: '¿Qué datos almacena NURO localmente?',
      answer: 'NURO solo guarda: tus preferencias de configuración, historial local de consultas (opcional), y datos de rendimiento anónimos. Todo está cifrado con AES-256 y solo tú tienes acceso.'
    },
    {
      id: 16,
      category: 'privacy',
      question: '¿Puedo usar NURO offline completamente?',
      answer: 'Sí, NURO funciona 100% offline. Solo necesita internet para descargar actualizaciones opcionales. Todos los modelos de IA están instalados localmente en tu dispositivo.'
    },
    {
      id: 17,
      category: 'privacy',
      question: '¿NURO cumple con GDPR?',
      answer: 'Absolutamente. Como NURO procesa todo localmente y no envía datos a servidores, cumple automáticamente con GDPR, CCPA y todas las regulaciones de privacidad internacionales.'
    },

    // Features
    {
      id: 18,
      category: 'features',
      question: '¿Qué tan rápido responde NURO?',
      answer: 'NURO tiene un tiempo de respuesta promedio de 50 milisegundos. Al procesar todo localmente con IA optimizada, es significativamente más rápido que asistentes basados en la nube.'
    },
    {
      id: 19,
      category: 'features',
      question: '¿NURO puede leer texto en imágenes?',
      answer: 'Sí, NURO incluye OCR avanzado que puede leer y comprender texto en imágenes, PDFs, capturas de pantalla, videos, y cualquier contenido visual con precisión del 99.5%.'
    },
    {
      id: 20,
      category: 'features',
      question: '¿Puedo personalizar las respuestas de NURO?',
      answer: 'Sí, NURO aprende de tus preferencias y se adapta a tu estilo. Puedes configurar el tono de respuestas, idioma preferido, nivel de detalle, y crear comandos personalizados.'
    },
    {
      id: 21,
      category: 'features',
      question: '¿NURO funciona con múltiples monitores?',
      answer: 'Sí, NURO funciona perfectamente con configuraciones de múltiples monitores. Puede analizar contenido en cualquier pantalla y proporcionar respuestas contextualmente apropiadas.'
    },
    {
      id: 22,
      category: 'features',
      question: '¿Hay atajos de teclado?',
      answer: 'Sí, NURO incluye atajos personalizables. Por defecto: Ctrl+Shift+N activa NURO, Ctrl+Shift+H muestra historial, Ctrl+Shift+S abre configuración. Puedes cambiar todos los atajos.'
    },
    {
      id: 23,
      category: 'features',
      question: '¿NURO puede ayudar con código de programación?',
      answer: 'Absolutamente. NURO puede analizar, explicar, optimizar y debuggear código en más de 50 lenguajes de programación. También puede sugerir mejores prácticas y detectar errores.'
    },

    // Technical
    {
      id: 24,
      category: 'technical',
      question: 'NURO usa mucha CPU/RAM, ¿es normal?',
      answer: 'NURO está optimizado para usar mínimos recursos. Normalmente usa 2-4% CPU y 200-400MB RAM. Si experimentas uso alto, verifica que tienes la última versión o contacta soporte.'
    },
    {
      id: 25,
      category: 'technical',
      question: '¿NURO funciona con software antivirus?',
      answer: 'Sí, NURO es compatible con todos los antivirus principales. Algunos pueden mostrar alertas la primera vez (falsos positivos). Simplemente agrega NURO a las excepciones de tu antivirus.'
    }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <>
      <head>
        <title>Preguntas Frecuentes - NURO | FAQ y Soporte</title>
        <meta name="description" content="Encuentra respuestas a las preguntas más frecuentes sobre NURO. Instalación, privacidad, funcionalidades y soporte técnico." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://nuro-ai.com/faq" />
      </head>

      <div className="min-h-screen bg-white text-gray-900 relative overflow-hidden">
        
        {/* Animated Background */}
        <div className="hidden md:block fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-ping"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/6 w-3 h-3 bg-cyan-300 rounded-full opacity-30 animate-bounce"></div>
          
          <div 
            className="absolute w-96 h-96 rounded-full opacity-3 pointer-events-none transition-all duration-1000 ease-out"
            style={{
              left: mousePosition.x - 192,
              top: mousePosition.y - 192,
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.05) 50%, transparent 70%)',
            }}
          ></div>
        </div>

        {/* Header */}
        <nav className="relative z-20 container mx-auto px-4 sm:px-6 py-4 backdrop-blur-md bg-white/80 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative">
                <Image src="/images/nurologo.png" alt="NURO" width={48} height={48} className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-lg" />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-md"></div>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-gray-900">FAQ</div>
                <div className="text-xs sm:text-sm text-gray-500">Preguntas Frecuentes</div>
              </div>
            </div>
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
              <Home className="w-4 h-4" />
              <span className="font-medium">Volver al Inicio</span>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 bg-gradient-to-br from-cyan-50 to-blue-50 py-12 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-block bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full px-4 sm:px-6 py-2 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs sm:text-sm font-semibold text-cyan-800">SOPORTE Y AYUDA</span>
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                ¿Tienes
                <span className="block bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Preguntas?
                </span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed mb-8 sm:mb-12">
                Encuentra respuestas instantáneas a las preguntas más frecuentes sobre NURO. 
                Si no encuentras lo que buscas, contáctanos directamente.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto mb-8">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar preguntas frecuentes..."
                  className="block w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base shadow-lg"
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
                  <HelpCircle className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                  <div className="font-bold text-lg text-gray-900">25+</div>
                  <div className="text-xs text-gray-600">Preguntas</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
                  <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="font-bold text-lg text-gray-900">24h</div>
                  <div className="text-xs text-gray-600">Respuesta</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
                  <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="font-bold text-lg text-gray-900">1000+</div>
                  <div className="text-xs text-gray-600">Usuarios</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
                  <MessageCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <div className="font-bold text-lg text-gray-900">Chat</div>
                  <div className="text-xs text-gray-600">En Vivo</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            
            {/* Categories */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Categorías</h2>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <category.icon className="w-4 h-4" />
                    <span>{category.name}</span>
                    <span className="text-xs opacity-75">({category.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ List */}
            <div className="space-y-4 sm:space-y-6">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron resultados</h3>
                  <p className="text-gray-600">Intenta con otros términos de búsqueda o selecciona una categoría diferente.</p>
                </div>
              ) : (
                filteredFAQs.map((faq) => (
                  <div key={faq.id} className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-6 sm:px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-2xl sm:rounded-3xl"
                    >
                      <div className="flex-1 pr-4">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-relaxed">
                          {faq.question}
                        </h3>
                      </div>
                      {openFAQ === faq.id ? (
                        <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    
                    {openFAQ === faq.id && (
                      <div className="px-6 sm:px-8 pb-6 border-t border-gray-100">
                        <div className="pt-4">
                          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Contact Section */}
            <div className="mt-16 sm:mt-20">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl sm:rounded-3xl border border-gray-200 p-6 sm:p-8 text-center">
                <div className="max-w-3xl mx-auto">
                  <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-4 sm:mb-6" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                    ¿No encuentras tu respuesta?
                  </h2>
                  <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                    Nuestro equipo de soporte está aquí para ayudarte. Contáctanos y te responderemos 
                    en menos de 24 horas.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <a
                      href="mailto:support@nuro-technologies.com"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base flex items-center space-x-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Enviar Email</span>
                    </a>
                    <a
                      href="#chat"
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base flex items-center space-x-2"
                    >
                      <span>Chat en Vivo</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Resources */}
            <div className="mt-16 sm:mt-20">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">
                Recursos Populares
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Download className="w-8 h-8 text-emerald-600 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Guía de Instalación</h3>
                  <p className="text-gray-600 mb-4 text-sm">Instrucciones paso a paso para instalar NURO en tu sistema.</p>
                  <Link href="/docs" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center space-x-1">
                    <span>Leer Guía</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Shield className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Política de Privacidad</h3>
                  <p className="text-gray-600 mb-4 text-sm">Conoce cómo protegemos tu información y garantizamos tu privacidad.</p>
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1">
                    <span>Leer Política</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Lightbulb className="w-8 h-8 text-yellow-600 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Tips y Trucos</h3>
                  <p className="text-gray-600 mb-4 text-sm">Descubre funciones avanzadas y maximiza tu productividad con NURO.</p>
                  <Link href="/docs" className="text-yellow-600 hover:text-yellow-700 font-medium text-sm flex items-center space-x-1">
                    <span>Ver Tips</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 sm:py-16 border-t border-gray-200 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Image src="/images/nurologo.png" alt="NURO" width={48} height={48} className="w-10 h-10 sm:w-12 sm:h-12" />
                <div>
                  <div className="text-base sm:text-lg font-bold text-gray-900">NURO Technologies</div>
                  <div className="text-xs sm:text-sm text-gray-500">Preguntas Frecuentes</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-8">
                <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1 text-sm">
                  <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Inicio</span>
                </Link>
                <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Documentación
                </Link>
                <Link href="/changelog" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Changelog
                </Link>
                <div className="text-gray-500 text-xs sm:text-sm">
                  © 2025 NURO Technologies.
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default NuroFAQPage;