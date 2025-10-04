// app/components/SettingsMenu.tsx - COMPLETO
'use client';

import { useState, useRef } from 'react';
import { 
  X, User, Settings, LogOut, Crown, Shield, Palette, Bell, Moon, Sun, Monitor,
  Globe, Download, Upload, Trash2, UserCircle, Mail, Calendar, CreditCard, Sparkles, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../hooks/useConversations'; // ✅ HOOK ACTUALIZADO
import { useRouter } from 'next/navigation';
import { cloudFunctions } from '../lib/firebase';
import toast from 'react-hot-toast';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'profile' | 'appearance' | 'notifications' | 'data' | 'plan' | 'about';

export default function SettingsMenu({ isOpen, onClose }: SettingsMenuProps) {
  const { user, userProfile, signOut } = useAuth();
  const { exportConversations } = useConversations(); // ✅ SOLO exportConversations disponible
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [notifications, setNotifications] = useState(true);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !user || !userProfile) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const result = await cloudFunctions.createStripeCheckout({
        plan: 'pro',
        priceId: 'price_pro_monthly'
      });
      if (result?.data && typeof result.data === 'object' && 'url' in result.data) {
        const url = (result.data as { url: string }).url;
        if (url) window.location.href = url;
      }
    } catch (error: unknown) {
      console.error('Error initiating upgrade:', error);
      toast.error('Error al procesar upgrade. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const result = await cloudFunctions.manageSubscription();
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

  const handleExportData = async () => {
    try {
      await exportConversations();
      toast.success('Conversaciones exportadas exitosamente');
    } catch (error) {
      console.error('Error exporting conversations:', error);
      toast.error('Error al exportar conversaciones');
    }
  };

  const tabs = [
    { id: 'profile' as const, name: 'Perfil', icon: UserCircle },
    { id: 'data' as const, name: 'Datos', icon: Download },
    { id: 'plan' as const, name: 'Plan', icon: Crown },
    { id: 'about' as const, name: 'Acerca de', icon: Settings },
  ];

  return (
    <>
      <div className="h-full flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-white/3 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-float-delayed"></div>
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/4 rounded-full blur-xl animate-float-slow"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col">
          <div className="flex-1 max-w-6xl mx-auto w-full my-4 md:my-8">
            <div className="floating-settings-container h-full flex flex-col">
              <div className="p-3 md:p-4">
                <div className="flex items-center justify-end">
                  <button onClick={onClose} className="floating-button p-2 rounded-lg transition-all duration-300">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col md:flex-row min-h-0">
                <div className="w-full md:w-16 flex md:flex-col overflow-x-auto md:overflow-x-visible overflow-y-visible md:overflow-y-auto p-2 space-x-2 md:space-x-0 space-y-0 md:space-y-2 border-b md:border-b-0 md:border-r border-white/10">
                  <div className="flex md:flex-col space-x-2 md:space-x-0 space-y-0 md:space-y-2 min-w-max md:min-w-0">
                    {tabs.map((tab, index) => {
                      const IconComponent = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          onMouseEnter={() => setHoveredTab(tab.id)}
                          onMouseLeave={() => setHoveredTab(null)}
                          className={`flex md:flex-col items-center justify-center space-x-2 md:space-x-0 space-y-0 md:space-y-1 p-2 md:p-3 rounded-xl font-light transition-all duration-500 liquid-tab-button group whitespace-nowrap md:whitespace-normal ${
                            activeTab === tab.id ? 'floating-tab-active' : 'floating-tab hover:floating-tab-hover'
                          }`}
                          style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif', animationDelay: `${index * 0.1}s` }}
                          title={tab.name}
                        >
                          <div className="relative flex-shrink-0">
                            <IconComponent className={`w-5 h-5 transition-all duration-500 ${
                              activeTab === tab.id ? 'text-white scale-110' : 'text-gray-300 group-hover:text-white group-hover:scale-105'
                            }`} />
                            {hoveredTab === tab.id && (
                              <div className="absolute inset-0 bg-white/20 rounded-full scale-0 animate-ripple"></div>
                            )}
                          </div>
                          <span className={`text-xs leading-tight transition-all duration-500 md:hidden ${
                            activeTab === tab.id ? 'text-white' : 'text-gray-300 group-hover:text-white'
                          }`}>
                            {tab.name}
                          </span>
                          {activeTab === tab.id && (
                            <div className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 w-0.5 h-6 bg-white rounded-r-lg animate-slide-in"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex-shrink-0 pt-2 md:pt-4 mt-2 md:mt-4 border-t border-white/10">
                    <button
                      onClick={handleSignOut}
                      className="flex md:flex-col items-center justify-center space-x-2 md:space-x-0 space-y-0 md:space-y-1 p-2 md:p-3 rounded-xl font-light text-red-400 hover:text-red-300 transition-all duration-500 liquid-tab-button group floating-tab hover:floating-tab-hover-danger whitespace-nowrap md:whitespace-normal"
                      style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}
                      title="Cerrar sesión"
                    >
                      <LogOut className="w-5 h-5 transition-all duration-300 group-hover:scale-105 flex-shrink-0" />
                      <span className="text-xs leading-tight md:hidden">Cerrar sesión</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scroll">
                  <div className="container max-w-none px-3 md:px-6">
                    {activeTab === 'profile' && (
                      <div className="py-4 md:py-6 space-y-4 md:space-y-6 animate-tab-content">
                        <div className="floating-card p-4 md:p-5 animate-card-in" style={{ animationDelay: '0.1s' }}>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
                            <div className="relative flex-shrink-0 self-center sm:self-auto">
                              <div className="w-10 h-10 md:w-12 md:h-12 floating-avatar flex items-center justify-center">
                                <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 text-center sm:text-left min-w-0">
                              <h3 className="text-base md:text-lg font-light text-white mb-1" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                                {userProfile.user.name || 'Usuario'}
                              </h3>
                              <p className="text-gray-400 font-light text-xs md:text-sm truncate" title={user.email ?? undefined}>{user.email}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                            <div className="floating-info-card p-2 md:p-3 animate-card-in" style={{ animationDelay: '0.2s' }}>
                              <div className="text-gray-400 mb-1 text-xs font-light">Plan actual</div>
                              <div className="text-white font-light flex items-center space-x-1 text-xs md:text-sm">
                                {userProfile.user.plan === 'free' ? (
                                  <><Shield className="w-3 h-3 text-gray-400 flex-shrink-0" /><span>Gratis</span></>
                                ) : (
                                  <><Crown className="w-3 h-3 text-yellow-400 flex-shrink-0" /><span className="capitalize truncate">{userProfile.user.plan}</span></>
                                )}
                              </div>
                            </div>
                            <div className="floating-info-card p-2 md:p-3 animate-card-in" style={{ animationDelay: '0.3s' }}>
                              <div className="text-gray-400 mb-1 text-xs font-light">Miembro desde</div>
                              <div className="text-white font-light text-xs md:text-sm">
                                {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'No disponible'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 md:space-y-3">
                          <div className="floating-card p-3 md:p-4 flex items-center space-x-3 md:space-x-4 animate-card-in" style={{ animationDelay: '0.4s' }}>
                            <div className="w-7 h-7 md:w-8 md:h-8 floating-icon-container flex-shrink-0">
                              <Mail className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-light text-sm md:text-base mb-1" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Email</div>
                              <div className="text-gray-400 font-light text-xs md:text-sm truncate" title={user.email ?? undefined}>{user.email}</div>
                            </div>
                          </div>
                          
                          <div className="floating-card p-3 md:p-4 flex items-center space-x-3 md:space-x-4 animate-card-in" style={{ animationDelay: '0.5s' }}>
                            <div className="w-7 h-7 md:w-8 md:h-8 floating-icon-container flex-shrink-0">
                              <Calendar className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-light text-sm md:text-base mb-1" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Último acceso</div>
                              <div className="text-gray-400 font-light text-xs md:text-sm break-words">
                                {user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'No disponible'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'data' && (
                      <div className="py-4 md:py-6 space-y-4 md:space-y-6 animate-tab-content">
                        <div className="animate-card-in">
                          <h3 className="text-base md:text-lg font-light text-white mb-2" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Exportar Datos</h3>
                          <p className="text-gray-400 mb-3 md:mb-4 font-light leading-relaxed text-xs md:text-sm">
                            Descarga todas tus conversaciones y configuraciones en un archivo JSON seguro para respaldo personal.
                          </p>
                          <button onClick={handleExportData} className="floating-action-button w-full p-3 md:p-4 flex items-center space-x-3 md:space-x-4">
                            <div className="w-7 h-7 md:w-8 md:h-8 floating-icon-container flex-shrink-0">
                              <Download className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                              <div className="font-light text-white text-sm md:text-base mb-1" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Exportar Conversaciones</div>
                              <div className="text-gray-400 font-light text-xs md:text-sm">Descargar archivo JSON con todas tus conversaciones</div>
                            </div>
                          </button>
                        </div>

                        <div className="floating-card p-3 md:p-4 animate-card-in" style={{ animationDelay: '0.4s' }}>
                          <h4 className="text-sm md:text-base font-light text-yellow-400 mb-2" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Privacidad y Seguridad</h4>
                          <p className="text-gray-400 font-light leading-relaxed text-xs md:text-sm">
                            Todos los datos se procesan y almacenan de forma segura en Firebase. Tus conversaciones están protegidas y mantienes control total sobre tu información personal.
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'plan' && (
                      <div className="py-4 md:py-6 space-y-4 md:space-y-6 animate-tab-content">
                        <div className="floating-card p-4 md:p-6 animate-card-in">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4 md:mb-6">
                            <h3 className="text-base md:text-lg font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Plan Actual</h3>
                            <div className={`px-3 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl font-light text-center sm:text-left text-xs md:text-sm ${
                              userProfile.user.plan === 'free' ? 'floating-badge-free' : 'floating-badge-premium'
                            }`}>
                              {userProfile.user.plan === 'free' ? 'GRATIS' : userProfile.user.plan.toUpperCase()}
                            </div>
                          </div>
                          
                          {userProfile.user.plan === 'free' ? (
                            <div className="space-y-4 md:space-y-6">
                              <p className="text-gray-400 font-light text-sm md:text-base leading-relaxed">
                                Estás usando el plan gratuito. Actualiza a Pro para desbloquear el potencial completo de NORA con funcionalidades avanzadas y sin límites.
                              </p>
                              <button
                                onClick={handleUpgrade}
                                disabled={isLoading}
                                className="floating-premium-button w-full py-3 md:py-4 px-4 md:px-6 flex items-center justify-center space-x-2 md:space-x-3 disabled:opacity-50"
                                style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}
                              >
                                {isLoading ? (
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <><Sparkles className="w-4 h-4 flex-shrink-0" /><span className="font-light text-sm md:text-base">Upgrade a Pro</span></>
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4 md:space-y-6">
                              <p className="text-gray-400 font-light text-sm md:text-base leading-relaxed">
                                Tienes acceso completo a todas las funcionalidades premium de NORA. Gestiona tu suscripción o actualiza tu método de pago.
                              </p>
                              <button
                                onClick={handleManageSubscription}
                                disabled={isLoading}
                                className="floating-action-button w-full py-3 md:py-4 px-4 md:px-6 flex items-center justify-center space-x-2 md:space-x-3"
                                style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}
                              >
                                <CreditCard className="w-4 h-4 flex-shrink-0" />
                                <span className="font-light text-sm md:text-base">Gestionar Suscripción</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="animate-card-in" style={{ animationDelay: '0.2s' }}>
                          <h3 className="text-base md:text-lg font-light text-white mb-4 md:mb-6" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Beneficios Premium</h3>
                          <div className="grid grid-cols-1 gap-2 md:gap-3">
                            {[
                              { text: 'Conversaciones ilimitadas', active: userProfile.user.plan !== 'free' },
                              { text: 'Búsqueda web avanzada', active: userProfile.user.plan !== 'free' },
                              { text: 'Generación de imágenes', active: userProfile.user.plan !== 'free' },
                              { text: 'Modo especialista', active: userProfile.user.plan !== 'free' },
                              { text: 'Soporte prioritario', active: userProfile.user.plan !== 'free' }
                            ].map((benefit, index) => (
                              <div 
                                key={index} 
                                className="floating-benefit-card p-2 md:p-3 flex items-center space-x-2 md:space-x-3 animate-card-in"
                                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                              >
                                <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0 ${
                                  benefit.active ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
                                }`} />
                                <span className="text-gray-300 font-light text-xs md:text-sm">{benefit.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'about' && (
                      <div className="py-4 md:py-6 space-y-4 md:space-y-6 animate-tab-content">
                        <div className="text-center animate-card-in">
                          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 floating-avatar">
                            <img src="/images/nora.png" alt="NORA" className="w-full h-full object-contain" />
                          </div>
                          <p className="text-gray-400 mb-4 md:mb-6 font-light text-sm md:text-base leading-relaxed">Tu asistente de IA más inteligente y confiable</p>
                          <div className="text-gray-500 font-light text-xs md:text-sm">Versión 1.0.0</div>
                        </div>
                        
                        <div className="space-y-3 md:space-y-4">
                          <div className="floating-card p-3 md:p-4 animate-card-in" style={{ animationDelay: '0.2s' }}>
                            <h4 className="text-white font-light text-sm md:text-base mb-2 md:mb-3" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Tecnología Avanzada</h4>
                            <p className="text-gray-400 font-light leading-relaxed text-xs md:text-sm">
                              Impulsado por los modelos de IA más avanzados: GPT-4o y Gemini, diseñados para brindarte respuestas precisas, contextuales y altamente personalizadas.
                            </p>
                          </div>
                          
                          <div className="floating-card p-3 md:p-4 animate-card-in" style={{ animationDelay: '0.3s' }}>
                            <h4 className="text-white font-light text-sm md:text-base mb-2 md:mb-3" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Privacidad Garantizada</h4>
                            <p className="text-gray-400 font-light leading-relaxed text-xs md:text-sm">
                              Tus conversaciones se almacenan de forma segura con encriptación. Nunca compartimos tus datos personales con terceros y tú mantienes control total.
                            </p>
                          </div>
                          
                          <div className="floating-card p-3 md:p-4 animate-card-in" style={{ animationDelay: '0.4s' }}>
                            <h4 className="text-white font-light text-sm md:text-base mb-2 md:mb-3" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>Soporte Dedicado</h4>
                            <p className="text-gray-400 font-light leading-relaxed text-xs md:text-sm break-words">
                              ¿Tienes preguntas o necesitas ayuda? Nuestro equipo está aquí para ti.{' '}
                              <a href="mailto:support@nora.ai" className="text-blue-400 hover:text-blue-300 transition-colors duration-300 underline decoration-blue-400/30 hover:decoration-blue-300 break-all">
                                support@nora.ai
                              </a>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Lastica:wght@300;400;500;600;700&display=swap');
        
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-8px) rotate(1deg); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-12px) rotate(-1deg); } }
        @keyframes float-slow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        @keyframes ripple { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(4); opacity: 0; } }
        @keyframes slide-in { 0% { opacity: 0; transform: translateX(-10px); } 100% { opacity: 1; transform: translateX(0); } }
        @keyframes card-in { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes tab-content { 0% { opacity: 0; transform: translateX(30px); } 100% { opacity: 1; transform: translateX(0); } }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-ripple { animation: ripple 0.6s ease-out; }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-card-in { animation: card-in 0.8s ease-out forwards; opacity: 0; }
        .animate-tab-content { animation: tab-content 0.6s ease-out; }

        .floating-settings-container { background: linear-gradient(145deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1); position: relative; overflow: hidden; }
        .floating-button { background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02)); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); transition: all 0.3s ease; }
        .floating-button:hover { background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05)); border-color: rgba(255, 255, 255, 0.15); transform: scale(1.05); }
        .floating-tab { background: linear-gradient(145deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01)); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.05); transition: all 0.4s ease; }
        .floating-tab-hover { background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04)); border-color: rgba(255, 255, 255, 0.12); transform: translateY(-2px); }
        .floating-tab-active { background: linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08)); border: 2px solid rgba(255, 255, 255, 0.25); box-shadow: 0 8px 32px rgba(255, 255, 255, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2); transform: scale(1.05); }
        .floating-tab-hover-danger:hover { background: linear-gradient(145deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05)); border-color: rgba(239, 68, 68, 0.2); }
        .floating-card { background: linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03)); backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1); transition: all 0.3s ease; }
        .floating-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.12); }
        .floating-avatar { background: linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06)); backdrop-filter: blur(25px); border: 2px solid rgba(255, 255, 255, 0.15); border-radius: 16px; box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1), 0 4px 16px rgba(0, 0, 0, 0.1); display: flex; align-items: center; justify-content: center; transition: all 0.4s ease; }
        .floating-avatar:hover { transform: scale(1.05); box-shadow: 0 12px 40px rgba(255, 255, 255, 0.15), 0 6px 20px rgba(0, 0, 0, 0.15); }
        .floating-icon-container { background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04)); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); transition: all 0.3s ease; }
        .floating-icon-container:hover { transform: scale(1.1); background: linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06)); }
        .floating-info-card { background: linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02)); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); transition: all 0.3s ease; }
        .floating-info-card:hover { background: linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03)); transform: translateY(-1px); }
        .floating-action-button { background: linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03)); backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1); }
        .floating-action-button:hover { background: linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06)); border-color: rgba(255, 255, 255, 0.15); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15); }
        .floating-premium-button { background: linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08)); backdrop-filter: blur(30px); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 16px; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1), 0 4px 16px rgba(0, 0, 0, 0.1); }
        .floating-premium-button:hover { background: linear-gradient(145deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.12)); border-color: rgba(255, 255, 255, 0.3); transform: translateY(-4px) scale(1.02); box-shadow: 0 16px 48px rgba(255, 255, 255, 0.2), 0 8px 24px rgba(0, 0, 0, 0.15); }
        .floating-badge-free { background: linear-gradient(145deg, rgba(107, 114, 128, 0.25), rgba(107, 114, 128, 0.15)); color: #d1d5db; border: 1px solid rgba(107, 114, 128, 0.3); backdrop-filter: blur(20px); }
        .floating-badge-premium { background: linear-gradient(145deg, rgba(251, 191, 36, 0.25), rgba(251, 191, 36, 0.15)); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); backdrop-filter: blur(20px); }
        .floating-benefit-card { background: linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02)); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; transition: all 0.3s ease; }
        .floating-benefit-card:hover { background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04)); border-color: rgba(255, 255, 255, 0.12); transform: translateX(4px); }
        .custom-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; transition: scrollbar-color 0.3s ease; }
        .custom-scroll:hover { scrollbar-color: rgba(255, 255, 255, 0.15) transparent; }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 3px; transition: background 0.3s ease; }
        .custom-scroll:hover::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.25); }
        * { font-family: 'Lastica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .liquid-tab-button { position: relative; overflow: hidden; }
        .liquid-tab-button::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); transition: left 0.5s; }
        .liquid-tab-button:hover::before { left: 100%; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .break-words { overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; }
        .break-all { word-break: break-all; }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }
        @media (max-width: 640px) { .container { padding-left: 1rem; padding-right: 1rem; } .floating-settings-container { border-radius: 16px; margin: 0.5rem; } }
      `}</style>
    </>
  );
}