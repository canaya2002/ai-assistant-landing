"use client";
import { useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Download, Shield, Star, Users, Check, AlertTriangle, Play, Brain, Clock, Menu, X, Zap, Sparkles } from 'lucide-react';

// Configuración segura
const CONFIG = {
  GA_ID: process.env.NEXT_PUBLIC_GA_ID || '',
  DOWNLOAD_URL: 'https://github.com/canaya2002/ai-assistant-professional/releases/download/v1.0.0/AI.Assistant.Professional.Setup.1.0.0.exe',
  VERSION: '1.0.0',
  RELEASE_DATE: '2025-08-26'
};

// Tipos
interface IconProps {
  className?: string;
}

type LucideIcon = React.ComponentType<IconProps>;

interface TrustIndicatorProps {
  icon: LucideIcon;
  value: string;
  label: string;
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

// Función de tracking
const trackEvent = (action: string, category: string, label?: string) => {
  if (typeof window !== 'undefined' && window.gtag && CONFIG.GA_ID) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label || undefined
    });
  }
};

// Componente de estadísticas
const TrustIndicator = memo<TrustIndicatorProps>(({ icon: Icon, value, label }) => (
  <div className="text-center transition-all duration-500 hover:scale-105 group cursor-pointer">
    <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 backdrop-blur-lg rounded-full shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 border border-blue-300/30 group-hover:border-purple-400/50 transition-all duration-500">
      <Icon className="w-6 h-6 text-blue-600 group-hover:text-purple-600 animate-floatSpin" />
    </div>
    <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
));

TrustIndicator.displayName = 'TrustIndicator';

// Componente de características
const FeatureCard = memo<FeatureCardProps>(({ icon: Icon, title, description, delay = 0 }) => (
  <div 
    className="text-center p-6 bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-cyan-50/80 backdrop-blur-lg rounded-xl border border-blue-200/50 transition-all duration-500 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-102 group relative overflow-hidden cursor-pointer"
    style={{ animationDelay: `${delay}ms`, animation: 'slideUp 0.8s ease-out forwards' }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
    <div className="absolute inset-0 border border-blue-300/0 group-hover:border-blue-300/50 rounded-xl transition-all duration-500"></div>
    <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-full shadow-md group-hover:shadow-lg border border-blue-300/30 group-hover:border-purple-400/50 transition-all duration-500">
      <Icon className="w-6 h-6 text-blue-600 group-hover:text-purple-600 animate-floatSpin" />
    </div>
    <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 animate-subtleGlow">{title}</h3>
    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
  </div>
));

FeatureCard.displayName = 'FeatureCard';

// Validación de email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
};

// Sanitización de strings
const sanitizeString = (str: string): string => {
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/[<>]/g, '')
            .trim();
};

