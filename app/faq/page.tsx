"use client";
import React, { useState, useEffect } from 'react';
import { HelpCircle, Home, Search, ChevronDown, ChevronUp, Shield, Download, Zap, Eye, MessageSquare, Settings, CreditCard, Users, Globe, Lock, AlertTriangle, CheckCircle, Info, Star } from 'lucide-react';

const NuroFAQPage = () => {
  const [openItems, setOpenItems] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedCategory, setSelectedCategory] = useState('todas');

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.innerWidth > 768) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const categories = [
    { id: 'todas', name: 'Todas', icon: HelpCircle, count: 0 },
    { id: 'instalacion', name: 'Instalación', icon: Download, count: 0 },
    { id: 'funciones', name: 'Funciones', icon: Zap, count: 0 },
    { id: 'privacidad', name: 'Privacidad', icon: Shield, count: 0 },
    { id: 'precios', name: 'Precios', icon: CreditCard, count: 0 },
    { id: 'soporte', name: 'Soporte', icon: Users, count: 0 }
  ];

  const faqData = [
    // Instalación
    {
      category: 'instalacion',
      question: '¿Por qué Windows dice que NURO es peligroso?',
      answer: 'Windows Defender muestra esta advertencia porque NURO no está firmado digitalmente con un certificado de Microsoft (que cuesta $300+ anuales). Esto es común en software independiente. NURO es completamente seguro y no contiene virus ni malware. Para instalarlo, haz clic en "More info" y luego "Run anyway".',
      popular: true
    },
    {
      category: 'instalacion',
      question: '¿Qué requisitos del sistema necesito?',
      answer: 'Windows 10 (versión 1903+) o Windows 11, 4GB RAM mínimo (8GB recomendado), 200MB de espacio libre, y conexión a internet solo para actualizaciones opcionales. NURO funciona completamente offline una vez instalado.'
    },
    {
      category: 'instalacion',
      question: '¿NURO funciona en Mac o Linux?',
      answer: 'Actualmente NURO está disponible solo para Windows. Estamos desarrollando versiones para Mac y Linux que estarán disponibles en 2025. Únete a nuestra lista de correo para recibir notificaciones cuando estén listas.'
    },
    {
      category: 'instalacion',
      question: '¿Puedo instalar NURO en múltiples computadoras?',
      answer: 'Sí, puedes instalar NURO en todos tus dispositivos Windows con la misma licencia. No hay límite en el número de instalaciones para uso personal.'
    },

    // Funciones
    {
      category: 'funciones',
      question: '¿Cómo funciona el análisis de pantalla?',
      answer: 'NURO utiliza tecnología de visión computacional avanzada (OCR + AI) para "leer" todo el contenido visible en tu pantalla. Identifica texto, imágenes, botones, formularios y estructura, luego procesa esta información localmente con modelos de IA para generar respuestas contextuales.',
      popular: true
    },
    {
      category: 'funciones',
      question: '¿Qué puedo preguntar a NURO?',
      answer: 'Puedes preguntar sobre cualquier cosa visible en tu pantalla: "¿Qué dice este documento?", "Resume esta página web", "¿Cómo completo este formulario?", "Explica este gráfico", "¿Hay errores en este código?". NURO comprende contexto y puede ayudar con tareas complejas.'
    },
    {
      category: 'funciones',
      question: '¿Cuál es la diferencia entre plan gratuito y profesional?',
      answer: 'Plan gratuito: 10 análisis/mes, IA básica, soporte comunitario. Plan profesional ($19/mes): 500 análisis/mes, IA avanzada, soporte prioritario 24/7, acceso beta, integraciones API.'
    },
    {
      category: 'funciones',
      question: '¿NURO puede automatizar tareas?',
      answer: 'Sí, NURO puede crear macros inteligentes y automatizar tareas repetitivas. Por ejemplo: completar formularios automáticamente, navegar sitios web, procesar documentos en lote, y crear workflows personalizados.'
    },

    // Privacidad
    {
      category: 'privacidad',
      question: '¿Mis datos se envían a servidores externos?',
      answer: '¡NO! NURO procesa TODO localmente en tu dispositivo. Ni capturas de pantalla, ni texto, ni conversaciones se envían a internet. Los modelos de IA están instalados en tu computadora. Tu privacidad está 100% garantizada.',
      popular: true
    },
    {
      category: 'privacidad',
      question: '¿Qué datos recopila NURO?',
      answer: 'Solo estadísticas anónimas de uso (como "análisis completados: 15") para mejorar el producto. NUNCA recopilamos contenido personal, capturas de pantalla, conversaciones, o datos identificables. Puedes desactivar incluso estas estadísticas.'
    },
    {
      category: 'privacidad',
      question: '¿NURO guarda mi historial de conversaciones?',
      answer: 'El historial se guarda localmente en tu dispositivo (cifrado con AES-256) para mejorar la experiencia. Puedes configurar el tiempo de retención o desactivar el historial completamente en Configuración → Privacidad.'
    },
    {
      category: 'privacidad',
      question: '¿Puedo usar NURO para información confidencial?',
      answer: 'Sí, NURO es seguro para información confidencial porque todo se procesa localmente. Es ideal para documentos legales, financieros, médicos, o cualquier información sensible. Muchas empresas usan NURO para análisis de datos confidenciales.'
    },

    // Precios
    {
      category: 'precios',
      question: '¿El plan gratuito tiene limitaciones de tiempo?',
      answer: 'No, el plan gratuito es permanente. Puedes usar 10 análisis cada mes indefinidamente. Solo se limita la cantidad de análisis, no el tiempo de uso ni las funciones básicas.',
      popular: true
    },
    {
      category: 'precios',
      question: '¿Puedo cambiar o cancelar mi suscripción?',
      answer: 'Sí, puedes actualizar, bajar de plan o cancelar en cualquier momento desde Configuración → Suscripción. No hay contratos ni penalizaciones. Si cancelas, mantienes acceso profesional hasta el final del período pagado.'
    },
    {
      category: 'precios',
      question: '¿Hay descuentos para estudiantes o equipos?',
      answer: 'Sí: 50% descuento para estudiantes con email .edu. Descuentos por volumen para equipos de 5+ usuarios. Precios especiales para ONG y organizaciones educativas. Contacta support@nuro-technologies.com para más detalles.'
    },
    {
      category: 'precios',
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos todas las tarjetas de crédito/débito principales (Visa, MasterCard, American Express), PayPal, y transferencias bancarias para cuentas empresariales. El pago es seguro y procesado por Stripe.'
    },

    // Soporte
    {
      category: 'soporte',
      question: '¿Cómo obtengo soporte técnico?',
      answer: 'Plan gratuito: Documentación, FAQ y foros comunitarios. Plan profesional: Soporte prioritario 24/7 por email (respuesta <1 hora), chat en vivo, y llamadas de soporte para problemas críticos.',
      popular: true
    },
    {
      category: 'soporte',
      question: '¿Con qué frecuencia se actualiza NURO?',
      answer: 'Actualizaciones de seguridad: semanales. Nuevas funciones: mensualmente. Actualizaciones mayores: trimestralmente. Los usuarios profesionales reciben acceso beta a nuevas funciones 2-4 semanas antes.'
    },
    {
      category: 'soporte',
      question: '¿NURO funciona con otras aplicaciones?',
      answer: 'NURO es compatible con todas las aplicaciones Windows: Office, browsers, Adobe, editores de código, CRM, ERP, etc. Para usuarios profesionales, ofrecemos integraciones API con Slack, Notion, Zapier y más.'
    },
    {
      category: 'soporte',
      question: '¿Qué hago si NURO es lento o no responde?',
      answer: 'Verifica: 1) Suficiente RAM disponible (>2GB libre), 2) Nivel de análisis no en "Avanzado", 3) Otros programas no consumiendo CPU. En Configuración → Rendimiento puedes optimizar NURO para tu sistema específico.'
    }
  ];

  // Count FAQs per category
  categories.forEach(cat => {
    if (cat.id === 'todas') {
      cat.count = faqData.length;
    } else {
      cat.count = faqData.filter(item => item.category === cat.id).length;
    }
  });

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'todas' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularFAQ = faqData.filter(item => item.popular);

  return (
    <>
      <head>
        <title>Preguntas Frecuentes - NURO | Respuestas y Soporte</title>
        <meta name="description" content="Encuentra respuestas a las preguntas más frecuentes sobre NURO. Aprende sobre instalación, funciones, privacidad, precios y soporte técnico." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://nuro-ai.com/faq" />
      </head>

      <div className="min-h-screen bg-white text-gray-900 relative">
        
        {/* Animated Background - Hidden on mobile */}
        <div className="hidden md:block fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-ping"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full opacity-20 animate-pulse"></div>
          
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
                <img src="/images/nurologo.png" alt="NURO" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-lg" />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-md"></div>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-gray-900">Preguntas Frecuentes</div>
                <div className="text-xs sm:text-sm text-gray-500">Encuentra respuestas rápidas</div>
              </div>
            </div>
            <a href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
              <Home className="w-4 h-4" />
              <span className="font-medium">Volver al Inicio</span>
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 bg-gradient-to-br from-purple-50 to-pink-50 py-12 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-4 sm:px-6 py-2 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  <span className="text-xs sm:text-sm font-semibold text-purple-800">CENTRO DE AYUDA</span>
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                ¿Necesitas
                <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Ayuda?
                </span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed mb-8 sm:mb-12">
                Encuentra respuestas rápidas a las preguntas más comunes sobre NURO. 
                Si no encuentras lo que buscas, nuestro equipo está listo para ayudarte.
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
                  className="block w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base shadow-lg"
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
                  <HelpCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="font-bold text-lg text-gray-900">{faqData.length}</div>
                  <div className="text-xs text-gray-600">Preguntas</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <div className="font-bold text-lg text-gray-900">{popularFAQ.length}</div>
                  <div className="text-xs text-gray-600">Populares</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
                  <Users className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <div className="font-bold text-lg text-gray-900">24/7</div>
                  <div className="text-xs text-gray-600">Soporte Pro</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
                  <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="font-bold text-lg text-gray-900">98%</div>
                  <div className="text-xs text-gray-600">Resueltos</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            
            {/* Popular Questions */}
            {!searchQuery && selectedCategory === 'todas' && (
              <div className="mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
                  Preguntas Populares
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {popularFAQ.map((item, index) => (
                    <div key={`popular-${index}`} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start space-x-3">
                        <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">{item.question}</h3>
                          <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{item.answer.substring(0, 120)}...</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filters */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Categorías</h2>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <category.icon className="w-4 h-4" />
                    <span>{category.name}</span>
                    <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{category.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ List */}
            <div className="space-y-4 sm:space-y-6">
              {filteredFAQ.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-8 sm:p-12">
                    <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No encontramos resultados</h3>
                    <p className="text-gray-600 mb-6">
                      Intenta con otros términos de búsqueda o contacta nuestro soporte.
                    </p>
                    <button
                      onClick={() => {setSearchQuery(''); setSelectedCategory('todas');}}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                      Ver todas las preguntas
                    </button>
                  </div>
                </div>
              ) : (
                filteredFAQ.map((item, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                    <button
                      onClick={() => toggleItem(index)}
                      className="w-full text-left p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 rounded-xl sm:rounded-2xl transition-colors"
                    >
                      <div className="flex items-start space-x-3 sm:space-x-4 pr-4">
                        {item.popular && (
                          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 mt-1 flex-shrink-0" />
                        )}
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug">{item.question}</h3>
                      </div>
                      {openItems.has(index) ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    
                    {openItems.has(index) && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <div className={`pl-0 ${item.popular ? 'sm:pl-9' : 'sm:pl-0'}`}>
                          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                            <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Contact Support */}
            <div className="mt-16 sm:mt-20">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl sm:rounded-3xl border border-blue-200 p-6 sm:p-8 text-center">
                <div className="max-w-2xl mx-auto">
                  <Users className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-4 sm:mb-6" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                    ¿No encontraste tu respuesta?
                  </h2>
                  <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                    Nuestro equipo de soporte está listo para ayudarte con cualquier pregunta 
                    que tengas sobre NURO.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                      <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 mx-auto mb-3" />
                      <h3 className="font-bold text-gray-900 mb-2">Plan Gratuito</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-4">Soporte por comunidad y documentación</p>
                      <a href="/docs" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Ver Documentación →
                      </a>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 sm:p-6 rounded-xl border border-blue-200">
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-bold text-gray-900 mb-2">Plan Profesional</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-4">Soporte prioritario 24/7 por email y chat</p>
                      <a href="mailto:support@nuro-technologies.com" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Contactar Soporte →
                      </a>
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Respuesta típica: &lt;2 horas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span>Soporte en español</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-purple-500" />
                      <span>Equipo certificado</span>
                    </div>
                  </div>
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
                <img src="/images/nurologo.png" alt="NURO" className="w-10 h-10 sm:w-12 sm:h-12" />
                <div>
                  <div className="text-base sm:text-lg font-bold text-gray-900">NURO Technologies</div>
                  <div className="text-xs sm:text-sm text-gray-500">Centro de Ayuda</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-8">
                <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1 text-sm">
                  <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Inicio</span>
                </a>
                <a href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Documentación
                </a>
                <a href="/changelog" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Changelog
                </a>
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