"use client";
import React, { useState, useEffect } from 'react';
import { Download, Brain, Zap, Shield, Star, Users, Check, AlertTriangle, ArrowRight, Play, Cpu, Eye, MessageSquare, Sparkles, Globe, Lock, Award, ChevronRight, Layers, Hexagon, Orbit, Zap as Lightning, Database, Network, Bot } from 'lucide-react';


// Google Analytics tracking functions
const trackEvent = (action: string, category: string, label?: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};

const trackDownload = () => trackEvent('download', 'engagement', 'nuro_download_v1.0.0');
const trackSectionView = (section: string) => trackEvent('section_view', 'engagement', section);

const NuroLandingPage = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Feature rotation
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 4000);

    // Mouse tracking (only on desktop)
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth > 768) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    // Intersection Observer for section tracking
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          trackSectionView(entry.target.id);
        }
      });
    }, { threshold: 0.5 });

    // Observe sections
    document.querySelectorAll('[id]').forEach((el) => {
      observer.observe(el);
    });

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  const handleDownload = () => {
    if (!emailSubmitted) {
      setShowEmailCapture(true);
      return;
    }
    
    trackDownload();
    setShowWarning(true);
    setTimeout(() => {
      window.open('https://github.com/canaya2002/ai-assistant-professional/releases/download/v1.0.0/AI.Assistant.Professional.Setup.1.0.0.exe', '_blank');
    }, 1000);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      alert('Por favor ingresa un email válido');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'download_page' })
      });

      const result = await response.json();

      if (result.success) {
        setEmailSubmitted(true);
        setShowEmailCapture(false);
        
        // Track successful email capture
        trackEvent('email_capture', 'lead_generation', 'download_intent');
        
        // Proceed with download
        setTimeout(() => {
          handleDownload();
        }, 500);
      } else {
        alert(result.error || 'Error al suscribirse. Inténtalo de nuevo.');
      }
      
    } catch (error) {
      console.error('Error submitting email:', error);
      alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    { icon: Eye, text: "Análisis Visual Avanzado", color: "from-blue-500 to-cyan-400" },
    { icon: MessageSquare, text: "IA Conversacional", color: "from-purple-500 to-pink-400" },
    { icon: Lightning, text: "Procesamiento Instantáneo", color: "from-emerald-500 to-teal-400" }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden relative">
      
      {/* Advanced Animated Background - Hidden on mobile for performance */}
      <div className="hidden md:block fixed inset-0 pointer-events-none">
        {/* Floating Geometric Elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full opacity-40 animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/6 w-3 h-3 bg-cyan-300 rounded-full opacity-20 animate-bounce"></div>
        
        {/* Dynamic Mouse-Following Element */}
        <div 
          className="absolute w-96 h-96 rounded-full opacity-3 pointer-events-none transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.05) 50%, transparent 70%)',
          }}
        ></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.01]" style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className={`max-w-6xl mx-auto text-center transform transition-all duration-1500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          
          {/* Animated Feature Badge */}
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-full px-4 sm:px-6 py-2 mb-8 sm:mb-12 shadow-lg backdrop-blur-sm">
            {(() => {
              const IconComponent = features[currentFeature].icon;
              return IconComponent ? (
                <div className={`p-1.5 rounded-lg bg-gradient-to-r ${features[currentFeature].color}`}>
                  <IconComponent className="w-3 h-3 text-white" />
                </div>
              ) : null;
            })()}
            <span className="text-xs sm:text-sm font-semibold text-gray-700">{features[currentFeature].text}</span>
            <div className="flex space-x-1">
              {features.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    index === currentFeature ? 'bg-blue-500 w-4' : 'bg-gray-300'
                  }`}
                ></div>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* Main Title */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-4 sm:mb-6 leading-none">
              <span className="block bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent">
                NURO
              </span>
            </h1>
            
            {/* Floating Elements around NURO - Hidden on mobile */}
            <div className="hidden sm:block absolute -top-6 -left-6 opacity-60">
              <Hexagon className="w-6 h-6 text-blue-400 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div className="hidden sm:block absolute -top-3 -right-8 opacity-40">
              <Orbit className="w-5 h-5 text-purple-400 animate-bounce" />
            </div>
            <div className="hidden sm:block absolute -bottom-4 left-0 opacity-50">
              <Layers className="w-7 h-7 text-cyan-400 animate-pulse" />
            </div>
          </div>
          
          <div className="text-xl sm:text-2xl md:text-3xl font-light text-gray-700 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
              Inteligencia Artificial Avanzada
            </span>
            <br />
            para Análisis Visual y Asistencia Profesional
          </div>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-10 sm:mb-16 max-w-3xl mx-auto leading-relaxed px-4">
            Revoluciona tu flujo de trabajo con el asistente de IA más sofisticado del mercado. 
            Procesamiento neural avanzado, comprensión contextual y respuestas instantáneas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center mb-12 sm:mb-20 px-4">
            <button 
              onClick={handleDownload}
              className="group w-full sm:w-auto relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-3xl text-lg sm:text-xl font-bold flex items-center justify-center space-x-3 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Download className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-bounce relative z-10" />
              <span className="relative z-10">Descarga Gratuita</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform relative z-10" />
            </button>
            
            <button className="group flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors duration-300">
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-3 rounded-full group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm sm:text-base">Ver Demostración</div>
                <div className="text-xs sm:text-sm text-gray-500">2 min de duración</div>
              </div>
            </button>
          </div>

          <div className="text-xs sm:text-sm text-gray-500 mb-8 sm:mb-12 space-y-2 px-4">
            <div>Windows 10/11 • Versión 1.0.0 • Instalación Segura</div>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                <span>Certificado de Seguridad</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                <span>Procesamiento Local</span>
              </div>
            </div>
          </div>

          {/* Advanced Trust Indicators */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto px-4">
            <div className="group p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-lg sm:text-2xl text-gray-900">1,247+</div>
              <div className="text-xs sm:text-sm text-gray-600">Usuarios Activos</div>
            </div>
            <div className="group p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-lg sm:text-2xl text-gray-900">4.9/5</div>
              <div className="text-xs sm:text-sm text-gray-600">Calificación</div>
            </div>
            <div className="group p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
              <Network className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-lg sm:text-2xl text-gray-900">99.9%</div>
              <div className="text-xs sm:text-sm text-gray-600">Disponibilidad</div>
            </div>
            <div className="group p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
              <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-lg sm:text-2xl text-gray-900">50ms</div>
              <div className="text-xs sm:text-sm text-gray-600">Tiempo Respuesta</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        {/* Background Pattern - Hidden on mobile */}
        <div className="hidden md:block absolute inset-0 opacity-3">
          <div className="absolute top-20 left-20 w-32 h-32 border border-blue-200 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 border border-purple-200 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-gray-200 rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 sm:px-6 py-2 mb-4 sm:mb-6">
              <span className="text-xs sm:text-sm font-semibold text-blue-800">TECNOLOGÍA AVANZADA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-8 leading-tight px-4">
              Capacidades de
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Próxima Generación
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              NURO integra las tecnologías de inteligencia artificial más avanzadas para ofrecerte 
              una experiencia sin precedentes en asistencia digital.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-20">
            <div className="group relative bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-500 transform hover:scale-105">
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-500 to-cyan-400 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:rotate-6 transition-transform duration-500">
                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-900 pt-4 sm:pt-6">Visión Computacional Avanzada</h3>
              <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                Algoritmos de deep learning que analizan, interpretan y comprenden cualquier contenido visual 
                con precisión superior al 99.5%.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                  <span>Reconocimiento de texto OCR avanzado</span>
                </li>
                <li className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                  <span>Detección de objetos y contexto</span>
                </li>
                <li className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                  <span>Análisis semántico inteligente</span>
                </li>
              </ul>
            </div>

            <div className="group relative bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-500 transform hover:scale-105">
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-400 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:rotate-6 transition-transform duration-500">
                <Cpu className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-900 pt-4 sm:pt-6">Procesamiento Neural</h3>
              <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                Redes neuronales transformer de última generación optimizadas para respuestas 
                contextualmente precisas y relevantes.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                  <span>Arquitectura transformer optimizada</span>
                </li>
                <li className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                  <span>Memoria contextual persistente</span>
                </li>
                <li className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                  <span>Aprendizaje adaptativo continuo</span>
                </li>
              </ul>
            </div>

            <div className="group relative bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-500 transform hover:scale-105 md:col-span-2 lg:col-span-1">
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-500 to-teal-400 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:rotate-6 transition-transform duration-500">
                <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-900 pt-4 sm:pt-6">Interacción Natural</h3>
              <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                Procesamiento de lenguaje natural avanzado que comprende intenciones, 
                contexto y matices conversacionales.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                  <span>Comprensión contextual profunda</span>
                </li>
                <li className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                  <span>Generación de respuestas coherentes</span>
                </li>
                <li className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                  <span>Personalización adaptativa</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Additional Advanced Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-blue-100">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                  <Lightning className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900">Rendimiento Ultrarápido</h4>
              </div>
              <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                Optimizado para velocidades de procesamiento de menos de 50ms con arquitectura 
                de computación paralela y cachés inteligentes.
              </p>
              <div className="bg-white/60 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Tiempo de análisis visual:</span>
                    <span className="font-semibold">~30ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Generación de respuesta:</span>
                    <span className="font-semibold">~20ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Latencia total promedio:</span>
                    <span className="font-semibold text-green-600">~50ms</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-purple-100">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-400 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                  <Lock className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900">Seguridad y Privacidad</h4>
              </div>
              <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                Procesamiento local con cifrado de extremo a extremo. Tus datos nunca abandonan 
                tu dispositivo, garantizando privacidad absoluta.
              </p>
              <div className="bg-white/60 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <div className="text-xs sm:text-sm text-gray-600 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span>Procesamiento 100% local</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span>Cifrado AES-256</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span>Certificación SOC 2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-block bg-gradient-to-r from-gray-100 to-blue-100 rounded-full px-4 sm:px-6 py-2 mb-4 sm:mb-6">
              <span className="text-xs sm:text-sm font-semibold text-gray-700">PROCESO INTELIGENTE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-8 px-4">
              Cómo Funciona
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                la Magia de NURO
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Un proceso simple y elegante que revoluciona tu forma de trabajar
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Connection Lines - Hidden on mobile */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 transform -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 relative z-10">
              <div className="text-center group">
                <div className="relative mb-6 sm:mb-8">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-3xl font-bold mx-auto shadow-xl group-hover:scale-110 transition-transform duration-500">
                    1
                  </div>
                  <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-2xl sm:rounded-3xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">Instalación Inteligente</h3>
                <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base px-2">
                  Descarga e instala NURO en menos de 2 minutos. La configuración automática 
                  detecta tu sistema y optimiza el rendimiento según tu hardware.
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <div className="text-xs sm:text-sm text-blue-700 font-medium">Auto-configuración inteligente</div>
                </div>
              </div>

              <div className="text-center group">
                <div className="relative mb-6 sm:mb-8">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-400 text-white w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-3xl font-bold mx-auto shadow-xl group-hover:scale-110 transition-transform duration-500">
                    2
                  </div>
                  <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-purple-400 to-pink-300 rounded-2xl sm:rounded-3xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">Análisis Continuo</h3>
                <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base px-2">
                  NURO analiza discretamente todo el contenido visible en tu pantalla, 
                  construyendo un contexto inteligente sin interferir con tu trabajo.
                </p>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <div className="text-xs sm:text-sm text-purple-700 font-medium">Procesamiento en tiempo real</div>
                </div>
              </div>

              <div className="text-center group">
                <div className="relative mb-6 sm:mb-8">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-3xl font-bold mx-auto shadow-xl group-hover:scale-110 transition-transform duration-500">
                    3
                  </div>
                  <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-emerald-400 to-teal-300 rounded-2xl sm:rounded-3xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">Asistencia Proactiva</h3>
                <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base px-2">
                  Recibe sugerencias inteligentes, respuestas contextuales y automatización 
                  proactiva adaptada a tu flujo de trabajo específico.
                </p>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <div className="text-xs sm:text-sm text-emerald-700 font-medium">IA predictiva avanzada</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-4 sm:px-6 py-2 mb-4 sm:mb-6">
              <span className="text-xs sm:text-sm font-semibold text-purple-800">PLANES FLEXIBLES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-8 px-4">
              Planes Diseñados
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Para Tu Éxito
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Comienza gratis y escala según tus necesidades. Sin compromisos, con resultados garantizados.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-gray-200 hover:shadow-2xl transition-all duration-500 relative">
              <div className="mb-6 sm:mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">Plan Gratuito</h3>
                <p className="text-gray-600">Perfecto para comenzar</p>
              </div>
              <div className="mb-6 sm:mb-8">
                <div className="text-4xl sm:text-6xl font-bold text-gray-900 mb-2">$0</div>
                <div className="text-gray-500">por siempre</div>
              </div>
              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">10 análisis inteligentes</div>
                    <div className="text-xs sm:text-sm text-gray-600">por mes</div>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">IA básica</div>
                    <div className="text-xs sm:text-sm text-gray-600">Funcionalidades esenciales</div>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Soporte comunitario</div>
                    <div className="text-xs sm:text-sm text-gray-600">Documentación y foros</div>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Actualizaciones</div>
                    <div className="text-xs sm:text-sm text-gray-600">Versiones estables</div>
                  </div>
                </li>
              </ul>
              <button className="w-full py-3 sm:py-4 border-2 border-gray-300 rounded-xl sm:rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 text-sm sm:text-base">
                Incluido en la Descarga
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 sm:p-10 rounded-2xl sm:rounded-3xl border-2 border-blue-200 relative hover:shadow-2xl transition-all duration-500">
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-8 py-1 sm:py-2 rounded-full font-bold shadow-lg text-xs sm:text-sm">
                  MÁS POPULAR
                </div>
              </div>
              
              <div className="mb-6 sm:mb-8 pt-2 sm:pt-4">
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Plan Profesional</h3>
                <p className="text-gray-600">Para profesionales exigentes</p>
              </div>
              <div className="mb-6 sm:mb-8">
                <div className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">$19</div>
                <div className="text-gray-500">por mes</div>
              </div>
              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">500 análisis inteligentes</div>
                    <div className="text-xs sm:text-sm text-gray-600">50x más que el plan gratuito</div>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">IA avanzada</div>
                    <div className="text-xs sm:text-sm text-gray-600">Modelos premium y personalización</div>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Soporte prioritario 24/7</div>
                    <div className="text-xs sm:text-sm text-gray-600">Respuesta en menos de 1 hora</div>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Acceso beta</div>
                    <div className="text-xs sm:text-sm text-gray-600">Nuevas funciones primero</div>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Integraciones avanzadas</div>
                    <div className="text-xs sm:text-sm text-gray-600">APIs y automatizaciones</div>
                  </div>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base">
                Actualizar en la App
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 opacity-40"></div>
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight px-4">
            El Futuro de la
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Productividad es Hoy
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-10 sm:mb-16 max-w-3xl mx-auto leading-relaxed px-4">
            Únete a miles de profesionales que ya han revolucionado su forma de trabajar. 
            Descarga NURO y experimenta el poder de la inteligencia artificial avanzada.
          </p>
          
          <button 
            onClick={handleDownload}
            className="group w-full sm:w-auto bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white px-12 sm:px-16 md:px-20 py-5 sm:py-6 md:py-8 rounded-2xl sm:rounded-3xl text-lg sm:text-xl md:text-2xl font-bold flex items-center justify-center space-x-3 sm:space-x-5 mx-auto hover:shadow-2xl transition-all duration-500 transform hover:scale-105 relative overflow-hidden max-w-lg sm:max-w-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Download className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 group-hover:animate-bounce relative z-10" />
            <span className="relative z-10">Descargar NURO Gratis</span>
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:translate-x-2 transition-transform relative z-10" />
          </button>
          
          <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-xs sm:text-sm text-gray-500 px-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Disponible globalmente</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Certificado de seguridad</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Garantía de privacidad</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <img src="/images/nurologo.png" alt="NURO" className="w-10 h-10 sm:w-12 sm:h-12" />
              <div>
                <div className="text-base sm:text-lg font-bold text-gray-900">NURO Technologies</div>
                <div className="text-xs sm:text-sm text-gray-500">Inteligencia Artificial Avanzada</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-8">
              <a href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                Documentación
              </a>
              <a href="/faq" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                FAQ
              </a>
              <a href="/changelog" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                Changelog
              </a>
              <a href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1 text-sm">
                <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Política de Privacidad</span>
              </a>
              <a href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1 text-sm">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Términos de Servicio</span>
              </a>
              <div className="text-gray-500 text-xs sm:text-sm">
                © 2025 NURO Technologies. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Email Capture Modal */}
      {showEmailCapture && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl max-w-md sm:max-w-lg mx-auto shadow-2xl border">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2.5 sm:p-3 rounded-lg sm:rounded-xl">
                <Download className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Descarga NURO Gratis</h3>
            </div>
            <p className="text-gray-700 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
              Recibe actualizaciones, tips de productividad y acceso anticipado a nuevas funciones.
            </p>
            
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base disabled:opacity-50"
                />
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm text-gray-700 space-y-1">
                    <p><strong>✨ Versión 1.0.0 completa</strong> - 164MB, Windows 10/11</p>
                    <p><strong>🔧 Updates mensuales</strong> - Nuevas funciones y mejoras</p>
                    <p><strong>🚀 Early access</strong> - Prueba funciones beta primero</p>
                    <p><strong>💡 Tips de productividad</strong> - Maximiza tu flujo de trabajo</p>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:transform-none"
              >
                {isSubmitting ? 'Enviando...' : 'Descargar NURO + Unirse a Updates'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setEmailSubmitted(true);
                  setShowEmailCapture(false);
                  setTimeout(() => handleDownload(), 100);
                }}
                className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm transition-colors"
                disabled={isSubmitting}
              >
                Saltar y descargar directamente
              </button>
            </div>

            <div className="mt-4 text-center text-xs text-gray-500">
              No spam. Puedes cancelar en cualquier momento.
            </div>

            <button
              onClick={() => setShowEmailCapture(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl max-w-md sm:max-w-lg mx-auto shadow-2xl border">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-2.5 sm:p-3 rounded-lg sm:rounded-xl">
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Aviso de Seguridad</h3>
            </div>
            <p className="text-gray-700 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
              Windows mostrará una advertencia de "Publisher desconocido" porque NURO no está firmado 
              digitalmente (proceso que cuesta $300+ anuales). La aplicación es completamente segura.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
              <h4 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Pasos para la instalación:</h4>
              <ol className="space-y-2 sm:space-y-3">
                <li className="flex items-start space-x-2 sm:space-x-3">
                  <div className="bg-blue-600 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                  <span className="text-gray-700 text-sm sm:text-base">Windows muestra: "Windows protected your PC"</span>
                </li>
                <li className="flex items-start space-x-2 sm:space-x-3">
                  <div className="bg-blue-600 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                  <span className="text-gray-700 text-sm sm:text-base">Hacer clic en <strong>"More info"</strong> o <strong>"Más información"</strong></span>
                </li>
                <li className="flex items-start space-x-2 sm:space-x-3">
                  <div className="bg-green-600 text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                  <span className="text-gray-700 text-sm sm:text-base">Hacer clic en <strong>"Run anyway"</strong> o <strong>"Ejecutar de todas formas"</strong></span>
                </li>
              </ol>
            </div>
            <button 
              onClick={() => setShowWarning(false)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm sm:text-base"
            >
              Entendido, Continuar Descarga
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NuroLandingPage;