const NuroLandingPage = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);

  // Animación de tiempo y mouse tracking
  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth > 768) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    const handleScroll = () => {
      const elements = document.querySelectorAll('[data-parallax]');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const offset = window.scrollY / 20;
        (el as HTMLElement).style.transform = `translateY(${offset}px)`;
      });
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

  // Manejo de descarga
  const handleDownload = useCallback(() => {
    if (!emailSubmitted) {
      setShowEmailCapture(true);
      return;
    }
    
    trackEvent('download', 'engagement', `nuro_v${CONFIG.VERSION}`);
    setShowWarning(true);
    
    const link = document.createElement('a');
    link.href = CONFIG.DOWNLOAD_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [emailSubmitted]);

  // Manejo del formulario de email
  const handleEmailSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError('');
    
    const cleanEmail = sanitizeString(email);
    
    if (!validateEmail(cleanEmail)) {
      setEmailError('Por favor ingresa un email válido');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: cleanEmail, 
          source: 'download_page',
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setEmailSubmitted(true);
        setShowEmailCapture(false);
        trackEvent('email_capture', 'lead_generation', 'download_intent');
        setTimeout(() => handleDownload(), 500);
      } else {
        setEmailError(result.error || 'Error al suscribirse. Inténtalo de nuevo.');
      }
      
    } catch (error) {
      console.error('Email submission error:', error);
      setEmailError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, handleDownload]);

  const navigationItems = [
    { href: '/docs', label: 'Documentación' },
    { href: '/api', label: 'API' },
    { href: '/faq', label: 'FAQ' },
    { href: '/privacy', label: 'Privacidad' },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 relative overflow-hidden">
      {/* Fondo animado mejorado */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Gradiente base sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-cyan-50/30 animate-gradientFlow" style={{ animationDuration: '15s' }}></div>
        
        {/* Grid tecnológico sutil */}
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
        
        {/* Partículas flotantes mejoradas */}
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
        
        {/* Efectos holográficos */}
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
        
        {/* Líneas de código matrix */}
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
        
        {/* Efectos de circuitos */}
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
        
        {/* Pulsos radiales */}
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
        
        {/* Hexágonos tecnológicos */}
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
        
        {/* Cursor interactivo sutil */}
        <div 
          className="absolute w-96 h-96 rounded-full opacity-5 pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 70%)',
            animation: 'pulseGentle 4s ease-in-out infinite'
          }}
        ></div>
        
        {/* Ondas de energía sutiles */}
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

      {/* Header optimizado más ancho */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-blue-200/50 shadow-sm">
        <div className="container mx-auto px-4">
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
              <div className="ml-3">
                <div className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 animate-subtleGlow">NURO</div>
                <div className="text-xs text-gray-600">AI Technologies</div>
              </div>
            </Link>

            <div className="hidden lg:flex items-center space-x-6">
              {navigationItems.map((item, index) => (
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
              {mobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
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
      </nav>

      {/* Hero Section optimizado */}
      <section className="min-h-screen flex items-center justify-center pt-24 bg-white relative z-10" data-parallax>
        <div className="container mx-auto px-4 text-center relative z-20">
          <div className={`max-w-4xl mx-auto transition-all duration-1000 ${isLoaded ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-50/80 via-purple-50/60 to-cyan-50/80 backdrop-blur-lg px-6 py-2 rounded-full text-sm font-semibold text-gray-700 mb-8 shadow-sm border border-blue-200/50 animate-slideUp">
              <span>Neural AI • 99.7% Precisión • Tiempo Real</span>
              <Sparkles className="w-4 h-4 text-blue-600 animate-floatSpin" />
            </div>

            <div className="relative mb-8">
              <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6 animate-solarFlare leading-tight relative transform-gpu">
                NURO
              </h1>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 blur-xl animate-pulseGentle opacity-50"></div>
              {/* Scan lines sobre el título */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scanLine top-1/4"></div>
                <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-scanLine top-2/4" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scanLine top-3/4" style={{ animationDelay: '1s' }}></div>
              </div>
              {/* Efectos de partículas alrededor del texto */}
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

            <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Procesamiento neuronal avanzado con arquitectura de transformadores optimizada, comprensión contextual profunda y respuestas en tiempo real.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-purple-50/60 backdrop-blur-lg border border-blue-200/50 hover:shadow-md hover:shadow-blue-500/20 transition-all duration-500 group animate-slideUp" style={{ animationDelay: '0ms' }}>
                <div className="flex items-center space-x-3 mb-2">
                  <Brain className="w-5 h-5 text-blue-600 group-hover:text-purple-600 animate-floatSpin" />
                  <span className="font-semibold text-gray-800 text-sm">175B Parámetros</span>
                </div>
                <p className="text-xs text-gray-600">Modelo avanzado con razonamiento profundo</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-purple-50/60 backdrop-blur-lg border border-blue-200/50 hover:shadow-md hover:shadow-blue-500/20 transition-all duration-500 group animate-slideUp" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center space-x-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-600 group-hover:text-purple-600 animate-floatSpin" />
                  <span className="font-semibold text-gray-800 text-sm">Respuesta 50ms</span>
                </div>
                <p className="text-xs text-gray-600">Latencia ultrabaja en tiempo real</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-purple-50/60 backdrop-blur-lg border border-blue-200/50 hover:shadow-md hover:shadow-blue-500/20 transition-all duration-500 group animate-slideUp" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center space-x-3 mb-2">
                  <Shield className="w-5 h-5 text-blue-600 group-hover:text-purple-600 animate-floatSpin" />
                  <span className="font-semibold text-gray-800 text-sm">100% Local</span>
                </div>
                <p className="text-xs text-gray-600">Procesamiento con privacidad garantizada</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <button 
                onClick={handleDownload}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold text-base hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-500 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-purple-400/50 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                <span className="relative">Descargar Gratis</span>
              </button>
              <button className="flex items-center space-x-3 border border-blue-300/50 px-6 py-3 rounded-full text-gray-700 font-semibold text-base hover:bg-blue-50/50 transition-all duration-500 group">
                <Play className="w-5 h-5 text-blue-600 group-hover:text-purple-600 animate-floatSpin" />
                <span>Ver Demo</span>
              </button>
            </div>

            <div className="text-sm text-gray-500 mb-8">
              <div className="inline-block bg-gradient-to-r from-blue-50/80 to-purple-50/60 backdrop-blur-lg rounded-full px-6 py-2 shadow-sm border border-blue-200/50">
                Windows 10/11 • Versión {CONFIG.VERSION} • 164MB
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <TrustIndicator icon={Users} value="1,247+" label="Usuarios Activos" />
              <TrustIndicator icon={Star} value="4.9/5" label="Calificación" />
              <TrustIndicator icon={Zap} value="99.9%" label="Tiempo Activo" />
              <TrustIndicator icon={Clock} value="50ms" label="Respuesta" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white relative z-10" data-parallax>
        <div className="container mx-auto px-4 relative z-20">
          <div className="text-center mb-12">
            <span className="inline-block bg-gradient-to-r from-blue-50/80 to-purple-50/60 backdrop-blur-lg rounded-full px-6 py-2 text-sm font-semibold text-gray-700 mb-4 shadow-sm border border-blue-200/50">ARQUITECTURA NEURONAL</span>
            <h2 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Procesamiento Avanzado</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Arquitectura optimizada que redefine el rendimiento de la IA.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            <FeatureCard 
              icon={Zap}
              title="Visión Computacional"
              description="Análisis visual con 147 capas de procesamiento y 99.7% de precisión."
              delay={0}
            />
            <FeatureCard 
              icon={Brain}
              title="Transformador Avanzado"
              description="Arquitectura de 175B parámetros con comprensión contextual."
              delay={200}
            />
            <FeatureCard 
              icon={Clock}
              title="Motor Cuántico"
              description="Latencia inferior a 50ms con 2.3M operaciones por segundo."
              delay={400}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50/80 to-purple-50/60 backdrop-blur-lg border border-blue-200/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-500 group">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-6 h-6 text-blue-600 group-hover:text-purple-600 animate-floatSpin" />
                <h4 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Rendimiento</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">Procesamiento distribuido con aceleración de hardware.</p>
              <div className="bg-white/60 backdrop-blur-lg p-4 rounded-lg border border-blue-200/50">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium text-sm">Análisis visual:</span>
                    <span className="text-blue-600 font-semibold text-sm">28ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium text-sm">Procesamiento:</span>
                    <span className="text-blue-600 font-semibold text-sm">22ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium text-sm">Respuesta:</span>
                    <span className="text-blue-600 font-semibold text-sm">19ms</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-blue-200/50">
                    <span className="text-gray-800 font-semibold text-sm">Promedio:</span>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold text-sm">47ms</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50/80 to-purple-50/60 backdrop-blur-lg border border-blue-200/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-500 group">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-blue-600 group-hover:text-purple-600 animate-floatSpin" />
                <h4 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Seguridad</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">Seguridad de grado militar con procesamiento 100% local.</p>
              <div className="bg-white/60 backdrop-blur-lg p-4 rounded-lg border border-blue-200/50">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600 font-medium text-sm">Cifrado AES-256</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600 font-medium text-sm">Arquitectura de conocimiento cero</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600 font-medium text-sm">Auditorías continuas</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600 font-medium text-sm">Certificación SOC 2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section arreglada */}
      <section className="py-20 pb-32 bg-white relative z-10" data-parallax>
        <div className="container mx-auto px-4 relative z-20">
          <div className="text-center mb-12">
            <span className="inline-block bg-gradient-to-r from-blue-50/80 to-purple-50/60 backdrop-blur-lg rounded-full px-6 py-2 text-sm font-semibold text-gray-700 mb-4 shadow-sm border border-blue-200/50">PLANES DE ACCESO</span>
            <h2 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Planes de Precios</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Soluciones para necesidades personales y profesionales.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan Personal */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-blue-50/80 to-purple-50/60 backdrop-blur-lg border border-blue-200/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-500 group relative">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Personal</h3>
              <p className="text-gray-600 mb-4 text-sm">Para individuos y exploradores de IA</p>
              <div className="mb-6">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">$0</div>
                <div className="text-gray-500 text-sm">Gratis para siempre</div>
              </div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-600">100 análisis por mes</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-600">IA neuronal completa</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-600">Soporte comunitario</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-gray-600">Actualizaciones automáticas</span>
                </li>
              </ul>
              <button className="w-full py-3 border border-blue-300/50 rounded-full text-gray-700 font-semibold text-sm hover:bg-blue-50/50 transition-all duration-500">
                Incluido en la Descarga
              </button>
            </div>

            {/* Plan Profesional */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-blue-50/80 to-purple-50/60 backdrop-blur-lg border border-blue-300/60 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-500 group relative">
              {/* Badge Popular - Posicionado correctamente */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
                Más Popular
              </div>
              
              <div className="pt-4">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Profesional</h3>
                <p className="text-gray-600 mb-4 text-sm">Para profesionales y equipos</p>
                <div className="mb-6">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">$19</div>
                  <div className="text-gray-500 text-sm">Por mes, cancela cuando quieras</div>
                </div>
                <ul className="space-y-3 mb-6 text-sm">
                  <li className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-600">Análisis ilimitados</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-600">IA neuronal premium</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-600">Soporte prioritario 24/7</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-600">Acceso beta exclusivo</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-600">API e integraciones</span>
                  </li>
                </ul>
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-500">
                  Actualizar en la App
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 mt-16 border-t border-blue-200/50 bg-white relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <Image src="/images/nurologo.png" alt="NURO" width={32} height={32} className="w-8 h-8 group-hover:scale-110 transition-all duration-500 animate-subtleGlow" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div>
                <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">NURO Technologies</div>
                <div className="text-xs text-gray-600">Inteligencia Artificial del Futuro</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-6">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href} className="text-gray-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent transition-all text-sm relative group">
                  {item.label}
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
                </Link>
              ))}
              <div className="text-gray-500 text-xs">
                © 2025 NURO Technologies. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Email Capture Modal */}
      {showEmailCapture && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg p-8 rounded-xl max-w-md mx-auto shadow-xl border border-blue-200/50 relative animate-modalIn">
            <div className="flex items-center space-x-3 mb-4">
              <Download className="w-6 h-6 text-blue-600 animate-floatSpin" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Descargar NURO</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">Únete a la revolución de la IA con actualizaciones exclusivas.</p>
            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                placeholder="tu@email.com"
                required
                disabled={isSubmitting}
                maxLength={254}
                className="w-full px-4 py-3 border border-blue-300/50 rounded-full focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white/80 text-sm"
              />
              {emailError && (
                <p className="text-red-500 text-sm">{emailError}</p>
              )}
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleEmailSubmit(e as any);
                }}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-500"
              >
                {isSubmitting ? 'Procesando...' : 'Descargar NURO'}
              </button>
            </div>
            <button
              onClick={() => {
                setEmailSubmitted(true);
                setShowEmailCapture(false);
                setTimeout(() => handleDownload(), 100);
              }}
              className="text-gray-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent text-sm mt-4 block text-center"
              disabled={isSubmitting}
            >
              Omitir y descargar directamente
            </button>
            <button
              onClick={() => setShowEmailCapture(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-blue-600 text-xl"
              disabled={isSubmitting}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-lg p-8 rounded-xl max-w-md mx-auto shadow-xl border border-blue-200/50 animate-modalIn">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Aviso de Seguridad</h3>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
              Windows puede mostrar una advertencia. NURO es completamente seguro.
            </p>
            <ol className="space-y-3 mb-6 text-sm text-gray-600">
              <li className="flex items-center space-x-3">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Windows muestra: "Windows protegió tu PC"</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Haz clic en "Más información"</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Haz clic en "Ejecutar de todos modos"</span>
              </li>
            </ol>
            <button 
              onClick={() => setShowWarning(false)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-500"
            >
              Entendido, Continuar
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes subtleGlow {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.1);
          }
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
          0% {
            transform: translate(0, 0) scale(0.5);
            opacity: 0;
          }
          50% {
            opacity: 1;
            transform: translate(20px, -10px) scale(1);
          }
          100% {
            transform: translate(0, 0) scale(0.5);
            opacity: 0;
          }
        }
        @keyframes circuitPulse {
          0%, 100% {
            opacity: 0.1;
            transform: scaleX(0);
          }
          50% {
            opacity: 0.8;
            transform: scaleX(1);
          }
        }
        @keyframes radialPulse {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(15);
            opacity: 0;
          }
        }
        @keyframes hexSpin {
          0% {
            transform: rotate(0deg) scale(0.5);
            opacity: 0.3;
          }
          50% {
            transform: rotate(180deg) scale(1);
            opacity: 0.7;
          }
          100% {
            transform: rotate(360deg) scale(0.5);
            opacity: 0.3;
          }
        }
        @keyframes lightSweep {
          0% {
            opacity: 0;
            transform: translateX(-100%) skewX(-45deg);
          }
          50% {
            opacity: 0.7;
            transform: translateX(0%) skewX(-45deg);
          }
          100% {
            opacity: 0;
            transform: translateX(100%) skewX(-45deg);
          }
        }
        @keyframes scanLine {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          10%, 90% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        @keyframes holoRing {
          0% {
            transform: scale(0.5) rotate(0deg);
            opacity: 0;
            border-width: 2px;
          }
          50% {
            transform: scale(1) rotate(180deg);
            opacity: 0.5;
            border-width: 1px;
          }
          100% {
            transform: scale(1.5) rotate(360deg);
            opacity: 0;
            border-width: 0.5px;
          }
        }
        @keyframes matrixCode {
          0% {
            transform: translateY(-20px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        @keyframes floatSpin {
          0%, 100% {
            transform: rotateY(0deg) translateY(0px);
          }
          25% {
            transform: rotateY(90deg) translateY(-2px);
          }
          50% {
            transform: rotateY(180deg) translateY(0px);
          }
          75% {
            transform: rotateY(270deg) translateY(-2px);
          }
        }
        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-5px) translateX(2px) rotate(90deg);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-10px) translateX(5px) rotate(180deg);
            opacity: 1;
          }
          75% {
            transform: translateY(-5px) translateX(2px) rotate(270deg);
            opacity: 0.6;
          }
        }
        @keyframes pulseGentle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        @keyframes energyWave {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          10%, 90% {
            opacity: 0.5;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        @keyframes gradientFlow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes gridFloat {
          0%, 100% {
            opacity: 0.05;
            transform: translate(0, 0);
          }
          50% {
            opacity: 0.1;
            transform: translate(1px, 1px);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes modalIn {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
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

export default NuroLandingPage;