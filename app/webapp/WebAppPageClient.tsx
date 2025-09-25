// app/webapp/WebAppPageClient.tsx - (NUEVO ARCHIVO - Componente de Cliente)
"use client";

import React, { useState, useEffect, useRef, useCallback, memo, forwardRef, ReactNode } from 'react';
import Image from 'next/image';
import {
  AlertTriangle, Bot, Menu, X, BrainCircuit, ShieldCheck, Zap, Users, Quote,
  ChevronDown, ArrowRight, LucideProps, Plus, Code, Target, Sparkles, Layout
} from 'lucide-react';

// --- DEFINICIONES DE TIPOS (TYPESCRIPT) ---

interface Language {
  code: 'en';
  name: string;
}

type NavContent = { webApp: string; download: string; };
type HeroContent = { title: string; subtitle: string; description: string; cta: string; };
type DemoFeature = { id: string; name: string; image: string; description: string; };
type DemoContent = { title: string; features: DemoFeature[]; };
type Benefit = { icon: React.FC<LucideProps>; title: string; description: string; };
type BenefitsContent = { title: string; items: Benefit[]; };
type FeatureHighlight = { title: string; description: string; image: string; };
type FeatureHighlightsContent = { title: string; items: FeatureHighlight[]; };
type Screenshot = { id: string; title: string; description: string; media: string; isGif: boolean; };
type ScreenshotsContent = { title: string; items: Screenshot[]; };
type UseCase = { icon: React.FC<LucideProps>; title: string; description: string; };
type UseCasesContent = { title: string; items: UseCase[]; };
type Testimonial = { quote: string; name: string; role: string; avatar: string; };
type TestimonialsContent = { title: string; items: Testimonial[]; };
type FaqItemData = { q: string; a: string; };
type FaqContent = { title: string; items: FaqItemData[]; };
type CtaContent = { title: string; button: string; };
type FooterColumn = { title: string; links: string[]; };
type FooterContent = { tagline: string; columns: { products: FooterColumn; company: FooterColumn; support: FooterColumn; }; };

interface PageContent {
  nav: NavContent;
  hero: HeroContent;
  demo: DemoContent;
  benefits: BenefitsContent;
  highlights: FeatureHighlightsContent;
  screenshots: ScreenshotsContent;
  useCases: UseCasesContent;
  testimonials: TestimonialsContent;
  faq: FaqContent;
  cta: CtaContent;
  footer: FooterContent;
}

interface RootContent {
  en: PageContent;
}

interface HeaderProps { content: NavContent; lang: Language['code']; }
interface HeroSectionProps { content: HeroContent; }
interface InteractiveDemoSectionProps { content: DemoContent; }
interface KeyBenefitsSectionProps { content: BenefitsContent; }
interface FeatureHighlightsSectionProps { content: FeatureHighlightsContent; }
interface ScreenshotsSectionProps { content: ScreenshotsContent; }
interface UseCasesSectionProps { content: UseCasesContent; }
interface TestimonialsCarouselProps { content: TestimonialsContent; }
interface FaqSectionProps { content: FaqContent; }
interface FaqItemProps { item: FaqItemData; }
interface FinalCtaSectionProps { content: CtaContent; }
interface FooterProps { content: FooterContent; }
interface AnimatedElementProps { children: ReactNode; delay?: number; className?: string; }


// --- CONFIGURACIÓN Y DATOS DE LA PÁGINA ---

const contentMain = {
  en: {
    navDownload: 'Download',
    heroTitle: 'NORA',
    heroSubtitle: 'Your Personal AI Assistant',
    heroDescription: 'NORA is a revolutionary artificial intelligence assistant developed with GPT-4o & Gemini.',
    features: [],
    platforms: [],
    askAnything: 'Frequently Asked Questions',
    askSubtitle: 'Everything you need to know about NORA',
  }
};

