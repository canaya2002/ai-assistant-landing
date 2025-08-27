"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, Shield, User, Gavel, AlertTriangle, CheckCircle, Home, Mail, Globe, Clock, Scale, BookOpen, UserCheck, Zap, Lock, Award } from 'lucide-react';

const NuroTermsPage = () => {
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
    { id: 'aceptacion', title: 'Aceptación de Términos', icon: UserCheck },
    { id: 'licencia', title: 'Licencia de Uso', icon: BookOpen },
    { id: 'responsabilidades', title: 'Responsabilidades', icon: Shield },
    { id: 'restricciones', title: 'Restricciones de Uso', icon: AlertTriangle },
    { id: 'propiedad', title: 'Propiedad Intelectual', icon: Award },
    { id: 'limitaciones', title: 'Limitaciones', icon: Scale },
    { id: 'terminacion', title: 'Terminación', icon: Zap },
    { id: 'contacto', title: 'Contacto Legal', icon: Mail }
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
                <div className="text-xl font-bold text-gray-900">Términos de Servicio</div>
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
        <section className="relative z-10 bg-gradient-to-br from-indigo-50 to-purple-50 py-20">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-block bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full px-6 py-2 mb-6">
                <div className="flex items-center space-x-2">
                  <Gavel className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-indigo-800">TÉRMINOS LEGALES</span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Términos de
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Servicio
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Estos términos establecen las reglas para el uso de NURO y definen los derechos y 
                responsabilidades entre tú y NURO Technologies.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50">
                  <Scale className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                  <div className="font-bold text-gray-900">Uso Justo</div>
                  <div className="text-sm text-gray-600">Condiciones equilibradas</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50">
                  <Shield className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <div className="font-bold text-gray-900">Protección Legal</div>
                  <div className="text-sm text-gray-600">Derechos garantizados</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                  <div className="font-bold text-gray-900">Transparencia</div>
                  <div className="text-sm text-gray-600">Términos claros</div>
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
                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 text-indigo-700'
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

                  {/* Aceptación de Términos */}
                  <section data-section="aceptacion" id="aceptacion" className="scroll-mt-8">
                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-3 rounded-xl">
                          <UserCheck className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Aceptación de Términos</h2>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Consentimiento Informado</h3>
                          <p className="text-gray-700 leading-relaxed mb-4">
                            Al descargar, instalar o usar NURO, aceptas estar legalmente vinculado por estos 
                            términos de servicio. Si no estás de acuerdo con alguna parte de estos términos, 
                            no debes usar nuestro software.
                          </p>
                          <div className="bg-white/60 p-4 rounded-xl">
                            <h4 className="font-bold text-gray-900 mb-2">Requisitos de Aceptación:</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• Tener al menos 18 años o consentimiento parental</li>
                              <li>• Capacidad legal para celebrar contratos</li>
                              <li>• Cumplimiento con las leyes locales aplicables</li>
                              <li>• Comprensión de los términos en su totalidad</li>
                            </ul>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Modificaciones de Términos</h3>
                          <p className="text-gray-700 leading-relaxed mb-4">
                            Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                            Los cambios significativos se notificarán con al menos 30 días de anticipación.
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-purple-600">
                            <Clock className="w-4 h-4" />
                            <span>Notificación previa de 30 días para cambios importantes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Licencia de Uso */}
                  <section data-section="licencia" id="licencia" className="scroll-mt-8">
                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-3 rounded-xl">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Licencia de Uso</h2>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Licencia Otorgada</h3>
                          <p className="text-gray-700 leading-relaxed mb-4">
                            NURO Technologies te otorga una licencia personal, no exclusiva, no transferible 
                            y revocable para usar NURO de acuerdo con estos términos.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/60 p-4 rounded-xl">
                              <h4 className="font-bold text-emerald-700 mb-2 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Permitido
                              </h4>
                              <ul className="text-sm text-gray-700 space-y-1">
                                <li>• Uso personal y comercial</li>
                                <li>• Instalación en múltiples dispositivos</li>
                                <li>• Creación de copias de seguridad</li>
                                <li>• Configuración y personalización</li>
                              </ul>
                            </div>
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                              <h4 className="font-bold text-red-700 mb-2 flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Prohibido
                              </h4>
                              <ul className="text-sm text-gray-700 space-y-1">
                                <li>• Redistribución o reventa</li>
                                <li>• Ingeniería inversa</li>
                                <li>• Modificación del código fuente</li>
                                <li>• Uso para entrenar otros modelos de IA</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Tipos de Licencia</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                              <h4 className="font-bold text-gray-900 mb-2">Licencia Gratuita</h4>
                              <p className="text-sm text-gray-600 mb-2">Para uso personal y pequeñas empresas</p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                <li>• 10 análisis mensuales</li>
                                <li>• Funciones básicas</li>
                                <li>• Soporte comunitario</li>
                              </ul>
                            </div>
                            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-xl border border-blue-200">
                              <h4 className="font-bold text-gray-900 mb-2">Licencia Profesional</h4>
                              <p className="text-sm text-gray-600 mb-2">Para uso comercial avanzado</p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                <li>• 500 análisis mensuales</li>
                                <li>• Funciones premium</li>
                                <li>• Soporte prioritario 24/7</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Responsabilidades */}
                  <section data-section="responsabilidades" id="responsabilidades" className="scroll-mt-8">
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl border border-orange-200 p-8 shadow-lg">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-3 rounded-xl">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Responsabilidades del Usuario</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-orange-100">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Uso Apropiado</h3>
                          <ul className="space-y-3">
                            <li className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">Usar NURO de acuerdo con las leyes aplicables</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">Mantener la confidencialidad de datos sensibles</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">Reportar bugs y vulnerabilidades de seguridad</span>
                            </li>
                            <li className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">Mantener el software actualizado</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-orange-100">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Responsabilidad de Contenido</h3>
                          <p className="text-gray-700 mb-4">
                            Eres responsable del contenido que procesas a través de NURO. Debes asegurarte de:
                          </p>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li>• Tener autorización para procesar datos de terceros</li>
                            <li>• Cumplir con regulaciones de privacidad (GDPR, CCPA)</li>
                            <li>• No procesar contenido ilegal o malicioso</li>
                            <li>• Respetar derechos de propiedad intelectual</li>
                          </ul>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-orange-100">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Seguridad del Sistema</h3>
                          <p className="text-gray-700 mb-4">
                            Debes implementar medidas de seguridad apropiadas:
                          </p>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li>• Proteger credenciales de acceso</li>
                            <li>• Usar antivirus actualizado</li>
                            <li>• Mantener backups regulares</li>
                            <li>• Configurar firewall adecuadamente</li>
                          </ul>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-orange-100">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Uso Comercial</h3>
                          <p className="text-gray-700 mb-4">
                            Para uso comercial, se requieren consideraciones adicionales:
                          </p>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li>• Licencia comercial apropiada</li>
                            <li>• Capacitación del personal</li>
                            <li>• Políticas de uso interno</li>
                            <li>• Auditorías de cumplimiento</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Restricciones de Uso */}
                  <section data-section="restricciones" id="restricciones" className="scroll-mt-8">
                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-xl">
                          <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Restricciones de Uso</h2>
                      </div>

                      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border border-red-100 mb-8">
                        <h3 className="text-xl font-bold text-red-800 mb-4">Actividades Prohibidas</h3>
                        <p className="text-gray-700 mb-4">
                          El siguiente uso de NURO está estrictamente prohibido y resultará en la 
                          terminación inmediata de la licencia:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                            <h4 className="font-bold text-red-800 mb-2">Actividades Ilegales</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• Procesamiento de contenido ilegal</li>
                              <li>• Violación de derechos de autor</li>
                              <li>• Fraude o engaño</li>
                              <li>• Actividades terroristas o criminales</li>
                            </ul>
                          </div>

                          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                            <h4 className="font-bold text-orange-800 mb-2">Abuso Técnico</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• Ingeniería inversa del software</li>
                              <li>• Bypass de limitaciones de uso</li>
                              <li>• Ataques de denegación de servicio</li>
                              <li>• Extracción de modelos de IA</li>
                            </ul>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                            <h4 className="font-bold text-purple-800 mb-2">Contenido Restringido</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• Contenido que promueva odio</li>
                              <li>• Material sexualmente explícito</li>
                              <li>• Información de menores sin consentimiento</li>
                              <li>• Datos médicos sin autorización</li>
                            </ul>
                          </div>

                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <h4 className="font-bold text-blue-800 mb-2">Uso Comercial Restringido</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• Reventa sin autorización</li>
                              <li>• Integración en productos competidores</li>
                              <li>• Ofertas de servicios basados en NURO</li>
                              <li>• Uso para entrenar IA competidora</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 bg-gray-50 p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Consecuencias del Incumplimiento</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="bg-yellow-100 p-3 rounded-xl mb-3">
                              <AlertTriangle className="w-6 h-6 text-yellow-600 mx-auto" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">Primera Violación</h4>
                            <p className="text-sm text-gray-600">Advertencia formal y suspensión temporal</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-orange-100 p-3 rounded-xl mb-3">
                              <Shield className="w-6 h-6 text-orange-600 mx-auto" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">Violación Repetida</h4>
                            <p className="text-sm text-gray-600">Suspensión extendida y revisión legal</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-red-100 p-3 rounded-xl mb-3">
                              <Zap className="w-6 h-6 text-red-600 mx-auto" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">Violación Grave</h4>
                            <p className="text-sm text-gray-600">Terminación inmediata y acciones legales</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Propiedad Intelectual */}
                  <section data-section="propiedad" id="propiedad" className="scroll-mt-8">
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl border border-indigo-200 p-8 shadow-lg">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-3 rounded-xl">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Propiedad Intelectual</h2>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-indigo-100">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Derechos de NURO Technologies</h3>
                          <p className="text-gray-700 mb-6">
                            NURO Technologies es propietario de todos los derechos, títulos e intereses 
                            en y para NURO, incluyendo:
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-bold text-gray-900 mb-3">Software y Tecnología</h4>
                              <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span>Código fuente y binarios</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span>Algoritmos de IA y modelos entrenados</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span>Arquitectura y diseño de software</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span>Actualizaciones y mejoras</span>
                                </li>
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-bold text-gray-900 mb-3">Marcas y Contenido</h4>
                              <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span>Marca registrada &quot;NURO&quot;</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span>Logotipos e identidad visual</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span>Documentación y manuales</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span>Material de marketing</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-indigo-100">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Tus Derechos sobre el Contenido</h3>
                          <p className="text-gray-700 mb-4">
                            Mantienes la propiedad completa del contenido que procesas a través de NURO:
                          </p>
                          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                            <ul className="space-y-2 text-sm text-gray-700">
                              <li className="flex items-center space-x-2">
                                <Lock className="w-4 h-4 text-green-600" />
                                <span>Tus datos permanecen bajo tu control exclusivo</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <Lock className="w-4 h-4 text-green-600" />
                                <span>No reclamamos derechos sobre tu contenido procesado</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <Lock className="w-4 h-4 text-green-600" />
                                <span>Puedes exportar tus datos en cualquier momento</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <Lock className="w-4 h-4 text-green-600" />
                                <span>Procesamiento local garantiza tu privacidad</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-indigo-100">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Reportes de Infracción</h3>
                          <p className="text-gray-700 mb-4">
                            Si crees que tu propiedad intelectual ha sido infringida, contacta inmediatamente a:
                          </p>
                          <div className="bg-indigo-50 p-4 rounded-xl">
                            <div className="flex items-center space-x-2 mb-2">
                              <Mail className="w-4 h-4 text-indigo-600" />
                              <span className="text-sm font-medium text-indigo-800">legal@nuro-technologies.com</span>
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
                  <section data-section="limitaciones" id="limitaciones" className="scroll-mt-8">
                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-gray-600 to-gray-800 p-3 rounded-xl">
                          <Scale className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Limitaciones de Responsabilidad</h2>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200">
                          <div className="flex items-center space-x-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-yellow-600" />
                            <h3 className="text-xl font-bold text-gray-900">Exención de Garantías</h3>
                          </div>
                          <p className="text-gray-700 mb-4">
                            NURO se proporciona &quot;tal como está&quot; y &quot;según disponibilidad&quot;. No garantizamos que:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ul className="space-y-2 text-sm text-gray-700">
                              <li>• El software esté libre de errores</li>
                              <li>• Funcione ininterrumpidamente</li>
                              <li>• Sea compatible con todo hardware</li>
                              <li>• Los resultados sean 100% precisos</li>
                            </ul>
                            <ul className="space-y-2 text-sm text-gray-700">
                              <li>• Sea adecuado para usos específicos</li>
                              <li>• No contenga vulnerabilidades</li>
                              <li>• Cumpla con todas las regulaciones</li>
                              <li>• Genere resultados comercialmente viables</li>
                            </ul>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-red-50 p-6 rounded-2xl border border-red-200">
                            <h3 className="text-lg font-bold text-red-800 mb-4">Limitación de Daños</h3>
                            <p className="text-gray-700 text-sm mb-4">
                              En ningún caso NURO Technologies será responsable por:
                            </p>
                            <ul className="space-y-2 text-xs text-gray-600">
                              <li>• Daños indirectos o consecuenciales</li>
                              <li>• Pérdida de beneficios o ingresos</li>
                              <li>• Pérdida de datos o información</li>
                              <li>• Interrupción del negocio</li>
                              <li>• Daños punitivos o ejemplares</li>
                            </ul>
                          </div>

                          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                            <h3 className="text-lg font-bold text-blue-800 mb-4">Límite Máximo</h3>
                            <p className="text-gray-700 text-sm mb-4">
                              La responsabilidad total de NURO Technologies está limitada a:
                            </p>
                            <div className="bg-white p-4 rounded-xl border border-blue-100">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-800 mb-1">$100 USD</div>
                                <div className="text-xs text-gray-600">o el monto pagado en los últimos 12 meses, lo que sea mayor</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
                          <h3 className="text-lg font-bold text-green-800 mb-4">Nuestro Compromiso</h3>
                          <p className="text-gray-700 mb-4">
                            Aunque limitamos nuestra responsabilidad legal, nos comprometemos a:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ul className="space-y-2 text-sm text-gray-700">
                              <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Proporcionar soporte técnico responsivo</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Corregir errores críticos rápidamente</span>
                              </li>
                            </ul>
                            <ul className="space-y-2 text-sm text-gray-700">
                              <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Mantener altos estándares de calidad</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Comunicar cambios importantes</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Terminación */}
                  <section data-section="terminacion" id="terminacion" className="scroll-mt-8">
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl border border-red-200 p-8 shadow-lg">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-xl">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Terminación del Acuerdo</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-red-100">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Terminación por tu Parte</h3>
                          <p className="text-gray-700 mb-4">Puedes terminar este acuerdo en cualquier momento:</p>
                          <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Desinstalando NURO de todos tus dispositivos</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Eliminando todas las copias del software</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Dejando de usar nuestros servicios</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-red-100">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Terminación por Nuestra Parte</h3>
                          <p className="text-gray-700 mb-4">Podemos terminar tu licencia si:</p>
                          <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-center space-x-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span>Violas estos términos de servicio</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span>Usas el software para actividades ilegales</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span>Intentas evadir limitaciones técnicas</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-red-100">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Efectos de la Terminación</h3>
                          <p className="text-gray-700 mb-4">Al terminarse el acuerdo:</p>
                          <ul className="space-y-2 text-sm text-gray-700">
                            <li>• Cesará inmediatamente tu derecho de uso</li>
                            <li>• Debes eliminar todas las copias del software</li>
                            <li>• Los datos locales permanecerán en tu dispositivo</li>
                            <li>• Las secciones de limitación seguirán vigentes</li>
                          </ul>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-red-100">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Supervivencia de Términos</h3>
                          <p className="text-gray-700 mb-4">Después de la terminación, seguirán vigentes:</p>
                          <ul className="space-y-2 text-sm text-gray-700">
                            <li>• Limitaciones de responsabilidad</li>
                            <li>• Derechos de propiedad intelectual</li>
                            <li>• Obligaciones de confidencialidad</li>
                            <li>• Cláusulas de resolución de disputas</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Contacto Legal */}
                  <section data-section="contacto" id="contacto" className="scroll-mt-8">
                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Contacto Legal</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-6">Información Legal</h3>
                          <div className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                              <h4 className="font-bold text-gray-900 mb-2">NURO Technologies, Inc.</h4>
                              <div className="text-sm text-gray-700 space-y-1">
                                <p>1234 Innovation Drive</p>
                                <p>San Francisco, CA 94105</p>
                                <p>Estados Unidos</p>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                              <h4 className="font-bold text-gray-900 mb-2">Departamento Legal</h4>
                              <div className="text-sm text-gray-700 space-y-1">
                                <p>Email: legal@nuro-technologies.com</p>
                                <p>Teléfono: +1 (555) 123-4567</p>
                                <p>Fax: +1 (555) 123-4568</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-6">Jurisdicción y Ley Aplicable</h3>
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-4">Ley Aplicable</h4>
                            <p className="text-gray-700 mb-4">
                              Estos términos se rigen por las leyes del Estado de California, 
                              Estados Unidos, sin considerar sus principios de conflicto de leyes.
                            </p>
                            
                            <h4 className="font-bold text-gray-900 mb-4">Resolución de Disputas</h4>
                            <div className="space-y-3">
                              <div className="flex items-start space-x-3">
                                <div className="bg-blue-100 p-1 rounded">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">Negociación Directa</div>
                                  <div className="text-sm text-gray-600">Primer intento de resolución amistosa</div>
                                </div>
                              </div>
                              <div className="flex items-start space-x-3">
                                <div className="bg-purple-100 p-1 rounded">
                                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">Mediación</div>
                                  <div className="text-sm text-gray-600">Proceso de mediación vinculante</div>
                                </div>
                              </div>
                              <div className="flex items-start space-x-3">
                                <div className="bg-red-100 p-1 rounded">
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

                      <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-start space-x-4">
                          <Clock className="w-6 h-6 text-blue-600 mt-1" />
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2">Vigencia y Actualizaciones</h4>
                            <p className="text-gray-700 mb-2">
                              Estos términos de servicio entran en vigencia el 26 de agosto de 2025 y se actualizan 
                              periódicamente. Los cambios significativos se notificarán con 30 días de anticipación.
                            </p>
                            <div className="text-sm text-blue-600 font-medium">
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
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1">
                  <Lock className="w-4 h-4" />
                  <span>Política de Privacidad</span>
                </Link>
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

export default NuroTermsPage;