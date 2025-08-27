"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Lock, Eye, Database, Globe, User, FileText, Clock, CheckCircle, AlertTriangle, ArrowRight, Home, Mail, Phone } from 'lucide-react';

const NuroPrivacyPage = () => {
  const [activeSection, setActiveSection] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      let currentSection = '';
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          currentSection = section.getAttribute('data-section');
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
    { id: 'recopilacion', title: 'Información que Recopilamos', icon: Database },
    { id: 'uso', title: 'Cómo Usamos tu Información', icon: Eye },
    { id: 'procesamiento', title: 'Procesamiento Local', icon: Lock },
    { id: 'seguridad', title: 'Seguridad de Datos', icon: Shield },
    { id: 'derechos', title: 'Tus Derechos', icon: User },
    { id: 'contacto', title: 'Contacto', icon: Mail }
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
        
        {/* Advanced Animated Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-60 animate-ping"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full opacity-40 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/6 w-3 h-3 bg-cyan-300 rounded-full opacity-30 animate-bounce"></div>
          
          {/* Dynamic Mouse-Following Element */}
          <div 
            className="absolute w-96 h-96 rounded-full opacity-5 pointer-events-none transition-all duration-1000 ease-out"
            style={{
              left: mousePosition.x - 192,
              top: mousePosition.y - 192,
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.1) 50%, transparent 70%)',
            }}
          ></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Header */}
        <nav className="relative z-20 container mx-auto px-6 py-6 backdrop-blur-md bg-white/80 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Image src="/images/nurologo.png" alt="NURO" width={64} height={64} className="w-16 h-16 drop-shadow-lg" />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-md"></div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">Política de Privacidad</div>
                <div className="text-sm text-gray-500">Última actualización: 26 de agosto, 2025</div>
              </div>
            </div>
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Home className="w-5 h-5" />
              <span className="font-medium">Volver al Inicio</span>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 bg-gradient-to-br from-blue-50 to-purple-50 py-20">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-2 mb-6">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">PRIVACIDAD Y SEGURIDAD</span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Tu Privacidad es
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Nuestra Prioridad
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                NURO está diseñado desde cero con privacidad por diseño. Procesamiento 100% local, 
                cifrado de extremo a extremo y control total sobre tus datos.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50">
                  <Lock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="font-bold text-gray-900">100% Local</div>
                  <div className="text-sm text-gray-600">Sin servidores externos</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50">
                  <Shield className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <div className="font-bold text-gray-900">Cifrado AES-256</div>
                  <div className="text-sm text-gray-600">Protección militar</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50">
                  <User className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                  <div className="font-bold text-gray-900">Control Total</div>
                  <div className="text-sm text-gray-600">Tus datos, tus reglas</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12">
              
              {/* Sidebar Navigation */}
              <div className="lg:w-1/4">
                <div className="sticky top-8 bg-white rounded-3xl border border-gray-200 p-6 shadow-lg">
                  <h3 className="font-bold text-gray-900 mb-6">Contenido</h3>
                  <nav className="space-y-2">
                    {sections.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                          activeSection === section.id
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <section.icon className="w-4 h-4 flex-shrink-0" />
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
                  <section data-section="recopilacion" id="recopilacion" className="scroll-mt-8">
                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-3 rounded-xl">
                          <Database className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Información que Recopilamos</h2>
                      </div>

                      <div className="space-y-8">
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100">
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                            Datos Procesados Localmente
                          </h3>
                          <ul className="space-y-3 text-gray-700">
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span><strong>Contenido de pantalla:</strong> Analizado únicamente en tu dispositivo para generar respuestas contextuales</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span><strong>Preferencias de configuración:</strong> Guardadas localmente para personalizar tu experiencia</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span><strong>Datos de uso:</strong> Estadísticas anónimas para mejorar el rendimiento (solo localmente)</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-100">
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                            Lo que NO Recopilamos
                          </h3>
                          <ul className="space-y-3 text-gray-700">
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>No enviamos capturas de pantalla a servidores externos</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>No accedemos a archivos personales sin tu consentimiento</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>No rastreamos tu actividad en línea fuera de NURO</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>No compartimos datos con terceros con fines comerciales</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Cómo Usamos tu Información */}
                  <section data-section="uso" id="uso" className="scroll-mt-8">
                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-400 p-3 rounded-xl">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Cómo Usamos tu Información</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Procesamiento de IA</h3>
                          <p className="text-gray-700 mb-4">
                            Los datos visuales se procesan exclusivamente en tu dispositivo usando nuestros 
                            modelos de IA locales para generar respuestas relevantes y contextualmente precisas.
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>100% procesamiento local</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Mejora del Producto</h3>
                          <p className="text-gray-700 mb-4">
                            Utilizamos datos agregados y anonimizados para mejorar la precisión de nuestros 
                            algoritmos y desarrollar nuevas funcionalidades.
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Datos completamente anónimos</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Personalización</h3>
                          <p className="text-gray-700 mb-4">
                            Adaptamos la experiencia según tus preferencias y patrones de uso, 
                            manteniendo toda la información en tu dispositivo local.
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Configuración local únicamente</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-2xl">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Soporte Técnico</h3>
                          <p className="text-gray-700 mb-4">
                            En caso de soporte técnico, solo accedemos a logs de diagnóstico 
                            no identificables y con tu consentimiento explícito.
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Solo con consentimiento</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Procesamiento Local */}
                  <section data-section="procesamiento" id="procesamiento" className="scroll-mt-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-200 p-8 shadow-lg">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-3 rounded-xl">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Procesamiento 100% Local</h2>
                      </div>

                      <div className="bg-white p-8 rounded-2xl border border-green-100 mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Arquitectura de Privacidad</h3>
                        <div className="space-y-6">
                          <div className="flex items-start space-x-4">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <Database className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 mb-2">Modelos de IA Locales</h4>
                              <p className="text-gray-700">
                                Todos los modelos de inteligencia artificial ejecutan directamente en tu dispositivo. 
                                No requieren conexión a internet para el análisis básico.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-4">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Lock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 mb-2">Cifrado en Reposo</h4>
                              <p className="text-gray-700">
                                Todos los datos almacenados localmente están cifrados usando AES-256, 
                                incluyendo configuraciones, caché y datos temporales.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-4">
                            <div className="bg-purple-100 p-2 rounded-lg">
                              <Shield className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 mb-2">Memoria Segura</h4>
                              <p className="text-gray-700">
                                Los datos en memoria se borran automáticamente al cerrar la aplicación. 
                                No quedan rastros de información sensible en el sistema.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Garantías de Privacidad</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-gray-700">Cero transmisión de datos personales</span>
                          </li>
                          <li className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-gray-700">Funcionamiento offline completo</span>
                          </li>
                          <li className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-gray-700">Auditoría de código abierto disponible</span>
                          </li>
                          <li className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-gray-700">Certificación independiente de seguridad</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Seguridad de Datos */}
                  <section data-section="seguridad" id="seguridad" className="scroll-mt-8">
                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-xl">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Seguridad de Datos</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-6">Medidas de Protección</h3>
                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-100">
                              <h4 className="font-bold text-gray-900 mb-2">Cifrado de Extremo a Extremo</h4>
                              <p className="text-sm text-gray-700">AES-256 para todos los datos almacenados y RSA-4096 para comunicaciones</p>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                              <h4 className="font-bold text-gray-900 mb-2">Autenticación Multifactor</h4>
                              <p className="text-sm text-gray-700">Opciones biométricas y tokens de seguridad para funciones avanzadas</p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
                              <h4 className="font-bold text-gray-900 mb-2">Auditorías de Seguridad</h4>
                              <p className="text-sm text-gray-700">Evaluaciones trimestrales por firmas de ciberseguridad independientes</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-6">Certificaciones</h3>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                              <CheckCircle className="w-6 h-6 text-green-500" />
                              <div>
                                <div className="font-bold text-gray-900">SOC 2 Type II</div>
                                <div className="text-sm text-gray-600">Controles de seguridad auditados</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                              <CheckCircle className="w-6 h-6 text-green-500" />
                              <div>
                                <div className="font-bold text-gray-900">ISO 27001</div>
                                <div className="text-sm text-gray-600">Gestión de seguridad de la información</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                              <CheckCircle className="w-6 h-6 text-green-500" />
                              <div>
                                <div className="font-bold text-gray-900">GDPR Compliant</div>
                                <div className="text-sm text-gray-600">Cumplimiento total con RGPD</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Tus Derechos */}
                  <section data-section="derechos" id="derechos" className="scroll-mt-8">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-200 p-8 shadow-lg">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Tus Derechos de Privacidad</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-blue-100">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Derecho de Acceso</h3>
                          <p className="text-gray-700 mb-4">
                            Tienes derecho a saber qué información personal procesamos y cómo la utilizamos.
                          </p>
                          <div className="text-sm text-blue-600 font-medium">
                            Respuesta en menos de 48 horas
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-blue-100">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Derecho de Rectificación</h3>
                          <p className="text-gray-700 mb-4">
                            Puedes solicitar la corrección de cualquier información personal inexacta o incompleta.
                          </p>
                          <div className="text-sm text-blue-600 font-medium">
                            Corrección inmediata
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-blue-100">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Derecho de Eliminación</h3>
                          <p className="text-gray-700 mb-4">
                            Tienes el derecho a solicitar la eliminación de tus datos personales bajo ciertas condiciones.
                          </p>
                          <div className="text-sm text-blue-600 font-medium">
                            Eliminación en 24 horas
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-blue-100">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Derecho de Portabilidad</h3>
                          <p className="text-gray-700 mb-4">
                            Puedes solicitar una copia de tus datos personales en un formato estructurado y legible.
                          </p>
                          <div className="text-sm text-blue-600 font-medium">
                            Exportación JSON/CSV
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 bg-white p-6 rounded-2xl border border-blue-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Cómo Ejercer tus Derechos</h3>
                        <p className="text-gray-700 mb-4">
                          Para ejercer cualquiera de estos derechos, contáctanos a través de los medios proporcionados 
                          en la sección de contacto. Procesamos todas las solicitudes de manera gratuita y sin demoras innecesarias.
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-blue-600">
                          <Mail className="w-4 h-4" />
                          <span>privacy@nuro-technologies.com</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Contacto */}
                  <section data-section="contacto" id="contacto" className="scroll-mt-8">
                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Contacto y Soporte</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-6">Oficial de Protección de Datos</h3>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Mail className="w-5 h-5 text-blue-600" />
                              <div>
                                <div className="font-medium text-gray-900">privacy@nuro-technologies.com</div>
                                <div className="text-sm text-gray-600">Para consultas sobre privacidad</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Phone className="w-5 h-5 text-green-600" />
                              <div>
                                <div className="font-medium text-gray-900">+1 (555) 123-4567</div>
                                <div className="text-sm text-gray-600">Soporte telefónico 24/7</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-6">Tiempos de Respuesta</h3>
                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">Consultas de privacidad</span>
                                <span className="text-green-600 font-bold">48 horas</span>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">Solicitudes de datos</span>
                                <span className="text-blue-600 font-bold">72 horas</span>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">Soporte técnico</span>
                                <span className="text-purple-600 font-bold">24 horas</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-start space-x-4">
                          <Clock className="w-6 h-6 text-blue-600 mt-1" />
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2">Última Actualización</h4>
                            <p className="text-gray-700 mb-2">
                              Esta política de privacidad fue actualizada por última vez el 26 de agosto de 2025. 
                              Notificaremos sobre cambios significativos con al menos 30 días de anticipación.
                            </p>
                            <div className="text-sm text-blue-600 font-medium">
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
        <footer className="py-16 border-t border-gray-200 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-8 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <Image src="/images/nurologo.png" alt="NURO" width={48} height={48} className="w-12 h-12" />
                <div>
                  <div className="text-lg font-bold text-gray-900">NURO Technologies</div>
                  <div className="text-sm text-gray-500">Inteligencia Artificial Avanzada</div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-8">
                <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1">
                  <Home className="w-4 h-4" />
                  <span>Inicio</span>
                </Link>
                <a href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>Términos de Servicio</span>
                </a>
                <div className="text-gray-500 text-sm">
                  © 2025 NURO Technologies. Todos los derechos reservados.
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default NuroPrivacyPage;