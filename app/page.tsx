"use client";
import React, { useState, useEffect, useCallback, memo, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Bot, Menu, X, Plus } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

// CONFIGURATION
const CONFIG = {
  VERSION: '1.0.4', 
};

// TYPES
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

// MULTILINGUAL CONTENT
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
        features: ['Voice Commands', 'iOS Widget Integration', 'Haptic Feedback', 'Real-time Sync']
      },
      {
        id: 'macos',
        name: 'macOS',
        description: 'Native Mac application with full functionality.',
        longDescription: 'The most powerful NORA experience is on macOS. With our native Mac app, you get full-featured AI assistance, file integration, and seamless workflow automation. Perfect for professionals and power users.',
        features: ['Menu Bar Access', 'File Drag & Drop', 'System-wide Shortcuts', 'Offline Capabilities']
      },
      {
        id: 'android',
        name: 'Android',
        description: 'Available on Google Play Store for Android 8.0 and above.',
        longDescription: 'NORA for Android delivers the full AI experience with Material Design 3. Enjoy seamless integration with Google services, customizable widgets, and powerful automation features that work across all your Android devices.',
        features: ['Google Assistant Integration', 'Customizable Widgets', 'Dynamic Theming', 'Cross-device Sync']
      },
      {
        id: 'windows',
        name: 'Windows',
        description: 'Native Windows application with full functionality.',
        longDescription: 'NORA for Windows delivers a powerful desktop experience with deep system integration. Enjoy advanced features like file analysis, clipboard integration, and workflow automation. Our Windows app is optimized for productivity and multitasking.',
        features: ['System Tray Icon', 'Clipboard Integration', 'Fluent Design System', 'High-Performance Core']
      },
      {
        id: 'web',
        name: 'Web',
        description: 'Use NORA directly in your favorite web browser.',
        longDescription: 'Access NORA from any device with our progressive web app. No downloads required - just open your browser and start chatting. Full feature parity with native apps, plus the convenience of universal access.',
        features: ['Progressive Web App (PWA)', 'Real-time Collaboration', 'Browser Extensions', 'Universal Accessibility']
      }
    ]
  }
};

interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

const AnimateOnScroll = ({ children, className = '', threshold = 0.1 }: AnimateOnScrollProps) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold,
  });

  return (
    <div ref={ref} className={`${className} transition-all duration-1000 ${inView ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-sm'}`}>
      {children}
    </div>
  );
};

const VideoBackground = memo(function VideoBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover md:object-center object-top"
        style={{ objectPosition: 'center 40%' }}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/images/fondo-nora-tres.mp4" type="video/mp4" />
        <source src="/fondo.webm" type="video/webm" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />
    </div>
  );
});

