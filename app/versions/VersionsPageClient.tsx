// app/versions/VersionsPageClient.tsx - (NUEVO ARCHIVO - Componente de Cliente)
"use client";

import { useState, useEffect, useCallback, memo } from 'react';
import { Calendar, Tag, Zap, Shield, Eye, MessageSquare, Settings, Bug, Plus, ArrowUp, Download, Star, Info, Clock, Users, Code, Sparkles, Bot, Menu, X } from 'lucide-react';
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
  <div className="text-center transition-all duration-500 hover:scale-105 group cursor-pointer bg-gradient-to-br from-[#737373]/20 via-[#737373]/10 to-[#737373]/20 backdrop-blur-lg rounded-xl border border-[#737373]/50 p-4 shadow-lg hover:shadow-[#737373]/30">
    <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-gradient-to-r from-[#737373]/20 via-[#737373]/20 to-[#737373]/20 rounded-full shadow-md group-hover:shadow-lg border border-[#737373]/30 group-hover:border-[#737373]/50 transition-all duration-500">
      <Icon className="w-6 h-6 text-[#737373] group-hover:text-white animate-floatSpin" />
    </div>
    <div className="text-lg font-bold bg-gradient-to-r from-[#737373] to-white bg-clip-text text-transparent animate-subtleGlow">{value}</div>
    <div className="text-xs text-gray-600">{label}</div>
  </div>
));

StatCard.displayName = 'StatCard';

