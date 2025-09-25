"use client";
import React, { useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import { Check, X, Bot, Menu, Plus } from 'lucide-react';
import Link from 'next/link';

// Configuration
const CONFIG = {
  VERSION: '1.0.0',
};

// Types
interface Language { 
  code: 'en'; 
  name: string; 
}

// Multilingual content
const content = {
  en: {
    navDownload: 'Download',
    pricingTitle: 'Choose the best plan for you',
    pricingSubtitle: 'Start with our free version or unlock advanced features with a premium plan.',
    pricingPlans: [
      {
        id: 'free',
        name: 'Free',
        price: 'Free',
        per: 'Limited',
        isCurrent: true,
        features: [
          { text: 'NORA 4.0 Model', isAvailable: true },
          { text: 'Increased conversation capacity', isAvailable: true },
          { text: 'Single device access', isAvailable: true },
          { text: 'Live screen mode detection', isAvailable: false },
          { text: 'Video generation', isAvailable: false },
          { text: 'Priority access to new features', isAvailable: false },
        ],
        buttonText: 'Get Started'
      },
      {
        id: 'pro',
        name: 'NORA Pro',
        price: '$20',
        per: 'per month',
        isCurrent: false,
        isPopular: true,
        features: [
          { text: 'NORA 4.5 Model', isAvailable: true },
          { text: 'Even greater conversation capacity', isAvailable: true },
          { text: 'Multi-device sync', isAvailable: true },
          { text: 'Live screen mode detection', isAvailable: true },
          { text: 'Increased video generation capacity', isAvailable: true },
          { text: 'Priority access to new features', isAvailable: false },
        ],
        buttonText: 'Get Started'
      },
      {
        id: 'pro-max',
        name: 'NORA Pro Max',
        price: '$75',
        per: 'per month',
        isCurrent: false,
        features: [
          { text: 'NORA 4.6 Model', isAvailable: true },
          { text: 'Maximum conversation capacity', isAvailable: true },
          { text: 'Multi-device sync', isAvailable: true },
          { text: 'Live screen mode detection', isAvailable: true },
          { text: 'Even greater video generation capacity', isAvailable: true },
          { text: 'Priority access to new features', isAvailable: true },
        ],
        buttonText: 'Get Started'
      },
    ],
    faq: [
      {
        title: 'What\'s the difference between Free and Pro?',
        description: 'The Free plan offers basic features with a limited conversation capacity, while the Pro plan provides a significantly increased capacity and advanced functionalities like video generation and live screen mode detection.'
      },
      {
        title: 'Can I cancel my subscription at any time?',
        description: 'Yes, you can cancel your NORA subscription at any time. Your premium features will remain active until the end of your current billing period.'
      },
      {
        title: 'What payment methods do you accept?',
        description: 'We accept all major credit cards, as well as popular payment platforms like Apple Pay and Google Pay, ensuring a secure and easy checkout process.'
      },
      {
        title: 'Is my data secure?',
        description: 'Yes, NORA uses end-to-end encryption to protect your conversations. We do not store your personal conversations, prioritizing your privacy and security.'
      }
    ]
  }
};

// Navigation component from the original code
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

  const handleDownloadClick = () => {
    window.location.href = '/download';
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <Image 
              src="/images/nora.png" 
              alt="NORA Logo" 
              width={96}
              height={96}
              className="hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <button 
            onClick={handleWebAppClick}
            className="px-6 py-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-full text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300 flex items-center space-x-2"
          >
            <span className="text-sm font-light">Web App</span>
            <Bot className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDownloadClick}
            className="px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-light hover:bg-white/15 hover:border-white/30 transition-all duration-300"
          >
            {content[lang].navDownload}
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

// Footer component from the original code
const Footer = memo(function Footer() {
  return (
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
  );
});

// Pricing Section
const PricingSection = memo(function PricingSection({ lang, activeQuestion, setActiveQuestion }: { lang: Language['code']; activeQuestion: number; setActiveQuestion: (index: number) => void; }) {
  const currentContent = content[lang];

  const handleGetStartedClick = useCallback(() => {
    window.location.href = '/app';
  }, []);

  return (
    <section className="relative pt-20 pb-20 md:pt-40 md:pb-40 bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#737373]/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#737373]/15 rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-[#737373]/8 rounded-full blur-xl animate-float-slow"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 animate-fade-up" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            {currentContent.pricingTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {currentContent.pricingSubtitle}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 max-w-6xl mx-auto mb-16 md:mb-24">
          {currentContent.pricingPlans.map((plan, index) => (
            <div 
              key={plan.id}
              className={`relative rounded-3xl p-6 md:p-8 border border-[#737373]/40 transition-all duration-700 ease-in-out transform hover:-translate-y-2 hover:scale-105 hover:rotate-y-2 hover:shadow-2xl shadow-md shadow-gray-700/20 animate-fade-up
              ${plan.isPopular ? 'bg-gradient-to-br from-[#737373]/30 to-[#737373]/10 border-[#737373] shadow-2xl shadow-[#737373]/30' : 'bg-[#737373]/20 backdrop-blur-xl'}
              `}
              style={{ animationDelay: `${index * 0.2 + 0.5}s` }}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 mt-4 mr-4 px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                  Most Popular
                </div>
              )}
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-1" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>{plan.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{plan.per}</p>
              <div className="text-white mb-6">
                <span className="text-4xl md:text-5xl font-bold">{plan.price}</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-gray-300">
                    {feature.isAvailable ? (
                      <Check className="w-4 h-4 md:w-5 md:h-5 text-green-400 mt-1 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 md:w-5 md:h-5 text-gray-500 mt-1 flex-shrink-0" />
                    )}
                    <span className="ml-3 text-sm md:text-base font-light">{feature.text}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleGetStartedClick}
                className={`w-full py-3 rounded-xl text-base md:text-lg font-medium transition-all duration-300 ease-in-out transform
                bg-white text-black hover:bg-gray-200 hover:scale-105`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative py-12 md:py-24 overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <div className="w-82 h-82 md:w-100 md:h-100 rounded-3xl overflow-hidden opacity-100">
            <video 
              autoPlay 
              muted 
              loop 
              playsInline
              preload="none"
            >
              <source src="/images/fondo-animado-noru-bola.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="absolute inset-0 bg-black/20 z-10" />
        </div>
        <div className="container mx-auto px-6 relative z-20">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4 md:mb-6 animate-fade-up" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div className="max-w-4xl mx-auto space-y-6">
            {currentContent.faq.map((faq, index) => (
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
      </div>
    </section>
  );
});

// Main Pricing Page Component
const Pricing: React.FC = () => {
  const [lang] = useState<Language['code']>('en');
  const [activeQuestion, setActiveQuestion] = useState(0);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Navigation lang={lang} />
      
      <main>
        <PricingSection 
          lang={lang} 
          activeQuestion={activeQuestion} 
          setActiveQuestion={setActiveQuestion} 
        />
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

        @keyframes rotate-y {
          0% { transform: perspective(1000px) rotateY(0deg) scale(1); }
          100% { transform: perspective(1000px) rotateY(2deg) scale(1.05); }
        }
        
        .animate-fade-up { 
          animation: fade-up 0.8s ease-out forwards; 
          opacity: 0; 
        }
        .animate-slide-up { 
          animation: slide-up 0.8s ease-out forwards; 
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
        .hover\\:rotate-y-2:hover {
          animation: rotate-y 0.5s forwards;
        }

        html {
          scroll-behavior: smooth;
        }

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

        body {
          font-family: 'Lastica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default Pricing;