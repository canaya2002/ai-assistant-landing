"use client";
import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Gavel, AlertTriangle, CheckCircle, Home, Mail, Clock, Scale, BookOpen, UserCheck, Zap, Lock, Award, ArrowUp, Sparkles } from 'lucide-react';

// Configuration
const CONFIG = {
  VERSION: '1.0.0',
  DOWNLOAD_URL: 'https://github.com/canaya2002/ai-assistant-professional/releases/download/v1.0.0/AI.Assistant.Professional.Setup.1.0.0.exe',
};

// Types
interface IconProps {
  className?: string;
}

type LucideIcon = React.ComponentType<IconProps>;

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

// Memoized StatCard Component
const StatCard = memo<StatCardProps>(({ icon: Icon, title, description }) => (
  <div className="text-center transition-all duration-500 hover:scale-105 group cursor-pointer bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-cyan-50/80 backdrop-blur-lg rounded-xl border border-blue-200/50 p-6 shadow-lg hover:shadow-blue-500/30">
    <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-full shadow-md group-hover:shadow-lg border border-blue-300/30 group-hover:border-purple-400/50 transition-all duration-500">
      <Icon className="w-6 h-6 text-blue-600 group-hover:text-purple-600 animate-floatSpin" />
    </div>
    <div className="font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">{title}</div>
    <div className="text-xs text-gray-600">{description}</div>
  </div>
));

StatCard.displayName = 'StatCard';

