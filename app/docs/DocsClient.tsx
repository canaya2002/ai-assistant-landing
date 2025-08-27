"use client";
import { useState, useEffect } from 'react';
import { FileText, Search, Download, Play, Settings, Zap, Eye, MessageSquare, Keyboard, AlertTriangle, Book, CheckCircle, Lightbulb, Code, ExternalLink, Home } from 'lucide-react';
import Link from 'next/link';

const DocsClientComponent = () => {
  const [activeSection, setActiveSection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth > 768) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      let currentSection = '';
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          currentSection = section.getAttribute('data-section') || '';
        }
      });
      
      setActiveSection(currentSection);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const sections = [
    { id: 'introduccion', title: 'Introducción', icon: Book },
    { id: 'instalacion', title: 'Instalación', icon: Download },
    { id: 'primeros-pasos', title: 'Primeros Pasos', icon: Play },
    { id: 'configuracion', title: 'Configuración', icon: Settings },
    { id: 'funciones', title: 'Funciones Principales', icon: Zap },
    { id: 'atajos', title: 'Atajos de Teclado', icon: Keyboard },
    { id: 'solucionar', title: 'Solución de Problemas', icon: AlertTriangle },
    { id: 'api', title: 'API Reference', icon: Code }
  ];

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      
      {/* Navigation Inline */}
      <nav className="relative z-20 backdrop-blur-md bg-white/80 border-b border-gray-100 sticky top-0">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center space-x-3 sm:space-x-4 group">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg sm:text-xl">N</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">NURO</div>
                <div className="text-xs text-gray-500">Documentación</div>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
                <Home className="w-4 h-4" />
                <span className="font-medium">Volver al Inicio</span>
              </Link>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                Descargar
              </button>
            </div>
          </div>
        </div>
      </nav>

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

      {/* Search Hero */}
      <section className="relative z-10 bg-gradient-to-br from-blue-50 to-purple-50 py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Documentación de
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NURO
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed mb-8 sm:mb-12">
              Todo lo que necesitas saber para dominar tu asistente de IA y maximizar tu productividad.
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
                placeholder="Buscar en la documentación..."
                className="block w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base shadow-lg"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
                <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="font-bold text-lg text-gray-900">8</div>
                <div className="text-xs text-gray-600">Secciones</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
                <Lightbulb className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div className="font-bold text-lg text-gray-900">25+</div>
                <div className="text-xs text-gray-600">Tips</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
                <Keyboard className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="font-bold text-lg text-gray-900">15</div>
                <div className="text-xs text-gray-600">Atajos</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
                <Code className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <div className="font-bold text-lg text-gray-900">API</div>
                <div className="text-xs text-gray-600">Reference</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 sm:gap-12">
            
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
              <div className="sticky top-8 bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-4 sm:p-6 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-4 sm:mb-6">Contenido</h3>
                <nav className="space-y-1 sm:space-y-2">
                  {filteredSections.map((section) => (
                    <Link
                      key={section.id}
                      href={`#${section.id}`}
                      className={`flex items-center space-x-3 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <section.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">{section.title}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="space-y-12 sm:space-y-16">

                {/* Introducción */}
                <section data-section="introduccion" id="introduccion" className="scroll-mt-8">
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-lg">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                        <Book className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Introducción</h2>
                    </div>

                    <div className="prose prose-sm sm:prose max-w-none">
                      <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                        NURO es un asistente de inteligencia artificial avanzado diseñado para revolucionar tu productividad 
                        a través del análisis inteligente de pantalla y respuestas contextuales en tiempo real.
                      </p>

                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">¿Qué hace NURO?</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 sm:p-6 rounded-xl border border-blue-100">
                          <Eye className="w-6 h-6 text-blue-600 mb-3" />
                          <h4 className="font-bold text-gray-900 mb-2">Análisis Visual</h4>
                          <p className="text-sm text-gray-700">Comprende cualquier contenido en tu pantalla con precisión del 99.5%</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-6 rounded-xl border border-purple-100">
                          <MessageSquare className="w-6 h-6 text-purple-600 mb-3" />
                          <h4 className="font-bold text-gray-900 mb-2">IA Conversacional</h4>
                          <p className="text-sm text-gray-700">Respuestas naturales y contextuales basadas en lo que ves</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl border border-green-200 mb-6">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-bold text-green-800 mb-2">Privacidad Garantizada</h4>
                            <p className="text-sm text-green-700">
                              Procesamiento 100% local. Tus datos nunca salen de tu dispositivo. Sin servidores externos, sin tracking.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Instalación */}
                <section data-section="instalacion" id="instalacion" className="scroll-mt-8">
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-lg">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                        <Download className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Instalación</h2>
                    </div>

                    <div className="space-y-6 sm:space-y-8">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Requisitos del Sistema</h3>
                        <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                          <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                            <li className="flex items-center space-x-3">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span><strong>SO:</strong> Windows 10 (versión 1903+) o Windows 11</span>
                            </li>
                            <li className="flex items-center space-x-3">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span><strong>RAM:</strong> 4GB mínimo, 8GB recomendado</span>
                            </li>
                            <li className="flex items-center space-x-3">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span><strong>Espacio:</strong> 200MB libres</span>
                            </li>
                            <li className="flex items-center space-x-3">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span><strong>Internet:</strong> Solo para actualizaciones (opcional)</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Proceso de Instalación</h3>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-4">
                            <div className="bg-blue-600 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base font-bold flex-shrink-0 mt-1">1</div>
                            <div>
                              <h4 className="font-bold text-gray-900 mb-2">Descargar NURO</h4>
                              <p className="text-gray-700 mb-3">Descarga <code className="bg-gray-100 px-2 py-1 rounded text-sm">AI.Assistant.Professional.Setup.1.0.0.exe</code> desde la página principal.</p>
                              <Link href="/" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                                <ExternalLink className="w-4 h-4" />
                                <span>Ir a página de descarga</span>
                              </Link>
                            </div>
                          </div>

                          <div className="flex items-start space-x-4">
                            <div className="bg-blue-600 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base font-bold flex-shrink-0 mt-1">2</div>
                            <div>
                              <h4 className="font-bold text-gray-900 mb-2">Ejecutar Instalador</h4>
                              <p className="text-gray-700 mb-3">Haz doble clic en el archivo descargado para iniciar la instalación.</p>
                              
                              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-3">
                                <div className="flex items-start space-x-3">
                                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <h5 className="font-bold text-yellow-800 mb-1">Advertencia de Windows</h5>
                                    <p className="text-sm text-yellow-700">
                                      Windows mostrará &quot;Windows protected your PC&quot; porque NURO no está firmado digitalmente. 
                                      Esto es normal y la aplicación es completamente segura.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start space-x-4">
                            <div className="bg-blue-600 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base font-bold flex-shrink-0 mt-1">3</div>
                            <div>
                              <h4 className="font-bold text-gray-900 mb-2">Bypass de Windows Defender</h4>
                              <ol className="space-y-2 text-sm text-gray-700">
                                <li>1. Haz clic en <strong>&quot;More info&quot;</strong></li>
                                <li>2. Selecciona <strong>&quot;Run anyway&quot;</strong></li>
                                <li>3. Confirma la instalación como administrador</li>
                              </ol>
                            </div>
                          </div>

                          <div className="flex items-start space-x-4">
                            <div className="bg-green-600 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base font-bold flex-shrink-0 mt-1">✓</div>
                            <div>
                              <h4 className="font-bold text-gray-900 mb-2">¡Listo!</h4>
                              <p className="text-gray-700">NURO se iniciará automáticamente y estará listo para usar.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

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
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-gray-900">NURO Technologies</div>
                <div className="text-xs sm:text-sm text-gray-500">Documentación y Soporte</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                Inicio
              </Link>
              <Link href="/faq" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                FAQ
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
  );
};

export default DocsClientComponent;