// components/LoadingScreen.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  message?: string;
}

const loadingTips = [
  "🤖 ¿Sabías que puedo ayudarte con análisis de código en más de 20 lenguajes?",
  "✨ Tip: Usa comandos específicos como 'explícame como si tuviera 5 años' para respuestas más simples",
  "🎯 Nora aprende de cada conversación para brindarte mejores respuestas",
  "💡 Puedo generar imágenes, analizar documentos y hasta crear presentaciones",
  "🚀 Mi IA combina GPT-4o y Gemini para darte la mejor experiencia",
  "📊 Tip: Pregúntame sobre análisis de datos y te ayudo a crear visualizaciones",
  "🎨 ¿Necesitas ideas creativas? Soy experta en brainstorming y soluciones innovadoras",
  "🔍 Puedo buscar información actualizada en internet para darte datos precisos",
  "💬 Tip: Sé específico en tus preguntas para obtener respuestas más precisas",
  "🌟 Cada conversación conmigo es única y adaptada a tu estilo de comunicación",
  "📝 Puedo ayudarte desde escribir emails hasta crear estrategias de negocio",
  "🎓 ¿Estudiando? Te ayudo con resúmenes, explicaciones y resolución de problemas",
  "🛠️ Tip: Menciona el contexto de tu pregunta para respuestas más relevantes",
  "🎪 Soy más que un chatbot: soy tu asistente personal de IA más inteligente",
  "⚡ Mi procesamiento cuántico me permite entender context complejos al instante"
];

export default function LoadingScreen({ message = 'Cargando...' }: LoadingScreenProps) {
  const [currentTip, setCurrentTip] = useState(loadingTips[0]);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    // Cambiar tip cada 3 segundos
    const interval = setInterval(() => {
      setTipIndex((prev) => {
        const next = (prev + 1) % loadingTips.length;
        setCurrentTip(loadingTips[next]);
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Efecto de partículas de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      
      {/* Círculos animados de fondo */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="text-center relative z-10 max-w-md mx-auto px-6">
        {/* GIF de Loading */}
        <div className="mb-8 flex justify-center">
          <div className="relative select-none pointer-events-none">
            <Image 
              src="/images/noraloading.gif" 
              alt="Nora Loading" 
              width={120}
              height={120}
              className="select-none pointer-events-none"
              unoptimized={true}
              priority
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              style={{ 
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                WebkitTouchCallout: 'none'
              } as React.CSSProperties}
            />
            
            {/* Efecto de glow alrededor del gif */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse" />
          </div>
        </div>

        {/* Título */}
        <h2 className="text-3xl font-bold text-white mb-4 font-lastica animate-fade-up">
          NORA
        </h2>

        {/* Mensaje de estado */}
        <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="inline-flex items-center space-x-3 text-gray-300">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-lg font-light">{message}</span>
          </div>
        </div>

        {/* Tips dinámicos */}
        <div className="animate-fade-up" style={{ animationDelay: '0.6s' }}>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 min-h-[80px] flex items-center justify-center">
            <p className="text-white/80 text-sm font-light leading-relaxed text-center transition-all duration-500 ease-in-out">
              {currentTip}
            </p>
          </div>
        </div>

        {/* Indicador de progreso */}
        <div className="mt-6 animate-fade-up" style={{ animationDelay: '0.9s' }}>
          <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse" 
                 style={{ 
                   width: '100%',
                   animation: 'loading-progress 2s ease-in-out infinite'
                 }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes loading-progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-fade-up { 
          animation: fade-up 0.8s ease-out forwards; 
          opacity: 0; 
        }
      `}</style>
    </div>
  );
}