const Navigation = memo(function Navigation({ lang }: { lang: Language['code'] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleWebAppClick = () => {
    window.location.href = '/app';
    setMobileMenuOpen(false);
  };

  const handleDownloadClick = () => {
    window.location.href = '/download';
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent transition-all duration-300">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src="/images/nora.png"
            alt="NORA Logo"
            width={96}
            height={96}
            className="hover:scale-105 transition-transform duration-300"
            priority
          />
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={handleWebAppClick}
            className="group relative px-6 py-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-full text-white hover:border-white/20 transition-all duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center space-x-2">
              <span className="text-sm font-light">Web App</span>
              <Bot className="w-4 h-4" />
            </span>
          </button>
          <button
            onClick={handleDownloadClick}
            className="group relative px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-light hover:bg-white/15 hover:border-white/30 transition-all duration-300 overflow-hidden"
          >
             <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
             <span className="relative">{content[lang].navDownload}</span>
          </button>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
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

const HeroSection = memo(function HeroSection({ lang }: { lang: Language['code'] }) {
  const currentContent = content[lang];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <VideoBackground />
      <div className="relative z-30 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll className="mt-24 md:mt-48">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 md:mb-16 tracking-wide" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              NORA : Your AI Assistant
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll className="delay-200">
             <p className="text-lg md:text-3xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
               {currentContent.heroDescription}
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll className="delay-400">
            <div className="flex flex-row items-center justify-center space-x-8 md:space-x-44 mb-24 md:mb-48">
              <button className="transition-transform duration-300 filter hover:brightness-110 animate-float">
                <Image
                  src="/images/appstore.png"
                  alt="Download on App Store"
                  width={180}
                  height={60}
                  className="h-12 md:h-16 w-auto"
                />
              </button>
              <button className="transition-transform duration-300 filter hover:brightness-110 animate-float [animation-delay:300ms]">
                <Image
                  src="/images/googleplay.png"
                  alt="Get it on Google Play"
                  width={180}
                  height={60}
                  className="h-12 md:h-16 w-auto"
                />
              </button>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
});

// PARTICLE BACKGROUND & PARTICLE CLASS
interface ParticleBackgroundProps {
  particleCount?: number;
  particleColor?: string;
  lineColor?: string;
}

class Particle {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  size: number;
  color: string;

  constructor(x: number, y: number, directionX: number, directionY: number, size: number, color: string) {
    this.x = x;
    this.y = y;
    this.directionX = directionX;
    this.directionY = directionY;
    this.size = size;
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
    if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
    this.x += this.directionX;
    this.y += this.directionY;
    this.draw(ctx);
  }
}

const ParticleBackground = ({ 
    particleCount = 70, 
    particleColor = 'rgba(128, 128, 128, 0.5)',
    lineColor = 'rgba(128, 128, 128, 0.5)'
}: ParticleBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      let particlesArray: Particle[] = [];

      const init = () => {
        particlesArray = [];
        for (let i = 0; i < particleCount; i++) {
          let size = (Math.random() * 2) + 1;
          let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
          let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
          let directionX = (Math.random() * .4) - .2;
          let directionY = (Math.random() * .4) - .2;
          particlesArray.push(new Particle(x, y, directionX, directionY, size, particleColor));
        }
      }

      const connect = () => {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
          for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                             ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));

            if (distance < (canvas.width / 7) * (canvas.height / 7)) {
              opacityValue = 1 - (distance / 20000);
              const finalLineColor = lineColor.replace(/,\s*\d*\.?\d*\)/, `, ${opacityValue})`);
              ctx.strokeStyle = finalLineColor;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
              ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
              ctx.stroke();
            }
          }
        }
      }
    
      let animationFrameId: number;
      const animate = () => {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        particlesArray.forEach(p => p.update(ctx, canvas));
        connect();
        animationFrameId = requestAnimationFrame(animate);
      }

      init();
      animate();

      const handleResize = () => {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
      };
    }
    return () => {};
  }, [particleCount, particleColor, lineColor]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full" />;
};


const ModelImageSection = memo(function ModelImageSection() {
    return (
        <section className="py-16 md:py-24 bg-black relative overflow-hidden [mask-image:linear-gradient(to_bottom,white_80%,transparent_100%)]">
            <ParticleBackground particleCount={50} particleColor="rgba(107, 114, 128, 0.3)" lineColor="rgba(107, 114, 128, 0.3)" />
            <div className="container mx-auto px-6 relative z-10">
                 <AnimateOnScroll className="relative max-w-4xl mx-auto text-center">
                    <div className="relative group">
                        <div className="mb-8 md:mb-12">
                            <Image
                                src="/images/modeloianora.png"
                                alt="NORA AI Model"
                                width={768}
                                height={512}
                                className="w-full max-w-3xl mx-auto transition-transform duration-500 animate-float"
                            />
                        </div>
                        <div className="max-w-2xl mx-auto text-center">
                            <h2 className="text-3xl md:text-4xl font-light text-white mb-4 md:mb-6" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                                Advanced Artificial Intelligence
                            </h2>
                            <p className="text-lg text-gray-400 leading-relaxed font-light mb-6 md:mb-8">
                                NORA uses the most advanced artificial intelligence models, combining GPT-4o and Gemini to offer you precise, creative, and natural responses at any time of day.
                            </p>
                            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 mb-8 md:mb-12">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span>Instant responses</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:200ms]"></div>
                                    <span>Multiple languages</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse [animation-delay:400ms]"></div>
                                    <span>Advanced context</span>
                                </div>
                            </div>
                        </div>
                    </div>
                 </AnimateOnScroll>
            </div>
        </section>
    );
});


