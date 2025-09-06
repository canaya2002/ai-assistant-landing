"use client";
import React, { useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import { 
  AlertTriangle, Bot, Menu, X, Plus
} from 'lucide-react';

// Configuration
const CONFIG = {
  VERSION: '1.0.0',
  DOWNLOAD_URL: 'https://github.com/canaya2002/ai-assistant-professional/releases/download/v1.0.0/AI.Assistant.Professional.Setup.1.0.0.exe',
};

// Types
interface Language { 
  code: 'en'; 
  name: string; 
}

interface Platform {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  features: string[];
}

// Multilingual content
const content = {
  en: {
    navDownload: 'Download',
    heroTitle: 'NORA',
    heroSubtitle: 'Your Personal AI Assistant',
    heroDescription: 'NORA is a revolutionary artificial intelligence assistant developed with GPT-4o & Gemini.',
    tryForFree: 'Try for Free',
    scrollDown: 'Scroll Down',
    enterEmail: 'Enter your email address',
    trustedByText: 'Trusted by thousands of users worldwide',
    availableForAll: 'Available for Web, iPhone, Apple Watch, macOS, Android',
    availableOn: 'Available On',
    askAnything: 'Frequently Asked Questions',
    askSubtitle: 'Everything you need to know about NORA',
    features: [
      {
        title: 'What is NORA?',
        description: 'NORA is an advanced artificial intelligence assistant that uses GPT-4o and Gemini to provide accurate and natural responses to any question or task you have.'
      },
      {
        title: 'Is NORA free to use?',
        description: 'NORA offers a free version with basic functionalities. We also have premium plans with advanced features for more demanding users.'
      },
      {
        title: 'What devices does it work on?',
        description: 'NORA is available on iPhone, iPad, Apple Watch, Mac, Android, and web browsers. Sync your conversations across all your devices.'
      },
      {
        title: 'Is it safe to use NORA?',
        description: 'Yes, NORA uses end-to-end encryption and does not store your personal conversations. Your privacy is our top priority.'
      },
      {
        title: 'Can I use NORA offline?',
        description: 'NORA requires an internet connection to function, as it uses cloud-based AI models to provide the best possible responses.'
      }
    ],
    platforms: [
      { 
        id: 'iphone', 
        name: 'iPhone', 
        description: 'Available on App Store for iOS 14 and above.',
        longDescription: 'Experience NORA on your iPhone with our beautifully designed native app. Get instant access to AI-powered conversations, voice commands, and seamless integration with iOS features. Our iPhone app is optimized for performance and battery life.',
        features: [
        ]
      },
      { 
        id: 'watch', 
        name: 'Apple Watch', 
        description: 'Access NORA directly from your wrist with our optimized app.',
        longDescription: 'NORA on Apple Watch brings AI assistance directly to your wrist. Perfect for quick questions, voice commands, and staying productive on the go. Our Watch app is designed for quick interactions and essential AI features.',
        features: [
        ]
      },
      { 
        id: 'macos', 
        name: 'macOS', 
        description: 'Native Mac application with full functionality.',
        longDescription: 'The most powerful NORA experience is on macOS. With our native Mac app, you get full-featured AI assistance, file integration, and seamless workflow automation. Perfect for professionals and power users.',
        features: [
        ]
      },
      { 
        id: 'android', 
        name: 'Android', 
        description: 'Available on Google Play Store for Android 8.0 and above.',
        longDescription: 'NORA for Android delivers the full AI experience with Material Design 3. Enjoy seamless integration with Google services, customizable widgets, and powerful automation features that work across all your Android devices.',
        features: [
        ]
      },
      { 
        id: 'web', 
        name: 'Web', 
        description: 'Use NORA directly in your favorite web browser.',
        longDescription: 'Access NORA from any device with our progressive web app. No downloads required - just open your browser and start chatting. Full feature parity with native apps, plus the convenience of universal access.',
        features: [
        ]
      }
    ]
  }
};

// Background video component - ARREGLADO PARA MÓVIL
const VideoBackground = memo(function VideoBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video 
        className="absolute inset-0 w-full h-full object-cover md:object-center object-top"
        style={{ objectPosition: 'center 20%' }} // Subido más arriba en móvil
        autoPlay 
        muted 
        loop 
        playsInline
        preload="metadata"
      >
        <source src="/images/fondo.mp4" type="video/mp4" />
        <source src="/fondo.webm" type="video/webm" />
      </video>
      {/* Overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />
    </div>
  );
});

// Enhanced Navigation - MENÚ MÓVIL ARREGLADO
const Navigation = memo(function Navigation({
  onDownload,
  lang
}: {
  onDownload: () => void;
  lang: Language['code'];
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleWebAppClick = () => {
    window.location.href = '/app';
    setMobileMenuOpen(false);
  };

  const handleDownloadClick = () => {
    onDownload();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo as image */}
        <div className="flex items-center">
          <Image 
            src="/images/nora.png" 
            alt="NORA Logo" 
            width={96}
            height={96}
            className="hover:scale-105 transition-transform duration-300"
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
            onClick={onDownload}
            className="px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-light hover:bg-white/15 hover:border-white/30 transition-all duration-300"
          >
            {content[lang].navDownload}
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

      {/* Mobile menu - ARREGLADO */}
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
              onClick={handleDownloadClick}
              className="w-full px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-light hover:bg-white/15 hover:border-white/30 transition-all duration-300"
            >
              {content[lang].navDownload}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
});

