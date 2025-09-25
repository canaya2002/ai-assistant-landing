// app/faq/FaqPageClient.tsx - (NUEVO ARCHIVO - Componente de Cliente)
"use client";

import React, { useState, memo } from 'react';
import Image from 'next/image';
import {
  AlertTriangle, Bot, Menu, X, Plus
} from 'lucide-react';

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
    heroTitle: 'NORA',
    heroSubtitle: 'Your Personal AI Assistant',
    heroDescription: 'NORA is a revolutionary artificial intelligence assistant developed with GPT-4o & Gemini.',
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
      },
      {
        title: 'How does NORA protect my data?',
        description: 'Your data is encrypted both in transit and at rest. We do not sell or share your personal information with third parties. Our privacy policy provides full details on our data handling practices.'
      },
      {
        title: 'What languages does NORA support?',
        description: 'NORA is a multilingual assistant and supports over 50 languages, including English, Spanish, French, German, and Chinese. You can switch languages at any time within the app settings.'
      },
      {
        title: 'What are the premium plan features?',
        description: 'Premium plans offer unlimited chat history, priority access to new AI models, enhanced response speed, and offline capabilities (for certain features). More details are available on our pricing page.'
      },
      {
        title: 'How do I cancel my subscription?',
        description: 'You can cancel your premium subscription at any time through your account settings in the app or on our website. Cancellations are effective at the end of the current billing cycle.'
      },
      {
        title: 'Can NORA generate images?',
        description: 'Yes, NORA has integrated image generation capabilities. You can simply describe the image you want, and NORA will create it for you using advanced text-to-image models.'
      },
      {
        title: 'Is NORA suitable for professional use?',
        description: 'Absolutely. NORA for Work includes features like advanced document analysis, secure team collaboration, and custom workflow automations to help boost your professional productivity.'
      },
      {
        title: 'What is the difference between NORA and other AI assistants?',
        description: 'NORA stands out by combining multiple leading AI models (GPT-4o and Gemini), offering cross-platform synchronization, and prioritizing user privacy with robust encryption.'
      },
      {
        title: 'How can I report a bug or suggest a feature?',
        description: 'We welcome your feedback! You can report bugs or suggest new features directly through the "Help & Feedback" section in the app. Our development team reviews all submissions.'
      },
      {
        title: 'Does NORA support voice commands?',
        description: 'Yes, the NORA mobile and desktop apps support voice input. You can simply tap the microphone icon and speak your query, and NORA will respond with both text and voice.'
      },
      {
        title: 'Can NORA help with coding?',
        description: 'NORA is an excellent tool for developers. It can help you debug code, write new functions, explain complex algorithms, and even translate code between different programming languages.'
      },
      {
        title: 'How often is NORA updated?',
        description: 'We release regular updates with new features, performance improvements, and model enhancements. You can check the "Versions" page for a full history of our updates.'
      },
      {
        title: 'Is NORA available in my region?',
        description: 'NORA is a cloud-based service and is available worldwide. There may be some regional restrictions on specific features, which are noted in our terms of service.'
      },
      {
        title: 'Does NORA learn from my conversations?',
        description: 'NORA does not use your personal conversations to train its models. All interactions are handled with strict privacy protocols to ensure your data is not used for public model training.'
      },
      {
        title: 'What is the minimum requirement to use NORA?',
        description: 'NORA can be used on any modern device with an internet connection. For the best experience, we recommend using the latest version of your web browser or our native apps on supported operating systems.'
      },
      {
        title: 'Can I integrate NORA with other apps?',
        description: 'We offer an API for developers to integrate NORA into their own applications and workflows. Our documentation portal provides all the necessary information to get started.'
      }
    ]
  }
};

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

  const handleDownloadClick = () => {
    window.location.href = '/download';
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src="/images/nora.png"
            alt="NORA Logo"
            width={96}
            height={96}
            className="hover:scale-105 transition-transform duration-300"
          />
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
            onClick={() => window.location.href = '/download'}
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

// FAQ section
const FAQSection = memo(function FAQSection({ lang }: { lang: Language['code'] }) {
  const [activeQuestion, setActiveQuestion] = useState(-1);
  const currentContent = content[lang];

  return (
    <section className="relative py-12 md:py-32 mt-6 md:mt-16 overflow-hidden min-h-screen flex items-center">
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

      <div className="relative z-20 container mx-auto px-6">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4 md:mb-6 animate-fade-up" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            {currentContent.askAnything}
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light animate-fade-up" style={{ animationDelay: '200ms' }}>
            {currentContent.askSubtitle}
          </p>
        </div>

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

// Main component
export default function FaqPageClient() {
  const [lang] = useState<Language['code']>('en');

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Navigation lang={lang} />

      <main>
        <FAQSection lang={lang} />
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