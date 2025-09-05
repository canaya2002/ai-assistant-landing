'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Zap, MessageCircle } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

// Componente que usa useSearchParams envuelto en Suspense
function SuccessContent() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(true);
  const { refreshProfile, userProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const session_id = searchParams.get('session_id');
    if (session_id) {
      setSessionId(session_id);
    }

    // Refresh profile to get updated plan
    const updateProfile = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait a bit for Stripe webhook
        await refreshProfile();
      } catch (error) {
        console.error('Error refreshing profile:', error);
      } finally {
        setIsUpdating(false);
      }
    };

    updateProfile();
  }, [searchParams, refreshProfile]);

  if (isUpdating) {
    return <LoadingScreen message="Activando tu suscripción..." />;
  }

  const handleContinue = () => {
    router.push('/chat');
  };

  const handleViewPlans = () => {
    router.push('/upgrade');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-green-400" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4 font-lastica">
          ¡Pago Exitoso!
        </h1>
        
        <p className="text-xl text-gray-400 mb-8">
          Tu suscripción a NORA {userProfile?.user?.plan?.replace('_', ' ').toUpperCase()} ha sido activada correctamente. 
          Ya puedes acceder a todas las funciones premium.
        </p>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-nora-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-nora-primary" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Chat con IA</h3>
            <p className="text-gray-400 text-sm">
              Conversa con NORA sobre cualquier tema con respuestas inteligentes
            </p>
          </div>
          
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="w-12 h-12 bg-nora-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-nora-primary" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Funciones Premium</h3>
            <p className="text-gray-400 text-sm">
              Acceso completo a análisis de voz, multimedia, código y más
            </p>
          </div>
        </div>
        
        {sessionId && (
          <div className="bg-white/5 rounded-xl p-4 mb-8">
            <p className="text-xs text-gray-500">
              ID de sesión: {sessionId}
            </p>
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
        
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-gray-500 text-sm">
            Recibirás un email de confirmación en breve. Si tienes alguna pregunta,{' '}
            <a href="mailto:support@nora.com" className="text-nora-primary hover:underline">
              contacta nuestro soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Loading fallback para Suspense
function SuccessLoading() {
  return <LoadingScreen message="Cargando..." />;
}

// Página principal con Suspense
export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent />
    </Suspense>
  );
}