const NuroTermsPage = () => {
  const [activeSection, setActiveSection] = useState<string | null>('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth > 768) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      let currentSection: string | null = '';
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          currentSection = section.getAttribute('data-section');
        }
      });
      
      setActiveSection(currentSection);
    };

    const timeInterval = setInterval(() => {
      setTime(prev => prev + 1);
    }, 50);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timeInterval);
    };
  }, []);

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

  const navigationItems = [
    { href: '/', label: 'Inicio' },
    { href: '/docs', label: 'Documentación' },
    { href: '/faq', label: 'FAQ' },
    { href: '/privacy', label: 'Privacidad' },
  ];

  return (
    <>
      <head>
        <title>Términos de Servicio - NURO | Condiciones de Uso Legal</title>
        <meta name="description" content="Términos de servicio y condiciones de uso de NURO. Conoce tus derechos y responsabilidades al usar nuestro asistente de IA profesional." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://nuro-ai.com/terms" />
      </head>

      <div className="min-h-screen bg-white text-gray-900 overflow-hidden relative">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-cyan-50/30 animate-gradientFlow" style={{ animationDuration: '15s' }}></div>
          
          <div className="absolute inset-0 opacity-5" 
               style={{
                 backgroundImage: `
                   linear-gradient(to right, #3b82f6 1px, transparent 1px),
                   linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
                 `,
                 backgroundSize: '30px 30px',
                 animation: 'gridFloat 8s ease-in-out infinite',
                 transform: `translate(${Math.sin(time * 0.005) * 2}px, ${Math.cos(time * 0.007) * 2}px)`
               }}>
          </div>
          
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-gentleFloat"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${1 + Math.random() * 4}px`,
                height: `${1 + Math.random() * 4}px`,
                background: `linear-gradient(45deg, ${['#3b82f6', '#8b5cf6', '#06b6d4'][Math.floor(Math.random() * 3)]}, transparent)`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${4 + Math.random() * 6}s`,
                opacity: 0.4,
                boxShadow: `0 0 10px ${['#3b82f6', '#8b5cf6', '#06b6d4'][Math.floor(Math.random() * 3)]}`
              }}
            />
          ))}
          
          <div className="absolute inset-0 opacity-10">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute border border-blue-400 animate-holoRing"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  width: `${50 + Math.random() * 100}px`,
                  height: `${50 + Math.random() * 100}px`,
                  borderRadius: '50%',
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          
          <div className="absolute inset-0 opacity-5 font-mono text-xs text-blue-600 overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-matrixCode"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-20px`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${8 + Math.random() * 4}s`
                }}
              >
                {Array.from({length: 25}, () => Math.random().toString(36)[2] || '0').join('')}
              </div>
            ))}
          </div>
          
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 animate-circuitPulse"
                style={{
                  left: `${Math.random() * 90}%`,
                  top: `${Math.random() * 90}%`,
                  width: `${20 + Math.random() * 100}px`,
                  height: '1px',
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>
          
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute border border-blue-300/30 rounded-full animate-radialPulse"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  width: '10px',
                  height: '10px',
                  animationDelay: `${i * 0.8}s`,
                  animationDuration: '4s'
                }}
              />
            ))}
          </div>
          
          <div className="absolute inset-0 opacity-5">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute border border-purple-400 animate-hexSpin"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${10 + Math.random() * 30}px`,
                  height: `${10 + Math.random() * 30}px`,
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${6 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>
          
          <div 
            className="absolute w-96 h-96 rounded-full opacity-5 pointer-events-none transition-all duration-300 ease-out"
            style={{
              left: mousePosition.x - 192,
              top: mousePosition.y - 192,
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 70%)',
              animation: 'pulseGentle 4s ease-in-out infinite'
            }}
          ></div>
          
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-gradient-to-r from-transparent via-blue-400/20 to-transparent h-px animate-energyWave"
                style={{
                  left: 0,
                  top: `${(i * 15) % 100}%`,
                  width: '100%',
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Header */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-blue-200/50 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-24">
              <Link href="/" className="flex items-center group">
                <div className="relative">
                  <Image 
                    src="/images/nurologo.png" 
                    alt="NURO Logo" 
                    width={32} 
                    height={32} 
                    className="w-8 h-8 group-hover:scale-110 transition-all duration-500 animate-subtleGlow"
                    priority 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </Link>

              <div className="hidden lg:flex items-center space-x-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent transition-all duration-300 relative group"
                  >
                    {item.label}
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
                  </Link>
                ))}
                <button
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-500 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-purple-400/50 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                  <span className="relative">Descargar</span>
                </button>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-blue-50 transition-all duration-300"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <ArrowUp className="w-5 h-5 text-gray-600" /> : <ArrowUp className="w-5 h-5 text-gray-600 transform rotate-180" />}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-blue-200/50 animate-slideDown">
                <div className="container mx-auto px-4 py-4">
                  <div className="space-y-3">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent transition-all py-2"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        handleDownload();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-500"
                    >
                      Descargar NURO
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-cyan-50/80 backdrop-blur-lg pt-32 pb-12 sm:pt-40 sm:pb-20" data-parallax>
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-cyan-50/80 backdrop-blur-lg px-6 py-2 rounded-full text-sm font-semibold text-gray-700 mb-8 shadow-sm border border-blue-200/50 animate-slideUp">
                <span>Términos Legales</span>
                <Sparkles className="w-4 h-4 text-blue-600 animate-floatSpin" />
              </div>

              <div className="relative mb-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6 animate-solarFlare leading-tight relative transform-gpu">
                  Términos de Servicio
                </h1>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 blur-xl animate-pulseGentle opacity-50"></div>
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scanLine top-1/4"></div>
                  <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-scanLine top-2/4" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scanLine top-3/4" style={{ animationDelay: '1s' }}></div>
                </div>
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-blue-400 rounded-full animate-orbitText"
                      style={{
                        left: `${30 + Math.cos(i * 30 * Math.PI / 180) * 40}%`,
                        top: `${50 + Math.sin(i * 30 * Math.PI / 180) * 30}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '4s'
                      }}
                    />
                  ))}
                </div>
              </div>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed mb-8 sm:mb-12 max-w-3xl mx-auto">
                Estos términos establecen las reglas para el uso de NURO y definen los derechos y responsabilidades entre tú y NURO Technologies.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
                <StatCard icon={Scale} title="Uso Justo" description="Condiciones equilibradas" />
                <StatCard icon={Shield} title="Protección Legal" description="Derechos garantizados" />
                <StatCard icon={CheckCircle} title="Transparencia" description="Términos claros" />
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 scroll-mt-28">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Sidebar Navigation */}
              <div className="lg:w-1/4">
                <div className="sticky top-28 bg-white/95 backdrop-blur-lg rounded-3xl border border-blue-200/50 p-6 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                  <h3 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-subtleGlow">Contenido</h3>
                  <nav className="space-y-2">
                    {sections.map((section, index) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 group relative animate-slideUp ${
                          activeSection === section.id
                            ? 'bg-gradient-to-r from-blue-50/80 to-purple-50/80 border-l-4 border-blue-500 text-blue-700'
                            : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-purple-50/80'
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                        <section.icon className="w-4 h-4 flex-shrink-0 text-blue-600 group-hover:text-purple-600 animate-floatSpin" />
                        <span className="text-sm font-medium">{section.title}</span>
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
                    <div className="bg-white/95 backdrop-blur-lg rounded-3xl border border-blue-200/50 p-8 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                          <UserCheck className="w-6 h-6 text-white animate-floatSpin" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">Aceptación de Términos</h2>
                      </div>

                      <div className="space-y-8">
                        <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Consentimiento Informado</h3>
                          <p className="text-gray-600 leading-relaxed mb-4">
                            Al descargar, instalar o usar NURO, aceptas estar legalmente vinculado por estos términos de servicio. Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestro software.
                          </p>
                          <div className="bg-white/95 backdrop-blur-lg p-4 rounded-xl border border-blue-200/50">
                            <h4 className="font-bold text-gray-900 mb-2">Requisitos de Aceptación:</h4>
                            <ul className="text-sm text-gray-600 space-y-2">
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Tener al menos 18 años o consentimiento parental</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Capacidad legal para celebrar contratos</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Cumplimiento con las leyes locales aplicables</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Comprensión de los términos en su totalidad</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50/80 to-cyan-50/80 p-6 rounded-2xl border border-purple-200/50">
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Clock className="w-5 h-5 text-blue-600 mr-2 animate-floatSpin" />
                            Modificaciones de Términos
                          </h3>
                          <p className="text-gray-600 leading-relaxed mb-4">
                            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios significativos se notificarán con al menos 30 días de anticipación.
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-emerald-600">
                            <CheckCircle className="w-4 h-4 animate-floatSpin" />
                            <span>Notificación previa de 30 días para cambios importantes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Licencia de Uso */}
                  <section data-section="licencia" id="licencia" className="scroll-mt-28">
                    <div className="bg-white/95 backdrop-blur-lg rounded-3xl border border-blue-200/50 p-8 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                          <BookOpen className="w-6 h-6 text-white animate-floatSpin" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">Licencia de Uso</h2>
                      </div>

                      <div className="space-y-8">
                        <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Licencia Otorgada</h3>
                          <p className="text-gray-600 leading-relaxed mb-4">
                            NURO Technologies te otorga una licencia personal, no exclusiva, no transferible y revocable para usar NURO de acuerdo con estos términos.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/95 backdrop-blur-lg p-4 rounded-xl border border-blue-200/50">
                              <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                                <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 animate-floatSpin" />
                                Permitido
                              </h4>
                              <ul className="text-sm text-gray-600 space-y-2">
                                <li className="flex items-start space-x-3">
                                  <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>Uso personal y comercial</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                  <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>Instalación en múltiples dispositivos</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                  <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>Creación de copias de seguridad</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                  <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>Configuración y personalización</span>
                                </li>
                              </ul>
                            </div>
                            <div className="bg-gradient-to-r from-red-50/80 to-pink-50/80 p-4 rounded-xl border border-red-200/50">
                              <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                                <AlertTriangle className="w-4 h-4 text-red-600 mr-2 animate-floatSpin" />
                                Prohibido
                              </h4>
                              <ul className="text-sm text-gray-600 space-y-2">
                                <li className="flex items-start space-x-3">
                                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>Redistribución o reventa</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>Ingeniería inversa</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>Modificación del código fuente</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <span>Uso para entrenar otros modelos de IA</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Tipos de Licencia</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/95 backdrop-blur-lg p-4 rounded-xl border border-blue-200/50">
                              <h4 className="font-bold text-gray-900 mb-2">Licencia Gratuita</h4>
                              <p className="text-sm text-gray-600 mb-2">Para uso personal y pequeñas empresas</p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                  <span>10 análisis mensuales</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                  <span>Funciones básicas</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                  <span>Soporte comunitario</span>
                                </li>
                              </ul>
                            </div>
                            <div className="bg-gradient-to-r from-blue-100/80 to-purple-100/80 p-4 rounded-xl border border-blue-200/50">
                              <h4 className="font-bold text-gray-900 mb-2">Licencia Profesional</h4>
                              <p className="text-sm text-gray-600 mb-2">Para uso comercial avanzado</p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                  <span>500 análisis mensuales</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                  <span>Funciones premium</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                  <span>Soporte prioritario 24/7</span>
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
                    <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-lg rounded-3xl border border-blue-200/50 p-8 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                          <Shield className="w-6 h-6 text-white animate-floatSpin" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">Responsabilidades del Usuario</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Uso Apropiado</h3>
                          <ul className="space-y-3">
                            <li className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5 animate-floatSpin" />
                              <span className="text-gray-600">Usar NURO de acuerdo con las leyes aplicables</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5 animate-floatSpin" />
                              <span className="text-gray-600">Mantener la confidencialidad de datos sensibles</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5 animate-floatSpin" />
                              <span className="text-gray-600">Reportar bugs y vulnerabilidades de seguridad</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5 animate-floatSpin" />
                              <span className="text-gray-600">Mantener el software actualizado</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Responsabilidad de Contenido</h3>
                          <p className="text-gray-600 mb-4">
                            Eres responsable del contenido que procesas a través de NURO. Debes asegurarte de:
                          </p>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Tener autorización para procesar datos de terceros</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Cumplir con regulaciones de privacidad (GDPR, CCPA)</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>No procesar contenido ilegal o malicioso</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Respetar derechos de propiedad intelectual</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Seguridad del Sistema</h3>
                          <p className="text-gray-600 mb-4">
                            Debes implementar medidas de seguridad apropiadas:
                          </p>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Proteger credenciales de acceso</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Usar antivirus actualizado</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Mantener backups regulares</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Configurar firewall adecuadamente</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Uso Comercial</h3>
                          <p className="text-gray-600 mb-4">
                            Para uso comercial, se requieren consideraciones adicionales:
                          </p>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Licencia comercial apropiada</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Capacitación del personal</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Políticas de uso interno</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Auditorías de cumplimiento</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Restricciones de Uso */}
                  <section data-section="restricciones" id="restricciones" className="scroll-mt-28">
                    <div className="bg-white/95 backdrop-blur-lg rounded-3xl border border-blue-200/50 p-8 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                          <AlertTriangle className="w-6 h-6 text-white animate-floatSpin" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">Restricciones de Uso</h2>
                      </div>

                      <div className="bg-gradient-to-r from-red-50/80 to-pink-50/80 p-6 rounded-2xl border border-red-200/50 mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                          <AlertTriangle className="w-5 h-5 text-red-600 mr-2 animate-floatSpin" />
                          Actividades Prohibidas
                        </h3>
                        <p className="text-gray-600 mb-4">
                          El siguiente uso de NURO está estrictamente prohibido y resultará en la terminación inmediata de la licencia:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-red-50/80 to-pink-50/80 p-4 rounded-xl border border-red-200/50">
                            <h4 className="font-bold text-gray-900 mb-2">Actividades Ilegales</h4>
                            <ul className="text-sm text-gray-600 space-y-2">
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Procesamiento de contenido ilegal</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Violación de derechos de autor</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Fraude o engaño</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Actividades terroristas o criminales</span>
                              </li>
                            </ul>
                          </div>

                          <div className="bg-gradient-to-r from-orange-50/80 to-yellow-50/80 p-4 rounded-xl border border-orange-200/50">
                            <h4 className="font-bold text-gray-900 mb-2">Abuso Técnico</h4>
                            <ul className="text-sm text-gray-600 space-y-2">
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Ingeniería inversa del software</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Bypass de limitaciones de uso</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Ataques de denegación de servicio</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Extracción de modelos de IA</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-purple-50/80 to-cyan-50/80 p-4 rounded-xl border border-purple-200/50">
                            <h4 className="font-bold text-gray-900 mb-2">Contenido Restringido</h4>
                            <ul className="text-sm text-gray-600 space-y-2">
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Contenido que promueva odio</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Material sexualmente explícito</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Información de menores sin consentimiento</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Datos médicos sin autorización</span>
                              </li>
                            </ul>
                          </div>

                          <div className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 p-4 rounded-xl border border-blue-200/50">
                            <h4 className="font-bold text-gray-900 mb-2">Uso Comercial Restringido</h4>
                            <ul className="text-sm text-gray-600 space-y-2">
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Reventa sin autorización</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Integración en productos competidores</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Ofertas de servicios basados en NURO</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Uso para entrenar IA competidora</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-6 rounded-2xl border border-blue-200/50">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Consecuencias del Incumplimiento</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="bg-gradient-to-r from-yellow-50/80 to-orange-50/80 p-3 rounded-xl mb-3 border border-yellow-200/50">
                              <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto animate-floatSpin" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">Primera Violación</h4>
                            <p className="text-sm text-gray-600">Advertencia formal y suspensión temporal</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-gradient-to-r from-orange-50/80 to-red-50/80 p-3 rounded-xl mb-3 border border-orange-200/50">
                              <Shield className="w-6 h-6 text-orange-600 mx-auto animate-floatSpin" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">Violación Repetida</h4>
                            <p className="text-sm text-gray-600">Suspensión extendida y revisión legal</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-gradient-to-r from-red-50/80 to-pink-50/80 p-3 rounded-xl mb-3 border border-red-200/50">
                              <Zap className="w-6 h-6 text-red-600 mx-auto animate-floatSpin" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">Violación Grave</h4>
                            <p className="text-sm text-gray-600">Terminación inmediata y acciones legales</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Propiedad Intelectual */}
                  <section data-section="propiedad" id="propiedad" className="scroll-mt-28">
                    <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-lg rounded-3xl border border-blue-200/50 p-8 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                          <Award className="w-6 h-6 text-white animate-floatSpin" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">Propiedad Intelectual</h2>
                      </div>

                      <div className="space-y-8">
                        <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Derechos de NURO Technologies</h3>
                          <p className="text-gray-600 mb-6">
                            NURO Technologies es propietario de todos los derechos, títulos e intereses en y para NURO, incluyendo:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-bold text-gray-900 mb-3">Software y Tecnología</h4>
                              <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                  <span>Código fuente y binarios</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                  <span>Algoritmos de IA y modelos entrenados</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                  <span>Arquitectura y diseño de software</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                  <span>Actualizaciones y mejoras</span>
                                </li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 mb-3">Marcas y Contenido</h4>
                              <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                  <span>Marca registrada &quot;NURO&quot;</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                  <span>Logotipos e identidad visual</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                  <span>Documentación y manuales</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                  <span>Material de marketing</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Tus Derechos sobre el Contenido</h3>
                          <p className="text-gray-600 mb-4">
                            Mantienes la propiedad completa del contenido que procesas a través de NURO:
                          </p>
                          <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 p-4 rounded-xl border border-emerald-200/50">
                            <ul className="space-y-2 text-sm text-gray-600">
                              <li className="flex items-center space-x-2">
                                <Lock className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                <span>Tus datos permanecen bajo tu control exclusivo</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <Lock className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                <span>No reclamamos derechos sobre tu contenido procesado</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <Lock className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                <span>Puedes exportar tus datos en cualquier momento</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <Lock className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                <span>Procesamiento local garantiza tu privacidad</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Reportes de Infracción</h3>
                          <p className="text-gray-600 mb-4">
                            Si crees que tu propiedad intelectual ha sido infringida, contacta inmediatamente a:
                          </p>
                          <div className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 p-4 rounded-xl border border-blue-200/50">
                            <div className="flex items-center space-x-2 mb-2">
                              <Mail className="w-4 h-4 text-blue-600 animate-floatSpin" />
                              <span className="text-sm font-medium text-blue-600">legal@nuro-technologies.com</span>
                            </div>
                            <p className="text-xs text-gray-600">
                              Incluye toda la información relevante para acelerar la investigación
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Limitaciones */}
                  <section data-section="limitaciones" id="limitaciones" className="scroll-mt-28">
                    <div className="bg-white/95 backdrop-blur-lg rounded-3xl border border-blue-200/50 p-8 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                          <Scale className="w-6 h-6 text-white animate-floatSpin" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">Limitaciones de Responsabilidad</h2>
                      </div>

                      <div className="space-y-8">
                        <div className="bg-gradient-to-r from-yellow-50/80 to-orange-50/80 p-6 rounded-2xl border border-yellow-200/50">
                          <div className="flex items-center space-x-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-amber-600 animate-floatSpin" />
                            <h3 className="text-xl font-bold text-gray-900">Exención de Garantías</h3>
                          </div>
                          <p className="text-gray-600 mb-4">
                            NURO se proporciona &quot;tal como está&quot; y &quot;según disponibilidad&quot;. No garantizamos que:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ul className="space-y-2 text-sm text-gray-600">
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>El software esté libre de errores</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Funcione ininterrumpidamente</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Sea compatible con todo hardware</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Los resultados sean 100% precisos</span>
                              </li>
                            </ul>
                            <ul className="space-y-2 text-sm text-gray-600">
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Sea adecuado para usos específicos</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>No contenga vulnerabilidades</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Cumpla con todas las regulaciones</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Genere resultados comercialmente viables</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gradient-to-r from-red-50/80 to-pink-50/80 p-6 rounded-2xl border border-red-200/50">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Limitación de Daños</h3>
                            <p className="text-gray-600 text-sm mb-4">
                              En ningún caso NURO Technologies será responsable por:
                            </p>
                            <ul className="space-y-2 text-xs text-gray-600">
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Daños indirectos o consecuenciales</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Pérdida de beneficios o ingresos</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Pérdida de datos o información</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Interrupción del negocio</span>
                              </li>
                              <li className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span>Daños punitivos o ejemplares</span>
                              </li>
                            </ul>
                          </div>

                          <div className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 p-6 rounded-2xl border border-blue-200/50">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Límite Máximo</h3>
                            <p className="text-gray-600 text-sm mb-4">
                              La responsabilidad total de NURO Technologies está limitada a:
                            </p>
                            <div className="bg-white/95 backdrop-blur-lg p-4 rounded-xl border border-blue-200/50">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600 animate-subtleGlow">$100 USD</div>
                                <div className="text-xs text-gray-600">o el monto pagado en los últimos 12 meses, lo que sea mayor</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 p-6 rounded-2xl border border-emerald-200/50">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Nuestro Compromiso</h3>
                          <p className="text-gray-600 mb-4">
                            Aunque limitamos nuestra responsabilidad legal, nos comprometemos a:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ul className="space-y-2 text-sm text-gray-600">
                              <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                <span>Proporcionar soporte técnico responsivo</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                <span>Corregir errores críticos rápidamente</span>
                              </li>
                            </ul>
                            <ul className="space-y-2 text-sm text-gray-600">
                              <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                <span>Mantener altos estándares de calidad</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                                <span>Comunicar cambios importantes</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Terminación */}
                  <section data-section="terminacion" id="terminacion" className="scroll-mt-28">
                    <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-lg rounded-3xl border border-blue-200/50 p-8 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                          <Zap className="w-6 h-6 text-white animate-floatSpin" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">Terminación del Acuerdo</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Terminación por tu Parte</h3>
                          <p className="text-gray-600 mb-4">Puedes terminar este acuerdo en cualquier momento:</p>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                              <span>Desinstalando NURO de todos tus dispositivos</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                              <span>Eliminando todas las copias del software</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-emerald-600 animate-floatSpin" />
                              <span>Dejando de usar nuestros servicios</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Terminación por Nuestra Parte</h3>
                          <p className="text-gray-600 mb-4">Podemos terminar tu licencia si:</p>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center space-x-2">
                              <AlertTriangle className="w-4 h-4 text-red-600 animate-floatSpin" />
                              <span>Violas estos términos de servicio</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <AlertTriangle className="w-4 h-4 text-red-600 animate-floatSpin" />
                              <span>Usas el software para actividades ilegales</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <AlertTriangle className="w-4 h-4 text-red-600 animate-floatSpin" />
                              <span>Intentas evadir limitaciones técnicas</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Efectos de la Terminación</h3>
                          <p className="text-gray-600 mb-4">Al terminarse el acuerdo:</p>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Cesará inmediatamente tu derecho de uso</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Debes eliminar todas las copias del software</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Los datos locales permanecerán en tu dispositivo</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Las secciones de limitación seguirán vigentes</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Supervivencia de Términos</h3>
                          <p className="text-gray-600 mb-4">Después de la terminación, seguirán vigentes:</p>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Limitaciones de responsabilidad</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Derechos de propiedad intelectual</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Obligaciones de confidencialidad</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Cláusulas de resolución de disputas</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Contacto Legal */}
                  <section data-section="contacto" id="contacto" className="scroll-mt-28">
                    <div className="bg-white/95 backdrop-blur-lg rounded-3xl border border-blue-200/50 p-8 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                          <Mail className="w-6 h-6 text-white animate-floatSpin" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">Contacto Legal</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-6">Información Legal</h3>
                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-4 rounded-xl border border-blue-200/50">
                              <h4 className="font-bold text-gray-900 mb-2">NURO Technologies, Inc.</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>1234 Innovation Drive</p>
                                <p>San Francisco, CA 94105</p>
                                <p>Estados Unidos</p>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50/80 to-cyan-50/80 p-4 rounded-xl border border-purple-200/50">
                              <h4 className="font-bold text-gray-900 mb-2">Departamento Legal</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>Email: legal@nuro-technologies.com</p>
                                <p>Teléfono: +1 (555) 123-4567</p>
                                <p>Fax: +1 (555) 123-4568</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-6">Jurisdicción y Ley Aplicable</h3>
                          <div className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 p-6 rounded-2xl border border-blue-200/50">
                            <h4 className="font-bold text-gray-900 mb-4">Ley Aplicable</h4>
                            <p className="text-gray-600 mb-4">
                              Estos términos se rigen por las leyes del Estado de California, Estados Unidos, sin considerar sus principios de conflicto de leyes.
                            </p>
                            
                            <h4 className="font-bold text-gray-900 mb-4">Resolución de Disputas</h4>
                            <div className="space-y-3">
                              <div className="flex items-start space-x-3">
                                <div className="bg-blue-100/80 p-1 rounded">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">Negociación Directa</div>
                                  <div className="text-sm text-gray-600">Primer intento de resolución amistosa</div>
                                </div>
                              </div>
                              <div className="flex items-start space-x-3">
                                <div className="bg-purple-100/80 p-1 rounded">
                                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">Mediación</div>
                                  <div className="text-sm text-gray-600">Proceso de mediación vinculante</div>
                                </div>
                              </div>
                              <div className="flex items-start space-x-3">
                                <div className="bg-red-100/80 p-1 rounded">
                                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">Arbitraje</div>
                                  <div className="text-sm text-gray-600">Arbitraje final en San Francisco, CA</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-6 rounded-2xl border border-blue-200/50">
                        <div className="flex items-start space-x-4">
                          <Clock className="w-6 h-6 text-blue-600 mt-1 animate-floatSpin" />
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2">Vigencia y Actualizaciones</h4>
                            <p className="text-gray-600 mb-2">
                              Estos términos de servicio entran en vigencia el 26 de agosto de 2025 y se actualizan periódicamente. Los cambios significativos se notificarán con 30 días de anticipación.
                            </p>
                            <div className="text-sm text-blue-600 font-medium animate-subtleGlow">
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

        {/* Footer */}
        <footer className="py-12 sm:py-16 border-t border-blue-200/50 bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-cyan-50/80 backdrop-blur-lg relative z-10">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-8 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Image 
                    src="/images/nurologo.png" 
                    alt="NURO Logo" 
                    width={48} 
                    height={48} 
                    className="w-12 h-12 animate-subtleGlow"
                    priority 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-lg rounded-full opacity-50"></div>
                </div>
                <div>
                  <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">NURO Technologies</div>
                  <div className="text-sm text-gray-600">Inteligencia Artificial Avanzada</div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                <Link href="/" className="text-gray-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent transition-all duration-300 flex items-center space-x-1">
                  <Home className="w-4 h-4 animate-floatSpin" />
                  <span>Inicio</span>
                </Link>
                <Link href="/docs" className="text-gray-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent transition-all duration-300 flex items-center space-x-1">
                  <BookOpen className="w-4 h-4 animate-floatSpin" />
                  <span>Documentación</span>
                </Link>
                <Link href="/faq" className="text-gray-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent transition-all duration-300 flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 animate-floatSpin" />
                  <span>FAQ</span>
                </Link>
                <Link href="/privacy" className="text-gray-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent transition-all duration-300 flex items-center space-x-1">
                  <Lock className="w-4 h-4 animate-floatSpin" />
                  <span>Política de Privacidad</span>
                </Link>
                <div className="text-gray-600 text-sm">
                  © 2025 NURO Technologies. Todos los derechos reservados.
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Download Warning Modal */}
        {showWarning && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-lg border border-blue-200/50">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Advertencia de Descarga</h3>
              <p className="text-gray-600 mb-6">
                Estás a punto de descargar NURO. Asegúrate de que tu sistema cumple con los requisitos mínimos y que confías en la fuente de la descarga.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowWarning(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-purple-50/80 rounded-full transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowWarning(false)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-500"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NuroTermsPage;