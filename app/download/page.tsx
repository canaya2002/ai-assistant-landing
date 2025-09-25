"use client";
import React, { useState, useEffect, memo, useRef } from 'react';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import {
  Bot, Menu, X, Download, Monitor, Laptop, Shield, Zap, HardDrive, Cpu,
  Sparkles, Bug, Rocket
} from 'lucide-react';

// Configuration
const CONFIG = {
  VERSION: '1.0.0',
  DOWNLOADS: {
    WINDOWS: 'https://github.com/canaya2002/ai-assistant-professional/releases/download/v1.0.0/AI.Assistant.Professional.Setup.1.0.0.exe',
    MACOS: 'https://github.com/canaya2002/ai-assistant-professional/releases/download/v1.0.0/AI.Assistant.Professional.Setup.1.0.0.dmg'
  }
};

// Types
interface Language {
  code: 'en';
  name: string;
}

// Multilingual content - EXPANDED WITH NEW SECTIONS
const content = {
  en: {
    heroTitle: 'Download NORA',
    heroSubtitle: 'Get the most powerful AI assistant on your desktop',
    heroDescription: 'Experience NORA with full desktop integration, advanced features, and unlimited capabilities.',
    downloadForWindows: 'Download for Windows',
    downloadForMacOS: 'Download for macOS',
    systemRequirements: 'System Requirements',
    features: 'Desktop Features',
    versionHighlightsTitle: `What's New in Version ${CONFIG.VERSION}`,
    windowsRequirements: {
      title: 'Windows Requirements',
      items: [
        'Windows 10 version 1903 or later (64-bit) - May 2019 Update or newer',
        '8 GB RAM minimum, 16 GB recommended for optimal AI processing',
        '2 GB free disk space for installation, 5 GB recommended for cache and models',
        'Internet connection required for initial setup and cloud features',
        'DirectX 11 compatible graphics card for enhanced visual effects',
        'Modern multi-core processor (Intel Core i5 8th gen or AMD Ryzen 5 3000 series minimum)',
        'Administrator privileges required for installation'
      ]
    },
    macosRequirements: {
      title: 'macOS Requirements',
      items: [
        'macOS 12.0 Monterey or later (Universal Binary for Intel and Apple Silicon)',
        '8 GB unified memory minimum, 16 GB recommended for seamless multitasking',
        '2 GB available storage for installation, 5 GB recommended for optimal performance',
        'Internet connection required for activation and cloud synchronization',
        'Metal-compatible GPU for enhanced visual rendering and AI acceleration',
        'Apple Silicon M1/M2/M3 or Intel Core i5 2017 or newer processor',
        'Full Disk Access permission for comprehensive file analysis'
      ]
    },
    desktopFeatures: [
      {
        icon: 'shield',
        title: 'Native Desktop Integration',
        description: 'Seamlessly integrate with your OS for the best experience with system-wide shortcuts, native notifications, and context menu actions.',
        details: ['System-wide keyboard shortcuts', 'Native notifications', 'Context menu integration', 'System tray quick access', 'Spotlight/Windows Search', 'Native dark mode']
      },
      {
        icon: 'harddrive',
        title: 'Advanced File Processing',
        description: 'Analyze documents, images, and complex datasets directly from your desktop with simple drag-and-drop support.',
        details: ['100+ file formats supported', 'Drag-and-drop batch processing', 'Real-time file analysis', 'OCR for scanned documents', 'Audio transcription', 'Large file handling (up to 10GB)']
      },
      {
        icon: 'zap',
        title: 'Offline Capabilities',
        description: 'Access essential features even when offline with intelligent caching and local processing. Automatic sync when reconnected.',
        details: ['Local AI models for basic tasks', 'Intelligent data caching', 'Offline document analysis', 'Task queue system', 'Cross-device synchronization', 'Conflict resolution']
      },
      {
        icon: 'cpu',
        title: 'Enhanced Performance',
        description: 'Optimized for desktop performance with GPU acceleration, multi-threading, and intelligent memory management.',
        details: ['GPU acceleration for AI', 'Multi-threaded operations', 'Intelligent memory management', 'Adaptive performance', 'Background processing', 'Real-time monitoring']
      }
    ],
    changelog: {
      newFeatures: [
        'Introduced native dark mode that syncs with your OS.',
        'Added support for video file analysis (transcription and summaries).',
        'New system-wide hotkey to capture screen snippets for analysis.',
        'Integration with Slack for sharing NORA insights directly.'
      ],
      performanceImprovements: [
        'Up to 40% faster startup time on both Windows and macOS.',
        'Reduced memory usage by 25% during idle periods.',
        'Optimized local AI models for Apple Silicon M-series chips.',
        'Improved synchronization logic for faster cloud updates.'
      ],
      bugFixes: [
        'Fixed an issue where the app would not close properly from the system tray.',
        'Resolved a rendering glitch on high-refresh-rate displays.',
        'Corrected a bug affecting OCR accuracy on low-resolution images.',
        'Patched a memory leak related to batch file processing.'
      ]
    }
  }
};

