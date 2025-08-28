"use client";
import { useState, useEffect, useCallback, memo } from 'react';
import { FileText, Search, Download, Play, Settings, Zap, Eye, MessageSquare, Keyboard, AlertTriangle, Book, CheckCircle, Lightbulb, Code, ExternalLink, Home, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
  value: string;
  label: string;
}

// Memoized StatCard Component
const StatCard = memo<StatCardProps>(({ icon: Icon, value, label }) => (
  <div className="text-center transition-all duration-500 hover:scale-105 group cursor-pointer bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-cyan-50/80 backdrop-blur-lg rounded-xl border border-blue-200/50 p-4 shadow-lg hover:shadow-blue-500/30">
    <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-full shadow-md group-hover:shadow-lg border border-blue-300/30 group-hover:border-purple-400/50 transition-all duration-500">
      <Icon className="w-6 h-6 text-blue-600 group-hover:text-purple-600 animate-floatSpin" />
    </div>
    <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">{value}</div>
    <div className="text-xs text-gray-600">{label}</div>
  </div>
));

StatCard.displayName = 'StatCard';

const DocsClientComponent = () => {
  const [activeSection, setActiveSection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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
      let currentSection = '';
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          currentSection = section.getAttribute('data-section') || '';
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

  const navigationItems = [
    { href: '/', label: 'Inicio' },
    { href: '/faq', label: 'FAQ' },
    { href: '/changelog', label: 'Changelog' },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 relative overflow-hidden">
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

      {/* Navigation */}
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
              {mobileMenuOpen ? <AlertTriangle className="w-5 h-5 text-gray-600" /> : <Book className="w-5 h-5 text-gray-600" />}
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

      {/* Search Hero */}
      <section className="relative z-10 bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-cyan-50/80 backdrop-blur-lg pt-32 pb-12 sm:pt-40 sm:pb-20" data-parallax>
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-cyan-50/80 backdrop-blur-lg px-6 py-2 rounded-full text-sm font-semibold text-gray-700 mb-8 shadow-sm border border-blue-200/50 animate-slideUp">
              <span>Neural AI • Documentación Completa</span>
              <Sparkles className="w-4 h-4 text-blue-600 animate-floatSpin" />
            </div>

            <div className="relative mb-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6 animate-solarFlare leading-tight relative transform-gpu">
                Documentación de NURO
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
              Todo lo que necesitas saber para dominar tu asistente de IA y maximizar tu productividad.
            </p>

            <div className="relative max-w-2xl mx-auto mb-8">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 animate-floatSpin" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en la documentación..."
                className="block w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/80 backdrop-blur-lg border border-blue-300/50 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base shadow-lg hover:shadow-blue-500/30 transition-all duration-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
              <StatCard icon={FileText} value="8" label="Secciones" />
              <StatCard icon={Lightbulb} value="25+" label="Tips" />
              <StatCard icon={Keyboard} value="15" label="Atajos" />
              <StatCard icon={Code} value="API" label="Reference" />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 sm:gap-12">
            
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
              <div className="sticky top-28 bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl border border-blue-200/50 p-4 sm:p-6 shadow-lg hover:shadow-blue-500/30 transition-all duration-500">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 sm:mb-6 animate-subtleGlow">Contenido</h3>
                <nav className="space-y-1 sm:space-y-2">
                  {filteredSections.map((section, index) => (
                    <Link
                      key={section.id}
                      href={`#${section.id}`}
                      className={`flex items-center space-x-3 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 text-sm sm:text-base group relative overflow-hidden ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-blue-50/80 to-purple-50/60 border-l-4 border-blue-500 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50'
                      }`}
                      style={{ animation: `slideUp 0.8s ease-out forwards`, animationDelay: `${index * 100}ms` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <section.icon className="w-4 h-4 flex-shrink-0 text-blue-600 group-hover:text-purple-600 animate-floatSpin" />
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
                <section data-section="introduccion" id="introduccion" className="scroll-mt-28">
                  <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl border border-blue-200/50 p-6 sm:p-8 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative overflow-hidden animate-slideUp">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                        <Book className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-floatSpin" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">Introducción</h2>
                    </div>

                    <div className="prose prose-sm sm:prose max-w-none">
                      <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6">
                        NURO es un asistente de inteligencia artificial avanzado diseñado para revolucionar tu productividad 
                        a través del análisis inteligente de pantalla y respuestas contextuales en tiempo real.
                      </p>

                      <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-subtleGlow">¿Qué hace NURO?</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-lg p-4 sm:p-6 rounded-xl border border-blue-200/50 hover:shadow-blue-500/20 transition-all duration-500 group relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                          <Eye className="w-6 h-6 text-blue-600 mb-3 group-hover:text-purple-600 animate-floatSpin" />
                          <h4 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">Análisis Visual</h4>
                          <p className="text-sm text-gray-600">Comprende cualquier contenido en tu pantalla con precisión del 99.5%</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-lg p-4 sm:p-6 rounded-xl border border-purple-200/50 hover:shadow-purple-500/20 transition-all duration-500 group relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-pink-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                          <MessageSquare className="w-6 h-6 text-purple-600 mb-3 group-hover:text-blue-600 animate-floatSpin" />
                          <h4 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">IA Conversacional</h4>
                          <p className="text-sm text-gray-600">Respuestas naturales y contextuales basadas en lo que ves</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-lg p-4 sm:p-6 rounded-xl border border-green-200/50 mb-6 hover:shadow-green-500/20 transition-all duration-500 group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 to-emerald-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0 group-hover:text-emerald-600 animate-floatSpin" />
                          <div>
                            <h4 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">Privacidad Garantizada</h4>
                            <p className="text-sm text-gray-600">
                              Procesamiento 100% local. Tus datos nunca salen de tu dispositivo. Sin servidores externos, sin tracking.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Instalación */}
                <section data-section="instalacion" id="instalacion" className="scroll-mt-28">
                  <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl border border-blue-200/50 p-6 sm:p-8 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative overflow-hidden animate-slideUp">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                        <Download className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-floatSpin" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">Instalación</h2>
                    </div>

                    <div className="space-y-6 sm:space-y-8">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-subtleGlow">Requisitos del Sistema</h3>
                        <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/60 backdrop-blur-lg p-4 sm:p-6 rounded-xl border border-blue-200/50 hover:shadow-blue-500/20 transition-all duration-500 group relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-purple-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                          <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                            <li className="flex items-center space-x-3">
                              <CheckCircle className="w-4 h-4 text-green-500 group-hover:text-emerald-600 animate-floatSpin" />
                              <span><strong>SO:</strong> Windows 10 (versión 1903+) o Windows 11</span>
                            </li>
                            <li className="flex items-center space-x-3">
                              <CheckCircle className="w-4 h-4 text-green-500 group-hover:text-emerald-600 animate-floatSpin" />
                              <span><strong>RAM:</strong> 4GB mínimo, 8GB recomendado</span>
                            </li>
                            <li className="flex items-center space-x-3">
                              <CheckCircle className="w-4 h-4 text-green-500 group-hover:text-emerald-600 animate-floatSpin" />
                              <span><strong>Espacio:</strong> 200MB libres</span>
                            </li>
                            <li className="flex items-center space-x-3">
                              <CheckCircle className="w-4 h-4 text-green-500 group-hover:text-emerald-600 animate-floatSpin" />
                              <span><strong>Internet:</strong> Solo para actualizaciones (opcional)</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-subtleGlow">Proceso de Instalación</h3>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-4">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base font-bold flex-shrink-0 mt-1 animate-subtleGlow">1</div>
                            <div>
                              <h4 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">Descargar NURO</h4>
                              <p className="text-gray-600 mb-3">Descarga <code className="bg-blue-50/80 backdrop-blur-sm px-2 py-1 rounded text-sm text-blue-600">AI.Assistant.Professional.Setup.1.0.0.exe</code> desde la página principal.</p>
                              <Link href="/" className="inline-flex items-center space-x-2 text-blue-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent font-medium text-sm relative group">
                                <ExternalLink className="w-4 h-4 animate-floatSpin" />
                                <span>Ir a página de descarga</span>
                                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
                              </Link>
                            </div>
                          </div>

                          <div className="flex items-start space-x-4">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base font-bold flex-shrink-0 mt-1 animate-subtleGlow">2</div>
                            <div>
                              <h4 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">Ejecutar Instalador</h4>
                              <p className="text-gray-600 mb-3">Haz doble clic en el archivo descargado para iniciar la instalación.</p>
                              
                              <div className="bg-gradient-to-br from-yellow-50/80 to-amber-50/80 backdrop-blur-lg p-4 rounded-xl border border-yellow-200/50 mb-3 hover:shadow-yellow-500/20 transition-all duration-500 group relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/50 to-amber-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                                <div className="flex items-start space-x-3">
                                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0 group-hover:text-amber-600 animate-floatSpin" />
                                  <div>
                                    <h5 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 animate-subtleGlow">Advertencia de Windows</h5>
                                    <p className="text-sm text-gray-600">
                                      Windows mostrará &quot;Windows protected your PC&quot; porque NURO no está firmado digitalmente. 
                                      Esto es normal y la aplicación es completamente segura.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start space-x-4">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base font-bold flex-shrink-0 mt-1 animate-subtleGlow">3</div>
                            <div>
                              <h4 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">Bypass de Windows Defender</h4>
                              <ol className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center space-x-3">
                                  <CheckCircle className="w-4 h-4 text-green-500 animate-floatSpin" />
                                  <span>1. Haz clic en <strong>&quot;More info&quot;</strong></span>
                                </li>
                                <li className="flex items-center space-x-3">
                                  <CheckCircle className="w-4 h-4 text-green-500 animate-floatSpin" />
                                  <span>2. Selecciona <strong>&quot;Run anyway&quot;</strong></span>
                                </li>
                                <li className="flex items-center space-x-3">
                                  <CheckCircle className="w-4 h-4 text-green-500 animate-floatSpin" />
                                  <span>3. Confirma la instalación como administrador</span>
                                </li>
                              </ol>
                            </div>
                          </div>

                          <div className="flex items-start space-x-4">
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base font-bold flex-shrink-0 mt-1 animate-subtleGlow">✓</div>
                            <div>
                              <h4 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">¡Listo!</h4>
                              <p className="text-gray-600">NURO se iniciará automáticamente y estará listo para usar.</p>
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
      <footer className="py-12 sm:py-16 border-t border-blue-200/50 bg-white relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4 group">
              <div className="relative">
                <Image src="/images/nurologo.png" alt="NURO" width={32} height={32} className="w-8 h-8 group-hover:scale-110 transition-all duration-500 animate-subtleGlow" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div>
                <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">NURO Technologies</div>
                <div className="text-xs text-gray-600">Documentación y Soporte</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent transition-all text-sm relative group"
                >
                  {item.label}
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
              <AlertTriangle className="w-6 h-6 text-amber-500 animate-floatSpin" />
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
  );
};

export default DocsClientComponent;