// Enhanced Hero Section - ARREGLADO PARA MÓVIL
const HeroSection = memo(function HeroSection({ lang }: { lang: Language['code'] }) {
  const currentContent = content[lang];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <VideoBackground />
      
      <div className="relative z-30 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Title with animation - POSICIÓN ARREGLADA PARA MÓVIL */}
          <div className="mb-1 animate-fade-up mt-32 md:mt-80">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 md:mb-20 tracking-wide" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              NORA : Your AI Assistant
            </h1>
          </div>

          <p className="text-lg md:text-3xl text-white/90 mb-12 md:mb-16 max-w-3xl mx-auto leading-relaxed font-light animate-fade-up" style={{ animationDelay: '0.5s' }}>
            {currentContent.heroDescription}
          </p>

          {/* Store buttons - ARREGLADO PARA QUE ESTÉN PAREJOS EN MÓVIL */}
          <div className="flex flex-row items-center justify-center space-x-8 md:space-x-44 animate-fade-up mb-32 md:mb-60" style={{ animationDelay: '2s' }}>
            <button className="hover:scale-105 transition-transform duration-300">
              <Image 
                src="/images/appstore.png" 
                alt="Download on App Store" 
                width={180}
                height={60}
                className="h-12 md:h-16 w-auto"
              />
            </button>
            
            <button className="hover:scale-105 transition-transform duration-300">
              <Image 
                src="/images/googleplay.png" 
                alt="Get it on Google Play" 
                width={180}
                height={60}
                className="h-12 md:h-16 w-auto"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});