// Reusable AnimateOnScroll Component
const AnimateOnScroll = ({ children, className = '', threshold = 0.1 }: { children: React.ReactNode; className?: string; threshold?: number; }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold });
  return (
    <div ref={ref} className={`${className} transition-all duration-1000 ${inView ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-sm'}`}>
      {children}
    </div>
  );
};

// Reusable Particle Background Component
class Particle {
  x: number; y: number; directionX: number; directionY: number; size: number; color: string;
  constructor(x: number, y: number, dX: number, dY: number, size: number, color: string) {
    this.x = x; this.y = y; this.directionX = dX; this.directionY = dY; this.size = size; this.color = color;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false); ctx.fillStyle = this.color; ctx.fill();
  }
  update(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
    if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
    this.x += this.directionX; this.y += this.directionY; this.draw(ctx);
  }
}
const ParticleBackground = memo(function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let animationFrameId: number;
    let particlesArray: Particle[] = [];
    const init = () => {
      particlesArray = [];
      const numberOfParticles = (window.innerWidth * 1000) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let dX = (Math.random() * 0.4) - 0.2; let dY = (Math.random() * 0.4) - 0.2;
        particlesArray.push(new Particle(x, y, dX, dY, size, 'rgba(107, 114, 128, 0.5)'));
      }
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesArray.forEach(p => p.update(ctx, canvas));
      animationFrameId = requestAnimationFrame(animate);
    };
    const handleResize = () => {
        if(canvasRef.current?.parentElement) {
            canvas.width = canvasRef.current.parentElement.offsetWidth;
            canvas.height = canvasRef.current.parentElement.offsetHeight;
            init();
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    animate();
    return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener('resize', handleResize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full" />;
});


// Background video component
const VideoBackground = memo(function VideoBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline preload="metadata">
        <source src="/images/fondo-nora-tres.mp4" type="video/mp4" />
        <source src="/fondo.webm" type="video/webm" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />
    </div>
  );
});

// Navigation Component
const Navigation = memo(function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleWebAppClick = () => { window.location.href = '/app'; setMobileMenuOpen(false); };
  const handleHomeClick = () => { window.location.href = '/'; setMobileMenuOpen(false); };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Image src="/images/nora.png" alt="NORA Logo" width={96} height={96} className="hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={handleHomeClick} priority />
        <div className="hidden md:flex items-center space-x-4">
          <button onClick={handleWebAppClick} className="group relative px-6 py-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-full text-white hover:border-white/20 transition-all duration-300 overflow-hidden">
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center space-x-2"><span className="text-sm font-light">Web App</span><Bot className="w-4 h-4" /></span>
          </button>
          <button onClick={handleHomeClick} className="group relative px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-light hover:bg-white/15 hover:border-white/30 transition-all duration-300 overflow-hidden">
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative">Home</span>
          </button>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-white/80 hover:text-white transition-colors">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-6 py-4 space-y-3">
            <button onClick={handleWebAppClick} className="w-full px-6 py-3 bg-black/20 backdrop-blur-sm border border-white/10 rounded-full text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300 flex items-center justify-center space-x-2">
              <span className="text-sm font-light">Web App</span><Bot className="w-4 h-4" />
            </button>
            <button onClick={handleHomeClick} className="w-full px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-light hover:bg-white/15 hover:border-white/30 transition-all duration-300">
              Home
            </button>
          </div>
        </div>
      )}
    </nav>
  );
});

