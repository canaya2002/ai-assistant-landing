"use client";
import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ChevronDown, ChevronUp, Home, HelpCircle, Shield, Download, Star, MessageCircle, ArrowRight, Bot, Lightbulb, Clock, Users, Code, Sparkles } from 'lucide-react';

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

const NuroFAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
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

  const categories = [
    { id: 'all', name: 'Todas las Preguntas', icon: HelpCircle, count: 25 },
    { id: 'general', name: 'General', icon: Bot, count: 8 },
    { id: 'installation', name: 'Instalación', icon: Download, count: 5 },
    { id: 'privacy', name: 'Privacidad', icon: Shield, count: 4 },
    { id: 'features', name: 'Funcionalidades', icon: Star, count: 6 },
    { id: 'technical', name: 'Soporte Técnico', icon: Code, count: 2 }
  ];

  const faqData = [
    // General
    {
      id: 1,
      category: 'general',
      question: '¿Qué es NURO?',
      answer: 'NURO es un asistente de inteligencia artificial avanzado que analiza tu pantalla en tiempo real y proporciona respuestas contextuales. Funciona completamente offline procesando todo localmente en tu dispositivo para garantizar máxima privacidad.'
    },
    {
      id: 2,
      category: 'general',
      question: '¿NURO es gratuito?',
      answer: 'Sí, NURO ofrece una versión gratuita con funcionalidades completas para uso personal. También tenemos planes profesionales para empresas que requieren funciones avanzadas y soporte prioritario.'
    },
    {
      id: 3,
      category: 'general',
      question: '¿En qué se diferencia NURO de otros asistentes de IA?',
      answer: 'NURO es único porque: 1) Procesa todo localmente - cero datos enviados a servidores, 2) Analiza visualmente tu pantalla para dar respuestas contextuales, 3) Funciona completamente offline, 4) Respuesta promedio de 50ms, 5) Privacidad garantizada al 100%.'
    },
    {
      id: 4,
      category: 'general',
      question: '¿Qué idiomas soporta NURO?',
      answer: 'Actualmente NURO soporta español, inglés, francés, alemán, italiano y portugués. Estamos trabajando en agregar más idiomas en futuras actualizaciones.'
    },
    {
      id: 5,
      category: 'general',
      question: '¿Puedo usar NURO para trabajo comercial?',
      answer: 'Absolutamente. NURO es perfecto para uso comercial y empresarial. Ofrecemos licencias comerciales con funciones avanzadas, soporte prioritario 24/7 y opciones de personalización para equipos.'
    },
    {
      id: 6,
      category: 'general',
      question: '¿NURO funciona con cualquier aplicación?',
      answer: 'Sí, NURO puede analizar cualquier contenido visible en tu pantalla, incluyendo navegadores web, documentos, aplicaciones de escritorio, videos, imágenes y más. Es completamente universal.'
    },
    {
      id: 7,
      category: 'general',
      question: '¿Hay límites en el uso gratuito?',
      answer: 'La versión gratuita permite hasta 100 consultas mensuales. Para uso ilimitado, considera nuestro plan profesional que también incluye funciones avanzadas y soporte prioritario.'
    },
    {
      id: 8,
      category: 'general',
      question: '¿Cómo puedo contactar soporte?',
      answer: 'Puedes contactarnos via email a support@nuro-technologies.com, a través del chat en vivo en nuestra web, o creando un ticket en nuestro portal de soporte. Respondemos en menos de 24 horas.'
    },

    // Installation
    {
      id: 9,
      category: 'installation',
      question: '¿Qué requisitos necesita mi computadora?',
      answer: 'NURO requiere: Windows 10 (1903+) o Windows 11, mínimo 4GB RAM (recomendado 8GB), 200MB de espacio libre, y procesador de 64 bits. No requiere conexión a internet para funcionar.'
    },
    {
      id: 10,
      category: 'installation',
      question: 'Windows Defender bloquea la instalación, ¿es seguro?',
      answer: 'Es completamente normal. Windows muestra esta advertencia porque NURO no tiene firma digital costosa. La aplicación es 100% segura. Simplemente haz clic en "More info" y luego "Run anyway" para continuar.'
    },
    {
      id: 11,
      category: 'installation',
      question: '¿Puedo instalar NURO en múltiples dispositivos?',
      answer: 'Sí, puedes instalar NURO en todos tus dispositivos personales. Para uso empresarial con múltiples licencias, contáctanos para obtener un descuento por volumen.'
    },
    {
      id: 12,
      category: 'installation',
      question: '¿Cómo actualizo NURO?',
      answer: 'NURO se actualiza automáticamente en segundo plano. También puedes verificar actualizaciones manualmente desde la configuración o descargando la última versión desde nuestra web.'
    },
    {
      id: 13,
      category: 'installation',
      question: '¿Cómo desinstalo NURO?',
      answer: 'Ve a Configuración > Apps > NURO > Desinstalar, o usa el Panel de Control de Windows. Todos los datos locales se eliminarán completamente, pero puedes exportar tu configuración antes de desinstalar.'
    },

    // Privacy
    {
      id: 14,
      category: 'privacy',
      question: '¿NURO envía mis datos a servidores?',
      answer: 'No, nunca. NURO procesa todo localmente en tu dispositivo. Cero capturas de pantalla, cero datos personales, cero transmisiones a servidores externos. Tu privacidad es nuestra máxima prioridad.'
    },
    {
      id: 15,
      category: 'privacy',
      question: '¿Qué datos almacena NURO localmente?',
      answer: 'NURO solo guarda: tus preferencias de configuración, historial local de consultas (opcional), y datos de rendimiento anónimos. Todo está cifrado con AES-256 y solo tú tienes acceso.'
    },
    {
      id: 16,
      category: 'privacy',
      question: '¿Puedo usar NURO offline completamente?',
      answer: 'Sí, NURO funciona 100% offline. Solo necesita internet para descargar actualizaciones opcionales. Todos los modelos de IA están instalados localmente en tu dispositivo.'
    },
    {
      id: 17,
      category: 'privacy',
      question: '¿NURO cumple con GDPR?',
      answer: 'Absolutamente. Como NURO procesa todo localmente y no envía datos a servidores, cumple automáticamente con GDPR, CCPA y todas las regulaciones de privacidad internacionales.'
    },

    // Features
    {
      id: 18,
      category: 'features',
      question: '¿Qué tan rápido responde NURO?',
      answer: 'NURO tiene un tiempo de respuesta promedio de 50 milisegundos. Al procesar todo localmente con IA optimizada, es significativamente más rápido que asistentes basados en la nube.'
    },
    {
      id: 19,
      category: 'features',
      question: '¿NURO puede leer texto en imágenes?',
      answer: 'Sí, NURO incluye OCR avanzado que puede leer y comprender texto en imágenes, PDFs, capturas de pantalla, videos, y cualquier contenido visual con precisión del 99.5%.'
    },
    {
      id: 20,
      category: 'features',
      question: '¿Puedo personalizar las respuestas de NURO?',
      answer: 'Sí, NURO aprende de tus preferencias y se adapta a tu estilo. Puedes configurar el tono de respuestas, idioma preferido, nivel de detalle, y crear comandos personalizados.'
    },
    {
      id: 21,
      category: 'features',
      question: '¿NURO funciona con múltiples monitores?',
      answer: 'Sí, NURO funciona perfectamente con configuraciones de múltiples monitores. Puede analizar contenido en cualquier pantalla y proporcionar respuestas contextualmente apropiadas.'
    },
    {
      id: 22,
      category: 'features',
      question: '¿Hay atajos de teclado?',
      answer: 'Sí, NURO incluye atajos personalizables. Por defecto: Ctrl+Shift+N activa NURO, Ctrl+Shift+H muestra historial, Ctrl+Shift+S abre configuración. Puedes cambiar todos los atajos.'
    },
    {
      id: 23,
      category: 'features',
      question: '¿NURO puede ayudar con código de programación?',
      answer: 'Absolutamente. NURO puede analizar, explicar, optimizar y debuggear código en más de 50 lenguajes de programación. También puede sugerir mejores prácticas y detectar errores.'
    },

    // Technical
    {
      id: 24,
      category: 'technical',
      question: 'NURO usa mucha CPU/RAM, ¿es normal?',
      answer: 'NURO está optimizado para usar mínimos recursos. Normalmente usa 2-4% CPU y 200-400MB RAM. Si experimentas uso alto, verifica que tienes la última versión o contacta soporte.'
    },
    {
      id: 25,
      category: 'technical',
      question: '¿NURO funciona con software antivirus?',
      answer: 'Sí, NURO es compatible con todos los antivirus principales. Algunos pueden mostrar alertas la primera vez (falsos positivos). Simplemente agrega NURO a las excepciones de tu antivirus.'
    }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const navigationItems = [
    { href: '/', label: 'Inicio' },
    { href: '/docs', label: 'Documentación' },
    { href: '/changelog', label: 'Changelog' },
  ];

  return (
    <>
      <head>
        <title>Preguntas Frecuentes - NURO | FAQ y Soporte</title>
        <meta name="description" content="Encuentra respuestas a las preguntas más frecuentes sobre NURO. Instalación, privacidad, funcionalidades y soporte técnico." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://nuro-ai.com/faq" />
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
                {mobileMenuOpen ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
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
                <span>Soporte y Ayuda • FAQ</span>
                <Sparkles className="w-4 h-4 text-blue-600 animate-floatSpin" />
              </div>

              <div className="relative mb-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6 animate-solarFlare leading-tight relative transform-gpu">
                  ¿Tienes Preguntas?
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
                Encuentra respuestas instantáneas a las preguntas más frecuentes sobre NURO. 
                Si no encuentras lo que buscas, contáctanos directamente.
              </p>

              <div className="relative max-w-2xl mx-auto mb-8">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 animate-floatSpin" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar preguntas frecuentes..."
                  className="block w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white/80 backdrop-blur-lg border border-blue-300/50 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base shadow-lg hover:shadow-blue-500/30 transition-all duration-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
                <StatCard icon={HelpCircle} value="25+" label="Preguntas" />
                <StatCard icon={Clock} value="24h" label="Respuesta" />
                <StatCard icon={Users} value="1000+" label="Usuarios" />
                <StatCard icon={MessageCircle} value="Chat" label="En Vivo" />
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            
            {/* Categories */}
            <div className="mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 sm:mb-6 animate-subtleGlow">Categorías</h2>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {categories.map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 group relative overflow-hidden animate-slideUp ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-lg text-gray-700 hover:shadow-blue-500/30 border border-blue-200/50'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                    <category.icon className="w-4 h-4 text-blue-600 group-hover:text-purple-600 animate-floatSpin" />
                    <span>{category.name}</span>
                    <span className="text-xs opacity-75">({category.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ List */}
            <div className="space-y-4 sm:space-y-6">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-floatSpin" />
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">No se encontraron resultados</h3>
                  <p className="text-gray-600">Intenta con otros términos de búsqueda o selecciona una categoría diferente.</p>
                </div>
              ) : (
                filteredFAQs.map((faq, index) => (
                  <div
                    key={faq.id}
                    className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl border border-blue-200/50 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative overflow-hidden animate-slideUp"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-6 sm:px-8 py-6 text-left flex items-center justify-between hover:bg-blue-50/50 transition-colors rounded-2xl sm:rounded-3xl"
                    >
                      <div className="flex-1 pr-4">
                        <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-relaxed animate-subtleGlow">
                          {faq.question}
                        </h3>
                      </div>
                      {openFAQ === faq.id ? (
                        <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 group-hover:text-purple-600 flex-shrink-0 animate-floatSpin" />
                      ) : (
                        <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 group-hover:text-purple-600 flex-shrink-0 animate-floatSpin" />
                      )}
                    </button>
                    
                    {openFAQ === faq.id && (
                      <div className="px-6 sm:px-8 pb-6 border-t border-blue-200/50">
                        <div className="pt-4">
                          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Contact Section */}
            <div className="mt-16 sm:mt-20">
              <div className="bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-cyan-50/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl border border-blue-200/50 p-6 sm:p-8 text-center shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                <div className="max-w-3xl mx-auto">
                  <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-4 sm:mb-6 group-hover:text-purple-600 animate-floatSpin" />
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 animate-subtleGlow">
                    ¿No encuentras tu respuesta?
                  </h2>
                  <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                    Nuestro equipo de soporte está aquí para ayudarte. Contáctanos y te responderemos 
                    en menos de 24 horas.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <a
                      href="mailto:support@nuro-technologies.com"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-500 relative overflow-hidden group text-sm sm:text-base flex items-center space-x-2"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-purple-400/50 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                      <MessageCircle className="w-4 h-4 animate-floatSpin" />
                      <span className="relative">Enviar Email</span>
                    </a>
                    <a
                      href="#chat"
                      className="text-blue-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent font-medium text-sm sm:text-base flex items-center space-x-2 relative group"
                    >
                      <span>Chat en Vivo</span>
                      <ArrowRight className="w-4 h-4 animate-floatSpin" />
                      <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Resources */}
            <div className="mt-16 sm:mt-20">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 sm:mb-12 text-center animate-subtleGlow">
                Recursos Populares
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                  <Download className="w-8 h-8 text-emerald-600 mb-4 group-hover:text-emerald-700 animate-floatSpin" />
                  <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">Guía de Instalación</h3>
                  <p className="text-gray-600 mb-4 text-sm">Instrucciones paso a paso para instalar NURO en tu sistema.</p>
                  <Link href="/docs" className="text-emerald-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent font-medium text-sm flex items-center space-x-1 relative group">
                    <span>Leer Guía</span>
                    <ArrowRight className="w-3 h-3 animate-floatSpin" />
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
                  </Link>
                </div>

                <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                  <Shield className="w-8 h-8 text-blue-600 mb-4 group-hover:text-purple-600 animate-floatSpin" />
                  <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">Política de Privacidad</h3>
                  <p className="text-gray-600 mb-4 text-sm">Conoce cómo protegemos tu información y garantizamos tu privacidad.</p>
                  <Link href="/privacy" className="text-blue-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent font-medium text-sm flex items-center space-x-1 relative group">
                    <span>Leer Política</span>
                    <ArrowRight className="w-3 h-3 animate-floatSpin" />
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
                  </Link>
                </div>

                <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-blue-200/50 shadow-lg hover:shadow-blue-500/30 transition-all duration-500 group relative animate-slideUp">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-cyan-100/50 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-shimmer"></div>
                  <Lightbulb className="w-8 h-8 text-yellow-600 mb-4 group-hover:text-yellow-700 animate-floatSpin" />
                  <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-subtleGlow">Tips y Trucos</h3>
                  <p className="text-gray-600 mb-4 text-sm">Descubre funciones avanzadas y maximiza tu productividad con NURO.</p>
                  <Link href="/docs" className="text-yellow-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent font-medium text-sm flex items-center space-x-1 relative group">
                    <span>Ver Tips</span>
                    <ArrowRight className="w-3 h-3 animate-floatSpin" />
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
                  </Link>
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
                  <div className="text-xs text-gray-600">Preguntas Frecuentes</div>
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

export default NuroFAQPage;