const AnimatedPhrasesSection = memo(function AnimatedPhrasesSection() {
    const [currentPhrase, setCurrentPhrase] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const phrases = useMemo(() => [
        "Your personal AI assistant always available",
        "Intelligent answers for all your questions",
        "Creativity and innovation in every conversation",
        "Boost your productivity with artificial intelligence",
        "The future of digital assistance is here"
    ], []);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentPhrase(prev => (prev + 1) % phrases.length);
                setIsVisible(true);
            }, 700); 
        }, 4000);
        return () => clearInterval(interval);
    }, [phrases.length]);

    return (
        <section className="relative mt-16 md:mt-24 py-16 md:py-24 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <video
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                >
                    <source src="/images/fondo-nora-dos.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/70 z-10" />
            </div>
            <div className="relative z-20 container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="h-[450px] flex items-center justify-center">
                        <h2
                            className={`text-2xl md:text-5xl lg:text-6xl font-light text-white leading-tight transition-all duration-700 ease-in-out transform ${isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-4 blur-sm'}`}
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

const AvailableSection = memo(function AvailableSection({ lang }: { lang: Language['code'] }) {
    const [activeTab, setActiveTab] = useState('web');
    const currentContent = content[lang];
    
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: -999, y: -999 });
    const [cardStyle, setCardStyle] = useState({});

    const tabs = useMemo(() => [
        { id: 'iphone', image: '/images/iphone-icon.png', deviceImage: '/images/iphone-images.gif', label: 'iPhone' },
        { id: 'macos', image: '/images/mac-icon.png', deviceImage: '/images/mac-images.gif', label: 'macOS' },
        { id: 'android', image: '/images/android-icons.png', deviceImage: '/images/android-images.gif', label: 'Android' },
        { id: 'windows', image: '/images/win-icon.png', deviceImage: '/images/win-images.gif', label: 'Windows' },
        { id: 'web', image: '/images/web-icon.png', deviceImage: '/images/win-images.gif', label: 'Web' }
    ], []);
    
    const activePlatform = useMemo(() => {
        return currentContent.platforms.find((p: Platform) => p.id === activeTab) || currentContent.platforms.find((p:Platform) => p.id === 'web') || currentContent.platforms[0];
    }, [activeTab, currentContent.platforms]);

    const activeTabData = useMemo(() => {
        return tabs.find(t => t.id === activeTab) || tabs.find(t => t.id === 'web') || tabs[0];
    }, [activeTab, tabs]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePos({ x, y });

        const rotateX = (y / rect.height - 0.5) * -6; 
        const rotateY = (x / rect.width - 0.5) * 6;
        
        setCardStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
            transition: 'transform 0.1s ease-out'
        });
    };
    
    const handleMouseLeave = () => {
        setMousePos({ x: -999, y: -999 });
        setCardStyle({
            transform: 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)',
            transition: 'transform 0.5s ease-in-out'
        });
    };

    return (
        <section className="relative py-16 md:py-24 bg-black overflow-hidden">
            {/* CHANGE: Removed background elements for a full black background */}
            <div className="container mx-auto px-6 relative z-10">
                <AnimateOnScroll>
                    <h2 className="text-4xl md:text-5xl font-light text-white text-center mb-12 md:mb-16" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        {currentContent.availableOn}
                    </h2>
                </AnimateOnScroll>
                
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-12 md:mb-16 max-w-4xl mx-auto">
                    {tabs.map((tab, index) => (
                         <AnimateOnScroll key={tab.id} className={`delay-${index * 100}`}>
                            <button
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full p-3 md:p-4 rounded-2xl transition-all duration-300 border hover:-translate-y-1 ${activeTab === tab.id ? 'border-white/50 bg-white/20 scale-105 shadow-[0_0_15px_rgba(255,255,255,0.25)]' : 'border-white/20 bg-white/10'}`}
                            >
                                <div className="flex flex-col items-center space-y-2">
                                    <Image src={tab.image} alt={tab.label} width={24} height={24} className={`md:w-6 md:h-6 transition-all duration-500 ${activeTab === tab.id ? 'opacity-100' : 'opacity-80'}`} loading="lazy" />
                                    <span className={`text-xs font-light transition-colors duration-500 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`}>
                                        {tab.label}
                                    </span>
                                </div>
                            </button>
                         </AnimateOnScroll>
                    ))}
                </div>

                <AnimateOnScroll>
                    <div 
                        ref={cardRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        style={cardStyle}
                        className="group relative bg-black/50 backdrop-blur-2xl rounded-3xl p-6 md:p-12 border border-white/20 transition-shadow duration-300 shadow-lg hover:shadow-2xl hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] overflow-hidden max-w-5xl mx-auto"
                    >
                        <div 
                            className="absolute rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,255,255,0.1),transparent)] w-96 h-96 pointer-events-none"
                            style={{ top: mousePos.y, left: mousePos.x, transform: 'translate(-50%, -50%)' }}
                        />
                        <div className="relative z-10 text-center">
                            <div className="mb-6 md:mb-12 flex justify-center items-center">
                                <div 
                                    className="relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-2 border-white/10 shadow-lg"
                                    style={{ transform: 'translateZ(20px)' }}
                                >
                                    <Image 
                                        src={activeTabData.deviceImage} 
                                        alt={activePlatform.name} 
                                        width={600}
                                        height={600}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        key={activeTab}
                                    />
                                </div>
                            </div>
                          
                            <h3 className="text-2xl md:text-4xl font-light text-white mb-3 md:mb-6" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                                {activePlatform.name}
                            </h3>
                            <p className="text-gray-300 mb-4 md:mb-8 max-w-2xl mx-auto font-light leading-relaxed text-base md:text-lg">
                                {activePlatform.longDescription}
                            </p>
                            {activePlatform.features.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                                    {activePlatform.features.map((feature: string, index: number) => (
                                        <AnimateOnScroll key={index} className={`delay-${index * 150}`}>
                                            <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                                                <div className="w-2 h-2 bg-white/50 rounded-full flex-shrink-0"></div>
                                                <span className="text-gray-300 font-light text-sm">{feature}</span>
                                            </div>
                                        </AnimateOnScroll>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </AnimateOnScroll>
            </div>
        </section>
    );
});

const FAQSection = memo(function FAQSection({ lang }: { lang: Language['code'] }) {
    const [activeQuestion, setActiveQuestion] = useState(0);
    const currentContent = content[lang];

    return (
        <section className="relative py-16 md:py-24 bg-black overflow-hidden">
            <div className="absolute inset-0 z-0 flex justify-center opacity-60 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_80%)] pt-48">
                <div className="w-full h-full max-w-[800px] max-h-[800px] md:max-w-[1100px] md:max-h-[1100px] rounded-3xl overflow-hidden">
                    <video autoPlay muted loop playsInline preload="none">
                        <source src="/images/fondo-animado-noru-bola.mp4" type="video/mp4" />
                    </video>
                </div>
            </div>

            <div className="relative z-20 container mx-auto px-6">
                 <AnimateOnScroll className="text-center mb-8 md:mb-16">
                    <h2 className="text-4xl md:text-5xl font-light text-white mb-4 md:mb-6" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        {currentContent.askAnything}
                    </h2>
                    <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
                        {currentContent.askSubtitle}
                    </p>
                 </AnimateOnScroll>

                <div className="max-w-4xl mx-auto space-y-4">
                    {currentContent.features.map((faq, index) => (
                        <AnimateOnScroll key={index} className={`delay-${index * 100}`}>
                            <div className={`relative bg-white/5 backdrop-blur-xl rounded-2xl border transition-all duration-500 hover:border-white/20 ${activeQuestion === index ? 'border-white/50 bg-white/10' : 'border-white/10'}`}>
                                <button
                                    onClick={() => setActiveQuestion(activeQuestion === index ? -1 : index)}
                                    className="w-full p-6 text-left flex items-center justify-between"
                                >
                                    <h3 className="text-lg font-light text-white flex-1 pr-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                                        {faq.title}
                                    </h3>
                                    <div className={`transition-transform duration-500 ease-in-out ${activeQuestion === index ? 'rotate-45' : 'rotate-0'}`}>
                                        <Plus className="w-5 h-5 text-gray-400" />
                                    </div>
                                </button>
                                <div className={`grid transition-all duration-700 ease-in-out ${activeQuestion === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                    <div className="overflow-hidden">
                                         <p className="text-gray-300 font-light leading-relaxed px-6 pb-6 pt-0">
                                            {faq.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </AnimateOnScroll>
                    ))}
                </div>
            </div>
        </section>
    );
});

