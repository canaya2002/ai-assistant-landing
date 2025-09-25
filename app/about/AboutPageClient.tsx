// app/about/AboutPageClient.tsx - (NUEVO ARCHIVO - Componente de Cliente)
"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import {
  Bot, Menu, X, Target, Eye, Handshake, Star, Lightbulb, TrendingUp, ShieldCheck, Zap, Heart, Users, Globe, Code, Layers, MessageCircle, Aperture, Feather
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

interface ValueItem {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface HistoryEvent {
  year: number | string;
  title: string;
  description: string;
  video: string;
}

// Multilingual content
const content = {
  en: {
    navDownload: 'Download',
    aboutTitle: 'Our Journey',
    aboutSubtitle: 'Innovating the Future of AI, One Conversation at a Time',
    aboutDescription: 'NORA was born from a simple yet powerful idea: to make advanced artificial intelligence accessible to everyone. We are a passionate team of engineers, designers, and AI ethicists dedicated to creating a digital assistant that is not only profoundly intelligent but also intuitive, secure, and genuinely helpful.',
    historyTitle: 'Our Story: A Timeline of Innovation',
    historyEvents: [
      { year: 2024, title: 'The Spark: Project Conception', description: 'The visionary concept of NORA is born. Initial R&D begins, focusing on creating a truly personal and ethical AI assistant. The core team is assembled to lay the foundation for a new kind of intelligence.', video: '/images/Spark.mp4' },
      { year: 2024, title: 'Prototype & Core Development', description: 'Our first functional prototypes are developed. We focus on building a robust conversational engine and a seamless user experience, getting NORA ready for its first users.', video: '/images/Development.mp4' },
      { year: 2025, title: 'Public Beta & Cross-Platform Launch', description: 'NORA launches its first public beta. Simultaneously, we roll out native applications for iOS, Android, macOS, and the web, ensuring a consistent and powerful experience across all devices.', video: '/images/Platform.mp4' },
      { year: 2025, title: 'Scaling & Feature Expansion', description: 'We scale our infrastructure to support a rapidly growing user base. New features like advanced image generation, voice commands, and personalized learning are introduced.', video: '/images/Expansion.mp4' },
      { year: 2026, title: 'Global Reach & A New Era', description: 'NORA expands its linguistic support, reaching millions more users around the globe. We continue our mission of pushing the boundaries of what AI can achieve, always with the user at the center.', video: '/images/Global.mp4' },
    ],
    founderTitle: 'Meet Our Visionary Founder',
    founderName: 'Carlos Anaya Ruiz',
    founderBio: 'Carlos Anaya Ruiz is the brilliant mind and driving force behind NORA. A distinguished software engineer with a profound expertise in artificial intelligence and a passion for human-centric design, Carlos embarked on this journey with a clear mission: to democratize advanced AI. His leadership is characterized by an unwavering commitment to innovation, ethical development, and ensuring that NORA remains a trusted, empowering tool for every user. He firmly believes that the most impactful technology is that which seamlessly integrates into our lives, making them richer and more productive without compromising privacy or values.',
    missionVisionTitle: 'Our Guiding Principles',
    missionTitle: 'Our Mission',
    missionDescription: 'Our mission is to empower individuals worldwide by providing them with an intelligent, intuitive, and secure personal AI assistant. We strive to simplify complex tasks, ignite creativity, and offer instant, accurate, and contextually relevant information across all platforms. We are dedicated to making advanced artificial intelligence a fundamental and accessible tool for personal growth, professional productivity, and lifelong learning.',
    visionTitle: 'Our Vision',
    visionDescription: 'We envision a future where NORA is an indispensable part of daily life – a trusted and proactive partner that understands, anticipates, and adapts to user needs with unparalleled precision and empathy. We are building towards a world where every person has effortless access to the transformative power of artificial intelligence, enhancing their potential while upholding the highest standards of privacy, security, and ethical responsibility. NORA will be synonymous with intelligent assistance and human-AI collaboration.',
    valuesTitle: 'The Pillars of Our Success',
    values: [
      {
        icon: Lightbulb,
        title: 'Innovation First',
        description: 'We embrace continuous research and development, always seeking groundbreaking ways to enhance NORA\'s capabilities and user experience. Stagnation is not an option.'
      },
      {
        icon: Users,
        title: 'User-Centric Design',
        description: 'Every feature, every interaction, and every update is crafted with our users in mind. Their needs and feedback are the compass guiding our development.'
      },
      {
        icon: ShieldCheck,
        title: 'Unwavering Privacy & Security',
        description: 'We are fiercely committed to protecting user data through end-to-end encryption, strict access controls, and transparent policies. Trust is paramount.'
      },
      {
        icon: Handshake,
        title: 'Ethical AI Development',
        description: 'We adhere to the highest ethical standards, ensuring NORA is developed responsibly, free from bias, and always operates for the benefit of humanity.'
      },
      {
        icon: TrendingUp,
        title: 'Excellence in Performance',
        description: 'We optimize NORA for speed, accuracy, and reliability, leveraging the best AI models to deliver a seamless and high-performing experience on all devices.'
      },
      {
        icon: Globe,
        title: 'Global Accessibility',
        description: 'We believe advanced AI should be for everyone, everywhere. We are dedicated to making NORA accessible, multilingual, and culturally sensitive across the globe.'
      }
    ],
    technologyTitle: 'Our Advanced Technology Stack',
    technologyDescription: 'At the heart of NORA lies a sophisticated and robust technology stack designed for ultimate performance, scalability, and intelligence. We leverage cutting-edge advancements in AI to deliver an unparalleled assistant experience.',
    techHighlights: [
      { icon: Code, title: 'Hybrid AI Architecture', description: 'A flexible AI core that adapts to the task at hand, providing intelligent responses for every type of query.' },
      { icon: Layers, title: 'Secure Cloud Infrastructure', description: 'Built on a globally distributed, enterprise-grade cloud architecture for high availability, low latency, and top-tier data security.' },
      { icon: MessageCircle, title: 'Real-time Contextual Understanding', description: 'Advanced algorithms allow NORA to maintain conversational context over extended interactions, providing highly personalized responses.' },
      { icon: Aperture, title: 'Cross-Device Synchronization', description: 'A proprietary sync engine ensures your NORA experience is consistent and up-to-date across all your devices: web, mobile, and desktop.' },
      { icon: Feather, title: 'Multimodal Processing', description: 'NORA understands and generates content from various formats, including text, images, and voice, to deliver a truly versatile experience.' },
      { icon: Zap, title: 'Scalable Microservices', description: 'Our architecture is built with microservices, allowing for independent scaling of components and rapid deployment of new features without downtime.' },
    ],
    teamCultureTitle: 'Our Culture: Where Innovation Thrives',
    teamCultureDescription: 'Our team is the soul of NORA. We foster a vibrant, collaborative, and inclusive culture where diverse ideas are celebrated, and every voice contributes to our collective success. We believe that a supportive environment is key to groundbreaking innovation.',
    culturePoints: [
      'Collaborative Spirit: We work together, share knowledge, and grow as a unified team.',
      'Continuous Learning: We encourage curiosity, experimentation, and professional development.',
      'Impact-Driven: We focus on building features that genuinely make a difference in users\' lives.',
      'Work-Life Balance: We promote a healthy environment that values both hard work and personal well-being.',
      'Diversity & Inclusion: We champion a team that reflects the global community we serve.'
    ],
  }
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

const AboutHeroSection = memo(function AboutHeroSection({ lang }: { lang: Language['code'] }) {
  const currentContent = content[lang];
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-black overflow-hidden flex items-center justify-center min-h-screen">
      <div className="container mx-auto px-6 text-center relative z-10 max-w-5xl">
        <h1 className="text-5xl md:text-7xl font-light text-white mb-4 md:mb-6 animate-fade-up" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          {currentContent.aboutTitle}
        </h1>
        <p className="text-xl md:text-3xl text-gray-400 max-w-4xl mx-auto leading-relaxed font-light animate-fade-up" style={{ animationDelay: '0.2s' }}>
          {currentContent.aboutSubtitle}
        </p>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light mt-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          {currentContent.aboutDescription}
        </p>
      </div>
      <div className="absolute inset-0 z-0 opacity-10">
        <Image
          src="/images/modeloia.png"
          alt="Abstract background"
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/80" />
      </div>
    </section>
  );
});

const HistoryTimelineSection = memo(function HistoryTimelineSection({ lang }: { lang: Language['code'] }) {
  const currentContent = content[lang];

  return (
    <section className="relative py-20 md:py-40 bg-black overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <h2 className="text-4xl md:text-5xl font-light text-white text-center mb-16 animate-fade-up" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          {currentContent.historyTitle}
        </h2>
        <div className="relative max-w-6xl mx-auto">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-gradient-to-b from-[#737373]/20 via-[#737373] to-[#737373]/20 h-full hidden md:block"></div>
          
          <div className="space-y-24">
            {currentContent.historyEvents.map((event: HistoryEvent, index: number) => (
              <div
                key={index}
                className={`relative flex flex-col-reverse md:flex-row items-center gap-12 md:gap-0`}
              >
                <div className="hidden md:block absolute w-4 h-4 rounded-full bg-[#737373] left-1/2 transform -translate-x-1/2 z-20 border-2 border-white/20 transition-all duration-500 hover:scale-150 hover:border-white hover:shadow-lg hover:shadow-white/30 animate-scale-in" style={{ animationDelay: `${0.2 + index * 0.1}s` }}></div>

                <div className={`w-full md:w-[48%] flex-shrink-0 relative group p-4 transform transition-all duration-700 hover:scale-[1.03]
                  ${index % 2 === 0 ? 'md:order-1 md:pr-16 rotate-[-1deg] animate-fade-in-left' : 'md:order-2 md:pl-16 rotate-1 animate-fade-in-right'}`}
                  style={{ animationDelay: `${0.4 + index * 0.15}s` }}>
                  <div className="relative aspect-video rounded-3xl overflow-hidden border border-[#737373]/30 shadow-2xl transition-all duration-500 group-hover:shadow-3xl group-hover:shadow-[#737373]/40 group-hover:border-white/40">
                    <video
                      className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    >
                      <source src={event.video} type="video/mp4" />
                    </video>
                  </div>
                </div>

                <div className={`w-full md:w-[48%] flex-shrink-0 relative group p-4 transform transition-all duration-700 hover:scale-[1.03]
                  ${index % 2 === 0 ? 'md:order-2 md:pl-16 rotate-1 animate-fade-in-right' : 'md:order-1 md:pr-16 rotate-[-1deg] animate-fade-in-left'}`}
                  style={{ animationDelay: `${0.4 + index * 0.15}s` }}>
                  <div className="w-full p-8 rounded-3xl border border-[#737373]/30 backdrop-blur-xl bg-[#737373]/20 transition-all duration-700 hover:border-[#737373]/50 hover:bg-[#737373]/30 hover:shadow-3xl hover:shadow-[#737373]/20">
                    <h3 className="text-xl md:text-2xl font-medium text-white mb-2" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                      {event.year}: {event.title}
                    </h3>
                    <p className="text-gray-300 text-base font-light">{event.description}</p>
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

const FounderSection = memo(function FounderSection({ lang }: { lang: Language['code'] }) {
  const currentContent = content[lang];
  return (
    <section className="relative py-20 md:py-40 bg-black overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          <div className="relative group animate-fade-in-right">
            <div className="relative w-full h-auto aspect-[4/5] rounded-3xl overflow-hidden border border-[#737373]/30 shadow-2xl transition-all duration-500 group-hover:shadow-3xl group-hover:shadow-[#737373]/40">
              <Image
                src="/images/founder.png"
                alt={currentContent.founderName}
                layout="fill"
                objectFit="cover"
                className="group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-start p-6 md:p-10">
                <div className="text-left">
                  <h3 className="text-2xl md:text-4xl font-light text-white mb-1" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    {currentContent.founderName}
                  </h3>
                  <p className="text-lg text-gray-400 font-light">Founder & CEO, NORA</p>
                </div>
              </div>
            </div>
          </div>
          <div className="animate-fade-in-left">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6 md:mb-8" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              {currentContent.founderTitle}
            </h2>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-light">
              {currentContent.founderBio}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

const MissionVisionSection = memo(function MissionVisionSection({ lang }: { lang: Language['code'] }) {
  const currentContent = content[lang];
  return (
    <section className="relative py-20 md:py-40 bg-black overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12 md:mb-24 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            {currentContent.missionVisionTitle}
          </h2>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          <div className="group relative bg-[#737373]/30 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-[#737373]/30 animate-fade-in-up transition-all duration-700 hover:shadow-3xl hover:shadow-[#737373]/40" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 rounded-3xl z-0 transition-opacity duration-1000 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-[#737373]/40 to-transparent"></div>
            <div className="relative z-10">
              <Target className="w-12 h-12 text-white mb-4 md:mb-6 opacity-80 animate-floating-glow" />
              <h3 className="text-3xl font-light text-white mb-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                {currentContent.missionTitle}
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed font-light">
                {currentContent.missionDescription}
              </p>
            </div>
          </div>
          <div className="group relative bg-[#737373]/30 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-[#737373]/30 animate-fade-in-up transition-all duration-700 hover:shadow-3xl hover:shadow-[#737373]/40" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-0 rounded-3xl z-0 transition-opacity duration-1000 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-[#737373]/40 to-transparent"></div>
            <div className="relative z-10">
              <Eye className="w-12 h-12 text-white mb-4 md:mb-6 opacity-80 animate-floating-glow" />
              <h3 className="text-3xl font-light text-white mb-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                {currentContent.visionTitle}
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed font-light">
                {currentContent.visionDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

const ValuesSection = memo(function ValuesSection({ lang }: { lang: Language['code'] }) {
  const currentContent = content[lang];
  const valuesWithImages = currentContent.values.map((value, index) => ({
    ...value,
    image: `/images/values/value-${index + 1}.png`
  }));

  return (
    <section className="relative py-20 md:py-40 bg-black overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12 md:mb-16 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            {currentContent.valuesTitle}
          </h2>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {valuesWithImages.map((value, index) => (
            <div
              key={index}
              className="group relative bg-[#737373]/30 backdrop-blur-xl rounded-3xl p-8 border border-[#737373]/30 text-center flex flex-col items-center justify-center overflow-hidden animate-fade-in-up transition-all duration-500 hover:bg-[#737373]/40 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#737373]/30"
              style={{ animationDelay: `${0.6 + index * 0.15}s` }}
            >
              <div className="absolute inset-0 z-0 opacity-10 transition-opacity duration-500 group-hover:opacity-20">
                <Image
                  src={value.image}
                  alt={value.title}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4 md:mb-6 p-3 bg-[#737373]/50 rounded-full transition-colors duration-500 group-hover:bg-[#737373]/70">
                  <value.icon className="w-10 h-10 text-white opacity-90 transition-transform duration-500 group-hover:scale-110" />
                </div>
                <h3 className="text-xl md:text-2xl font-medium text-white mb-3" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  {value.title}
                </h3>
                <p className="text-base text-gray-300 font-light leading-relaxed">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

const TechnologySection = memo(function TechnologySection({ lang }: { lang: Language['code'] }) {
  const currentContent = content[lang];
  return (
    <section className="relative py-20 md:py-40 bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute w-full h-full bg-gradient-to-br from-black via-black/80 to-[#737373]/10 opacity-30"></div>
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#737373]/10 rounded-full blur-3xl animate-blob-one"></div>
        <div className="absolute bottom-1/3 right-1/5 w-60 h-60 bg-[#737373]/15 rounded-full blur-2xl animate-blob-two"></div>
        <div className="absolute top-1/2 left-1/5 w-40 h-40 bg-[#737373]/8 rounded-full blur-xl animate-blob-three"></div>
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12 md:mb-16 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            {currentContent.technologyTitle}
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            {currentContent.technologyDescription}
          </p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentContent.techHighlights.map((tech, index) => (
            <div
              key={index}
              className="bg-[#737373]/20 backdrop-blur-xl rounded-2xl p-6 border border-[#737373]/20 flex flex-col justify-between hover:border-[#737373]/40 hover:bg-[#737373]/30 transition-all duration-300 animate-slide-in-up"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className="flex justify-center md:justify-start mb-4">
                <tech.icon className="w-10 h-10 text-white opacity-80" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                {tech.title}
              </h3>
              <p className="text-base text-gray-400 font-light">
                {tech.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

const TeamCultureSection = memo(function TeamCultureSection({ lang }: { lang: Language['code'] }) {
  const currentContent = content[lang];
  return (
    <section className="relative py-20 md:py-40 bg-black overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12 md:mb-16 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            {currentContent.teamCultureTitle}
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            {currentContent.teamCultureDescription}
          </p>
        </div>
        <div className="max-w-4xl mx-auto space-y-6">
          {currentContent.culturePoints.map((point, index) => (
            <div
              key={index}
              className="flex items-start bg-[#737373]/20 backdrop-blur-lg rounded-xl p-5 border border-[#737373]/20 animate-fade-in-up hover:bg-[#737373]/30 transition-all duration-300"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <Heart className="w-6 h-6 text-white/70 mr-4 mt-1 flex-shrink-0" />
              <p className="text-lg text-gray-300 font-light">{point}</p>
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
export default function AboutPageClient() {
  const [lang] = useState<Language['code']>('en');

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Navigation lang={lang} />

      <main>
        <AboutHeroSection lang={lang} />
        <HistoryTimelineSection lang={lang} />
        <FounderSection lang={lang} />
        <MissionVisionSection lang={lang} />
        <ValuesSection lang={lang} />
        <TechnologySection lang={lang} />
        <TeamCultureSection lang={lang} />
      </main>

      <Footer />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lastica:wght@300;400;500;600;700&display=swap');

        /* Keyframe Animations */
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(50px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in-right {
          0% { opacity: 0; transform: translateX(50px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        @keyframes fade-in-left {
          0% { opacity: 0; transform: translateX(-50px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes slide-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes blob-one {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes blob-two {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-40px, 10px) scale(0.95); }
          66% { transform: translate(20px, -30px) scale(1.05); }
        }

        @keyframes blob-three {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(10px, 40px) scale(1.1); }
          66% { transform: translate(-50px, -10px) scale(0.9); }
        }

        @keyframes floating-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        /* Animation Classes */
        .animate-fade-up {
          animation: fade-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-right {
          animation: fade-in-right 1s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-left {
          animation: fade-in-left 1s ease-out forwards;
          opacity: 0;
        }

        .animate-scale-in {
          animation: scale-in 0.7s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-blob-one {
          animation: blob-one 12s ease-in-out infinite alternate;
        }

        .animate-blob-two {
          animation: blob-two 15s ease-in-out infinite alternate-reverse;
        }

        .animate-blob-three {
          animation: blob-three 10s ease-in-out infinite alternate;
        }

        .animate-floating-glow {
          animation: floating-glow 3s ease-in-out infinite;
        }

        /* Custom shadows for enhanced glass effect */
        .shadow-3xl {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 40px rgba(115, 115, 115, 0.3) inset;
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