"use client";
import { useState, useEffect } from 'react';
import { Calendar, Home, Tag, Zap, Shield, Eye, MessageSquare, Settings, Bug, Plus, ArrowUp, Download, Star, Info, Clock, Users, Code } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const NuroChangelogPage = () => {
  const [selectedVersion, setSelectedVersion] = useState('all');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth > 768) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
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
      case 'new': return 'bg-green-100 text-green-800';
      case 'improvement': return 'bg-blue-100 text-blue-800';
      case 'fix': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <>
      <head>
        <title>Changelog - NURO | Historial de Versiones y Actualizaciones</title>
        <meta name="description" content="Mantente al día con las últimas actualizaciones de NURO. Nuevas funciones, mejoras y correcciones en cada versión." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://nuro-ai.com/changelog" />
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
                <Image src="/images/nurologo.png" alt="NURO" width={48} height={48} className="drop-shadow-lg" />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-md"></div>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-gray-900">Changelog</div>
                <div className="text-xs sm:text-sm text-gray-500">Historial de versiones</div>
              </div>
            </div>
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
              <Home className="w-4 h-4" />
              <span className="font-medium">Volver al Inicio</span>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 bg-gradient-to-br from-emerald-50 to-cyan-50 py-12 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-block bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-full px-4 sm:px-6 py-2 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs sm:text-sm font-semibold text-emerald-800">ACTUALIZACIONES</span>
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                Siempre
                <span className="block bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  Evolucionando
                </span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed mb-8 sm:mb-12">
                Descubre las últimas funciones, mejoras y correcciones en cada versión de NURO. 
                Nos comprometemos a mejorar continuamente tu experiencia.
              </p>

              {/* Current Version Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto mb-8">
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
                  <Tag className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <div className="font-bold text-lg text-gray-900">v{changelogData[0]?.version ?? 'N/A'}</div>
                  <div className="text-xs text-gray-600">Versión Actual</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
                  <Download className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="font-bold text-lg text-gray-900">{changelogData[0]?.stats.downloads ?? '0'}</div>
                  <div className="text-xs text-gray-600">Descargas</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
                  <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="font-bold text-lg text-gray-900">{changelogData[0] ? new Date(changelogData[0].date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'N/A'}</div>
                  <div className="text-xs text-gray-600">Última Actualización</div>
                </div>
              </div>

              {/* Quick Download */}
              <Link
                href="/"
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Download className="w-5 h-5" />
                <span className="text-sm sm:text-base">Descargar Última Versión</span>
              </Link>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            
            {/* Version Filter */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Filtrar por Versión</h2>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {versions.map((version) => (
                  <button
                    key={version}
                    onClick={() => setSelectedVersion(version)}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
                      selectedVersion === version
                        ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
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

            {/* Changelog Timeline */}
            <div className="space-y-8 sm:space-y-12">
              {filteredChangelog.map((release, index) => (
                <div key={release.version} className="relative">
                  
                  {/* Timeline Line */}
                  {index < filteredChangelog.length - 1 && (
                    <div className="absolute left-6 sm:left-8 top-16 sm:top-20 bottom-0 w-0.5 bg-gray-200"></div>
                  )}
                  
                  <div className="flex items-start space-x-4 sm:space-x-6">
                    
                    {/* Version Badge */}
                    <div className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                      release.status === 'stable' 
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' 
                        : release.status === 'planned'
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}>
                      <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    
                    {/* Release Content */}
                    <div className="flex-1 bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                      
                      {/* Release Header */}
                      <div className="p-6 sm:p-8 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                v{release.version}
                              </h2>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                release.type === 'major' 
                                  ? 'bg-red-100 text-red-800' 
                                  : release.type === 'minor'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {release.type.toUpperCase()}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                release.status === 'stable' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {release.status === 'stable' ? 'ESTABLE' : 'PLANIFICADO'}
                              </span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{release.title}</h3>
                            <p className="text-gray-600 text-sm sm:text-base">{release.description}</p>
                          </div>
                          
                          <div className="flex flex-col sm:items-end space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(release.date).toLocaleDateString('es-ES', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                            {release.status === 'stable' && (
                              <Link
                                href="/"
                                className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                <span>Descargar</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Release Stats */}
                      <div className="px-6 sm:px-8 py-4 bg-gray-50 border-b border-gray-100">
                        <div className="grid grid-cols-3 gap-4 sm:gap-6">
                          <div className="text-center">
                            <div className="font-bold text-lg sm:text-xl text-gray-900">{release.stats.new_features}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Nuevas Funciones</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-lg sm:text-xl text-gray-900">{release.stats.issues_fixed}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Problemas Resueltos</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-lg sm:text-xl text-gray-900">{release.stats.downloads}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Descargas</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Changes List */}
                      <div className="p-6 sm:p-8">
                        <h4 className="text-lg font-bold text-gray-900 mb-6">Cambios en esta versión:</h4>
                        <div className="space-y-4 sm:space-y-6">
                          {release.changes.map((change, changeIndex) => {
                            const TypeIcon = getTypeIcon(change.type);
                            const CategoryIcon = getCategoryIcon(change.category);
                            
                            return (
                              <div key={changeIndex} className="flex items-start space-x-4">
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  <div className={`p-2 rounded-lg ${getTypeColor(change.type)}`}>
                                    <TypeIcon className="w-4 h-4" />
                                  </div>
                                  <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                                    <CategoryIcon className="w-4 h-4" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{change.title}</h5>
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
            <div className="mt-16 sm:mt-20">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl sm:rounded-3xl border border-blue-200 p-6 sm:p-8 text-center">
                <div className="max-w-3xl mx-auto">
                  <Star className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-4 sm:mb-6" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                    ¿Qué viene después?
                  </h2>
                  <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                    Estamos trabajando en funciones increíbles para las próximas versiones. 
                    Únete a nuestra comunidad para influir en el desarrollo de NURO.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-bold text-gray-900 mb-2">Colaboración en Equipo</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Comparte análisis y workflows con tu equipo</p>
                    </div>
                    
                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                      <Code className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-3" />
                      <h3 className="font-bold text-gray-900 mb-2">API Completa</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Integra NURO con tus herramientas favoritas</p>
                    </div>
                    
                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                      <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 mx-auto mb-3" />
                      <h3 className="font-bold text-gray-900 mb-2">Aplicación Móvil</h3>
                      <p className="text-xs sm:text-sm text-gray-600">NURO en iOS y Android próximamente</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <a
                      href="mailto:feedback@nuro-technologies.com"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
                    >
                      Enviar Sugerencias
                    </a>
                    <Link
                      href="/"
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
                    >
                      Unirse a Updates por Email →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-12 sm:mt-16">
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Leyenda de Cambios:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 text-green-800 p-2 rounded-lg">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-gray-700"><strong>Nueva:</strong> Función completamente nueva</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-800 p-2 rounded-lg">
                      <ArrowUp className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-gray-700"><strong>Mejora:</strong> Optimización existente</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 text-red-800 p-2 rounded-lg">
                      <Bug className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-gray-700"><strong>Corrección:</strong> Bug solucionado</span>
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
                <Image src="/images/nurologo.png" alt="NURO" width={48} height={48} />
                <div>
                  <div className="text-base sm:text-lg font-bold text-gray-900">NURO Technologies</div>
                  <div className="text-xs sm:text-sm text-gray-500">Historial de Versiones</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-8">
                <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1 text-sm">
                  <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Inicio</span>
                </Link>
                <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Documentación
                </Link>
                <Link href="/faq" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  FAQ
                </Link>
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

export default NuroChangelogPage;