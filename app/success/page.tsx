'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Zap, MessageCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import toast from 'react-hot-toast';

// ========================================
// 🔒 TIPOS PARA VALIDACIÓN DE PAGO
// ========================================
interface PaymentValidationResult {
  success: boolean;
  session?: {
    id: string;
    payment_status: string;
    customer_email: string;
    subscription_id?: string;
    plan?: string;
  };
  error?: string;
  errorCode?: string;
}

interface StripeSession {
  id: string;
  object: 'checkout.session';
  payment_status: 'paid' | 'unpaid';
  status: 'complete' | 'open' | 'expired';
  customer_email: string;
  subscription?: string;
  metadata?: {
    plan?: string;
    userId?: string;
  };
  created: number;
  expires_at: number;
}

// ========================================
// 🔒 COMPONENTE DE VALIDACIÓN DE ÉXITO SEGURO
// ========================================
function SuccessContent() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [validationResult, setValidationResult] = useState<PaymentValidationResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { refreshProfile, userProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const session_id = searchParams.get('session_id');
    if (session_id) {
      setSessionId(session_id);
      validatePayment(session_id);
    } else {
      // No hay session_id - error
      setValidationResult({
        success: false,
        error: 'ID de sesión no encontrado',
        errorCode: 'MISSING_SESSION_ID'
      });
      setIsValidating(false);
    }
  }, [searchParams]);

  // ========================================
  // 🔒 FUNCIÓN DE VALIDACIÓN REAL DE PAGO
  // ========================================
  const validatePayment = async (sessionId: string, isRetry = false) => {
    try {
      setIsValidating(true);
      
      // ✅ PASO 1: VERIFICAR SESIÓN CON STRIPE
      console.log('🔍 Validando sesión de pago:', sessionId);
      
      const validationResponse = await fetch('/api/validate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          session_id: sessionId,
          timestamp: Date.now()
        })
      });

      if (!validationResponse.ok) {
        const errorData = await validationResponse.json();
        throw new Error(errorData.error || `HTTP ${validationResponse.status}`);
      }

      const validationData: PaymentValidationResult = await validationResponse.json();

      if (!validationData.success) {
        throw new Error(validationData.error || 'Validación de pago falló');
      }

      // ✅ PASO 2: VERIFICAR QUE EL PAGO FUE COMPLETADO
      if (validationData.session?.payment_status !== 'paid') {
        throw new Error(`Pago no completado. Estado: ${validationData.session?.payment_status}`);
      }

      console.log('✅ Pago validado exitosamente');
      setValidationResult(validationData);

      // ✅ PASO 3: ESPERAR A QUE EL WEBHOOK PROCESE LA SUSCRIPCIÓN
      if (!isRetry) {
        await waitForSubscriptionUpdate();
      }

    } catch (error: any) {
      console.error('❌ Error validando pago:', error);
      
      // ✅ MANEJO DE ERRORES ESPECÍFICOS
      let errorCode = 'UNKNOWN_ERROR';
      let errorMessage = error.message;

      if (error.message.includes('not found')) {
        errorCode = 'SESSION_NOT_FOUND';
        errorMessage = 'Sesión de pago no encontrada. Puede estar expirada.';
      } else if (error.message.includes('expired')) {
        errorCode = 'SESSION_EXPIRED';
        errorMessage = 'Sesión de pago expirada. Intenta el proceso de pago nuevamente.';
      } else if (error.message.includes('unpaid')) {
        errorCode = 'PAYMENT_INCOMPLETE';
        errorMessage = 'El pago no se completó correctamente.';
      }

      setValidationResult({
        success: false,
        error: errorMessage,
        errorCode
      });
    } finally {
      setIsValidating(false);
    }
  };

  // ========================================
  // 🔄 ESPERAR ACTUALIZACIÓN DE SUSCRIPCIÓN
  // ========================================
  const waitForSubscriptionUpdate = async () => {
    const maxRetries = 10; // 30 segundos máximo
    const retryDelay = 3000; // 3 segundos entre intentos

    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`🔄 Verificando actualización de suscripción (${i + 1}/${maxRetries})...`);
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        await refreshProfile();

        // Verificar si el plan se actualizó
        if (userProfile?.user?.plan && userProfile.user.plan !== 'free') {
          console.log('✅ Plan actualizado exitosamente:', userProfile.user.plan);
          return;
        }

      } catch (error) {
        console.warn(`⚠️ Error en intento ${i + 1}:`, error);
      }
    }

    console.warn('⚠️ El plan no se actualizó automáticamente, puede tomar unos minutos más');
  };

  // ========================================
  // 🔄 FUNCIÓN DE REINTENTO
  // ========================================
  const handleRetry = () => {
    if (sessionId && retryCount < 3) {
      setRetryCount(prev => prev + 1);
      validatePayment(sessionId, true);
      toast.loading('Reintentando validación...');
    }
  };

  // ========================================
  // 🔄 FUNCIÓN DE REFRESH MANUAL
  // ========================================
  const handleRefreshProfile = async () => {
    try {
      toast.loading('Actualizando perfil...');
      await refreshProfile();
      toast.dismiss();
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.dismiss();
      toast.error('Error actualizando perfil');
    }
  };

  // ========================================
  // 📱 NAVEGACIÓN
  // ========================================
  const handleContinue = () => {
    router.push('/chat');
  };

  const handleViewPlans = () => {
    router.push('/upgrade');
  };

  const handleContactSupport = () => {
    window.open('mailto:support@nora.com?subject=Problema con pago&body=ID de sesión: ' + sessionId, '_blank');
  };

  // ========================================
  // 🎨 RENDERIZADO CONDICIONAL
  // ========================================

  // Estado de carga/validación
  if (isValidating) {
    return (
      <LoadingScreen 
        message={
          retryCount > 0 
            ? `Reintentando validación... (${retryCount}/3)`
            : "Validando tu pago de forma segura..."
        } 
      />
    );
  }

  // Error en validación
  if (!validationResult?.success) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Error en Validación
          </h1>
          
          <p className="text-xl text-gray-400 mb-6">
            {validationResult?.error || 'Hubo un problema validando tu pago'}
          </p>

          {validationResult?.errorCode && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-400">
                Código de error: {validationResult.errorCode}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {retryCount < 3 && sessionId && (
              <button
                onClick={handleRetry}
                disabled={isValidating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Reintentar Validación</span>
              </button>
            )}
            
            <button
              onClick={handleContactSupport}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-4 px-8 rounded-xl font-medium transition-colors"
            >
              Contactar Soporte
            </button>
            
            <button
              onClick={() => router.push('/upgrade')}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-xl font-medium transition-colors"
            >
              Volver a Planes
            </button>
          </div>

          {sessionId && (
            <div className="mt-8 p-4 bg-white/5 rounded-xl">
              <p className="text-xs text-gray-500">
                ID de sesión: {sessionId}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ✅ ÉXITO - PAGO VALIDADO
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-green-400" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4 font-lastica">
          ¡Pago Verificado!
        </h1>
        
        <p className="text-xl text-gray-400 mb-8">
          Tu suscripción a NORA {userProfile?.user?.plan?.replace('_', ' ').toUpperCase()} ha sido 
          <span className="text-green-400 font-semibold"> validada y activada</span> correctamente.
        </p>

        {/* Información de validación */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">Pago verificado con Stripe</span>
          </div>
          {validationResult.session && (
            <p className="text-sm text-green-300">
              Estado: {validationResult.session.payment_status} • 
              Plan: {validationResult.session.plan || userProfile?.user?.plan}
            </p>
          )}
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-nora-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-nora-primary" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Chat Avanzado</h3>
            <p className="text-gray-400 text-sm">
              Conversa con NORA con capacidades premium y respuestas más inteligentes
            </p>
          </div>
          
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-nora-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-nora-primary" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Funciones Premium</h3>
            <p className="text-gray-400 text-sm">
              {userProfile?.user?.plan === 'pro_max' 
                ? 'Generación de imágenes y videos, modos especializados'
                : 'Generación de imágenes, análisis avanzado y más'
              }
            </p>
          </div>
        </div>

        {/* Si el plan no se actualizó aún */}
        {userProfile?.user?.plan === 'free' && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <p className="text-yellow-400 text-sm mb-2">
              Tu plan se está actualizando. Si no ves los cambios en unos minutos:
            </p>
            <button
              onClick={handleRefreshProfile}
              className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Actualizar Perfil
            </button>
          </div>
        )}
        
        <div className="space-y-4">
          <button
            onClick={handleContinue}
            className="w-full bg-nora-primary hover:bg-nora-primary/80 text-white py-4 px-8 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Empezar a usar NORA</span>
          </button>
          
          <button
            onClick={handleViewPlans}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-xl font-medium transition-colors"
          >
            Ver detalles del plan
          </button>
        </div>
        
        {/* Información de la sesión */}
        {sessionId && (
          <div className="mt-8 p-4 bg-white/5 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">
              ID de sesión verificada: {sessionId}
            </p>
            {validationResult.session?.customer_email && (
              <p className="text-xs text-gray-500">
                Email: {validationResult.session.customer_email}
              </p>
            )}
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-gray-500 text-sm">
            Recibirás un email de confirmación en breve. Si tienes alguna pregunta,{' '}
            <button 
              onClick={handleContactSupport}
              className="text-nora-primary hover:underline"
            >
              contacta nuestro soporte
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ========================================
// 💻 COMPONENTE DE CARGA PARA SUSPENSE
// ========================================
function SuccessLoading() {
  return <LoadingScreen message="Cargando información del pago..." />;
}

// ========================================
// 📱 PÁGINA PRINCIPAL CON SUSPENSE
// ========================================
export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent />
    </Suspense>
  );
}

// ========================================
// 📋 NOTAS DE IMPLEMENTACIÓN
// ========================================

/*
PARA COMPLETAR LA IMPLEMENTACIÓN, NECESITAS CREAR:

1. Endpoint API para validación: app/api/validate-payment/route.ts

export async function POST(request: NextRequest) {
  try {
    const { session_id } = await request.json();
    
    // Verificar con Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        success: false,
        error: 'Pago no completado'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        customer_email: session.customer_email,
        subscription_id: session.subscription,
        plan: session.metadata?.plan
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

CARACTERÍSTICAS DE SEGURIDAD IMPLEMENTADAS:

✅ Validación real con Stripe API antes de mostrar éxito
✅ Verificación de estado de pago (paid vs unpaid)  
✅ Manejo de errores específicos (expired, not found, etc.)
✅ Sistema de reintentos para casos de timing
✅ Espera activa para webhook processing
✅ Logging detallado para debugging
✅ Información de sesión visible para soporte
✅ Enlaces directos para contactar soporte
✅ Refresh manual de perfil si hay delays

FLUJO DE VALIDACIÓN:

1. Usuario llega con session_id en URL
2. Validar session_id con Stripe API  
3. Verificar que payment_status === 'paid'
4. Esperar a que webhook actualice el plan en Firestore
5. Mostrar éxito solo después de validación completa
6. Proporcionar opciones de reintento si algo falla

*/