// Section with AI model image and animated video
const ModelImageSection = memo(function ModelImageSection() {
  return (
    <section className="py-32 bg-black relative overflow-hidden">
      {/* Background animated video positioned above background but below content */}
      <div className="absolute inset-0 z-5 flex items-center justify-center">
        <div className="w-96 h-96 rounded-3xl overflow-hidden opacity-30">
          <video 
            className="w-full h-full object-cover"
            autoPlay 
            muted 
            loop 
            playsInline
            preload="metadata"
          >
            <source src="/images/fondo-animado.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Main AI model image */}
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="relative animate-fade-up">
            {/* Model image */}
            <div className="mb-12">
              <Image 
                src="/images/modeloia.png" 
                alt="NORA AI Model" 
                width={768}
                height={512}
                className="w-full max-w-3xl mx-auto hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            {/* Descriptive information */}
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-light text-white mb-6" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Advanced Artificial Intelligence
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed font-light mb-8">
                NORA uses the most advanced artificial intelligence models, combining GPT-4o and Gemini to offer you precise, creative, and natural responses at any time of day.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 mb-12">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Instant responses</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Multiple languages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Advanced context</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

// Section with animated phrases - FONDO DE VIDEO ARREGLADO PARA MÓVIL
const AnimatedPhrasesSection = memo(function AnimatedPhrasesSection() {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  const phrases = [
    "Your personal AI assistant always available",
    "Intelligent answers for all your questions",
    "Creativity and innovation in every conversation",
    "Boost your productivity with artificial intelligence",
    "The future of digital assistance is here"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentPhrase((prev) => (prev + 1) % phrases.length);
        setIsVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background video - ARREGLADO PARA MÓVIL */}
      <div className="absolute inset-0 z-0">
        <video 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            objectPosition: 'center center',
            minHeight: '100%',
            minWidth: '100%'
          }}
          autoPlay 
          muted 
          loop 
          playsInline
          preload="metadata"
        >
          <source src="/images/fondo-nora-dos.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60 z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="min-h-[200px] flex items-center justify-center">
            <h2 
              className={`text-2xl md:text-5xl lg:text-6xl font-light text-white leading-tight transition-all duration-700 ease-in-out transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              {phrases[currentPhrase]}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
});

// Enhanced "Available On" section - BOTONES CENTRADOS Y SIN SOMBRAS
const AvailableSection = memo(function AvailableSection({ lang }: { lang: Language['code'] }) {
  const [activeTab, setActiveTab] = useState('web');
  const currentContent = content[lang];

  const tabs = [
    { 
      id: 'iphone', 
      image: '/images/iphone-icon.png', 
      deviceImage: '/images/iphone-image.png',
      label: 'iPhone' 
    },
    { 
      id: 'watch', 
      image: '/images/watch-icon.png', 
      deviceImage: '/images/watch-image.png',
      label: 'Watch' 
    },
    { 
      id: 'macos', 
      image: '/images/mac-icon.png', 
      deviceImage: '/images/mac-image.png',
      label: 'macOS' 
    },
    { 
      id: 'android', 
      image: '/images/android-icon.png', 
      deviceImage: '/images/android-image.png',
      label: 'Android' 
    },
    { 
      id: 'web', 
      image: '/images/web-icon.png', 
      deviceImage: '/images/web-image.png',
      label: 'Web' 
    }
  ];

  const getCurrentPlatform = (): Platform => {
    return currentContent.platforms.find((p: Platform) => p.id === activeTab) || currentContent.platforms[4];
  };

  const getCurrentTab = () => {
    return tabs.find(t => t.id === activeTab) || tabs[4];
  };

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-light text-white text-center mb-16 animate-fade-up" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          {currentContent.availableOn}
        </h2>
        
        {/* Tab Headers - CENTRADO PERFECTO PARA MÓVIL */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-16 max-w-4xl mx-auto">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group p-4 md:p-6 rounded-2xl transition-all duration-700 transform hover:scale-110 ${
                activeTab === tab.id 
                  ? 'border border-[#737373] scale-110 shadow-2xl shadow-[#737373]/20' 
                  : 'bg-[#737373]/30 border border-[#737373]/40 hover:border-[#737373]/60 hover:bg-[#737373]/40'
              }`}
              style={{ 
                animationDelay: `${index * 150}ms`,
                backgroundColor: activeTab === tab.id ? '#737373' : undefined
              }}
            >
              <div className="flex flex-col items-center space-y-2 md:space-y-3">
                <Image 
                  src={tab.image} 
                  alt={tab.label}
                  width={32}
                  height={32}
                  className={`md:w-10 md:h-10 transition-all duration-700 ${
                    activeTab === tab.id ? 'opacity-100 scale-110' : 'opacity-70 group-hover:opacity-90'
                  }`}
                  loading="lazy"
                />
                <span className={`text-xs md:text-sm font-light transition-all duration-700 ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                }`}>
                  {tab.label}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content - SIN SOMBRAS NI DIFUMINADOS */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#737373]/20 backdrop-blur-2xl rounded-3xl p-8 md:p-12 border border-[#737373]/40 transition-all duration-700 shadow-2xl">
            <div className="text-center">
              {/* Device image - SIN EFECTOS DE SOMBRA */}
              <div className="mb-8 md:mb-12 animate-fade-up">
                <div className="relative bg-[#737373]/20 rounded-2xl p-6">
                  <Image 
                    src={getCurrentTab().deviceImage} 
                    alt={getCurrentPlatform().name}
                    width={448}
                    height={300}
                    className="relative z-10 w-full max-w-sm md:max-w-md mx-auto hover:scale-105 transition-transform duration-700 rounded-2xl"
                    loading="lazy"
                  />
                </div>
              </div>
              
              {/* Content below */}
              <div className="animate-slide-up">
                <div className="mb-6 md:mb-8">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-[#737373]/60 rounded-2xl mx-auto flex items-center justify-center mb-4 md:mb-6 backdrop-blur-xl border border-[#737373]/40">
                    <Image 
                      src={getCurrentTab().image} 
                      alt={getCurrentPlatform().name}
                      width={32}
                      height={32}
                      className="md:w-12 md:h-12"
                      loading="lazy"
                    />
                  </div>
                </div>
                
                <h3 className="text-2xl md:text-4xl font-light text-white mb-4 md:mb-6 animate-fade-up" style={{ 
                  fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif',
                  animationDelay: '0.2s'
                }}>
                  {getCurrentPlatform().name}
                </h3>
                
                <p className="text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto font-light leading-relaxed text-base md:text-lg animate-fade-up" style={{
                  animationDelay: '0.4s'
                }}>
                  {getCurrentPlatform().longDescription}
                </p>

                {/* Features list with animations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  {getCurrentPlatform().features.map((feature: string, index: number) => (
                    <div 
                      key={index}
                      className="flex items-center space-x-3 p-4 bg-[#737373]/20 rounded-xl border border-[#737373]/30 animate-slide-in-left"
                      style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                      <span className="text-gray-300 font-light text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

// Enhanced FAQ section - ESPACIADO REDUCIDO MÓVIL
const FAQSection = memo(function FAQSection({ lang }: { lang: Language['code'] }) {
  const [activeQuestion, setActiveQuestion] = useState(0);
  const currentContent = content[lang];

  return (
    <section className="relative py-16 md:py-32 mt-8 md:mt-16 overflow-hidden">
      {/* Background video */}
      <div className="absolute inset-0 z-0">
        <video 
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay 
          muted 
          loop 
          playsInline
          preload="none"
        >
          <source src="/images/fondo-nora-tres.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70 z-10" />
      </div>

      <div className="relative z-20 container mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4 md:mb-6 animate-fade-up" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            {currentContent.askAnything}
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light animate-fade-up" style={{ animationDelay: '200ms' }}>
            {currentContent.askSubtitle}
          </p>
        </div>

        {/* FAQ Items with #737373 colors */}
        <div className="max-w-4xl mx-auto space-y-6">
          {currentContent.features.map((faq: { title: string; description: string }, index: number) => (
            <div 
              key={index}
              className="bg-[#737373]/30 backdrop-blur-xl rounded-2xl border border-[#737373]/30 overflow-hidden transition-all duration-1000 ease-in-out hover:border-[#737373]/50 hover:bg-[#737373]/20"
            >
              <button
                onClick={() => setActiveQuestion(activeQuestion === index ? -1 : index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-[#737373]/20 transition-all duration-1000 ease-in-out"
              >
                <h3 className="text-lg font-light text-white flex-1 pr-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  {faq.title}
                </h3>
                <div className={`transition-all duration-1000 ease-in-out ${activeQuestion === index ? 'rotate-45 scale-110' : 'rotate-0 scale-100'}`}>
                  <Plus className="w-5 h-5 text-gray-400" />
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-1500 ease-in-out ${
                activeQuestion === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="p-6 pt-0">
                  <div className={`transform transition-all duration-1000 ease-in-out ${
                    activeQuestion === index ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
                  }`}>
                    <p className="text-gray-300 font-light leading-relaxed">
                      {faq.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

// Footer
const Footer = memo(function Footer() {
  return (
    <footer className="py-20 mt-20 bg-black">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Logo section */}
          <div className="md:col-span-1">
            <Image 
              src="/images/nora.png" 
              alt="NORA Logo" 
              width={80}
              height={80}
              className="mb-4"
            />
          </div>

          {/* Links sections */}
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
              <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
});

// Main component
const NuroNovaStyle: React.FC = () => {
  const [lang] = useState<Language['code']>('en');
  const [showWarning, setShowWarning] = useState(false);

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

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Navigation onDownload={handleDownload} lang={lang} />
      
      <main>
        <HeroSection lang={lang} />
        <ModelImageSection />
        <AnimatedPhrasesSection />
        <AvailableSection lang={lang} />
        <FAQSection lang={lang} />
      </main>

      <Footer />

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 max-w-md mx-auto">
            <div className="flex items-center space-x-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <h3 className="text-xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Security Notice</h3>
            </div>
            <p className="text-gray-300 mb-6 font-light">
              Windows may show a warning. NORA is completely safe.
            </p>
            <button 
              onClick={() => setShowWarning(false)}
              className="w-full bg-white text-black font-medium py-3 rounded-full hover:bg-gray-100 transition-colors duration-300"
            >
              Got it
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
        
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-left {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        .animate-fade-up { 
          animation: fade-up 0.8s ease-out forwards; 
          opacity: 0; 
        }
        .animate-slide-up { 
          animation: slide-up 0.8s ease-out forwards; 
          opacity: 0; 
        }
        .animate-slide-in-left { 
          animation: slide-in-left 0.6s ease-out forwards; 
          opacity: 0; 
        }
        .animate-float { 
          animation: float 6s ease-in-out infinite; 
        }
        .animate-float-delayed { 
          animation: float-delayed 8s ease-in-out infinite; 
        }
        .animate-float-slow { 
          animation: float-slow 10s ease-in-out infinite; 
        }

        /* Ensure smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1f2937;
        }
        ::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        /* Lastica font fallbacks */
        body {
          font-family: 'Lastica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default NuroNovaStyle;