const pageContent: RootContent = {
  en: {
    nav: {
      webApp: 'Web App',
      download: 'Download',
    },
    hero: {
      title: 'NORA Web App',
      subtitle: 'Your personal AI assistant, directly in your browser.',
      description: 'NORA Web App offers the full power of our AI assistant without any installation. It leverages the latest AI models, including GPT-4o and Gemini, to provide instant, secure, and intelligent support from any device. With a clean, responsive interface, NORA Web App ensures a fluid and intuitive user experience that syncs across all your devices, allowing you to access your conversations anywhere, anytime.',
      cta: 'Launch Web App',
    },
    demo: {
      title: 'A Truly Native Experience',
      features: [
        { id: 'chat', name: 'Intuitive Chat', image: '/images/web-chat-demo.png', description: 'Converse naturally with NORA in a clean and distraction-free web interface.' },
        { id: 'widget', name: 'Quick Access', image: '/images/web-quick-access-demo.png', description: 'Access AI functions instantly from your browser with a simple click on our extension or bookmark.' },
        { id: 'signin', name: 'Cloud Sync', image: '/images/web-sync-demo.png', description: 'Your data and conversations are securely synced across all your devices, ensuring a seamless experience.' },
      ]
    },
    benefits: {
      title: 'Designed for the Web',
      items: [
        { icon: Zap, title: 'Instant Access', description: 'No downloads, no installations. Just open your browser and start using NORA immediately, ensuring a friction-free experience.' },
        { icon: BrainCircuit, title: 'Universal Compatibility', description: 'Works flawlessly on any browser, operating system, or device. NORA is platform-agnostic, providing a consistent experience for everyone.' },
        { icon: ShieldCheck, title: 'Secure & Private', description: 'All your data is encrypted and securely stored in the cloud. We never sell your personal data to third parties, prioritizing your privacy at all times.' },
        { icon: Users, title: 'Lightweight Design', description: 'A sleek, modern, and fast-loading interface that won\'t bog down your browser. NORA is optimized for speed and efficiency.' },
      ]
    },
    highlights: {
      title: 'Key App Features',
      items: [
        { title: 'Advanced Contextual Understanding', description: 'NORA\'s AI models are capable of maintaining long, complex conversations while remembering previous interactions to provide highly relevant and personalized responses. It understands nuance, tone, and context like no other assistant.', image: '/images/placeholder/contextual-ai.jpg' },
        { title: 'Cross-Device Sync', description: 'Seamlessly transition from your phone to your desktop or tablet. Your conversation history and settings are always up-to-date and available wherever you are, thanks to our robust cloud infrastructure.', image: '/images/placeholder/cross-device-sync.jpg' },
        { title: 'Personalized Workflows', description: 'Create custom actions and shortcuts to automate repetitive tasks. NORA can integrate with other web apps to streamline your daily routines, from setting reminders to managing your calendar.', image: '/images/placeholder/workflows.jpg' },
        { title: 'Multilingual Support', description: 'Speak, chat, or type in multiple languages. NORA is trained on a vast corpus of data to provide accurate and natural responses in over 50 languages, making it a truly global assistant.', image: '/images/placeholder/multilingual.jpg' },
      ],
    },
    screenshots: {
      title: 'In-App Screenshots',
      items: [
        { id: 'chat-gif', title: 'Smart Chat Interface', description: 'A sleek and responsive chat UI with smart suggestions and voice input.', media: '/images/chat-demo.gif', isGif: true },
        { id: 'search-gif', title: 'Quick Search & Answers', description: 'Get instant answers by simply typing or speaking your query.', media: '/images/search-demo.gif', isGif: true },
        { id: 'settings', title: 'Customizable Settings', description: 'Personalize NORA\'s behavior, appearance, and integrations from a simple menu. Adjust themes, notification settings, and more.', media: '/images/placeholder/settings-screen.jpg', isGif: false },
        { id: 'home', title: 'Widgets & Shortcuts', description: 'Access AI functions directly from your home screen with a tap. Our customizable widgets adapt to your style and provide quick access to your most-used features.', media: '/images/placeholder/home-screen-widgets.jpg', isGif: false },
      ],
    },
    useCases: {
      title: 'How You Can Use NORA',
      items: [
        { icon: Layout, title: 'For Students', description: 'Create study guides, summarize long articles, or get help with complex concepts. NORA can be your personal tutor and research assistant, helping you prepare for exams and assignments.' },
        { icon: Target, title: 'For Professionals', description: 'Draft emails, brainstorm marketing strategies, or organize your calendar. NORA helps you manage your professional life with efficient and intelligent tools.' },
        { icon: Sparkles, title: 'For Creatives', description: 'Break through creative blocks by brainstorming ideas for stories, generating poetry, or composing song lyrics. NORA is your creative partner, providing endless inspiration.' },
        { icon: Code, title: 'For Developers', description: 'Get help with debugging code, understanding algorithms, or writing documentation. NORA supports various programming languages and can act as a knowledgeable coding partner.' },
      ]
    },
    testimonials: {
      title: 'Loved by Power Users',
      items: [
        {
          quote: 'NORA has completely changed how I organize my day. The instant access is a game-changer and the proactive suggestions are incredibly smart!',
          name: 'Alex Rivera',
          role: 'Web App Power User',
          avatar: '/images/avatar-1.png'
        },
        {
          quote: 'The universal compatibility is something I haven\'t seen in any other AI assistant. It feels native, fast, and secure. A must-have.',
          name: 'Maria Garcia',
          role: 'Productivity Enthusiast',
          avatar: '/images/avatar-2.png'
        },
        {
          quote: 'Finally, an AI that respects privacy without sacrificing functionality. The on-device processing gives me peace of mind.',
          name: 'Kenji Tanaka',
          role: 'Cybersecurity Analyst',
          avatar: '/images/avatar-3.png'
        },
        {
          quote: 'I use NORA on both my desktop and phone, and the seamless sync is flawless. It\'s the perfect tool for staying productive.',
          name: 'Laura Diaz',
          role: 'Student & Researcher',
          avatar: '/images/avatar-4.png'
        },
        {
          quote: 'The minimalist web design is a fantastic touch. The app feels fast and responsive, not just another sluggish website.',
          name: 'David Chen',
          role: 'UX Designer',
          avatar: '/images/avatar-5.png'
        },
        {
          quote: 'I was skeptical at first, but NORA\'s ability to integrate with the web sold me. It\'s my new go-to assistant.',
          name: 'Sofia Rodriguez',
          role: 'Digital Marketer',
          avatar: '/images/avatar-6.png'
        },
        {
          quote: 'NORA understands context better than any other AI I\'ve used. It makes conversations feel incredibly natural and efficient.',
          name: 'Michael Lee',
          role: 'Software Engineer',
          avatar: '/images/avatar-7.png'
        },
        {
          quote: 'The speed is incredible. I get answers almost instantly, which is exactly what I need when I\'m in my workflow.',
          name: 'Emily White',
          role: 'Consultant',
          avatar: '/images/avatar-8.png'
        },
      ]
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        { q: 'Is NORA Web App free to use?', a: 'Yes, NORA offers a generous free tier with core functionalities. Advanced features, such as deep integrations and priority support, are available with a NORA Pro subscription, which syncs across all your devices.' },
        { q: 'How does NORA protect my privacy?', a: 'We prioritize privacy by design. NORA processes sensitive data on-device whenever possible. For cloud-based features, we use end-to-end encryption to ensure your data is secure. We never sell your personal data to third parties.' },
        { q: 'Does it work with all browsers?', a: 'Absolutely. NORA Web App is optimized for all modern web browsers, including Chrome, Firefox, Safari, and Edge, ensuring a consistent experience regardless of your choice of browser.' },
        { q: 'What AI models does NORA use?', a: 'NORA utilizes a powerful hybrid approach, combining the strengths of GPT-4o for its creative and nuanced text generation with Gemini\'s advanced reasoning capabilities, providing you with the most accurate and insightful responses.' },
        { q: 'Can I use NORA offline?', a: 'NORA requires an internet connection to access its cloud-based AI models for the most accurate and powerful responses. However, we are actively developing on-device capabilities for basic functionalities to provide a better experience in low-connectivity environments.' },
        { q: 'How is NORA different from other web-based AI apps?', a: 'NORA stands out due to its lightweight design, its commitment to privacy with on-device processing, and a fluid user experience designed from the ground up for the web ecosystem. It\'s not just a chat app; it\'s a smart extension of your device.' },
        { q: 'What kind of tasks can NORA help me with?', a: 'NORA can assist you with a wide range of tasks, from drafting emails and summarizing documents to managing your calendar and brainstorming creative ideas. It can also help with research, language translation, and even simple coding tasks.' },
        { q: 'Is NORA compatible with all devices?', a: 'Yes, NORA is designed to work flawlessly on a variety of devices, including desktops, laptops, tablets, and phones. The responsive interface adapts to different screen sizes, providing an enhanced and more productive experience.' },
        { q: 'How do I get started with NORA Web App?', a: 'Getting started is simple. Just click "Launch Web App" or visit our web app URL, sign in with your account, and you\'ll be ready to start your first conversation with NORA. The app includes an interactive tutorial to help you discover its main features.' },
      ]
    },
    cta: {
      title: 'Ready to Elevate Your Web Experience?',
      button: 'Launch Web App'
    },
    footer: {
      tagline: 'The next generation of AI assistance.',
      columns: {
        products: { title: 'Products', links: ['NORA for Android', 'NORA for iPhone', 'NORA for Mac', 'NORA for Web'] },
        company: { title: 'Company', links: ['About Us', 'Careers', 'Privacy Policy', 'Terms of Service'] },
        support: { title: 'Support', links: ['Help Center', 'Contact Us', 'Feature Requests'] },
      }
    }
  }
};


