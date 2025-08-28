"use client";
import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Lock, Eye, Database, User, FileText, Clock, CheckCircle, AlertTriangle, Home, Mail, Phone, ArrowUp, Sparkles } from 'lucide-react';

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

const NuroPrivacyPage = () => {
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
    { id: 'recopilacion', title: 'Información que Recopilamos', icon: Database },
    { id: 'uso', title: 'Cómo Usamos tu Información', icon: Eye },
    { id: 'procesamiento', title: 'Procesamiento Local', icon: Lock },
    { id: 'seguridad', title: 'Seguridad de Datos', icon: Shield },
    { id: 'derechos', title: 'Tus Derechos', icon: User },
    { id: 'contacto', title: 'Contacto', icon: Mail }
  ];

  const navigationItems = [
    { href: '/', label: 'Inicio' },
    { href: '/docs', label: 'Documentación' },
    { href: '/faq', label: 'FAQ' },
    { href: '/terms', label: 'Términos de Servicio' },
  ];

  return (
    <>
      <head>
        <title>Política de Privacidad - NURO | Protección de Datos Avanzada</title>
        <meta name="description" content="Política de privacidad completa de NURO. Conoce cómo protegemos tu información con procesamiento local y cifrado de extremo a extremo." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://nuro-ai.com/privacy" />
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
                <span>Privacidad y Seguridad</span>
                <Sparkles className="w-4 h-4 text-blue-600 animate-floatSpin" />
              </div>

              <div className="relative mb-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6 animate-solarFlare leading-tight relative transform-gpu">
                  Tu Privacidad es Nuestra Prioridad
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
                NURO está diseñado desde cero con privacidad por diseño. Procesamiento 100% local, 
                cifrado de extremo a extremo y control total sobre tus datos.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
                <StatCard icon={Lock} title="100% Local" description="Sin servidores externos" />
                <StatCard icon={Shield} title="Cifrado AES-256" description="Protección militar" />
                <StatCard icon={User} title="Control Total" description="Tus datos, tus reglas" />
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
                  {/* Información que Recopilamos */}
                  <section data-section="recopilacion" id="recopilacion" className="scroll-mt-28">
                    <div className="bg-white/95 backdrop-blur-lg rounded-3xl border border-blue-200/50 p-8 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                          <Database className="w-6 h-6 text-white animate-floatSpin" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">Información que Recopilamos</h2>
                      </div>

                      <div className="space-y-8">
                        <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <CheckCircle className="w-5 h-5 text-emerald-600 mr-2 animate-floatSpin" />
                            Datos Procesados Localmente
                          </h3>
                          <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span><strong>Contenido de pantalla:</strong> Analizado únicamente en tu dispositivo para generar respuestas contextuales</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span><strong>Preferencias de configuración:</strong> Guardadas localmente para personalizar tu experiencia</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span><strong>Datos de uso:</strong> Estadísticas anónimas para mejorar el rendimiento (solo localmente)</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mr-2 animate-floatSpin" />
                            Lo que NO Recopilamos
                          </h3>
                          <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>No enviamos capturas de pantalla a servidores externos</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>No accedemos a archivos personales sin tu consentimiento</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>No rastreamos tu actividad en línea fuera de NURO</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>No compartimos datos con terceros con fines comerciales</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Cómo Usamos tu Información */}
                  <section data-section="uso" id="uso" className="scroll-mt-28">
                    <div className="bg-white/95 backdrop-blur-lg rounded-3xl border border-blue-200/50 p-8 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                          <Eye className="w-6 h-6 text-white animate-floatSpin" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">Cómo Usamos tu Información</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-subtleGlow">Procesamiento de IA</h3>
                          <p className="text-gray-600 mb-4">
                            Los datos visuales se procesan exclusivamente en tu dispositivo usando nuestros 
                            modelos de IA locales para generar respuestas relevantes y contextualmente precisas.
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-emerald-600">
                            <CheckCircle className="w-4 h-4 animate-floatSpin" />
                            <span>100% procesamiento local</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-subtleGlow">Mejora del Producto</h3>
                          <p className="text-gray-600 mb-4">
                            Utilizamos datos agregados y anonimizados para mejorar la precisión de nuestros 
                            algoritmos y desarrollar nuevas funcionalidades.
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-emerald-600">
                            <CheckCircle className="w-4 h-4 animate-floatSpin" />
                            <span>Datos completamente anónimos</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-subtleGlow">Personalización</h3>
                          <p className="text-gray-600 mb-4">
                            Adaptamos la experiencia según tus preferencias y patrones de uso, 
                            manteniendo toda la información en tu dispositivo local.
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-emerald-600">
                            <CheckCircle className="w-4 h-4 animate-floatSpin" />
                            <span>Configuración local únicamente</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-subtleGlow">Soporte Técnico</h3>
                          <p className="text-gray-600 mb-4">
                            En caso de soporte técnico, solo accedemos a logs de diagnóstico 
                            no identificables y con tu consentimiento explícito.
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-emerald-600">
                            <CheckCircle className="w-4 h-4 animate-floatSpin" />
                            <span>Solo con consentimiento</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Procesamiento Local */}
                  <section data-section="procesamiento" id="procesamiento" className="scroll-mt-28">
                    <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-lg rounded-3xl border border-blue-200/50 p-8 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                          <Lock className="w-6 h-6 text-white animate-floatSpin" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">Procesamiento 100% Local</h2>
                      </div>

                      <div className="bg-white/95 backdrop-blur-lg p-8 rounded-2xl border border-blue-200/50 mb-8">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-subtleGlow">Arquitectura de Privacidad</h3>
                        <div className="space-y-6">
                          <div className="flex items-start space-x-4 group">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Database className="w-5 h-5 text-blue-600 animate-floatSpin" />
                            </div>
                            <div>
                              <h4 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">Modelos de IA Locales</h4>
                              <p className="text-gray-600">
                                Todos los modelos de inteligencia artificial ejecutan directamente en tu dispositivo. 
                                No requieren conexión a internet para el análisis básico.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-4 group">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Lock className="w-5 h-5 text-blue-600 animate-floatSpin" />
                            </div>
                            <div>
                              <h4 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">Cifrado en Reposo</h4>
                              <p className="text-gray-600">
                                Todos los datos almacenados localmente están cifrados usando AES-256, 
                                incluyendo configuraciones, caché y datos temporales.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-4 group">
                            <div className="bg-purple-100 p-2 rounded-lg">
                              <Shield className="w-5 h-5 text-purple-600 animate-floatSpin" />
                            </div>
                            <div>
                              <h4 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">Memoria Segura</h4>
                              <p className="text-gray-600">
                                Los datos en memoria se borran automáticamente al cerrar la aplicación. 
                                No quedan rastros de información sensible en el sistema.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-100/80 to-purple-100/80 p-6 rounded-2xl">
                        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-subtleGlow">Garantías de Privacidad</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-emerald-600 animate-floatSpin" />
                            <span className="text-gray-600">Cero transmisión de datos personales</span>
                          </li>
                          <li className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-emerald-600 animate-floatSpin" />
                            <span className="text-gray-600">Funcionamiento offline completo</span>
                          </li>
                          <li className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-emerald-600 animate-floatSpin" />
                            <span className="text-gray-600">Auditoría de código abierto disponible</span>
                          </li>
                          <li className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-emerald-600 animate-floatSpin" />
                            <span className="text-gray-600">Certificación independiente de seguridad</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Seguridad de Datos */}
                  <section data-section="seguridad" id="seguridad" className="scroll-mt-28">
                    <div className="bg-white/95 backdrop-blur-lg rounded-3xl border border-blue-200/50 p-8 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                          <Shield className="w-6 h-6 text-white animate-floatSpin" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">Seguridad de Datos</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-subtleGlow">Medidas de Protección</h3>
                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-4 rounded-xl border border-blue-200/50">
                              <h4 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">Cifrado de Extremo a Extremo</h4>
                              <p className="text-sm text-gray-600">AES-256 para todos los datos almacenados y RSA-4096 para comunicaciones</p>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-4 rounded-xl border border-blue-200/50">
                              <h4 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">Autenticación Multifactor</h4>
                              <p className="text-sm text-gray-600">Opciones biométricas y tokens de seguridad para funciones avanzadas</p>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-4 rounded-xl border border-blue-200/50">
                              <h4 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">Auditorías de Seguridad</h4>
                              <p className="text-sm text-gray-600">Evaluaciones trimestrales por firmas de ciberseguridad independientes</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-subtleGlow">Certificaciones</h3>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-xl border border-blue-200/50">
                              <CheckCircle className="w-6 h-6 text-emerald-600 animate-floatSpin" />
                              <div>
                                <div className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">SOC 2 Type II</div>
                                <div className="text-sm text-gray-600">Controles de seguridad auditados</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-xl border border-blue-200/50">
                              <CheckCircle className="w-6 h-6 text-emerald-600 animate-floatSpin" />
                              <div>
                                <div className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">ISO 27001</div>
                                <div className="text-sm text-gray-600">Gestión de seguridad de la información</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-xl border border-blue-200/50">
                              <CheckCircle className="w-6 h-6 text-emerald-600 animate-floatSpin" />
                              <div>
                                <div className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">GDPR Compliant</div>
                                <div className="text-sm text-gray-600">Cumplimiento total con RGPD</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Tus Derechos */}
                  <section data-section="derechos" id="derechos" className="scroll-mt-28">
                    <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-lg rounded-3xl border border-blue-200/50 p-8 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                          <User className="w-6 h-6 text-white animate-floatSpin" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">Tus Derechos de Privacidad</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-subtleGlow">Derecho de Acceso</h3>
                          <p className="text-gray-600 mb-4">
                            Tienes derecho a saber qué información personal procesamos y cómo la utilizamos.
                          </p>
                          <div className="text-sm text-blue-600 font-medium animate-subtleGlow">
                            Respuesta en menos de 48 horas
                          </div>
                        </div>

                        <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-subtleGlow">Derecho de Rectificación</h3>
                          <p className="text-gray-600 mb-4">
                            Puedes solicitar la corrección de cualquier información personal inexacta o incompleta.
                          </p>
                          <div className="text-sm text-blue-600 font-medium animate-subtleGlow">
                            Corrección inmediata
                          </div>
                        </div>

                        <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-subtleGlow">Derecho de Eliminación</h3>
                          <p className="text-gray-600 mb-4">
                            Tienes el derecho a solicitar la eliminación de tus datos personales bajo ciertas condiciones.
                          </p>
                          <div className="text-sm text-blue-600 font-medium animate-subtleGlow">
                            Eliminación en 24 horas
                          </div>
                        </div>

                        <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50">
                          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-subtleGlow">Derecho de Portabilidad</h3>
                          <p className="text-gray-600 mb-4">
                            Puedes solicitar una copia de tus datos personales en un formato estructurado y legible.
                          </p>
                          <div className="text-sm text-blue-600 font-medium animate-subtleGlow">
                            Exportación JSON/CSV
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50">
                        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-subtleGlow">Cómo Ejercer tus Derechos</h3>
                        <p className="text-gray-600 mb-4">
                          Para ejercer cualquiera de estos derechos, contáctanos a través de los medios proporcionados 
                          en la sección de contacto. Procesamos todas las solicitudes de manera gratuita y sin demoras innecesarias.
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-blue-600">
                          <Mail className="w-4 h-4 animate-floatSpin" />
                          <span>privacy@nuro-technologies.com</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Contacto */}
                  <section data-section="contacto" id="contacto" className="scroll-mt-28">
                    <div className="bg-white/95 backdrop-blur-lg rounded-3xl border border-blue-200/50 p-8 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                          <Mail className="w-6 h-6 text-white animate-floatSpin" />
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">Contacto y Soporte</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-subtleGlow">Oficial de Protección de Datos</h3>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Mail className="w-5 h-5 text-blue-600 animate-floatSpin" />
                              <div>
                                <div className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">privacy@nuro-technologies.com</div>
                                <div className="text-sm text-gray-600">Para consultas sobre privacidad</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Phone className="w-5 h-5 text-emerald-600 animate-floatSpin" />
                              <div>
                                <div className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">+1 (555) 123-4567</div>
                                <div className="text-sm text-gray-600">Soporte telefónico 24/7</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-subtleGlow">Tiempos de Respuesta</h3>
                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-4 rounded-xl border border-blue-200/50">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">Consultas de privacidad</span>
                                <span className="text-blue-600 font-bold animate-subtleGlow">48 horas</span>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-4 rounded-xl border border-blue-200/50">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">Solicitudes de datos</span>
                                <span className="text-blue-600 font-bold animate-subtleGlow">72 horas</span>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-4 rounded-xl border border-blue-200/50">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">Soporte técnico</span>
                                <span className="text-blue-600 font-bold animate-subtleGlow">24 horas</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-6 rounded-2xl border border-blue-200/50">
                        <div className="flex items-start space-x-4">
                          <Clock className="w-6 h-6 text-blue-600 mt-1 animate-floatSpin" />
                          <div>
                            <h4 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">Última Actualización</h4>
                            <p className="text-gray-600 mb-2">
                              Esta política de privacidad fue actualizada por última vez el 26 de agosto de 2025. 
                              Notificaremos sobre cambios significativos con al menos 30 días de anticipación.
                            </p>
                            <div className="text-sm text-blue-600 font-medium animate-subtleGlow">
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

        {/* Footer */}
        <footer className="py-12 sm:py-16 border-t border-blue-200/50 bg-white relative z-10">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-8 lg:space-y-0">
              <div className="flex items-center space-x-4 group">
                <div className="relative">
                  <Image src="/images/nurologo.png" alt="NURO" width={32} height={32} className="w-8 h-8 group-hover:scale-110 transition-all duration-500 animate-subtleGlow" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div>
                  <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">NURO Technologies</div>
                  <div className="text-xs text-gray-600">Inteligencia Artificial Avanzada</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-gray-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent transition-all text-sm relative group"
                  >
                    <span>{item.label}</span>
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
                  </Link>
                ))}
                <div className="text-gray-500 text-xs sm:text-sm">
                  © 2025 NURO Technologies. Todos los derechos reservados.
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Warning Modal */}
        {showWarning && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-lg p-8 rounded-xl max-w-md mx-auto shadow-xl border border-blue-200/50 animate-modalIn">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-amber-500 animate-floatSpin" />
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">Aviso de Seguridad</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Windows puede mostrar una advertencia. NURO es completamente seguro.
              </p>
              <ol className="space-y-3 mb-6 text-sm text-gray-600">
                <li className="flex items-center space-x-3">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-subtleGlow">1</span>
                  <span>Windows muestra: "Windows protegió tu PC"</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-subtleGlow">2</span>
                  <span>Haz clic en "Más información"</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-subtleGlow">3</span>
                  <span>Haz clic en "Ejecutar de todos modos"</span>
                </li>
              </ol>
              <button 
                onClick={() => setShowWarning(false)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-500 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-purple-400/50 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                <span className="relative">Entendido, Continuar</span>
              </button>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes slideUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes subtleGlow {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.1); }
          }
          @keyframes solarFlare {
            0% {
              filter: brightness(1) drop-shadow(0 0 10px #3b82f6) drop-shadow(0 0 20px #8b5cf6);
              text-shadow: 
                0 0 5px #3b82f6,
                0 0 15px #8b5cf6,
                0 0 25px #06b6d4,
                5px 5px 10px rgba(0,0,0,0.3),
                10px 10px 20px rgba(0,0,0,0.2);
              transform: perspective(500px) rotateX(0deg) translateZ(0px);
            }
            25% {
              filter: brightness(1.4) drop-shadow(0 0 20px #8b5cf6) drop-shadow(0 0 30px #06b6d4);
              text-shadow: 
                0 0 10px #8b5cf6,
                0 0 25px #06b6d4,
                0 0 35px #3b82f6,
                6px 6px 12px rgba(0,0,0,0.4),
                12px 12px 24px rgba(0,0,0,0.3);
              transform: perspective(500px) rotateX(2deg) translateZ(5px);
            }
            50% {
              filter: brightness(1.8) drop-shadow(0 0 30px #06b6d4) drop-shadow(0 0 40px #3b82f6);
              text-shadow: 
                0 0 15px #06b6d4,
                0 0 30px #3b82f6,
                0 0 45px #8b5cf6,
                8px 8px 16px rgba(0,0,0,0.5),
                16px 16px 32px rgba(0,0,0,0.4);
              transform: perspective(500px) rotateX(-1deg) translateZ(10px);
            }
            75% {
              filter: brightness(1.4) drop-shadow(0 0 25px #3b82f6) drop-shadow(0 0 35px #8b5cf6);
              text-shadow: 
                0 0 12px #3b82f6,
                0 0 28px #8b5cf6,
                0 0 40px #06b6d4,
                6px 6px 12px rgba(0,0,0,0.4),
                12px 12px 24px rgba(0,0,0,0.3);
              transform: perspective(500px) rotateX(1deg) translateZ(5px);
            }
            100% {
              filter: brightness(1) drop-shadow(0 0 10px #3b82f6) drop-shadow(0 0 20px #8b5cf6);
              text-shadow: 
                0 0 5px #3b82f6,
                0 0 15px #8b5cf6,
                0 0 25px #06b6d4,
                5px 5px 10px rgba(0,0,0,0.3),
                10px 10px 20px rgba(0,0,0,0.2);
              transform: perspective(500px) rotateX(0deg) translateZ(0px);
            }
          }
          @keyframes orbitText {
            0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
            50% { opacity: 1; transform: translate(20px, -10px) scale(1); }
            100% { transform: translate(0, 0) scale(0.5); opacity: 0; }
          }
          @keyframes circuitPulse {
            0%, 100% { opacity: 0.1; transform: scaleX(0); }
            50% { opacity: 0.8; transform: scaleX(1); }
          }
          @keyframes radialPulse {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(15); opacity: 0; }
          }
          @keyframes hexSpin {
            0% { transform: rotate(0deg) scale(0.5); opacity: 0.3; }
            50% { transform: rotate(180deg) scale(1); opacity: 0.7; }
            100% { transform: rotate(360deg) scale(0.5); opacity: 0.3; }
          }
          @keyframes scanLine {
            0% { transform: translateX(-100%); opacity: 0; }
            10%, 90% { opacity: 1; }
            100% { transform: translateX(100%); opacity: 0; }
          }
          @keyframes holoRing {
            0% { transform: scale(0.5) rotate(0deg); opacity: 0; border-width: 2px; }
            50% { transform: scale(1) rotate(180deg); opacity: 0.5; border-width: 1px; }
            100% { transform: scale(1.5) rotate(360deg); opacity: 0; border-width: 0.5px; }
          }
          @keyframes matrixCode {
            0% { transform: translateY(-20px); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
          @keyframes floatSpin {
            0%, 100% { transform: rotateY(0deg) translateY(0px); }
            25% { transform: rotateY(90deg) translateY(-2px); }
            50% { transform: rotateY(180deg) translateY(0px); }
            75% { transform: rotateY(270deg) translateY(-2px); }
          }
          @keyframes gentleFloat {
            0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.3; }
            25% { transform: translateY(-5px) translateX(2px) rotate(90deg); opacity: 0.6; }
            50% { transform: translateY(-10px) translateX(5px) rotate(180deg); opacity: 1; }
            75% { transform: translateY(-5px) translateX(2px) rotate(270deg); opacity: 0.6; }
          }
          @keyframes pulseGentle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.05); }
          }
          @keyframes energyWave {
            0% { transform: translateX(-100%); opacity: 0; }
            10%, 90% { opacity: 0.5; }
            100% { transform: translateX(100%); opacity: 0; }
          }
          @keyframes gradientFlow {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes gridFloat {
            0%, 100% { opacity: 0.05; transform: translate(0, 0); }
            50% { opacity: 0.1; transform: translate(1px, 1px); }
          }
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes slideDown {
            0% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes modalIn {
            0% { opacity: 0; transform: scale(0.9) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-shimmer {
            background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
            background-size: 200% 100%;
            animation: shimmer 2s infinite;
          }
          .hover\:scale-102:hover {
            transform: scale(1.02);
          }
        `}</style>
      </div>
    </>
  );
};

export default NuroPrivacyPage;