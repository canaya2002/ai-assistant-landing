// app/auth/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AuthForm from '../components/AuthForm';
import LoadingScreen from '../components/LoadingScreen';
import { ArrowLeft, Menu, X } from 'lucide-react';
import Image from 'next/image';
import { memo, useState } from 'react';

// Background video component
const VideoBackground = memo(function VideoBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video 
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        style={{ objectPosition: 'center 30%' }}
        autoPlay 
        muted 
        loop 
        playsInline
        preload="metadata"
      >
        <source src="/images/fondo.mp4" type="video/mp4" />
        <source src="/fondo.webm" type="video/webm" />
      </video>
      {/* Overlay gradients más sutiles */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20" />
      
      {/* Efectos adicionales */}
      <div className="absolute inset-0 z-30">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-purple-400/40 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-400/20 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '5s' }} />
      </div>
    </div>
  );
});

// Enhanced Navigation adapted from landing page
const Navigation = memo(function Navigation() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo as image from landing */}
        <div className="flex items-center">
          <Image 
            src="/images/nora.png" 
            alt="NORA Logo" 
            width={96}
            height={96}
            className="hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Desktop button */}
        <div className="hidden md:flex items-center space-x-4">
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-full text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-light">Inicio</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-white/10 md:hidden">
            <div className="container mx-auto px-6 py-4">
              <button 
                onClick={() => {
                  router.push('/');
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/15 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-light">Volver al Inicio</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

// Footer component
const Footer = memo(function Footer() {
  return (
    <footer className="relative z-30 py-8 px-6 border-t border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Image 
              src="/images/nora.png" 
              alt="NORA" 
              width={32}
              height={32}
            />
            <span className="text-white font-light">© 2024 NORA</span>
          </div>
          <div className="flex items-center space-x-6">
            <ul className="flex items-center space-x-4 text-sm text-gray-400">
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacidad</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Términos</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/chat');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingScreen message="Verificando autenticación..." />;
  }

  if (user) {
    return <LoadingScreen message="Redirigiendo a chat..." />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white overflow-hidden">
      <Navigation />
      
      <main className="relative flex-1 flex items-center justify-center">
        <VideoBackground />
        
        <div className="relative z-30 container mx-auto px-8 py-40 text-center">
          <AuthForm />
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lastica:wght@300;400;500;600;700&display=swap');
        
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-up { 
          animation: fade-up 0.8s ease-out forwards; 
          opacity: 0; 
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

        body {
          font-family: 'Lastica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
}