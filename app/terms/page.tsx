"use client";

import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Added for Image component
import { 
  Shield, AlertTriangle, CheckCircle, Home, Mail, Clock, 
  Scale, BookOpen, UserCheck, Zap, Lock, Award, Menu, X, Bot
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

  const navigationItems = [
    { href: '/', label: 'Inicio' },
    { href: '/docs', label: 'Documentación' },
    { href: '/faq', label: 'FAQ' },
    { href: '/privacy', label: 'Privacidad' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image 
            src="/images/nora.png" 
            alt="NORA Logo" 
            width={96} // Approximate width based on h-24 w-auto
            height={96} 
            className="hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-light text-white/80 hover:text-white transition-all duration-300"
            >
              {item.label}
            </Link>
          ))}
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
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-light text-white/80 hover:text-white transition-all py-2"
                >
                  {item.label}
                </Link>
              ))}
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
              Términos de Servicio
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed font-light animate-fade-up" style={{ animationDelay: '0.5s' }}>
            Condiciones legales para el uso de NORA
          </p>

          <div className="animate-fade-up" style={{ animationDelay: '1s' }}>
            <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed font-light">
              Estos términos establecen las reglas para el uso de NORA y definen los derechos y responsabilidades entre tú y NURO Technologies.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

// Main Content Sections
const TermsContent = memo(function TermsContent() {
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
    { id: 'aceptacion', title: 'Aceptación de Términos', icon: UserCheck },
    { id: 'licencia', title: 'Licencia de Uso', icon: BookOpen },
    { id: 'responsabilidades', title: 'Responsabilidades', icon: Shield },
    { id: 'restricciones', title: 'Restricciones de Uso', icon: AlertTriangle },
    { id: 'propiedad', title: 'Propiedad Intelectual', icon: Award },
    { id: 'limitaciones', title: 'Limitaciones', icon: Scale },
    { id: 'terminacion', title: 'Terminación', icon: Zap },
    { id: 'contacto', title: 'Contacto Legal', icon: Mail },
  ];

  return (
    <div className="bg-black">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
              <div className="sticky top-28 bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-800 p-6">
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
                          ? 'bg-white/10 text-white border-l-2 border-white'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
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
                {/* Aceptación de Términos */}
                <section data-section="aceptacion" id="aceptacion" className="scroll-mt-28">
                  <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-800 p-8">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="bg-white/10 p-3 rounded-lg">
                        <UserCheck className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        Aceptación de Términos
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                        <h3 className="text-xl font-light text-white mb-4">Consentimiento Informado</h3>
                        <p className="text-gray-300 leading-relaxed mb-4 font-light">
                          Al descargar, instalar o usar NORA, aceptas estar legalmente vinculado por estos términos de servicio. Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestro software.
                        </p>
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                          <h4 className="font-light text-white mb-2">Requisitos de Aceptación:</h4>
                          <ul className="text-sm text-gray-400 space-y-2 font-light">
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                              <span>Tener al menos 18 años o consentimiento parental</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                              <span>Capacidad legal para celebrar contratos</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                              <span>Cumplimiento con las leyes locales aplicables</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                              <span>Comprensión de los términos en su totalidad</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                        <h3 className="text-xl font-light text-white mb-4 flex items-center">
                          <Clock className="w-5 h-5 text-white mr-2" />
                          Modificaciones de Términos
                        </h3>
                        <p className="text-gray-300 leading-relaxed mb-4 font-light">
                          Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios significativos se notificarán con al menos 30 días de anticipación.
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-light">Notificación previa de 30 días para cambios importantes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Licencia de Uso */}
                <section data-section="licencia" id="licencia" className="scroll-mt-28">
                  <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-800 p-8">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="bg-white/10 p-3 rounded-lg">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        Licencia de Uso
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                        <h3 className="text-xl font-light text-white mb-4">Licencia Otorgada</h3>
                        <p className="text-gray-300 leading-relaxed mb-4 font-light">
                          NURO Technologies te otorga una licencia personal, no exclusiva, no transferible y revocable para usar NORA de acuerdo con estos términos.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <h4 className="font-light text-white mb-2 flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                              Permitido
                            </h4>
                            <ul className="text-sm text-gray-400 space-y-2 font-light">
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Uso personal y comercial</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Instalación en múltiples dispositivos</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Creación de copias de seguridad</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Configuración y personalización</span>
                              </li>
                            </ul>
                          </div>
                          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <h4 className="font-light text-white mb-2 flex items-center">
                              <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
                              Prohibido
                            </h4>
                            <ul className="text-sm text-gray-400 space-y-2 font-light">
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Redistribución o reventa</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Ingeniería inversa</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Modificación del código fuente</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Uso para entrenar otros modelos de IA</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Responsabilidades */}
                <section data-section="responsabilidades" id="responsabilidades" className="scroll-mt-28">
                  <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-800 p-8">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="bg-white/10 p-3 rounded-lg">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        Responsabilidades del Usuario
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                        <h3 className="text-lg font-light text-white mb-4">Uso Apropiado</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300 font-light">Usar NORA de acuerdo con las leyes aplicables</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300 font-light">Mantener la confidencialidad de datos sensibles</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300 font-light">Reportar bugs y vulnerabilidades de seguridad</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300 font-light">Mantener el software actualizado</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                        <h3 className="text-lg font-light text-white mb-4">Responsabilidad de Contenido</h3>
                        <p className="text-gray-300 mb-4 font-light">
                          Eres responsable del contenido que procesas a través de NORA. Debes asegurarte de:
                        </p>
                        <ul className="space-y-2 text-sm text-gray-400 font-light">
                          <li className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                            <span>Tener autorización para procesar datos de terceros</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                            <span>Cumplir con regulaciones de privacidad (GDPR, CCPA)</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                            <span>No procesar contenido ilegal o malicioso</span>
                          </li>
                          <li className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                            <span>Respetar derechos de propiedad intelectual</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Restricciones de Uso */}
                <section data-section="restricciones" id="restricciones" className="scroll-mt-28">
                  <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-800 p-8">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="bg-white/10 p-3 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        Restricciones de Uso
                      </h2>
                    </div>

                    <div className="bg-red-900/20 p-6 rounded-xl border border-red-800/50 mb-8">
                      <h3 className="text-xl font-light text-white mb-4 flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                        Actividades Prohibidas
                      </h3>
                      <p className="text-gray-300 mb-4 font-light">
                        El siguiente uso de NORA está estrictamente prohibido y resultará en la terminación inmediata de la licencia:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-red-900/20 p-4 rounded-xl border border-red-800/50">
                          <h4 className="font-light text-white mb-2">Actividades Ilegales</h4>
                          <ul className="text-sm text-gray-400 space-y-2 font-light">
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Procesamiento de contenido ilegal</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Violación de derechos de autor</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Fraude o engaño</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Actividades terroristas o criminales</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-orange-900/20 p-4 rounded-xl border border-orange-800/50">
                          <h4 className="font-light text-white mb-2">Abuso Técnico</h4>
                          <ul className="text-sm text-gray-400 space-y-2 font-light">
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Ingeniería inversa del software</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Bypass de limitaciones de uso</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Ataques de denegación de servicio</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Extracción de modelos de IA</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                          <h4 className="font-light text-white mb-2">Contenido Restringido</h4>
                          <ul className="text-sm text-gray-400 space-y-2 font-light">
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Contenido que promueva odio</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Material sexualmente explícito</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Información de menores sin consentimiento</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Datos médicos sin autorización</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                          <h4 className="font-light text-white mb-2">Uso Comercial Restringido</h4>
                          <ul className="text-sm text-gray-400 space-y-2 font-light">
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Reventa sin autorización</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Integración en productos competidores</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Ofertas de servicios basados en NORA</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Uso para entrenar IA competidora</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Propiedad Intelectual */}
                <section data-section="propiedad" id="propiedad" className="scroll-mt-28">
                  <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-800 p-8">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="bg-white/10 p-3 rounded-lg">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        Propiedad Intelectual
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                        <h3 className="text-xl font-light text-white mb-4">Derechos de NURA Technologies</h3>
                        <p className="text-gray-300 mb-6 font-light">
                          NURA Technologies es propietario de todos los derechos, títulos e intereses en y para NORA, incluyendo:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-light text-white mb-3">Software y Tecnología</h4>
                            <ul className="space-y-2 text-sm text-gray-400 font-light">
                              <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span>Código fuente y binarios</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span>Algoritmos de IA y modelos entrenados</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span>Arquitectura y diseño de software</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span>Actualizaciones y mejoras</span>
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-light text-white mb-3">Marcas y Contenido</h4>
                            <ul className="space-y-2 text-sm text-gray-400 font-light">
                              <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span>Marca registrada NORA</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span>Logotipos e identidad visual</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span>Documentación y manuales</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span>Material de marketing</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                        <h3 className="text-xl font-light text-white mb-4">Tus Derechos sobre el Contenido</h3>
                        <p className="text-gray-300 mb-4 font-light">
                          Mantienes la propiedad completa del contenido que procesas a través de NORA:
                        </p>
                        <div className="bg-green-900/20 p-4 rounded-lg border border-green-800/50">
                          <ul className="space-y-2 text-sm text-gray-300 font-light">
                            <li className="flex items-center space-x-2">
                              <Lock className="w-4 h-4 text-green-400" />
                              <span>Tus datos permanecen bajo tu control exclusivo</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Lock className="w-4 h-4 text-green-400" />
                              <span>No reclamamos derechos sobre tu contenido procesado</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Lock className="w-4 h-4 text-green-400" />
                              <span>Puedes exportar tus datos en cualquier momento</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <Lock className="w-4 h-4 text-green-400" />
                              <span>Procesamiento local garantiza tu privacidad</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Limitaciones */}
                <section data-section="limitaciones" id="limitaciones" className="scroll-mt-28">
                  <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-800 p-8">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="bg-white/10 p-3 rounded-lg">
                        <Scale className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        Limitaciones de Responsabilidad
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-yellow-900/20 p-6 rounded-xl border border-yellow-800/50">
                        <div className="flex items-center space-x-3 mb-4">
                          <AlertTriangle className="w-6 h-6 text-yellow-400" />
                          <h3 className="text-xl font-light text-white">Exención de Garantías</h3>
                        </div>
                        <p className="text-gray-300 mb-4 font-light">
                          NORA se proporciona tal como está y según disponibilidad. No garantizamos que:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <ul className="space-y-2 text-sm text-gray-400 font-light">
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>El software esté libre de errores</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Funcione ininterrumpidamente</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Sea compatible con todo hardware</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Los resultados sean 100% precisos</span>
                            </li>
                          </ul>
                          <ul className="space-y-2 text-sm text-gray-400 font-light">
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Sea adecuado para usos específicos</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>No contenga vulnerabilidades</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Cumpla con todas las regulaciones</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Genere resultados comercialmente viables</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-red-900/20 p-6 rounded-xl border border-red-800/50">
                          <h3 className="text-lg font-light text-white mb-4">Limitación de Daños</h3>
                          <p className="text-gray-300 text-sm mb-4 font-light">
                            En ningún caso NURA Technologies será responsable por:
                          </p>
                          <ul className="space-y-2 text-xs text-gray-400 font-light">
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Daños indirectos o consecuenciales</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Pérdida de beneficios o ingresos</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Pérdida de datos o información</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Interrupción del negocio</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Daños punitivos o ejemplares</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                          <h3 className="text-lg font-light text-white mb-4">Límite Máximo</h3>
                          <p className="text-gray-300 text-sm mb-4 font-light">
                            La responsabilidad total de NURA Technologies está limitada a:
                          </p>
                          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                            <div className="text-center">
                              <div className="text-2xl font-light text-white">$100 USD</div>
                              <div className="text-xs text-gray-400 font-light">o el monto pagado en los últimos 12 meses, lo que sea mayor</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Terminación */}
                <section data-section="terminacion" id="terminacion" className="scroll-mt-28">
                  <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-800 p-8">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="bg-white/10 p-3 rounded-lg">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        Terminación del Acuerdo
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                        <h3 className="text-lg font-light text-white mb-4">Terminación por tu Parte</h3>
                        <p className="text-gray-300 mb-4 font-light">Puedes terminar este acuerdo en cualquier momento:</p>
                        <ul className="space-y-2 text-sm text-gray-400 font-light">
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>Desinstalando NORA de todos tus dispositivos</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>Eliminando todas las copias del software</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span>Dejando de usar nuestros servicios</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                        <h3 className="text-lg font-light text-white mb-4">Terminación por Nuestra Parte</h3>
                        <p className="text-gray-300 mb-4 font-light">Podemos terminar tu licencia si:</p>
                        <ul className="space-y-2 text-sm text-gray-400 font-light">
                          <li className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span>Violas estos términos de servicio</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span>Usas el software para actividades ilegales</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span>Intentas evadir limitaciones técnicas</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Contacto Legal */}
                <section data-section="contacto" id="contacto" className="scroll-mt-28">
                  <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-800 p-8">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="bg-white/10 p-3 rounded-lg">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        Contacto Legal
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-light text-white mb-6">Información Legal</h3>
                        <div className="space-y-4">
                          <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-gray-800">
                            <h4 className="font-light text-white mb-2">NURA Technologies, Inc.</h4>
                            <div className="text-sm text-gray-400 space-y-1 font-light">
                              <p>1234 Innovation Drive</p>
                              <p>San Francisco, CA 94105</p>
                              <p>Estados Unidos</p>
                            </div>
                          </div>
                          <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-gray-800">
                            <h4 className="font-light text-white mb-2">Departamento Legal</h4>
                            <div className="text-sm text-gray-400 space-y-1 font-light">
                              <p>Email: legal@nura-technologies.com</p>
                              <p>Teléfono: +1 (555) 123-4567</p>
                              <p>Fax: +1 (555) 123-4568</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-light text-white mb-6">Jurisdicción y Ley Aplicable</h3>
                        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                          <h4 className="font-light text-white mb-4">Ley Aplicable</h4>
                          <p className="text-gray-300 mb-4 font-light">
                            Estos términos se rigen por las leyes del Estado de California, Estados Unidos, sin considerar sus principios de conflicto de leyes.
                          </p>
                          
                          <h4 className="font-light text-white mb-4">Resolución de Disputas</h4>
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <div className="bg-gray-700 p-1 rounded">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                              <div>
                                <div className="font-light text-white">Negociación Directa</div>
                                <div className="text-sm text-gray-400 font-light">Primer intento de resolución amistosa</div>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="bg-gray-700 p-1 rounded">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                              <div>
                                <div className="font-light text-white">Mediación</div>
                                <div className="text-sm text-gray-400 font-light">Proceso de mediación vinculante</div>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="bg-gray-700 p-1 rounded">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                              <div>
                                <div className="font-light text-white">Arbitraje</div>
                                <div className="text-sm text-gray-400 font-light">Arbitraje final en San Francisco, CA</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                      <div className="flex items-start space-x-4">
                        <Clock className="w-6 h-6 text-white mt-1" />
                        <div>
                          <h4 className="font-light text-white mb-2">Vigencia y Actualizaciones</h4>
                          <p className="text-gray-300 mb-2 font-light">
                            Estos términos de servicio entran en vigencia el 26 de agosto de 2025 y se actualizan periódicamente. Los cambios significativos se notificarán con 30 días de anticipación.
                          </p>
                          <div className="text-sm text-gray-400 font-light">
                            Versión 1.0 - Última actualización: agosto 2025
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
  const navigationItems = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/docs', label: 'Documentación', icon: BookOpen },
    { href: '/faq', label: 'FAQ', icon: CheckCircle },
    { href: '/privacy', label: 'Política de Privacidad', icon: Lock },
  ];

  return (
    <footer className="py-20 bg-black">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Logo section */}
          <div className="md:col-span-1">
            <Image 
              src="/images/nora.png" 
              alt="NORA Logo" 
              width={80} // Approximate width based on h-20 w-auto
              height={80} 
              className="mb-4"
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

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm font-light">
              © 2025 NURA Technologies. Todos los derechos reservados.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors text-sm font-light"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

// Main component
const NuroTermsPage: React.FC = () => {
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
        <TermsContent />
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

export default NuroTermsPage;