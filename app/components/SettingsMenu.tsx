// components/SettingsMenu.tsx - VERSIÓN COMPLETA CORREGIDA
'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Crown, 
  LogOut, 
  User, 
  CreditCard, 
  Loader2,
  X,
  Settings,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../contexts/ConversationContext';
import { useRouter } from 'next/navigation';
import { cloudFunctions, helpers } from '../lib/firebase';
import toast from 'react-hot-toast';

interface CheckoutResponse {
  url: string;
}

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsMenu({ isOpen, onClose }: SettingsMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'usage' | 'data'>('account');
  const { userProfile, plan, signOut } = useAuth();
  const { exportConversations, importConversations } = useConversations();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Prevenir propagación de clicks dentro del menú
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const canUpgrade = () => {
    return plan === 'free' || plan === 'pro';
  };

  const getPlanColor = (currentPlan: string) => {
    const colors = {
      free: 'text-gray-400',
      pro: 'text-blue-400',
      pro_max: 'text-yellow-400'
    };
    return colors[currentPlan as keyof typeof colors] || 'text-gray-400';
  };

  const getPlanDisplayName = (currentPlan: string) => {
    const names = {
      free: 'Gratis',
      pro: 'Pro',
      pro_max: 'Pro Max'
    };
    return names[currentPlan as keyof typeof names] || 'Gratis';
  };

  const handleUpgrade = async (planId: 'pro' | 'pro_max') => {
    setIsLoading(true);
    
    try {
      const priceIds = {
        pro: 'price_1S08CYPa2fV72c7wm3DC8M3y',
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
      onClose();
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    
    try {
      const result = await cloudFunctions.manageSubscription();
      
      // ✅ CORRECCIÓN PARA EL ERROR DEL OPERADOR 'in'
      if (result?.data && typeof result.data === 'object' && 'url' in result.data) {
        const url = (result.data as { url: string }).url;
        if (url) {
          window.location.href = url;
        } else {
          throw new Error('URL de gestión no disponible');
        }
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error: unknown) {
      console.error('Error managing subscription:', error);
      toast.error('Error al acceder a la gestión de suscripción.');
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth');
      onClose();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión. Intenta nuevamente.');
    }
  };

  const handleExportData = () => {
    try {
      exportConversations();
      toast.success('Conversaciones exportadas exitosamente');
    } catch (error) {
      console.error('Error exporting conversations:', error);
      toast.error('Error al exportar conversaciones');
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const success = await importConversations(file);
      if (success) {
        toast.success('Conversaciones importadas exitosamente');
      } else {
        toast.error('Error al importar conversaciones. Verifica el formato del archivo.');
      }
    } catch (error) {
      console.error('Error importing conversations:', error);
      toast.error('Error al importar conversaciones');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="absolute right-4 top-4 bottom-4 w-96 max-w-[calc(100vw-2rem)]">
        <div 
          ref={menuRef}
          onClick={handleMenuClick}
          className="h-full bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-light text-white font-lastica">Configuración</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {[
              { id: 'account', label: 'Cuenta', icon: User },
              { id: 'usage', label: 'Uso', icon: Settings },
              { id: 'data', label: 'Datos', icon: Download }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white border-b-2 border-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-light">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'account' && (
              <div className="p-6 space-y-6">
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">
                      {userProfile?.user?.name || 'Usuario'}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {userProfile?.user?.email || ''}
                    </div>
                    <div className={`text-xs font-medium ${getPlanColor(plan)}`}>
                      Plan {getPlanDisplayName(plan)}
                    </div>
                  </div>
                </div>

                {/* Upgrade Options */}
                {canUpgrade() && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-white">Actualizar Plan</h3>
                    
                    {plan === 'free' && (
                      <button
                        onClick={() => handleUpgrade('pro')}
                        disabled={isLoading}
                        className="w-full flex items-center space-x-3 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl text-white hover:bg-blue-500/30 transition-all duration-300"
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
                        className="w-full flex items-center space-x-3 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-white hover:bg-yellow-500/30 transition-all duration-300"
                      >
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">Actualizar a Pro Max</div>
                          <div className="text-xs text-gray-400">$25/mes - Uso ilimitado</div>
                        </div>
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      </button>
                    )}
                  </div>
                )}

                {/* Manage Subscription */}
                {(plan === 'pro' || plan === 'pro_max') && (
                  <button
                    onClick={handleManageSubscription}
                    disabled={isLoading}
                    className="w-full flex items-center space-x-3 p-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">Gestionar Suscripción</div>
                      <div className="text-xs text-gray-400">Facturas, cancelación y más</div>
                    </div>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  </button>
                )}

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-white hover:bg-red-500/30 transition-all duration-300"
                >
                  <LogOut className="w-5 h-5 text-red-400" />
                  <div className="text-left">
                    <div className="font-medium">Cerrar Sesión</div>
                    <div className="text-xs text-gray-400">Salir de tu cuenta</div>
                  </div>
                </button>
              </div>
            )}

            {activeTab === 'usage' && userProfile && (
              <div className="p-6 space-y-6">
                {/* Daily Usage */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white mb-3">Uso Diario</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Tokens</span>
                      <span className="text-sm text-white">
                        {helpers.formatTokens(userProfile.usage.daily.tokensUsed)}/
                        {helpers.formatTokens(userProfile.usage.daily.tokensLimit)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
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
                    <div className="text-xs text-gray-400">
                      {helpers.getUsagePercentage(
                        userProfile.usage.daily.tokensUsed,
                        userProfile.usage.daily.tokensLimit
                      )}% utilizado
                    </div>
                  </div>
                </div>

                {/* Monthly Usage */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white mb-3">Uso Mensual</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Tokens</span>
                      <span className="text-sm text-white">
                        {helpers.formatTokens(userProfile.usage.monthly.tokensUsed)}/
                        {helpers.formatTokens(userProfile.usage.monthly.tokensLimit)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(helpers.getUsagePercentage(
                            userProfile.usage.monthly.tokensUsed,
                            userProfile.usage.monthly.tokensLimit
                          ), 100)}%` 
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-400">
                      {helpers.getUsagePercentage(
                        userProfile.usage.monthly.tokensUsed,
                        userProfile.usage.monthly.tokensLimit
                      )}% utilizado
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white mb-3">Funciones Disponibles</h3>
                  <div className="space-y-2">
                    {Object.entries(userProfile.planInfo.availableFeatures).map(([feature, available]) => (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="text-sm text-gray-400 capitalize">{feature}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {available ? 'Disponible' : 'No disponible'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="p-6 space-y-6">
                {/* Export Data */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white">Exportar Datos</h3>
                  <p className="text-xs text-gray-400">
                    Descarga todas tus conversaciones en formato JSON
                  </p>
                  <button
                    onClick={handleExportData}
                    className="w-full flex items-center space-x-3 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl text-white hover:bg-blue-500/30 transition-all duration-300"
                  >
                    <Download className="w-5 h-5 text-blue-400" />
                    <div className="text-left">
                      <div className="font-medium">Exportar Conversaciones</div>
                      <div className="text-xs text-gray-400">Descargar archivo JSON</div>
                    </div>
                  </button>
                </div>

                {/* Import Data */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white">Importar Datos</h3>
                  <p className="text-xs text-gray-400">
                    Sube un archivo de respaldo para restaurar conversaciones
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center space-x-3 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-white hover:bg-green-500/30 transition-all duration-300"
                  >
                    <Upload className="w-5 h-5 text-green-400" />
                    <div className="text-left">
                      <div className="font-medium">Importar Conversaciones</div>
                      <div className="text-xs text-gray-400">Seleccionar archivo JSON</div>
                    </div>
                  </button>
                </div>

                {/* Privacy Notice */}
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-400 mb-2">Privacidad</h4>
                  <p className="text-xs text-gray-300">
                    Todos los datos se almacenan localmente en tu dispositivo. 
                    No se envían a servidores externos sin tu consentimiento.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}