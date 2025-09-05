"use client";
import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { 
  Shield, Lock, Eye, Database, User, Mail, Clock, CheckCircle, 
  AlertTriangle, Menu, X, Download, Bot, Plus
} from 'lucide-react';

// Configuration
const CONFIG = {
  VERSION: '1.0.0',
  DOWNLOAD_URL: 'https://github.com/canaya2002/ai-assistant-professional/releases/download/v1.0.0/AI.Assistant.Professional.Setup.1.0.0.exe',
};

// Background video component
const VideoBackground = memo(function VideoBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video 
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: 'center 30%' }}
        autoPlay 
        muted 
        loop 
        playsInline
        preload="metadata"
      >
        <source src="/images/fondo-nora-tres.mp4" type="video/mp4" />
        <source src="/fondo-nora-tres.webm" type="video/webm" />
      </video>
      {/* Overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />
    </div>
  );
});

// Navigation Component
const Navigation = memo(function Navigation({
  onDownload
}: {
  onDownload: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleWebAppClick = () => {
    window.location.href = '/app';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img 
            src="/images/nora.png" 
            alt="NORA Logo" 
            className="h-24 w-auto hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <button 
            onClick={handleWebAppClick}
            className="px-6 py-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-full text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300 flex items-center space-x-2"
          >
            <span className="text-sm font-light">Web App</span>
            <Bot className="w-4 h-4" />
          </button>
          
          <button
            onClick={onDownload}
            className="px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-light hover:bg-white/15 hover:border-white/30 transition-all duration-300"
          >
            Descargar
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-lg">
          <div className="container mx-auto px-6 py-4">
            <div className="space-y-3">
              <button
                onClick={() => {
                  handleWebAppClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left text-sm font-light text-white/80 hover:text-white transition-all py-2"
              >
                Web App
              </button>
              <button
                onClick={() => {
                  onDownload();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white px-6 py-2 font-light hover:bg-white/15 hover:border-white/30 transition-all duration-300"
              >
                Descargar NORA
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
});

// Hero Section with video background
const HeroSection = memo(function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <VideoBackground />
      
      <div className="relative z-30 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-8 tracking-wide" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Política de Privacidad
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed font-light animate-fade-up" style={{ animationDelay: '0.5s' }}>
            Tu privacidad es nuestra prioridad
          </p>

          <div className="animate-fade-up" style={{ animationDelay: '1s' }}>
            <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed font-light">
              NORA está diseñado desde cero con privacidad por diseño. Procesamiento 100% local, 
              cifrado de extremo a extremo y control total sobre tus datos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

// Main Content Sections
const PrivacyContent = memo(function PrivacyContent() {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    { id: 'recopilacion', title: 'Información que Recopilamos', icon: Database },
    { id: 'uso', title: 'Cómo Usamos tu Información', icon: Eye },
    { id: 'procesamiento', title: 'Procesamiento Local', icon: Lock },
    { id: 'seguridad', title: 'Seguridad de Datos', icon: Shield },
    { id: 'derechos', title: 'Tus Derechos', icon: User },
    { id: 'contacto', title: 'Contacto', icon: Mail }
  ];

  return (
    <div className="bg-black">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
              <div className="sticky top-28 bg-[#737373]/50 backdrop-blur-lg rounded-2xl border border-[#737373]/40 p-6">
                <h3 className="font-light text-white/90 mb-6 text-lg" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Contenido
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                        activeSection === section.id
                          ? 'bg-[#737373]/60 text-white border-l-2 border-white'
                          : 'text-gray-400 hover:bg-[#737373]/30 hover:text-white'
                      }`}
                    >
                      <section.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-light">{section.title}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="space-y-16">
                {/* Información que Recopilamos */}
                <section data-section="recopilacion" id="recopilacion" className="scroll-mt-28">
                  <div className="bg-[#737373]/50 backdrop-blur-lg rounded-2xl border border-[#737373]/40 p-8">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="bg-[#737373]/80 p-3 rounded-lg">
                        <Database className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        Información que Recopilamos
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-[#737373]/30">
                        <h3 className="text-xl font-light text-white mb-4 flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                          Datos Procesados Localmente
                        </h3>
                        <ul className="space-y-3 text-gray-300 font-light">
                          <li className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                            <span><strong>Contenido de pantalla:</strong> Analizado únicamente en tu dispositivo para generar respuestas contextuales</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                            <span><strong>Preferencias de configuración:</strong> Guardadas localmente para personalizar tu experiencia</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                            <span><strong>Datos de uso:</strong> Estadísticas anónimas para mejorar el rendimiento (solo localmente)</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-red-900/20 p-6 rounded-xl border border-red-800/50">
                        <h3 className="text-xl font-light text-white mb-4 flex items-center">
                          <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                          Lo que NO Recopilamos
                        </h3>
                        <ul className="space-y-3 text-gray-300 font-light">
                          <li className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>No enviamos capturas de pantalla a servidores externos</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>No accedemos a archivos personales sin tu consentimiento</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>No rastreamos tu actividad en línea fuera de NORA</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span>No compartimos datos con terceros con fines comerciales</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Cómo Usamos tu Información */}
                <section data-section="uso" id="uso" className="scroll-mt-28">
                  <div className="bg-[#737373]/50 backdrop-blur-lg rounded-2xl border border-[#737373]/40 p-8">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="bg-[#737373]/80 p-3 rounded-lg">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        Cómo Usamos tu Información
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-[#737373]/30">
                        <h3 className="text-lg font-light text-white mb-4">Procesamiento de IA</h3>
                        <p className="text-gray-300 mb-4 font-light">
                          Los datos visuales se procesan exclusivamente en tu dispositivo usando nuestros 
                          modelos de IA locales para generar respuestas relevantes y contextualmente precisas.
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-light">100% procesamiento local</span>
                        </div>
                      </div>

                      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-[#737373]/30">
                        <h3 className="text-lg font-light text-white mb-4">Mejora del Producto</h3>
                        <p className="text-gray-300 mb-4 font-light">
                          Utilizamos datos agregados y anonimizados para mejorar la precisión de nuestros 
                          algoritmos y desarrollar nuevas funcionalidades.
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-light">Datos completamente anónimos</span>
                        </div>
                      </div>

                      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-[#737373]/30">
                        <h3 className="text-lg font-light text-white mb-4">Personalización</h3>
                        <p className="text-gray-300 mb-4 font-light">
                          Adaptamos la experiencia según tus preferencias y patrones de uso, 
                          manteniendo toda la información en tu dispositivo local.
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-light">Configuración local únicamente</span>
                        </div>
                      </div>

                      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-[#737373]/30">
                        <h3 className="text-lg font-light text-white mb-4">Soporte Técnico</h3>
                        <p className="text-gray-300 mb-4 font-light">
                          En caso de soporte técnico, solo accedemos a logs de diagnóstico 
                          no identificables y con tu consentimiento explícito.
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-light">Solo con consentimiento</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Procesamiento Local */}
                <section data-section="procesamiento" id="procesamiento" className="scroll-mt-28">
                  <div className="bg-[#737373]/50 backdrop-blur-lg rounded-2xl border border-[#737373]/40 p-8">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="bg-[#737373]/80 p-3 rounded-lg">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        Procesamiento 100% Local
                      </h2>
                    </div>

                    <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-[#737373]/30 mb-8">
                      <h3 className="text-2xl font-light text-white mb-6">Arquitectura de Privacidad</h3>
                      <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                          <div className="bg-[#737373]/60 p-2 rounded-lg">
                            <Database className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-light text-white mb-2">Modelos de IA Locales</h4>
                            <p className="text-gray-300 font-light">
                              Todos los modelos de inteligencia artificial ejecutan directamente en tu dispositivo. 
                              No requieren conexión a internet para el análisis básico.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4">
                          <div className="bg-[#737373]/60 p-2 rounded-lg">
                            <Lock className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-light text-white mb-2">Cifrado en Reposo</h4>
                            <p className="text-gray-300 font-light">
                              Todos los datos almacenados localmente están cifrados usando AES-256, 
                              incluyendo configuraciones, caché y datos temporales.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4">
                          <div className="bg-[#737373]/60 p-2 rounded-lg">
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-light text-white mb-2">Memoria Segura</h4>
                            <p className="text-gray-300 font-light">
                              Los datos en memoria se borran automáticamente al cerrar la aplicación. 
                              No quedan rastros de información sensible en el sistema.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-900/20 p-6 rounded-xl border border-green-800/50">
                      <h3 className="text-lg font-light text-white mb-4">Garantías de Privacidad</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-gray-300 font-light">Cero transmisión de datos personales</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-gray-300 font-light">Funcionamiento offline completo</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-gray-300 font-light">Auditoría de código abierto disponible</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-gray-300 font-light">Certificación independiente de seguridad</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Seguridad de Datos */}
                <section data-section="seguridad" id="seguridad" className="scroll-mt-28">
                  <div className="bg-[#737373]/50 backdrop-blur-lg rounded-2xl border border-[#737373]/40 p-8">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="bg-[#737373]/80 p-3 rounded-lg">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        Seguridad de Datos
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-light text-white mb-6">Medidas de Protección</h3>
                        <div className="space-y-4">
                          <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-[#737373]/30">
                            <h4 className="font-light text-white mb-2">Cifrado de Extremo a Extremo</h4>
                            <p className="text-sm text-gray-300 font-light">AES-256 para todos los datos almacenados y RSA-4096 para comunicaciones</p>
                          </div>
                          <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-[#737373]/30">
                            <h4 className="font-light text-white mb-2">Autenticación Multifactor</h4>
                            <p className="text-sm text-gray-300 font-light">Opciones biométricas y tokens de seguridad para funciones avanzadas</p>
                          </div>
                          <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-[#737373]/30">
                            <h4 className="font-light text-white mb-2">Auditorías de Seguridad</h4>
                            <p className="text-sm text-gray-300 font-light">Evaluaciones trimestrales por firmas de ciberseguridad independientes</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-light text-white mb-6">Certificaciones</h3>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 p-4 bg-black/30 backdrop-blur-sm rounded-xl border border-[#737373]/30">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                            <div>
                              <div className="font-light text-white">SOC 2 Type II</div>
                              <div className="text-sm text-gray-300 font-light">Controles de seguridad auditados</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-4 bg-black/30 backdrop-blur-sm rounded-xl border border-[#737373]/30">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                            <div>
                              <div className="font-light text-white">ISO 27001</div>
                              <div className="text-sm text-gray-300 font-light">Gestión de seguridad de la información</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-4 bg-black/30 backdrop-blur-sm rounded-xl border border-[#737373]/30">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                            <div>
                              <div className="font-light text-white">GDPR Compliant</div>
                              <div className="text-sm text-gray-300 font-light">Cumplimiento total con RGPD</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Tus Derechos */}
                <section data-section="derechos" id="derechos" className="scroll-mt-28">
                  <div className="bg-[#737373]/50 backdrop-blur-lg rounded-2xl border border-[#737373]/40 p-8">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="bg-[#737373]/80 p-3 rounded-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        Tus Derechos de Privacidad
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-[#737373]/30">
                        <h3 className="text-lg font-light text-white mb-4">Derecho de Acceso</h3>
                        <p className="text-gray-300 mb-4 font-light">
                          Tienes derecho a saber qué información personal procesamos y cómo la utilizamos.
                        </p>
                        <div className="text-sm text-gray-400 font-light">
                          Respuesta en menos de 48 horas
                        </div>
                      </div>

                      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-[#737373]/30">
                        <h3 className="text-lg font-light text-white mb-4">Derecho de Rectificación</h3>
                        <p className="text-gray-300 mb-4 font-light">
                          Puedes solicitar la corrección de cualquier información personal inexacta o incompleta.
                        </p>
                        <div className="text-sm text-gray-400 font-light">
                          Corrección inmediata
                        </div>
                      </div>

                      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-[#737373]/30">
                        <h3 className="text-lg font-light text-white mb-4">Derecho de Eliminación</h3>
                        <p className="text-gray-300 mb-4 font-light">
                          Tienes el derecho a solicitar la eliminación de tus datos personales bajo ciertas condiciones.
                        </p>
                        <div className="text-sm text-gray-400 font-light">
                          Eliminación en 24 horas
                        </div>
                      </div>

                      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-[#737373]/30">
                        <h3 className="text-lg font-light text-white mb-4">Derecho de Portabilidad</h3>
                        <p className="text-gray-300 mb-4 font-light">
                          Puedes solicitar una copia de tus datos personales en un formato estructurado y legible.
                        </p>
                        <div className="text-sm text-gray-400 font-light">
                          Exportación JSON/CSV
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-[#737373]/30">
                      <h3 className="text-lg font-light text-white mb-4">Cómo Ejercer tus Derechos</h3>
                      <p className="text-gray-300 mb-4 font-light">
                        Para ejercer cualquiera de estos derechos, contáctanos a través de los medios proporcionados 
                        en la sección de contacto. Procesamos todas las solicitudes de manera gratuita y sin demoras innecesarias.
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span className="font-light">privacy@nura-technologies.com</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Contacto */}
                <section data-section="contacto" id="contacto" className="scroll-mt-28">
                  <div className="bg-[#737373]/50 backdrop-blur-lg rounded-2xl border border-[#737373]/40 p-8">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="bg-[#737373]/80 p-3 rounded-lg">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        Contacto y Soporte
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-light text-white mb-6">Oficial de Protección de Datos</h3>
                        <div className="space-y-4">
                          <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-[#737373]/30">
                            <h4 className="font-light text-white mb-2">NURA Technologies, Inc.</h4>
                            <div className="text-sm text-gray-300 space-y-1 font-light">
                              <p>1234 Innovation Drive</p>
                              <p>San Francisco, CA 94105</p>
                              <p>Estados Unidos</p>
                            </div>
                          </div>
                          <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-[#737373]/30">
                            <h4 className="font-light text-white mb-2">Contacto de Privacidad</h4>
                            <div className="text-sm text-gray-300 space-y-1 font-light">
                              <p>Email: privacy@nura-technologies.com</p>
                              <p>Teléfono: +1 (555) 123-4567</p>
                              <p>Soporte 24/7 disponible</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-light text-white mb-6">Tiempos de Respuesta</h3>
                        <div className="space-y-4">
                          <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-[#737373]/30">
                            <div className="flex items-center justify-between">
                              <span className="font-light text-white">Consultas de privacidad</span>
                              <span className="text-gray-400 font-light">48 horas</span>
                            </div>
                          </div>
                          <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-[#737373]/30">
                            <div className="flex items-center justify-between">
                              <span className="font-light text-white">Solicitudes de datos</span>
                              <span className="text-gray-400 font-light">72 horas</span>
                            </div>
                          </div>
                          <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-[#737373]/30">
                            <div className="flex items-center justify-between">
                              <span className="font-light text-white">Soporte técnico</span>
                              <span className="text-gray-400 font-light">24 horas</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-[#737373]/30">
                      <div className="flex items-start space-x-4">
                        <Clock className="w-6 h-6 text-white mt-1" />
                        <div>
                          <h4 className="font-light text-white mb-2">Última Actualización</h4>
                          <p className="text-gray-300 mb-2 font-light">
                            Esta política de privacidad fue actualizada por última vez el 26 de agosto de 2025. 
                            Notificaremos sobre cambios significativos con al menos 30 días de anticipación.
                          </p>
                          <div className="text-sm text-gray-400 font-light">
                            Versión 1.0 - Efectiva desde agosto 2025
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
    </div>
  );
});

// Footer
const Footer = memo(function Footer() {
  return (
    <footer className="py-20 bg-black">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Logo section */}
          <div className="md:col-span-1">
            <img 
              src="/images/nora.png" 
              alt="NORA Logo" 
              className="h-20 w-auto mb-4"
            />
          </div>

          {/* Links sections */}
          <div>
            <h3 className="text-white font-light mb-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Productos</h3>
            <ul className="space-y-2 text-gray-400 font-light">
              <li><a href="#" className="hover:text-white transition-colors">NORA para iPhone</a></li>
              <li><a href="#" className="hover:text-white transition-colors">NORA para iPad</a></li>
              <li><a href="#" className="hover:text-white transition-colors">NORA para Apple Watch</a></li>
              <li><a href="#" className="hover:text-white transition-colors">NORA para Mac</a></li>
              <li><a href="#" className="hover:text-white transition-colors">NORA para Android</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-light mb-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Información</h3>
            <ul className="space-y-2 text-gray-400 font-light">
              <li><a href="#" className="hover:text-white transition-colors">¿Qué es NORA?</a></li>
              <li><a href="#" className="hover:text-white transition-colors">NORA para Trabajo</a></li>
              <li><a href="#" className="hover:text-white transition-colors">NORA para Tareas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">NORA para Ensayos</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-light mb-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Comunidad</h3>
            <ul className="space-y-2 text-gray-400 font-light">
              <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-light mb-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Empresa</h3>
            <ul className="space-y-2 text-gray-400 font-light">
              <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Acerca de</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Soporte</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacidad</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Términos</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
});

// Main component
const NuroPrivacyPage: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);

  const handleDownload = useCallback(() => {
    setShowWarning(true);
    const link = document.createElement('a');
    link.href = CONFIG.DOWNLOAD_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Navigation onDownload={handleDownload} />
      
      <main>
        <HeroSection />
        <PrivacyContent />
      </main>

      <Footer />

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 max-w-md mx-auto">
            <div className="flex items-center space-x-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <h3 className="text-xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Advertencia de Seguridad</h3>
            </div>
            <p className="text-gray-300 mb-6 font-light">
              Windows puede mostrar una advertencia. NORA es completamente seguro.
            </p>
            <button 
              onClick={() => setShowWarning(false)}
              className="w-full bg-white text-black font-light py-3 rounded-full hover:bg-gray-100 transition-colors duration-300"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lastica:wght@300;400;500;600;700&display=swap');
        
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-up { 
          animation: fade-up 0.8s ease-out forwards; 
          opacity: 0; 
        }

        /* Ensure smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1f2937;
        }
        ::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        /* Lastica font fallbacks */
        body {
          font-family: 'Lastica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default NuroPrivacyPage;