// Download Hero Section
const DownloadHeroSection = memo(function DownloadHeroSection({ lang }: { lang: Language['code'] }) {
  const currentContent = content[lang];
  const handleDownload = (platform: 'windows' | 'macos') => {
    window.open(platform === 'windows' ? CONFIG.DOWNLOADS.WINDOWS : CONFIG.DOWNLOADS.MACOS, '_blank');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <VideoBackground />
      <div className="relative z-30 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll className="mt-24 md:mt-32">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 md:mb-8 tracking-wide" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>{currentContent.heroTitle}</h1>
          </AnimateOnScroll>
          <AnimateOnScroll className="delay-200">
            <h2 className="text-2xl md:text-4xl text-white/90 mb-6 max-w-3xl mx-auto font-light">{currentContent.heroSubtitle}</h2>
          </AnimateOnScroll>
          <AnimateOnScroll className="delay-400">
            <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto font-light">{currentContent.heroDescription}</p>
          </AnimateOnScroll>
          <AnimateOnScroll className="delay-500">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 md:mb-24">
              <button onClick={() => handleDownload('windows')} className="group min-w-[280px] bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white px-8 py-4 font-light hover:bg-white/20 transition-all duration-300 flex items-center space-x-3 hover:shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:-translate-y-1">
                <Monitor className="w-6 h-6" />
                <div className="text-left"><div className="text-lg">{currentContent.downloadForWindows}</div><div className="text-sm opacity-80">Version {CONFIG.VERSION} • 64-bit</div></div>
                <Download className="w-5 h-5 ml-auto transition-transform group-hover:scale-110" />
              </button>
              <button onClick={() => handleDownload('macos')} className="group min-w-[280px] bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white px-8 py-4 font-light hover:bg-white/20 transition-all duration-300 flex items-center space-x-3 hover:shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:-translate-y-1">
                <Laptop className="w-6 h-6" />
                <div className="text-left"><div className="text-lg">{currentContent.downloadForMacOS}</div><div className="text-sm opacity-80">Version {CONFIG.VERSION} • Universal</div></div>
                <Download className="w-5 h-5 ml-auto transition-transform group-hover:scale-110" />
              </button>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
});

// Sub-component for Feature Cards
const FeatureCard = memo(({ feature, index }: { feature: typeof content.en.desktopFeatures[0], index: number }) => {
    // FIX: Changed JSX.Element to React.ReactNode for better compatibility
    const getIcon = (iconName: string): React.ReactNode => {
        const icons: { [key: string]: React.ReactNode } = {
            shield: <Shield className="w-8 h-8 text-white" />, harddrive: <HardDrive className="w-8 h-8 text-white" />,
            zap: <Zap className="w-8 h-8 text-white" />, cpu: <Cpu className="w-8 h-8 text-white" />,
        };
        return icons[iconName] || <Shield className="w-8 h-8 text-white" />;
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    };

    return (
        <AnimateOnScroll className={`delay-${(index % 2) * 150} h-full`}>
            <div onMouseMove={handleMouseMove} className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 h-full overflow-hidden">
                <div className="absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.1), transparent 80%)`}} />
                <div className="relative flex flex-col h-full">
                    <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 mb-6">{getIcon(feature.icon)}</div>
                    <h3 className="text-2xl font-light text-white mb-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed text-base mb-6">{feature.description}</p>
                    <div className="mt-auto space-y-3 pt-6 border-t border-white/10">
                        <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider">Key Features:</h4>
                        <div className="space-y-2">
                            {feature.details.map((detail, detailIndex) => (
                                <div key={detailIndex} className="flex items-start space-x-3">
                                    <div className="w-1.5 h-1.5 bg-white/50 rounded-full flex-shrink-0 mt-2"></div>
                                    <span className="text-gray-400 text-sm leading-relaxed">{detail}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AnimateOnScroll>
    );
});


// Desktop Features Section
const DesktopFeaturesSection = memo(function DesktopFeaturesSection({ lang }: { lang: Language['code'] }) {
    const currentContent = content[lang];
    return (
        <section className="py-16 md:py-32 bg-black relative">
            <div className="container mx-auto px-6 relative z-10">
                <AnimateOnScroll className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 md:mb-20">
                        <h2 className="text-3xl md:text-5xl font-light text-white mb-6" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                            {currentContent.features}
                        </h2>
                        <p className="text-lg text-gray-400 leading-relaxed font-light max-w-3xl mx-auto">
                            Experience NORA's full potential with native desktop apps designed for maximum performance and integration.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {currentContent.desktopFeatures.map((feature, index) => <FeatureCard key={index} feature={feature} index={index} />)}
                    </div>
                </AnimateOnScroll>
            </div>
        </section>
    );
});

// NEW SECTION: Version Highlights
const VersionHighlightsSection = memo(function VersionHighlightsSection({ lang }: { lang: Language['code'] }) {
    const { changelog, versionHighlightsTitle } = content[lang];
    const highlightItems = [
        { icon: <Sparkles className="w-6 h-6 text-white" />, title: "New Features", items: changelog.newFeatures },
        { icon: <Rocket className="w-6 h-6 text-white" />, title: "Performance", items: changelog.performanceImprovements },
        { icon: <Bug className="w-6 h-6 text-white" />, title: "Bug Fixes", items: changelog.bugFixes },
    ];
    return (
        <section className="py-16 md:py-32 bg-black relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-40"><ParticleBackground /></div>
            <div className="container mx-auto px-6 relative z-10">
                <AnimateOnScroll className="max-w-5xl mx-auto">
                    <div className="text-center mb-12 md:mb-20">
                        <h2 className="text-3xl md:text-5xl font-light text-white mb-6" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                            {versionHighlightsTitle}
                        </h2>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            {highlightItems.map((category, index) => (
                                <AnimateOnScroll key={category.title} className={`delay-${index * 150}`}>
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">{category.icon}</div>
                                        <h3 className="text-xl font-light text-white">{category.title}</h3>
                                    </div>
                                    <ul className="space-y-3 pl-4">
                                        {category.items.map((item, itemIndex) => (
                                            <li key={itemIndex} className="flex items-start space-x-3 text-gray-400 text-sm">
                                                <div className="w-1 h-1 bg-white/50 rounded-full flex-shrink-0 mt-2" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </AnimateOnScroll>
                            ))}
                        </div>
                    </div>
                </AnimateOnScroll>
            </div>
        </section>
    );
});


// System Requirements Section
const SystemRequirementsSection = memo(function SystemRequirementsSection({ lang }: { lang: Language['code'] }) {
  const currentContent = content[lang];
  return (
    <section className="relative py-16 md:py-32 overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 flex justify-center opacity-60 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_80%)] pt-48">
        <video className="w-full h-full max-w-[800px] max-h-[800px] md:max-w-[1100px] md:max-h-[1100px] rounded-3xl" autoPlay muted loop playsInline preload="none"><source src="/images/fondo-animado-noru-bola.mp4" type="video/mp4" /></video>
      </div>
      <div className="relative z-20 container mx-auto px-6">
        <AnimateOnScroll className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-light text-white mb-6" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>{currentContent.systemRequirements}</h2>
            <p className="text-lg text-gray-400 leading-relaxed font-light max-w-4xl mx-auto">Ensure your system meets these requirements for the best NORA experience, performance, and security.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnimateOnScroll className="delay-200">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 h-full flex flex-col">
                <div className="flex items-center space-x-4 mb-6"><Monitor className="w-8 h-8 text-white" /><h3 className="text-2xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>{currentContent.windowsRequirements.title}</h3></div>
                <div className="space-y-3 flex-grow">{currentContent.windowsRequirements.items.map((item, index) => (<div key={index} className="flex items-start space-x-3"><div className="w-1.5 h-1.5 bg-white/50 rounded-full flex-shrink-0 mt-2"></div><span className="text-gray-300 leading-relaxed text-sm">{item}</span></div>))}</div>
                <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl"><h4 className="text-white font-medium mb-2 flex items-center space-x-2"><Shield className="w-4 h-4" /><span>Security Note</span></h4><p className="text-gray-300 text-sm">NORA for Windows is digitally signed. Your OS may display a security warning during installation, which is normal for new applications.</p></div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll className="delay-400">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 h-full flex flex-col">
                <div className="flex items-center space-x-4 mb-6"><Laptop className="w-8 h-8 text-white" /><h3 className="text-2xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>{currentContent.macosRequirements.title}</h3></div>
                <div className="space-y-3 flex-grow">{currentContent.macosRequirements.items.map((item, index) => (<div key={index} className="flex items-start space-x-3"><div className="w-1.5 h-1.5 bg-white/50 rounded-full flex-shrink-0 mt-2"></div><span className="text-gray-300 leading-relaxed text-sm">{item}</span></div>))}</div>
                 <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl"><h4 className="text-white font-medium mb-2 flex items-center space-x-2"><Zap className="w-4 h-4" /><span>Apple Silicon Note</span></h4><p className="text-gray-300 text-sm">NORA is a Universal Binary, fully optimized for Apple Silicon (M1/M2/M3) for maximum performance and battery efficiency.</p></div>
              </div>
            </AnimateOnScroll>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
});

// Footer
const Footer = memo(function Footer() {
    return (
        <footer className="py-16 mt-16 bg-black">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
                    <div className="md:col-span-2"><Image src="/images/nora.png" alt="NORA Logo" width={80} height={80} className="mb-4"/><p className="text-gray-400 font-light max-w-xs">The next generation AI assistant for all your needs.</p></div>
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

// Main component
const DownloadPage: React.FC = () => {
  const [lang] = useState<Language['code']>('en');
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navigation />
      <main>
        <DownloadHeroSection lang={lang} />
        <DesktopFeaturesSection lang={lang} />
        <SystemRequirementsSection lang={lang} />
        <VersionHighlightsSection lang={lang} />
      </main>
      <Footer />
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lastica:wght@300;400;500;600;700&display=swap');
        
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes pan { 0% { background-position: 0% 0%; } 100% { background-position: 100% 100%; } }
        
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-pan { animation: pan 30s linear infinite; }

        html { scroll-behavior: smooth; }
        body { font-family: 'Lastica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000; }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #6b7280; }
        
        .delay-100 { transition-delay: 100ms; } .delay-150 { transition-delay: 150ms; } .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; } .delay-400 { transition-delay: 400ms; } .delay-500 { transition-delay: 500ms; }
      `}</style>
    </div>
  );
};

export default DownloadPage;