// Background video component - IGUAL A NORA
const VideoBackground = memo(function VideoBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: 'center center' }}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/images/fondo-nora-tres.mp4" type="video/mp4" />
        <source src="/fondo.webm" type="video/webm" />
      </video>
      {/* Overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />
    </div>
  );
});

// Enhanced Navigation - HEADER EXACTO DE NORA
const Navigation = memo(function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleWebAppClick = () => {
    window.location.href = '/app';
    setMobileMenuOpen(false);
  };

  const handleHomeClick = () => {
    window.location.href = '/';
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo as image - LOGO DE NORA */}
        <div className="flex items-center">
          <Image
            src="/images/nora.png"
            alt="NORA Logo"
            width={96}
            height={96}
            className="hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={handleHomeClick}
          />
        </div>

        {/* Enhanced buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={handleWebAppClick}
            className="px-6 py-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-full text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300 flex items-center space-x-2"
          >
            <span className="text-sm font-light">Web App</span>
            <Bot className="w-4 h-4" />
          </button>

          <button
            onClick={handleHomeClick}
            className="px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-light hover:bg-white/15 hover:border-white/30 transition-all duration-300"
          >
            Home
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-6 py-4 space-y-3">
            <button
              onClick={handleWebAppClick}
              className="w-full px-6 py-3 bg-black/20 backdrop-blur-sm border border-white/10 rounded-full text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span className="text-sm font-light">Web App</span>
              <Bot className="w-4 h-4" />
            </button>

            <button
              onClick={handleHomeClick}
              className="w-full px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-light hover:bg-white/15 hover:border-white/30 transition-all duration-300"
            >
              Home
            </button>
          </div>
        </div>
      )}
    </nav>
  );
});

export default function VersionsPageClient() {
  const [selectedVersion, setSelectedVersion] = useState('all');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

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
      case 'improvement': return 'bg-gradient-to-r from-[#737373]/20 to-[#737373]/10 text-[#737373]';
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

  return (
      <div className="min-h-screen bg-black text-white overflow-hidden">
        <Navigation />

        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <VideoBackground />

          <div className="relative z-30 container mx-auto px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="mb-1 animate-fade-up pt-24 md:pt-32">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 md:mb-12 tracking-wide" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Siempre Evolucionando
                </h1>
              </div>

              <h2 className="text-2xl md:text-4xl text-white/90 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed font-light animate-fade-up" style={{ animationDelay: '0.3s' }}>
                NORA Changelog
              </h2>

              <p className="text-lg md:text-xl text-white/80 mb-12 md:mb-16 max-w-2xl mx-auto leading-relaxed font-light animate-fade-up" style={{ animationDelay: '0.5s' }}>
                Descubre las últimas funciones, mejoras y correcciones en cada versión de NURO.
                Nos comprometemos a mejorar continuamente tu experiencia.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto mb-8 animate-fade-up" style={{ animationDelay: '0.7s' }}>
                <StatCard icon={Tag} value={`v${changelogData[0]?.version ?? 'N/A'}`} label="Versión Actual" />
                <StatCard icon={Download} value={changelogData[0]?.stats.downloads ?? '0'} label="Descargas" />
                <StatCard icon={Clock} value={changelogData[0] ? new Date(changelogData[0].date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'N/A'} label="Última Actualización" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-32 bg-black relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-light text-white mb-4 sm:mb-6 animate-fade-up" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Filtrar por Versión</h2>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {versions.map((version, index) => (
                    <button
                      key={version}
                      onClick={() => setSelectedVersion(version)}
                      className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 group relative overflow-hidden animate-fade-up ${
                        selectedVersion === version
                          ? 'bg-gradient-to-r from-[#737373] to-[#737373]/80 text-white shadow-lg'
                          : 'bg-gradient-to-br from-[#737373]/20 to-[#737373]/10 backdrop-blur-lg text-gray-300 hover:shadow-[#737373]/30 border border-[#737373]/50'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {version === 'all' ? (
                        <>
                          <Calendar className="w-4 h-4" />
                          <span>Todas las Versiones</span>
                        </>
                      ) : (
                        <>
                          <Tag className="w-4 h-4" />
                          <span>v{version}</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-8 sm:space-y-12">
                {filteredChangelog.map((release, index) => (
                  <div key={release.version} className="relative animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                    {index < filteredChangelog.length - 1 && (
                      <div className="absolute left-6 sm:left-8 top-16 sm:top-20 bottom-0 w-0.5 bg-gradient-to-b from-[#737373]/50 to-[#737373]/20"></div>
                    )}
                    
                    <div className="flex items-start space-x-4 sm:space-x-6">
                      <div className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg group relative ${
                        release.status === 'stable'
                          ? 'bg-gradient-to-r from-[#737373] to-[#737373]/80'
                          : release.status === 'planned'
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                          : 'bg-gradient-to-r from-[#737373]/80 to-[#737373]'
                      }`}>
                        <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 bg-gradient-to-br from-[#737373]/30 to-[#737373]/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-[#737373]/40 shadow-lg hover:shadow-[#737373]/30 transition-all duration-500 group relative overflow-hidden">
                        <div className="p-6 sm:p-8 border-b border-[#737373]/50">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <div className="flex items-center space-x-3 mb-2">
                                <h2 className="text-2xl sm:text-3xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                                  v{release.version}
                                </h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  release.type === 'major'
                                    ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
                                    : release.type === 'minor'
                                    ? 'bg-gradient-to-r from-[#737373]/20 to-[#737373]/10 text-[#737373]'
                                    : 'bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-800'
                                }`}>
                                  {release.type.toUpperCase()}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  release.status === 'stable'
                                    ? 'bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-800'
                                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                                }`}>
                                  {release.status === 'stable' ? 'ESTABLE' : 'PLANIFICADO'}
                                </span>
                              </div>
                              <h3 className="text-lg sm:text-xl font-light text-white mb-2" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>{release.title}</h3>
                              <p className="text-gray-400 text-sm sm:text-base">{release.description}</p>
                            </div>
                            
                            <div className="flex flex-col sm:items-end space-y-2">
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4 text-[#737373]" />
                                <span>{new Date(release.date).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}</span>
                              </div>
                              {release.status === 'stable' && (
                                <button
                                  onClick={handleDownload}
                                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#737373] to-[#737373]/80 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-[#737373]/30 transition-all duration-500"
                                >
                                  <Download className="w-4 h-4" />
                                  <span>Descargar</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="px-6 sm:px-8 py-4 bg-gradient-to-br from-[#737373]/20 to-[#737373]/10 backdrop-blur-lg border-b border-[#737373]/50">
                          <div className="grid grid-cols-3 gap-4 sm:gap-6">
                            <div className="text-center">
                              <div className="font-bold text-lg sm:text-xl text-white">{release.stats.new_features}</div>
                              <div className="text-xs sm:text-sm text-gray-400">Nuevas Funciones</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-lg sm:text-xl text-white">{release.stats.issues_fixed}</div>
                              <div className="text-xs sm:text-sm text-gray-400">Problemas Resueltos</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-lg sm:text-xl text-white">{release.stats.downloads}</div>
                              <div className="text-xs sm:text-sm text-gray-400">Descargas</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6 sm:p-8">
                          <h4 className="text-lg font-light text-white mb-6" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Cambios en esta versión:</h4>
                          <div className="space-y-4 sm:space-y-6">
                            {release.changes.map((change, changeIndex) => {
                              const TypeIcon = getTypeIcon(change.type);
                              const CategoryIcon = getCategoryIcon(change.category);
                              
                              return (
                                <div key={changeIndex} className="flex items-start space-x-4 group relative">
                                  <div className="flex items-center space-x-2 flex-shrink-0">
                                    <div className={`p-2 rounded-lg ${getTypeColor(change.type)}`}>
                                      <TypeIcon className="w-4 h-4" />
                                    </div>
                                    <div className="p-2 rounded-lg bg-gradient-to-r from-[#737373]/20 to-[#737373]/10 text-gray-400">
                                      <CategoryIcon className="w-4 h-4" />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-light text-white mb-1 text-sm sm:text-base" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>{change.title}</h5>
                                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{change.description}</p>
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
              
              <div className="mt-12 sm:mt-16">
                <div className="bg-gradient-to-br from-[#737373]/30 to-[#737373]/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#737373]/40">
                  <h3 className="text-lg font-light text-white mb-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Leyenda de Cambios:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-800 p-2 rounded-lg">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-gray-400"><strong>Nueva:</strong> Función completamente nueva</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-[#737373]/20 to-[#737373]/10 text-[#737373] p-2 rounded-lg">
                        <ArrowUp className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-gray-400"><strong>Mejora:</strong> Optimización existente</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 p-2 rounded-lg">
                        <Bug className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-gray-400"><strong>Corrección:</strong> Bug solucionado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-20 mt-20 bg-black">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <div className="md:col-span-1">
                <Image
                  src="/images/nora.png"
                  alt="NORA Logo"
                  width={80}
                  height={80}
                  className="mb-4"
                />
              </div>
              <div>
                <h3 className="text-white font-medium mb-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Products</h3>
                <ul className="space-y-2 text-gray-400 font-light">
                  <li><a href="#" className="hover:text-white transition-colors">NORA for iPhone</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">NORA for iPad</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">NORA for Apple Watch</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">NORA for Mac</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">NORA for Android</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-medium mb-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Information</h3>
                <ul className="space-y-2 text-gray-400 font-light">
                  <li><a href="#" className="hover:text-white transition-colors">What is NORA?</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">NORA for Work</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">NORA for Tasks</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">NORA for Essays</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-medium mb-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Community</h3>
                <ul className="space-y-2 text-gray-400 font-light">
                  <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-medium mb-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Company</h3>
                <ul className="space-y-2 text-gray-400 font-light">
                  <li><a href="/versions" className="hover:text-white transition-colors">Versions</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                  <li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="/terms" className="hover:text-white transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>

        {showWarning && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-[#737373]/30 to-[#737373]/10 backdrop-blur-lg p-8 rounded-xl max-w-md mx-auto shadow-xl border border-[#737373]/50">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-amber-500" />
                <h3 className="text-xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Aviso de Seguridad</h3>
              </div>
              <p className="text-gray-400 mb-4 text-sm">
                Windows puede mostrar una advertencia. NURO es completamente seguro.
              </p>
              <ol className="space-y-3 mb-6 text-sm text-gray-400">
                <li className="flex items-center space-x-3">
                  <span className="bg-gradient-to-r from-[#737373] to-[#737373]/80 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Windows muestra: Windows protegió tu PC</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="bg-gradient-to-r from-[#737373] to-[#737373]/80 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Haz clic en Más información</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="bg-gradient-to-r from-[#737373] to-[#737373]/80 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Haz clic en Ejecutar de todos modos</span>
                </li>
              </ol>
              <button
                onClick={() => setShowWarning(false)}
                className="w-full bg-gradient-to-r from-[#737373] to-[#737373]/80 text-white py-3 rounded-full font-medium text-sm hover:shadow-lg hover:shadow-[#737373]/40 transition-all duration-500"
              >
                Entendido, Continuar
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
          html {
            scroll-behavior: smooth;
          }
          body {
            font-family: 'Lastica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>
      </div>
  );
}