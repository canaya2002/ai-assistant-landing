// components/Navigation.tsx
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, HelpCircle, Calendar, Shield, Scale, Download, Menu, X } from 'lucide-react';

interface NavigationProps {
  onDownload?: () => void;
  showDownloadButton?: boolean;
  variant?: 'landing' | 'internal';
}

const Navigation: React.FC<NavigationProps> = ({ 
  onDownload, 
  showDownloadButton = true, 
  variant = 'internal' 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    { href: '/', label: 'Inicio', icon: Home, external: false },
    { href: '/docs', label: 'Documentación', icon: FileText, external: false },
    { href: '/faq', label: 'FAQ', icon: HelpCircle, external: false },
    { href: '/changelog', label: 'Changelog', icon: Calendar, external: false },
    { href: '/privacy', label: 'Privacidad', icon: Shield, external: false },
    { href: '/terms', label: 'Términos', icon: Scale, external: false },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  const handleDownloadClick = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download action
      window.open('https://github.com/canaya2002/ai-assistant-professional/releases/download/v1.0.0/AI.Assistant.Professional.Setup.1.0.0.exe', '_blank');
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="relative z-20 backdrop-blur-md bg-white/80 border-b border-gray-100 sticky top-0">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 sm:space-x-4 group">
            <div className="relative">
              <img 
                src="/images/nurologo.png" 
                alt="NURO - Asistente IA Profesional" 
                className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" 
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-md group-hover:opacity-100 opacity-70 transition-opacity"></div>
            </div>
            {variant === 'internal' && (
              <div className="hidden sm:block">
                <div className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">NURO</div>
                <div className="text-xs text-gray-500">Asistente IA</div>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isCurrentPage = isActive(item.href);
              
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium relative group ${
                    isCurrentPage 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.label}</span>
                  {isCurrentPage && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  )}
                  {!isCurrentPage && (
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                  )}
                </Link>
              );
            })}

            {/* Desktop Download Button */}
            {showDownloadButton && (
              <button 
                onClick={handleDownloadClick}
                className="relative group bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Descargar</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-3">
            {showDownloadButton && (
              <button 
                onClick={handleDownloadClick}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Descargar</span>
              </button>
            )}
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isCurrentPage = isActive(item.href);
                
                return (
                  <Link 
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isCurrentPage 
                        ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-500' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile Download Button */}
            {showDownloadButton && (
              <div className="mt-6 px-4">
                <button 
                  onClick={handleDownloadClick}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Descargar NURO</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;