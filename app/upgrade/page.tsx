'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { cloudFunctions } from '../lib/firebase';
import { 
  Crown, CheckCircle, X, Loader2, Star, 
  MessageCircle, Camera, Mic, Image, Code, 
  FileText, Zap, TrendingUp, ArrowLeft 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { LucideIcon } from 'lucide-react';

interface Plan {
  name: string;
  price: { monthly: number; yearly: number };
  description: string;
  features: string[];
  limitations: string[];
  color: string;
  icon: LucideIcon;
  popular: boolean;
  priceId?: { monthly: string; yearly: string };
}

interface CheckoutResponse {
  url: string;
}

export default function UpgradePage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const { userProfile } = useAuth();
  const router = useRouter();

  const plans: Record<string, Plan> = {
    free: {
      name: 'Gratis',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfecto para probar NORA',
      features: [
        '6,600 tokens diarios',
        '2 análisis diarios',
        'Gemini 1.5 Flash',
        'Análisis básico de pantalla',
        'Soporte básico'
      ],
      limitations: [
        'Sin chat con IA',
        'Sin análisis de voz',
        'Sin análisis multimedia',
        'Sin asistente de código'
      ],
      color: '#6B7280',
      icon: Camera,
      popular: false
    },
    pro: {
      name: 'Pro',
      price: { monthly: 15, yearly: 150 },
      description: 'Para usuarios profesionales',
      features: [
        '333,000 tokens diarios',
        '50 análisis diarios',
        'Chat con IA habilitado',
        'Análisis de voz completo',
        'Análisis multimedia',
        'Asistente de código',
        'Análisis de PDFs',
        'Gemini 1.5 Flash Pro',
        'Modo live 10 horas',
        'Soporte prioritario'
      ],
      limitations: [],
      color: '#737373',
      icon: CheckCircle,
      popular: true,
      priceId: {
        monthly: 'price_1S08CYPa2fV72c7wm3DC8M3y',
        yearly: 'price_1S08CYPa2fV72c7wm3DC8M3y_yearly'
      }
    },
    pro_max: {
      name: 'Pro Max',
      price: { monthly: 75, yearly: 750 },
      description: 'Para equipos y empresas',
      features: [
        '466,000 tokens diarios',
        'Análisis ilimitados',
        'Chat avanzado con IA experta',
        'Todas las funciones de voz premium',
        'Análisis multimedia profesional',
        'Asistente de código experto',
        'Análisis de PDFs avanzado',
        'Gemini 1.5 Pro Max',
        'Modo live ilimitado',
        'API personalizada',
        'Exportar historial completo',
        'Soporte premium 24/7'
      ],
      limitations: [],
      color: '#F59E0B',
      icon: Crown,
      popular: false,
      priceId: {
        monthly: 'price_1S12wKPa2fV72c7wX2NRAwQF',
        yearly: 'price_1S12wKPa2fV72c7wX2NRAwQF_yearly'
      }
    }
  };

  const currentPlan = userProfile?.user?.plan || 'free';

  const handleUpgrade = async (planId: keyof typeof plans) => {
    const plan = plans[planId];
    if (!plan.priceId) {
      toast.error('Plan no disponible');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await cloudFunctions.createStripeCheckout({
        plan: planId,
        priceId: plan.priceId[billingCycle]
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
    }
  };

  const isCurrentPlan = (planId: string) => currentPlan === planId;
  const canUpgrade = (planId: string) => {
    if (planId === 'free') return false;
    if (currentPlan === 'free') return true;
    if (currentPlan === 'pro' && planId === 'pro_max') return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold font-lastica">Actualizar Plan</h1>
              <p className="text-gray-400">Elige el plan perfecto para ti</p>
            </div>
          </div>
          
          {userProfile && (
            <div className="text-right">
              <div className="text-sm text-gray-400">Plan actual</div>
              <div className="text-lg font-medium capitalize">
                {currentPlan.replace('_', ' ')}
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4 font-lastica">
            Desbloquea todo el potencial de NORA
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades y empieza a usar 
            todas las funciones avanzadas de inteligencia artificial.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-white/10 rounded-full p-1 flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly' 
                  ? 'bg-nora-primary text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-8 py-3 rounded-full text-sm font-medium transition-all relative ${
                billingCycle === 'yearly' 
                  ? 'bg-nora-primary text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Anual
              <span className="absolute -top-2 -right-2 bg-green-500 text-xs px-2 py-1 rounded-full text-white">
                Ahorra 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {Object.entries(plans).map(([planId, plan]) => {
            const PlanIcon = plan.icon;
            const isCurrent = isCurrentPlan(planId);
            const canUpgradeToPlan = canUpgrade(planId);

            return (
              <div
                key={planId}
                className={`relative bg-white/5 rounded-3xl p-8 border transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-nora-primary bg-nora-primary/10 ring-2 ring-nora-primary/30' 
                    : 'border-white/10 hover:border-white/20'
                } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-nora-primary text-white px-6 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span>Más Popular</span>
                    </div>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrent && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Plan Actual
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
                       style={{ backgroundColor: `${plan.color}20` }}>
                    <PlanIcon className="w-10 h-10" style={{ color: plan.color }} />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3 font-lastica">{plan.name}</h3>
                  <p className="text-gray-400 mb-6">{plan.description}</p>
                  
                  <div className="text-center">
                    <div className="text-5xl font-bold text-white mb-2">
                      ${plan.price[billingCycle]}
                      {planId !== 'free' && (
                        <span className="text-xl text-gray-400 font-normal">
                          /{billingCycle === 'monthly' ? 'mes' : 'año'}
                        </span>
                      )}
                    </div>
                    {billingCycle === 'yearly' && planId !== 'free' && (
                      <div className="text-sm text-gray-400">
                        ${(plan.price.yearly / 12).toFixed(0)}/mes facturado anualmente
                      </div>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center space-x-3 opacity-60">
                      <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <span className="text-gray-400 line-through">{limitation}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleUpgrade(planId as keyof typeof plans)}
                  disabled={isLoading || isCurrent || !canUpgradeToPlan}
                  className={`w-full py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isCurrent
                      ? 'bg-green-500/20 text-green-400 cursor-default'
                      : canUpgradeToPlan && planId !== 'free'
                        ? `hover:scale-105 text-white ${
                            plan.popular 
                              ? 'bg-nora-primary hover:bg-nora-primary/80' 
                              : 'bg-white/10 hover:bg-white/20'
                          }`
                        : 'bg-white/5 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isCurrent ? (
                    'Plan Actual'
                  ) : canUpgradeToPlan && planId !== 'free' ? (
                    `Actualizar a ${plan.name}`
                  ) : planId === 'free' ? (
                    'Plan Gratuito'
                  ) : (
                    'No Disponible'
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <h3 className="text-3xl font-bold text-white mb-8 text-center font-lastica">
            Comparación Detallada de Características
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MessageCircle, name: 'Chat con IA', free: false, pro: true, pro_max: true },
              { icon: Camera, name: 'Análisis de Pantalla', free: true, pro: true, pro_max: true },
              { icon: Mic, name: 'Análisis de Voz', free: false, pro: true, pro_max: true },
              { icon: Image, name: 'Análisis Multimedia', free: false, pro: true, pro_max: true },
              { icon: Code, name: 'Asistente de Código', free: false, pro: true, pro_max: true },
              { icon: FileText, name: 'Análisis de PDFs', free: false, pro: true, pro_max: true },
              { icon: Zap, name: 'Modo Live', free: false, pro: true, pro_max: true },
              { icon: TrendingUp, name: 'Análisis Ilimitados', free: false, pro: false, pro_max: true }
            ].map((feature, index) => (
              <div key={index} className="bg-white/5 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <feature.icon className="w-6 h-6 text-nora-primary" />
                  <span className="text-white font-medium">{feature.name}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Free</span>
                    {feature.free ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <X className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Pro</span>
                    {feature.pro ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <X className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Pro Max</span>
                    {feature.pro_max ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <X className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <h3 className="text-3xl font-bold text-white mb-8 text-center font-lastica">
            Preguntas Frecuentes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-2">¿Puedo cancelar en cualquier momento?</h4>
                <p className="text-gray-400">Sí, puedes cancelar tu suscripción en cualquier momento sin penalizaciones.</p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-2">¿Los datos se sincronzan entre dispositivos?</h4>
                <p className="text-gray-400">Sí, tu cuenta y conversaciones se sincronizan automáticamente entre web y desktop.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-2">¿Hay límites en el plan Pro Max?</h4>
                <p className="text-gray-400">No, el plan Pro Max incluye tokens y análisis ilimitados.</p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-2">¿Puedo cambiar de plan después?</h4>
                <p className="text-gray-400">Sí, puedes actualizar o degradar tu plan cuando gustes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-400">
            ¿Necesitas ayuda? {' '}
            <a href="mailto:support@nora.com" className="text-nora-primary hover:underline">
              Contacta nuestro soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}