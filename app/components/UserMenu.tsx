// components/UserMenu.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Settings, 
  Crown, 
  LogOut, 
  User, 
  CreditCard, 
  Loader2,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { cloudFunctions, helpers } from '../lib/firebase';
import toast from 'react-hot-toast';

interface CheckoutResponse {
  url: string;
}

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { userProfile, plan, signOut } = useAuth();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpgrade = async (planId: 'pro' | 'pro_max') => {
    setIsLoading(true);
    
    try {
      const priceIds = {
        pro: 'price_1S8id6Pa2fV72c7wyqjkxdpw',
        pro_max: 'price_1S12wKPa2fV72c7wX2NRAwQF'
      };

      const result = await cloudFunctions.createStripeCheckout({
        plan: planId,
        priceId: priceIds[planId]
      }) as { data: CheckoutResponse };
      
      if (result.data.url) {
        window.location.href = result.data.url;
      } else {
        throw new Error('No se pudo crear el checkout');
      }
    } catch (error: unknown) {
      console.error('Error upgrading:', error);
      toast.error('Error al procesar el pago. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    
    try {
      const result = await cloudFunctions.manageSubscription();
      if (result.data && 'url' in result.data) {
        window.location.href = result.data.url as string;
      }
    } catch (error: unknown) {
      console.error('Error managing subscription:', error);
      toast.error('Error al acceder a la gestión de suscripción.');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión. Intenta nuevamente.');
    }
  };

  const getPlanDisplayName = (planName: string) => {
    const names: { [key: string]: string } = {
      free: 'Gratis',
      pro: 'Pro',
      pro_max: 'Pro Max'
    };
    return names[planName] || 'Gratis';
  };

  const getPlanColor = (planName: string) => {
    const colors: { [key: string]: string } = {
      free: 'text-gray-400',
      pro: 'text-blue-400',
      pro_max: 'text-yellow-400'
    };
    return colors[planName] || 'text-gray-400';
  };

  const canUpgrade = () => {
    return plan === 'free' || plan === 'pro';
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 transition-all duration-300"
      >
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="text-sm font-medium text-white">
              {userProfile?.user?.name || 'Usuario'}
            </div>
            <div className={`text-xs ${getPlanColor(plan)}`}>
              Plan {getPlanDisplayName(plan)}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50">
          {/* User Info */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-white font-medium">
                  {userProfile?.user?.name || 'Usuario'}
                </div>
                <div className="text-gray-400 text-sm">
                  {userProfile?.user?.email || ''}
                </div>
                <div className={`text-sm font-medium ${getPlanColor(plan)}`}>
                  Plan {getPlanDisplayName(plan)}
                </div>
              </div>
            </div>

            {/* Usage Info */}
            {userProfile && userProfile.usage.daily.tokensLimit > 0 && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Tokens hoy</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">
                    {helpers.formatTokens(userProfile.usage.daily.tokensUsed)}/
                    {helpers.formatTokens(userProfile.usage.daily.tokensLimit)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {helpers.getUsagePercentage(
                      userProfile.usage.daily.tokensUsed,
                      userProfile.usage.daily.tokensLimit
                    )}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(helpers.getUsagePercentage(
                        userProfile.usage.daily.tokensUsed,
                        userProfile.usage.daily.tokensLimit
                      ), 100)}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {/* Upgrade Options */}
            {canUpgrade() && (
              <div className="mb-2">
                <div className="px-4 py-2 text-xs text-gray-400 font-medium">
                  ACTUALIZAR PLAN
                </div>
                
                {plan === 'free' && (
                  <button
                    onClick={() => handleUpgrade('pro')}
                    disabled={isLoading}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                  >
                    <Crown className="w-5 h-5 text-blue-400" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">Actualizar a Pro</div>
                      <div className="text-xs text-gray-400">$15/mes - Todas las funciones</div>
                    </div>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  </button>
                )}

                {(plan === 'free' || plan === 'pro') && (
                  <button
                    onClick={() => handleUpgrade('pro_max')}
                    disabled={isLoading}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                  >
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">Actualizar a Pro Max</div>
                      <div className="text-xs text-gray-400">$75/mes - Sin límites</div>
                    </div>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  </button>
                )}
              </div>
            )}

            {/* Manage Subscription (for paid users) */}
            {(plan === 'pro' || plan === 'pro_max') && (
              <button
                onClick={handleManageSubscription}
                disabled={isLoading}
                className="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-all duration-300"
              >
                <CreditCard className="w-5 h-5 text-green-400" />
                <span>Gestionar Suscripción</span>
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              </button>
            )}

            {/* Settings */}
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/settings');
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-all duration-300"
            >
              <Settings className="w-5 h-5 text-gray-400" />
              <span>Configuración</span>
            </button>

            {/* Divider */}
            <div className="border-t border-white/10 my-2" />

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}