// --- HOOKS PERSONALIZADOS ---

const useIntersectionObserver = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const callbackFunction = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(callbackFunction, { threshold: 0.1 });
    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [containerRef, callbackFunction]);

  return { containerRef, isVisible };
};

const AnimatedElement = forwardRef<HTMLDivElement, { children: ReactNode; delay?: number; className?: string }>(
  ({ children, delay = 0, className = '' }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    
    const callbackFunction = useCallback((entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, []);
  
    useEffect(() => {
      const observer = new IntersectionObserver(callbackFunction, { threshold: 0.1 });
      const currentRef = ref as React.RefObject<HTMLDivElement>;
      if (currentRef && currentRef.current) {
        observer.observe(currentRef.current);
      }
      return () => {
        if (currentRef && currentRef.current) {
          observer.unobserve(currentRef.current);
        }
      };
    }, [ref, callbackFunction]);

    const style = { transitionDelay: `${delay}ms` };
    
    return (
      <div ref={ref} style={style} className={`transition-all duration-1000 ${className} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {children}
      </div>
    );
  }
);
AnimatedElement.displayName = 'AnimatedElement';


const DynamicBackground = memo(() => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <div className="absolute inset-0 z-10 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #737373 1px, transparent 1px)', backgroundSize: '2rem 2rem' }} />
      <div className="absolute top-1/2 left-1/2 w-3/4 h-3/4 bg-gradient-radial from-[#737373]/30 via-transparent to-transparent -translate-x-1/2 -translate-y-1/2 animate-aurora-glow" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent z-20" />
    </div>
  );
});

const Header = memo(({ content, lang }: HeaderProps) => {
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
            onClick={handleDownloadClick}
            className="px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-light hover:bg-white/15 hover:border-white/30 transition-all duration-300"
          >
            {contentMain.en.navDownload}
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
              {contentMain.en.navDownload}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
});

const HeroSection = ({ content }: HeroSectionProps) => {
  const { containerRef, isVisible } = useIntersectionObserver();

  return (
    <div ref={containerRef} className="relative min-h-screen flex items-center justify-center text-center px-6 z-10">
      <div className="max-w-4xl">
        <AnimatedElement className="animate-fade-up">
          <h1 className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400 mb-6" style={{ fontFamily: 'Lastica, sans-serif' }}>
            {content.title}
          </h1>
        </AnimatedElement>
        <AnimatedElement delay={150} className="animate-fade-up">
          <p className="text-lg md:text-2xl text-white/70 font-light max-w-2xl mx-auto leading-relaxed">
            {content.subtitle}
          </p>
        </AnimatedElement>
        <AnimatedElement delay={300} className="animate-fade-up">
          <p className="mt-6 text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
            {content.description}
          </p>
        </AnimatedElement>
        <AnimatedElement delay={450} className="animate-fade-up">
          <a href="/app" className="inline-block mt-10">
            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-light text-lg transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:scale-105 transform group relative">
              {content.cta}
              <ArrowRight className="inline-block ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </a>
        </AnimatedElement>
      </div>
    </div>
  );
};

const InteractiveDemoSection = ({ content }: InteractiveDemoSectionProps) => {
  const [activeFeature, setActiveFeature] = useState<DemoFeature>(content.features[0]);
  const { containerRef, isVisible } = useIntersectionObserver();

  return (
    <div ref={containerRef} className="py-24 md:py-32">
      <AnimatedElement className="animate-fade-up">
        <h2 className="text-3xl md:text-5xl font-light text-center mb-16" style={{ fontFamily: 'Lastica, sans-serif' }}>{content.title}</h2>
      </AnimatedElement>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
        <div className="flex flex-col space-y-4 lg:pr-8">
          {content.features.map((feature: DemoFeature, index) => (
            <AnimatedElement key={feature.id} delay={index * 100} className="animate-fade-up">
              <button
                onClick={() => setActiveFeature(feature)}
                className={`p-6 text-left rounded-2xl transition-all duration-300 w-full ${activeFeature.id === feature.id ? 'bg-[#737373]/20 border border-[#737373]/40 scale-105' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
              >
                <h3 className="font-bold text-lg text-white">{feature.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{feature.description}</p>
              </button>
            </AnimatedElement>
          ))}
        </div>
        <div className="lg:col-span-2 relative h-[600px] flex items-center justify-center">
          <AnimatedElement delay={300} className="animate-fade-up">
            <div className="w-[800px] h-[500px] bg-black rounded-[20px] shadow-2xl shadow-[#737373]/20 p-4 relative">
              <div className="w-full h-full rounded-[12px] overflow-hidden">
                <Image src={activeFeature.image} alt={activeFeature.name} width={800} height={500} className="w-full h-full object-cover" />
              </div>
            </div>
          </AnimatedElement>
        </div>
      </div>
    </div>
  );
};

const FeatureHighlightsSection = ({ content }: FeatureHighlightsSectionProps) => {
  const { containerRef, isVisible } = useIntersectionObserver();
  return (
    <div ref={containerRef} className="py-24 md:py-32">
      <AnimatedElement className="animate-fade-up">
        <h2 className="text-3xl md:text-5xl font-light text-center mb-16" style={{ fontFamily: 'Lastica, sans-serif' }}>{content.title}</h2>
      </AnimatedElement>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {content.items.map((highlight, index) => (
          <AnimatedElement key={index} delay={index * 150} className="animate-fade-up">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#737373]/10 to-[#737373]/5 backdrop-blur-lg border border-[#737373]/10 group transition-all duration-300 hover:border-[#737373]/20 hover:-translate-y-2">
              <div className="h-48 mb-6 rounded-2xl overflow-hidden relative">
                <Image src={highlight.image} alt={highlight.title} width={600} height={400} className="transition-transform duration-300 group-hover:scale-105 w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">{highlight.title}</h3>
              <p className="text-gray-400 font-light leading-relaxed">{highlight.description}</p>
            </div>
          </AnimatedElement>
        ))}
      </div>
    </div>
  );
};

const ScreenshotsSection = ({ content }: ScreenshotsSectionProps) => {
  const { containerRef, isVisible } = useIntersectionObserver();
  return (
    <div ref={containerRef} className="py-24 md:py-32 bg-black">
      <AnimatedElement className="animate-fade-up">
        <h2 className="text-3xl md:text-5xl font-light text-center mb-16" style={{ fontFamily: 'Lastica, sans-serif' }}>{content.title}</h2>
      </AnimatedElement>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {content.items.map((screenshot: Screenshot, index: number) => (
          <AnimatedElement key={screenshot.id} delay={index * 150} className="animate-fade-up">
            <div className="bg-gradient-to-br from-[#737373]/10 to-[#737373]/5 backdrop-blur-lg border border-[#737373]/10 rounded-3xl p-6 h-full flex flex-col items-center text-center group transition-all duration-300 hover:border-[#737373]/20 hover:-translate-y-2">
              <div className="w-full h-80 rounded-2xl overflow-hidden mb-6 relative">
                {screenshot.isGif ? (
                  <Image src={screenshot.media} alt={screenshot.title} width={600} height={900} unoptimized={true} />
                ) : (
                  <Image src={screenshot.media} alt={screenshot.title} width={600} height={900} />
                )}
              </div>
              <h3 className="text-xl font-medium text-white mb-2">{screenshot.title}</h3>
              <p className="text-gray-400 font-light text-sm flex-1">{screenshot.description}</p>
            </div>
          </AnimatedElement>
        ))}
      </div>
    </div>
  );
};

const UseCasesSection = ({ content }: UseCasesSectionProps) => {
  const { containerRef, isVisible } = useIntersectionObserver();
  return (
    <div ref={containerRef} className="py-24 md:py-32">
      <AnimatedElement className="animate-fade-up">
        <h2 className="text-3xl md:text-5xl font-light text-center mb-16" style={{ fontFamily: 'Lastica, sans-serif' }}>{content.title}</h2>
      </AnimatedElement>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {content.items.map((useCase: UseCase, index: number) => {
          const Icon = useCase.icon;
          return (
            <AnimatedElement key={index} delay={index * 100} className="animate-fade-up">
              <div className="bg-gradient-to-br from-[#737373]/10 to-[#737373]/5 backdrop-blur-sm p-8 rounded-3xl border border-[#737373]/10 group transition-all duration-300 hover:border-[#737373]/20 hover:-translate-y-2">
                <div className="w-14 h-14 flex items-center justify-center bg-[#737373]/10 rounded-full mb-6 transition-all duration-300 group-hover:bg-[#737373]/20">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">{useCase.title}</h3>
                <p className="text-gray-400 font-light leading-relaxed">{useCase.description}</p>
              </div>
            </AnimatedElement>
          );
        })}
      </div>
    </div>
  );
};


const KeyBenefitsSection = ({ content }: KeyBenefitsSectionProps) => {
  const { containerRef, isVisible } = useIntersectionObserver();
  return (
    <div ref={containerRef} className="py-24 md:py-32">
      <AnimatedElement className="animate-fade-up">
        <h2 className="text-3xl md:text-5xl font-light text-center mb-20" style={{ fontFamily: 'Lastica, sans-serif' }}>{content.title}</h2>
      </AnimatedElement>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {content.items.map((benefit: Benefit, index: number) => {
          const Icon = benefit.icon;
          return (
            <AnimatedElement key={index} delay={index * 100} className="animate-fade-up">
              <div className="bg-gradient-to-br from-[#737373]/10 to-[#737373]/5 backdrop-blur-sm p-8 rounded-3xl border border-[#737373]/10 group transition-all duration-300 hover:border-[#737373]/20 hover:-translate-y-2">
                <div className="w-14 h-14 flex items-center justify-center bg-[#737373]/10 rounded-full mb-6 transition-all duration-300 group-hover:bg-[#737373]/20">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">{benefit.title}</h3>
                <p className="text-gray-400 font-light leading-relaxed">{benefit.description}</p>
              </div>
            </AnimatedElement>
          );
        })}
      </div>
    </div>
  );
};

const TestimonialsCarousel = ({ content }: TestimonialsCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(
      () => setCurrentIndex((prevIndex) => (prevIndex + 1) % content.items.length),
      5000
    );
    return () => resetTimeout();
  }, [currentIndex, content.items.length, resetTimeout]);

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  const { containerRef, isVisible } = useIntersectionObserver();
  return (
    <div ref={containerRef} className="py-24 md:py-32">
      <AnimatedElement className="animate-fade-up">
        <h2 className="text-3xl md:text-5xl font-light text-center mb-20" style={{ fontFamily: 'Lastica, sans-serif' }}>{content.title}</h2>
      </AnimatedElement>
      <AnimatedElement delay={150} className="relative max-w-4xl mx-auto h-80">
        <div className="overflow-hidden relative h-full">
          {content.items.map((testimonial: Testimonial, index: number) => (
            <div key={index} className="absolute w-full h-full transition-opacity duration-1000" style={{ opacity: index === currentIndex ? 1 : 0 }}>
              <div className="bg-gradient-to-br from-[#737373]/10 to-[#737373]/5 backdrop-blur-lg border border-[#737373]/10 rounded-3xl p-10 h-full flex flex-col justify-center items-center text-center">
                <Quote className="w-10 h-10 text-white/50 mb-4" />
                <p className="text-lg md:text-xl font-light text-white/90 mb-6 max-w-2xl">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <Image src={testimonial.avatar} alt={testimonial.name} width={40} height={40} className="rounded-full" />
                  <div className="ml-4 text-left">
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-2 mt-8">
          {content.items.map((_: Testimonial, index: number) => (
            <button key={index} onClick={() => goToSlide(index)} aria-label={`Go to slide ${index + 1}`} className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-white w-6' : 'bg-white/20 hover:bg-white/40'}`} />
          ))}
        </div>
      </AnimatedElement>
    </div>
  );
};

const FaqItem = ({ item }: FaqItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-[#737373]/10 backdrop-blur-xl rounded-2xl border border-[#737373]/20 overflow-hidden transition-all duration-500 hover:border-[#737373]/40 hover:bg-[#737373]/15">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-6 px-6">
        <h3 className="text-lg font-light text-white pr-4">{item.q}</h3>
        <Plus className={`w-5 h-5 text-gray-400 transition-transform duration-500 ${isOpen ? 'rotate-45' : 'rotate-0'}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-gray-300 font-light leading-relaxed px-6 pb-6">{item.a}</p>
      </div>
    </div>
  );
};

const FaqSection = ({ content }: FaqSectionProps) => {
  const { containerRef, isVisible } = useIntersectionObserver();
  return (
    <div ref={containerRef} className="py-24 md:py-32">
      <AnimatedElement className="animate-fade-up">
        <h2 className="text-3xl md:text-5xl font-light text-center mb-16" style={{ fontFamily: 'Lastica, sans-serif' }}>{content.title}</h2>
      </AnimatedElement>
      <div className="max-w-4xl mx-auto space-y-4">
        {content.items.map((item: FaqItemData, index: number) => (
          <AnimatedElement key={index} delay={index * 100} className="animate-fade-up">
            <FaqItem item={item} />
          </AnimatedElement>
        ))}
      </div>
    </div>
  );
};

const FinalCtaSection = ({ content }: FinalCtaSectionProps) => {
  const { containerRef, isVisible } = useIntersectionObserver();
  return (
    <div ref={containerRef}>
      <AnimatedElement className="py-24 md:py-32 text-center animate-fade-up">
        <h2 className="text-3xl md:text-5xl font-light mb-8 max-w-3xl mx-auto" style={{ fontFamily: 'Lastica, sans-serif' }}>
          {content.title}
        </h2>
        <a href="/app" className="inline-block">
          <button className="px-10 py-5 bg-gradient-to-r from-[#737373] to-[#737373]/80 rounded-full text-white font-bold text-lg transition-all duration-300 hover:scale-105 transform hover:shadow-2xl hover:shadow-[#737373]/50">
            {content.button}
          </button>
        </a>
      </AnimatedElement>
    </div>
  );
};

const Footer = memo(() => {
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


// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

export default function WebAppPageClient() {
  const [lang] = useState<'en'>('en');
  const content = pageContent[lang];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-gray-400 selection:text-black">
      <Header content={content.nav} lang={lang} />
      <main className="relative z-10">
        <DynamicBackground />
        
        <HeroSection content={content.hero} />

        <div className="container mx-auto px-6">
          <InteractiveDemoSection content={content.demo} />
          <KeyBenefitsSection content={content.benefits} />
          <FeatureHighlightsSection content={content.highlights} />
          <ScreenshotsSection content={content.screenshots} />
          <UseCasesSection content={content.useCases} />
          <TestimonialsCarousel content={content.testimonials} />
          <FaqSection content={content.faq} />
          <FinalCtaSection content={content.cta} />
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lastica:wght@300;400;500;600;700&display=swap');
        
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes aurora-glow {
          0%, 100% { transform: scale(1) translate(-50%, -50%); opacity: 0.2; }
          50% { transform: scale(1.2) translate(-50%, -50%); opacity: 0.4; }
        }

        .animate-fade-up {
          animation: fade-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-aurora-glow {
          animation: aurora-glow 20s ease-in-out infinite;
        }

        html { scroll-behavior: smooth; }
        body {
          font-family: 'Lastica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #000;
          color: #FFF;
        }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>
    </div>
  );
};