const Footer = memo(function Footer() {
    return (
        <footer className="py-16 mt-16 bg-black">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
                    <div className="md:col-span-2">
                        <Image
                            src="/images/nora.png"
                            alt="NORA Logo"
                            width={80}
                            height={80}
                            className="mb-4"
                        />
                        <p className="text-gray-400 font-light max-w-xs">The next generation AI assistant for all your needs.</p>
                    </div>
                    <div>
                        <h3 className="text-white font-medium mb-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Products</h3>
                        <ul className="space-y-2 text-gray-400 font-light">
                            <li><a href="/iphone" className="hover:text-white transition-colors">NORA for iPhone</a></li>
                            <li><a href="/android" className="hover:text-white transition-colors">NORA for Android</a></li>
                            <li><a href="/mac" className="hover:text-white transition-colors">NORA for Mac</a></li>
                            <li><a href="/windows" className="hover:text-white transition-colors">NORA for Windows</a></li>
                            <li><a href="/webapp" className="hover:text-white transition-colors">NORA for Web</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-medium mb-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Resources</h3>
                        <ul className="space-y-2 text-gray-400 font-light">
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Status Page</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-medium mb-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Community</h3>
                        <ul className="space-y-2 text-gray-400 font-light">
                            <li><a href="https://www.tiktok.com/@car2002121?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TikTok</a></li>
                            <li><a href="https://www.instagram.com/noraaiapp/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
                            <li><a href="https://www.facebook.com/profile.php?id=61576232000413&locale=es_LA" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a></li>
                            <li><a href="https://www.linkedin.com/company/norappai/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-medium mb-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Company</h3>
                        <ul className="space-y-2 text-gray-400 font-light">
                            <li><a href="/versions" className="hover:text-white transition-colors">Versions</a></li>
                            <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                            <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
                            <li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
                            <li><a href="/terms" className="hover:text-white transition-colors">Terms</a></li>
                        </ul>
                    </div>
                </div>
                 <div className="mt-16 pt-8 text-center text-gray-500 font-light text-sm">
                    <p>&copy; {new Date().getFullYear()} NORA AI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
});

const NuroNovaStyle: React.FC = () => {
    const [lang] = useState<Language['code']>('en');

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
            <Navigation lang={lang} />
            <main>
                <HeroSection lang={lang} />
                <ModelImageSection />
                <AnimatedPhrasesSection />
                <AvailableSection lang={lang} />
                <FAQSection lang={lang} />
            </main>
            <Footer />

            <style jsx global>{`
                /* Font Import */
                @import url('https://fonts.googleapis.com/css2?family=Lastica:wght@300;400;500;600;700&display=swap');
                
                /* ANIMATIONS */
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }

                @keyframes pan {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 100% 100%; }
                }
                .animate-pan {
                    animation: pan 30s linear infinite;
                }

                /* General Styles */
                html {
                    scroll-behavior: smooth;
                }
                body {
                    font-family: 'Lastica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background-color: #000;
                }
                
                /* Custom Scrollbar */
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #111; }
                ::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #6b7280; }

                /* Delay utilities for staggered animations */
                .delay-100 { transition-delay: 100ms; }
                .delay-150 { transition-delay: 150ms; }
                .delay-200 { transition-delay: 200ms; }
                .delay-300 { transition-delay: 300ms; }
                .delay-400 { transition-delay: 400ms; }
                .delay-500 { transition-delay: 500ms; }
            `}</style>
        </div>
    );
};

export default NuroNovaStyle;