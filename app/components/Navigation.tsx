// components/Navigation.tsx
'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageCircle, 
  Image as ImageIcon, 
  Settings, 
  Crown, 
  Menu,
  X,
  Sparkles,
  Zap,
  Camera,
  Home,
  User
} from 'lucide-react';
import Link from 'next/link';

interface NavigationProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function Navigation({ isOpen = false, onClose, isMobile = false }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userProfile, plan, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const navigationItems = [
    {
      name: 'Chat',
      href: '/chat',
      icon: MessageCircle,
      description: 'Conversa con NORA',
      available: true
    },
    {
      name: 'Generador de Imágenes',
      href: '/images',
      icon: ImageIcon,
      description: 'Crea imágenes con IA',
      available: userProfile?.planInfo?.availableFeatures?.imageGeneration || false,
      badge: plan !== 'free' ? null : 'Pro'
    },
    {
      name: 'Configuración',
      href: '/settings',
      icon: Settings,
      description: 'Ajustes y preferencias',
      available: true
    }
  ];

  const handleNavigation = async (href: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      await router.push(href);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error navigating:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getPlanIcon = () => {
    switch (plan) {
      case 'pro': return <Zap className="w-4 h-4 text-blue-400" />;
      case 'pro_max': return <Crown className="w-4 h-4 text-yellow-400" />;
      default: return <Camera className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPlanColor = () => {
    switch (plan) {
      case 'pro': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'pro_max': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  // Navegación móvil en pantalla completa
  if (isMobile) {
    return (
      <div className={`fixed inset-0 z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Navigation Panel */}
        <div className="relative w-80 h-full bg-black/90 backdrop-blur-xl border-r border-white/10">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">NORA</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* User Info */}
          {user && userProfile && (
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">
                    {user.email}
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    {userProfile.user.name}
                  </div>
                </div>
              </div>
              
              <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border text-sm ${getPlanColor()}`}>
                {getPlanIcon()}
                <span className="font-medium">
                  Plan {plan === 'pro_max' ? 'Pro Max' : plan?.charAt(0).toUpperCase() + plan?.slice(1)}
                </span>
              </div>
              
              {userProfile.usage.daily.tokensLimit > 0 && (
                <div className="mt-3 text-sm">
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>Tokens hoy</span>
                    <span>{userProfile.usage.daily.tokensRemaining}/{userProfile.usage.daily.tokensLimit}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.max(0, (userProfile.usage.daily.tokensRemaining / userProfile.usage.daily.tokensLimit) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-6">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const isDisabled = !item.available;
                
                return (
                  <button
                    key={item.href}
                    onClick={() => item.available ? handleNavigation(item.href) : null}
                    disabled={isDisabled || isLoading}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white'
                        : isDisabled
                        ? 'text-gray-500 cursor-not-allowed opacity-50'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">
                        {item.name}
                      </div>
                      <div className="text-sm opacity-70 truncate">
                        {item.description}
                      </div>
                    </div>
                    {item.badge && (
                      <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-medium">
                        {item.badge}
                      </span>
                    )}
                    {!item.available && (
                      <Crown className="w-4 h-4 text-yellow-400" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Acciones Rápidas</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleNavigation('/upgrade')}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl text-yellow-200 hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-200"
                >
                  <Crown className="w-5 h-5" />
                  <span className="font-medium">Actualizar Plan</span>
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all duration-200"
                >
                  <span className="font-medium">Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Navegación de escritorio (sidebar)
  return (
    <div className={`w-80 h-full bg-black/90 backdrop-blur-xl border-r border-white/10 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } transition-transform duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-white">NORA</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* User Info */}
      {user && userProfile && (
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate">
                {userProfile.user.name}
              </div>
              <div className="text-sm text-gray-400 truncate">
                {user.email}
              </div>
            </div>
          </div>
          
          <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full border ${getPlanColor()}`}>
            {getPlanIcon()}
            <span className="font-medium">
              Plan {plan === 'pro_max' ? 'Pro Max' : plan?.charAt(0).toUpperCase() + plan?.slice(1)}
            </span>
          </div>
          
          {userProfile.usage.daily.tokensLimit > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Tokens disponibles hoy</span>
                <span>{userProfile.usage.daily.tokensRemaining}/{userProfile.usage.daily.tokensLimit}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.max(0, (userProfile.usage.daily.tokensRemaining / userProfile.usage.daily.tokensLimit) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-6">
        <nav className="space-y-3">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const isDisabled = !item.available;
            
            return (
              <Link
                key={item.href}
                href={item.available ? item.href : '#'}
                onClick={(e) => {
                  if (!item.available) {
                    e.preventDefault();
                    return;
                  }
                  if (onClose) onClose();
                }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white'
                    : isDisabled
                    ? 'text-gray-500 cursor-not-allowed opacity-50'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-6 h-6 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">
                    {item.name}
                  </div>
                  <div className="text-sm opacity-70">
                    {item.description}
                  </div>
                </div>
                {item.badge && (
                  <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-medium">
                    {item.badge}
                  </span>
                )}
                {!item.available && (
                  <Crown className="w-5 h-5 text-yellow-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Section */}
        {plan === 'free' && (
          <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="font-medium text-white">Actualiza tu plan</span>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              Desbloquea generación de imágenes y más funciones premium.
            </p>
            <Link
              href="/upgrade"
              onClick={() => onClose && onClose()}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium"
            >
              Ver Planes
            </Link>
          </div>
        )}

        {/* Sign Out */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all duration-200"
          >
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}