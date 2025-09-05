"use client";
import { useState, useEffect, useCallback, memo } from 'react';
import { Calendar, Tag, Zap, Shield, Eye, MessageSquare, Settings, Bug, Plus, ArrowUp, Download, Star, Info, Clock, Users, Code, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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

const NuroChangelogPage = () => {
  const [selectedVersion, setSelectedVersion] = useState('all');
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

    const timeInterval = setInterval(() => {
      setTime(prev => prev + 1);
    }, 50);

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
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

  const changelogData = [
    {
      version: '1.0.0',
      date: '2025-08-26',
      type: 'major',
      status: 'stable',
      title: 'Lanzamiento Inicial',
      description: 'Primera versión estable de NURO con todas las funcionalidades principales implementadas.',
      changes: [
        {
          type: 'new',
          category: 'core',
          title: 'Motor de Análisis Visual',
          description: 'Implementación completa del sistema de OCR + IA para análisis de pantalla con precisión del 99.5%.'
        },
        {
          type: 'new',
          category: 'ai',
          title: 'IA Conversacional Avanzada',
          description: 'Modelos de lenguaje natural optimizados para respuestas contextuales y comprensión semántica.'
        },
        {
          type: 'new',
          category: 'ui',
          title: 'Interfaz Flotante',
          description: 'Sistema de ventanas flotantes no intrusivas con diseño adaptativo y transparencia inteligente.'
        },
        {
          type: 'new',
          category: 'privacy',
          title: 'Procesamiento 100% Local',
          description: 'Todos los modelos de IA ejecutan localmente. Cero transmisión de datos a servidores externos.'
        },
        {
          type: 'new',
          category: 'performance',
          title: 'Optimización de Rendimiento',
          description: 'Tiempo de respuesta promedio de 50ms con soporte para análisis en tiempo real.'
        }
      ],
      stats: {
        downloads: '1,247',
        issues_fixed: '0',
        new_features: '5'
      }
    },
    {
      version: '1.1.0',
      date: '2025-09-15',
      type: 'minor',
      status: 'planned',
      title: 'Automatización Inteligente',
      description: 'Nuevas funciones de automatización y mejoras en precisión del análisis visual.',
      changes: [
        {
          type: 'new',
          category: 'automation',
          title: 'Macros Inteligentes',
          description: 'Creación automática de macros basadas en patrones de uso repetitivos.'
        },
        {
          type: 'new',
          category: 'ai',
          title: 'Modo Predictivo',
          description: 'IA predictiva que anticipa necesidades del usuario basándose en contexto histórico.'
        },
        {
          type: 'improvement',
          category: 'performance',
          title: 'Optimización de Memoria',
          description: 'Reducción del 30% en uso de RAM y mejora en velocidad de procesamiento.'
        },
        {
          type: 'improvement',
          category: 'ui',
          title: 'Nuevos Temas Visuales',
          description: 'Modo oscuro, tema de alto contraste y personalización avanzada de interfaz.'
        },
        {
          type: 'fix',
          category: 'core',
          title: 'Estabilidad en Pantallas 4K',
          description: 'Corrección de problemas de renderizado en monitores de alta resolución.'
        }
      ],
      stats: {
        downloads: '0',
        issues_fixed: '12',
        new_features: '2'
      }
    },
    {
      version: '1.2.0',
      date: '2025-10-30',
      type: 'minor',
      status: 'planned',
      title: 'Integraciones y API',
      description: 'Sistema de integraciones con aplicaciones populares y API pública para desarrolladores.',
      changes: [
        {
          type: 'new',
          category: 'integrations',
          title: 'Integraciones Nativas',
          description: 'Soporte nativo para Slack, Notion, Microsoft Teams, Discord y Telegram.'
        },
        {
          type: 'new',
          category: 'api',
          title: 'API Pública v1.0',
          description: 'REST API completa para desarrolladores con documentación y SDK en múltiples lenguajes.'
        },
        {
          type: 'new',
          category: 'workflow',
          title: 'Constructor de Workflows',
          description: 'Editor visual drag-and-drop para crear automatizaciones complejas sin código.'
        },
        {
          type: 'improvement',
          category: 'ai',
          title: 'Modelos Especializados',
          description: 'IA especializada para código, finanzas, diseño, y contenido médico.'
        }
      ],
      stats: {
        downloads: '0',
        issues_fixed: '8',
        new_features: '3'
      }
    },
    {
      version: '2.0.0',
      date: '2025-12-15',
      type: 'major',
      status: 'planned',
      title: 'NURO Cloud',
      description: 'Versión híbrida con capacidades cloud opcionales y colaboración en tiempo real.',
      changes: [
        {
          type: 'new',
          category: 'cloud',
          title: 'NURO Cloud (Opcional)',
          description: 'Sincronización opcional en la nube manteniendo procesamiento local por defecto.'
        },
        {
          type: 'new',
          category: 'collaboration',
          title: 'Colaboración en Tiempo Real',
          description: 'Compartir análisis y workflows con equipos manteniendo privacidad total.'
        },
        {
          type: 'new',
          category: 'mobile',
          title: 'Aplicación Móvil',
          description: 'Apps nativas para iOS y Android con análisis de documentos y fotos.'
        },
        {
          type: 'improvement',
          category: 'ai',
          title: 'IA Multimodal Avanzada',
          description: 'Análisis simultáneo de texto, imágenes, audio y video con comprensión contextual.'
        }
      ],
      stats: {
        downloads: '0',
        issues_fixed: '15',
        new_features: '4'
      }
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'new': return 'bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-800';
      case 'improvement': return 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800';
      case 'fix': return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new': return Plus;
      case 'improvement': return ArrowUp;
      case 'fix': return Bug;
      default: return Info;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return Eye;
      case 'ai': return MessageSquare;
      case 'ui': return Settings;
      case 'performance': return Zap;
      case 'privacy': return Shield;
      case 'automation': return Settings;
      case 'integrations': return Users;
      case 'api': return Code;
      case 'workflow': return Settings;
      case 'cloud': return Users;
      case 'collaboration': return Users;
      case 'mobile': return Settings;
      default: return Info;
    }
  };

  const filteredChangelog = selectedVersion === 'all' 
    ? changelogData 
    : changelogData.filter(item => item.version === selectedVersion);

  const versions = ['all', ...changelogData.map(item => item.version)];

  const navigationItems = [
    { href: '/', label: 'Inicio' },
    { href: '/docs', label: 'Documentación' },
    { href: '/faq', label: 'FAQ' },
  ];

  return (
    <>
      <head>
        <title>Changelog - NURO | Historial de Versiones y Actualizaciones</title>
        <meta name="description" content="Mantente al día con las últimas actualizaciones de NURO. Nuevas funciones, mejoras y correcciones en cada versión." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://nuro-ai.com/changelog" />
      </head>

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
                <span>Actualizaciones • Changelog</span>
                <Sparkles className="w-4 h-4 text-blue-600 animate-floatSpin" />
              </div>

              <div className="relative mb-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6 animate-solarFlare leading-tight relative transform-gpu">
                  Siempre Evolucionando
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
                Descubre las últimas funciones, mejoras y correcciones en cada versión de NURO. 
                Nos comprometemos a mejorar continuamente tu experiencia.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto mb-8">
                <StatCard icon={Tag} value={`v${changelogData[0]?.version ?? 'N/A'}`} label="Versión Actual" />
                <StatCard icon={Download} value={changelogData[0]?.stats.downloads ?? '0'} label="Descargas" />
                <StatCard icon={Clock} value={changelogData[0] ? new Date(changelogData[0].date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'N/A'} label="Última Actualización" />
              </div>

              <Link
                href="/"
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-500 transform hover:scale-105 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-purple-400/50 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                <Download className="w-5 h-5 animate-floatSpin" />
                <span className="text-sm sm:text-base relative">Descargar Última Versión</span>
              </Link>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 scroll-mt-28">
          <div className="max-w-6xl mx-auto">
            {/* Version Filter */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 sm:mb-6 animate-subtleGlow">Filtrar por Versión</h2>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {versions.map((version, index) => (
                  <button
                    key={version}
                    onClick={() => setSelectedVersion(version)}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 group relative overflow-hidden animate-slideUp ${
                      selectedVersion === version
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-lg text-gray-700 hover:shadow-blue-500/30 border border-blue-200/50'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                    {version === 'all' ? (
                      <>
                        <Calendar className="w-4 h-4 text-blue-600 group-hover:text-purple-600 animate-floatSpin" />
                        <span>Todas las Versiones</span>
                      </>
                    ) : (
                      <>
                        <Tag className="w-4 h-4 text-blue-600 group-hover:text-purple-600 animate-floatSpin" />
                        <span>v{version}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Changelog Timeline */}
            <div className="space-y-8 sm:space-y-12">
              {filteredChangelog.map((release, index) => (
                <div key={release.version} className="relative animate-slideUp" style={{ animationDelay: `${index * 100}ms` }}>
                  {/* Timeline Line */}
                  {index < filteredChangelog.length - 1 && (
                    <div className="absolute left-6 sm:left-8 top-16 sm:top-20 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-purple-200"></div>
                  )}
                  
                  <div className="flex items-start space-x-4 sm:space-x-6">
                    {/* Version Badge */}
                    <div className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg group relative animate-subtleGlow ${
                      release.status === 'stable' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                        : release.status === 'planned'
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-floatSpin" />
                    </div>
                    
                    {/* Release Content */}
                    <div className="flex-1 bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl border border-blue-200/50 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      
                      {/* Release Header */}
                      <div className="p-6 sm:p-8 border-b border-blue-200/50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">
                                v{release.version}
                              </h2>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold animate-subtleGlow ${
                                release.type === 'major' 
                                  ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800' 
                                  : release.type === 'minor'
                                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800'
                                  : 'bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-800'
                              }`}>
                                {release.type.toUpperCase()}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold animate-subtleGlow ${
                                release.status === 'stable' 
                                  ? 'bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-800' 
                                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                              }`}>
                                {release.status === 'stable' ? 'ESTABLE' : 'PLANIFICADO'}
                              </span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">{release.title}</h3>
                            <p className="text-gray-600 text-sm sm:text-base">{release.description}</p>
                          </div>
                          
                          <div className="flex flex-col sm:items-end space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4 text-blue-600 animate-floatSpin" />
                              <span>{new Date(release.date).toLocaleDateString('es-ES', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                            {release.status === 'stable' && (
                              <button
                                onClick={handleDownload}
                                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-500 relative overflow-hidden group"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-purple-400/50 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                                <Download className="w-4 h-4 animate-floatSpin" />
                                <span className="relative">Descargar</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Release Stats */}
                      <div className="px-6 sm:px-8 py-4 bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-lg border-b border-blue-200/50">
                        <div className="grid grid-cols-3 gap-4 sm:gap-6">
                          <div className="text-center">
                            <div className="font-bold text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">{release.stats.new_features}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Nuevas Funciones</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">{release.stats.issues_fixed}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Problemas Resueltos</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">{release.stats.downloads}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Descargas</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Changes List */}
                      <div className="p-6 sm:p-8">
                        <h4 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-subtleGlow">Cambios en esta versión:</h4>
                        <div className="space-y-4 sm:space-y-6">
                          {release.changes.map((change, changeIndex) => {
                            const TypeIcon = getTypeIcon(change.type);
                            const CategoryIcon = getCategoryIcon(change.category);
                            
                            return (
                              <div key={changeIndex} className="flex items-start space-x-4 group relative animate-slideUp" style={{ animationDelay: `${changeIndex * 100}ms` }}>
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <div className={`p-2 rounded-lg ${getTypeColor(change.type)}`}>
                                    <TypeIcon className="w-4 h-4 animate-floatSpin" />
                                  </div>
                                  <div className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600">
                                    <CategoryIcon className="w-4 h-4 animate-floatSpin" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 text-sm sm:text-base animate-subtleGlow">{change.title}</h5>
                                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{change.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Roadmap Teaser */}
            <div className="mt-16 sm:mt-20 scroll-mt-28">
              <div className="bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-cyan-50/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl border border-blue-200/50 p-6 sm:p-8 text-center shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                <div className="max-w-3xl mx-auto">
                  <Star className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-4 sm:mb-6 group-hover:text-purple-600 animate-floatSpin" />
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 animate-subtleGlow">
                    ¿Qué viene después?
                  </h2>
                  <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                    Estamos trabajando en funciones increíbles para las próximas versiones. 
                    Únete a nuestra comunidad para influir en el desarrollo de NURO.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    <div className="bg-white/95 backdrop-blur-lg p-4 sm:p-6 rounded-xl border border-blue-200/50 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-3 group-hover:text-purple-600 animate-floatSpin" />
                      <h3 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">Colaboración en Equipo</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Comparte análisis y workflows con tu equipo</p>
                    </div>
                    
                    <div className="bg-white/95 backdrop-blur-lg p-4 sm:p-6 rounded-xl border border-blue-200/50 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <Code className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-3 group-hover:text-blue-600 animate-floatSpin" />
                      <h3 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">API Completa</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Integra NURO con tus herramientas favoritas</p>
                    </div>
                    
                    <div className="bg-white/95 backdrop-blur-lg p-4 sm:p-6 rounded-xl border border-blue-200/50 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                      <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 mx-auto mb-3 group-hover:text-emerald-700 animate-floatSpin" />
                      <h3 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">Aplicación Móvil</h3>
                      <p className="text-xs sm:text-sm text-gray-600">NURO en iOS y Android próximamente</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <a
                      href="mailto:feedback@nuro-technologies.com"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-500 relative overflow-hidden group text-sm sm:text-base"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-purple-400/50 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                      <span className="relative">Enviar Sugerencias</span>
                    </a>
                    <Link
                      href="/"
                      className="text-blue-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent font-medium text-sm sm:text-base relative group"
                    >
                      <span>Unirse a Updates por Email</span>
                      <ArrowUp className="w-4 h-4 inline-block ml-1 animate-floatSpin" />
                      <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-12 sm:mt-16 scroll-mt-28">
              <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200/50 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-subtleGlow">Leyenda de Cambios:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-800 p-2 rounded-lg">
                      <Plus className="w-4 h-4 animate-floatSpin" />
                    </div>
                    <span className="text-sm text-gray-600"><strong>Nueva:</strong> Función completamente nueva</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 p-2 rounded-lg">
                      <ArrowUp className="w-4 h-4 animate-floatSpin" />
                    </div>
                    <span className="text-sm text-gray-600"><strong>Mejora:</strong> Optimización existente</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 p-2 rounded-lg">
                      <Bug className="w-4 h-4 animate-floatSpin" />
                    </div>
                    <span className="text-sm text-gray-600"><strong>Corrección:</strong> Bug solucionado</span>
                  </div>
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
                  <div className="text-xs text-gray-600">Historial de Versiones</div>
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
                <Shield className="w-6 h-6 text-amber-500 animate-floatSpin" />
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-subtleGlow">Aviso de Seguridad</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Windows puede mostrar una advertencia. NURO es completamente seguro.
              </p>
              <ol className="space-y-3 mb-6 text-sm text-gray-600">
                <li className="flex items-center space-x-3">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-subtleGlow">1</span>
                  <span>Windows muestra: Windows protegió tu PC</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-subtleGlow">2</span>
                  <span>Haz clic en Más información</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-subtleGlow">3</span>
                  <span>Haz clic en Ejecutar de todos modos</span>
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

export default NuroChangelogPage;