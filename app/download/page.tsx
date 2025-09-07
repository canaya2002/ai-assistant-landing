"use client";
import React, { useState, useEffect, memo } from 'react';
import Image from 'next/image';
import { 
  Bot, Menu, X, Download, Monitor, Laptop, Shield, Zap, HardDrive, Cpu, Database, 
  Globe, Wifi, WifiOff, Lock, FileText, Video, Music,
  Smartphone, Tablet, Watch, Cloud, BarChart, Settings, Users
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

// Multilingual content
const content = {
  en: {
    heroTitle: 'Download NORA',
    heroSubtitle: 'Get the most powerful AI assistant on your desktop',
    heroDescription: 'Experience NORA with full desktop integration, advanced features, and unlimited capabilities.',
    downloadForWindows: 'Download for Windows',
    downloadForMacOS: 'Download for macOS',
    systemRequirements: 'System Requirements',
    features: 'Desktop Features',
    version: 'Version',
    fileSize: 'File Size',
    windowsRequirements: {
      title: 'Windows Requirements',
      items: [
        'Windows 10 version 1903 or later (64-bit) - May 2019 Update or newer',
        '8 GB RAM minimum, 16 GB recommended for optimal AI processing',
        '2 GB free disk space for installation, 5 GB recommended for cache and models',
        'Internet connection required for initial setup and cloud features',
        'DirectX 11 compatible graphics card for enhanced visual effects',
        'Modern multi-core processor (Intel Core i5 8th gen or AMD Ryzen 5 3000 series minimum)',
        'Hardware acceleration support (Intel Quick Sync, NVIDIA NVENC, or AMD VCE)',
        'Microsoft Edge WebView2 runtime (automatically installed if missing)',
        'Windows Defender or compatible antivirus software',
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
        'Gatekeeper enabled for security (NORA is notarized by Apple)',
        'Keychain access for secure credential storage',
        'Camera and microphone permissions for advanced features',
        'Full Disk Access permission for comprehensive file analysis'
      ]
    },
    desktopFeatures: [
      {
        icon: 'shield',
        title: 'Native Desktop Integration',
        description: 'Seamlessly integrate with your operating system for the best possible experience. NORA becomes part of your workflow with system-wide shortcuts, native notifications, context menu integration, and deep OS-level features. Access NORA from anywhere with global hotkeys, system tray controls, and spotlight/search integration.',
        details: [
          'System-wide keyboard shortcuts and hotkeys',
          'Native notifications and alerts',
          'Context menu integration in File Explorer/Finder',
          'System tray quick access and controls',
          'Spotlight/Windows Search integration',
          'Native dark mode and theme adaptation'
        ]
      },
      {
        icon: 'harddrive',
        title: 'Advanced File Processing',
        description: 'Analyze documents, images, videos, audio files, and complex datasets directly from your desktop with drag-and-drop support. Process multiple file formats simultaneously, extract insights from multimedia content, and perform bulk operations with enterprise-grade security.',
        details: [
          'Support for 100+ file formats including Office, PDF, images, videos',
          'Drag-and-drop batch processing capabilities',
          'Real-time file analysis and content extraction',
          'OCR for scanned documents and images',
          'Audio transcription and video analysis',
          'Large file handling up to 10GB per document'
        ]
      },
      {
        icon: 'zap',
        title: 'Offline Capabilities & Smart Sync',
        description: 'Access essential features even when offline with intelligent caching and local processing. Automatic synchronization when reconnected ensures your work is always up-to-date across all devices. Local AI models provide core functionality without internet dependency.',
        details: [
          'Local AI models for basic tasks and processing',
          'Intelligent caching of frequently used data',
          'Offline document analysis and text processing',
          'Queue system for tasks when connection returns',
          'Cross-device synchronization and backup',
          'Conflict resolution for collaborative work'
        ]
      },
      {
        icon: 'cpu',
        title: 'Enhanced Performance & Optimization',
        description: 'Optimized for desktop performance with faster processing, better resource management, and hardware acceleration. Take advantage of your computer\'s full potential with GPU acceleration, multi-threading, and intelligent memory management for lightning-fast responses.',
        details: [
          'GPU acceleration for AI processing and rendering',
          'Multi-threaded operations for maximum efficiency',
          'Intelligent memory management and cleanup',
          'Adaptive performance based on system resources',
          'Background processing without UI interruption',
          'Real-time performance monitoring and optimization'
        ]
      },
      {
        icon: 'database',
        title: 'Local Data Storage & Privacy',
        description: 'Your sensitive data stays on your device with enterprise-grade local encryption. Advanced privacy controls let you choose what data to sync to the cloud while keeping critical information secure on your machine.',
        details: [
          'AES-256 encryption for local data storage',
          'Granular privacy controls and data governance',
          'Local conversation history and preferences',
          'Secure credential management',
          'GDPR and enterprise compliance features',
          'Optional cloud sync with end-to-end encryption'
        ]
      },
      {
        icon: 'globe',
        title: 'Advanced Collaboration Tools',
        description: 'Share insights, collaborate on projects, and manage team workflows with advanced sharing features. Create shareable links, export in multiple formats, and integrate with popular productivity tools.',
        details: [
          'Real-time collaboration and sharing',
          'Export to multiple formats (PDF, Word, PowerPoint)',
          'Integration with Slack, Teams, and productivity apps',
          'Version control and change tracking',
          'Team workspace management',
          'Advanced permission and access controls'
        ]
      }
    ]
  }
};

// Background video component
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

// Enhanced Navigation
const Navigation = memo(function Navigation({
  lang
}: {
  lang: Language['code'];
}) {
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
        {/* Logo as image */}
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

// Download Hero Section - MÁS CERCA DEL HEADER
const DownloadHeroSection = memo(function DownloadHeroSection({ lang }: { lang: Language['code'] }) {
  const currentContent = content[lang];

  const handleDownload = (platform: 'windows' | 'macos') => {
    const link = document.createElement('a');
    link.href = platform === 'windows' ? CONFIG.DOWNLOADS.WINDOWS : CONFIG.DOWNLOADS.MACOS;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <VideoBackground />
      
      <div className="relative z-30 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Title with animation - MÁS CERCA DEL HEADER */}
          <div className="mb-1 animate-fade-up pt-24 md:pt-32">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 md:mb-12 tracking-wide" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              {currentContent.heroTitle}
            </h1>
          </div>

          <h2 className="text-2xl md:text-4xl text-white/90 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed font-light animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {currentContent.heroSubtitle}
          </h2>

          <p className="text-lg md:text-xl text-white/80 mb-12 md:mb-16 max-w-2xl mx-auto leading-relaxed font-light animate-fade-up" style={{ animationDelay: '0.5s' }}>
            {currentContent.heroDescription}
          </p>

          {/* Download buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-up mb-16 md:mb-24" style={{ animationDelay: '0.7s' }}>
            <button 
              onClick={() => handleDownload('windows')}
              className="group bg-gradient-to-br from-[#737373] to-[#737373]/80 hover:from-[#737373]/90 hover:to-[#737373]/70 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 flex items-center space-x-3 shadow-2xl shadow-[#737373]/30 hover:scale-105 min-w-[280px]"
            >
              <Monitor className="w-6 h-6" />
              <div className="text-left">
                <div className="text-lg">{currentContent.downloadForWindows}</div>
                <div className="text-sm opacity-80">Version {CONFIG.VERSION} • 64-bit</div>
              </div>
              <Download className="w-5 h-5 group-hover:animate-bounce" />
            </button>
            
            <button 
              onClick={() => handleDownload('macos')}
              className="group bg-gradient-to-br from-[#737373] to-[#737373]/80 hover:from-[#737373]/90 hover:to-[#737373]/70 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 flex items-center space-x-3 shadow-2xl shadow-[#737373]/30 hover:scale-105 min-w-[280px]"
            >
              <Laptop className="w-6 h-6" />
              <div className="text-left">
                <div className="text-lg">{currentContent.downloadForMacOS}</div>
                <div className="text-sm opacity-80">Version {CONFIG.VERSION} • Universal</div>
              </div>
              <Download className="w-5 h-5 group-hover:animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});

// Desktop Features Section - EXPANDIDO
const DesktopFeaturesSection = memo(function DesktopFeaturesSection({ lang }: { lang: Language['code'] }) {
  const currentContent = content[lang];

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'shield': return <Shield className="w-6 h-6 text-white" />;
      case 'harddrive': return <HardDrive className="w-6 h-6 text-white" />;
      case 'zap': return <Zap className="w-6 h-6 text-white" />;
      case 'cpu': return <Cpu className="w-6 h-6 text-white" />;
      case 'database': return <Database className="w-6 h-6 text-white" />;
      case 'globe': return <Globe className="w-6 h-6 text-white" />;
      default: return <Shield className="w-6 h-6 text-white" />;
    }
  };

  return (
    <section className="py-16 md:py-32 bg-black relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              {currentContent.features}
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed font-light max-w-3xl mx-auto">
              Experience NORA's full potential with our native desktop applications designed for maximum performance and integration. 
              These advanced features are exclusively available in our desktop versions, providing professional-grade capabilities 
              for power users and enterprises.
            </p>
          </div>
          
          {/* Features grid - EXPANDIDO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {currentContent.desktopFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-[#737373]/20 backdrop-blur-xl rounded-2xl p-8 border border-[#737373]/30 transition-all duration-300 hover:bg-[#737373]/30 hover:border-[#737373]/50 animate-fade-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-[#737373]/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    {getIcon(feature.icon)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-light text-white mb-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-6 text-base">
                      {feature.description}
                    </p>
                    
                    {/* Detailed features list */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider">Key Features:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {feature.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="flex items-center space-x-3">
                            <div className="w-1.5 h-1.5 bg-[#737373] rounded-full flex-shrink-0"></div>
                            <span className="text-gray-400 text-sm leading-relaxed">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

// System Requirements Section - EXPANDIDO Y CON FONDO COMPLETO
const SystemRequirementsSection = memo(function SystemRequirementsSection({ lang }: { lang: Language['code'] }) {
  const currentContent = content[lang];

  return (
    <section className="relative py-16 md:py-32 overflow-hidden">
      {/* Background video - FONDO COMPLETO SIN CORTAR */}
      <div className="absolute inset-0 z-0">
        <video 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            objectPosition: 'center center',
            minWidth: '100%',
            minHeight: '100%'
          }}
          autoPlay 
          muted 
          loop 
          playsInline
          preload="metadata"
        >
          <source src="/images/fondo-animado-noru-bola.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50 z-10" />
      </div>

      <div className="relative z-20 container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6 animate-fade-up" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              {currentContent.systemRequirements}
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed font-light animate-fade-up max-w-4xl mx-auto" style={{ animationDelay: '0.2s' }}>
              Make sure your system meets these comprehensive requirements for the best NORA experience. Our desktop applications 
              are optimized to take full advantage of modern hardware while maintaining compatibility with older systems. 
              These specifications ensure optimal performance, security, and feature availability.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Windows Requirements - EXPANDIDO */}
            <div className="bg-[#737373]/30 backdrop-blur-xl rounded-2xl p-8 border border-[#737373]/40 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-20 h-20 bg-[#737373]/50 rounded-2xl flex items-center justify-center">
                  <Monitor className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-light text-white mb-2" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    {currentContent.windowsRequirements.title}
                  </h3>
                  <p className="text-gray-400 text-sm">Comprehensive Windows compatibility and performance requirements</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white/90 mb-4">Minimum Requirements:</h4>
                {currentContent.windowsRequirements.items.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-3 bg-black/20 rounded-lg border border-white/10">
                    <div className="w-2 h-2 bg-white rounded-full flex-shrink-0 mt-2"></div>
                    <span className="text-gray-300 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Security Note</span>
                </h4>
                <p className="text-blue-200 text-sm">NORA for Windows includes advanced security features and is digitally signed. Windows may display a security warning during installation - this is normal for new applications.</p>
              </div>
            </div>

            {/* macOS Requirements - EXPANDIDO */}
            <div className="bg-[#737373]/30 backdrop-blur-xl rounded-2xl p-8 border border-[#737373]/40 animate-fade-up" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-20 h-20 bg-[#737373]/50 rounded-2xl flex items-center justify-center">
                  <Laptop className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-light text-white mb-2" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    {currentContent.macosRequirements.title}
                  </h3>
                  <p className="text-gray-400 text-sm">Optimized for both Intel and Apple Silicon Macs</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white/90 mb-4">Minimum Requirements:</h4>
                {currentContent.macosRequirements.items.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-3 bg-black/20 rounded-lg border border-white/10">
                    <div className="w-2 h-2 bg-white rounded-full flex-shrink-0 mt-2"></div>
                    <span className="text-gray-300 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Apple Silicon Optimization</span>
                </h4>
                <p className="text-green-200 text-sm">NORA is fully optimized for Apple Silicon (M1/M2/M3) chips, providing up to 3x faster AI processing and improved battery efficiency compared to Intel versions.</p>
              </div>
            </div>
          </div>
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
  );
});

// Main component
const DownloadPage: React.FC = () => {
  const [lang] = useState<Language['code']>('en');

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Navigation lang={lang} />
      
      <main>
        <DownloadHeroSection lang={lang} />
        <DesktopFeaturesSection lang={lang} />
        <SystemRequirementsSection lang={lang} />
      </main>

      <Footer />
      
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

export default DownloadPage;