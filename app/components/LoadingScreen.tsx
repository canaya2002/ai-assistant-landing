// app/components/LoadingScreen.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = 'Cargando NORA...' }: LoadingScreenProps) => {
  const [currentTip, setCurrentTip] = useState('');

  const tips = [
    "NORA aprende de cada conversación para ofrecerte respuestas más precisas",
    "Puedes subir imágenes para que NORA las analice en detalle",
    "Usa el modo Deep Search para búsquedas más profundas y detalladas",
    "NORA puede generar imágenes y videos personalizados para ti",
    "Todas tus conversaciones están protegidas con cifrado end-to-end"
  ];

  useEffect(() => {
    setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
    
    const interval = setInterval(() => {
      setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="text-center px-4 max-w-lg">
        {/* Logo con efecto sutil */}
        <div className="mb-8 flex justify-center">
          <div className="relative select-none pointer-events-none">
            <Image 
              src="/images/noraloading.gif" 
              alt="Nora Loading" 
              width={220}
              height={220}
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
          </div>
        </div>

        {/* Mensaje de estado */}
        <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="inline-flex items-center space-x-3 text-gray-300">
            {/* ✅ SPINNER CIRCULAR GRIS SIMPLE */}
            <div className="w-5 h-5 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
            <span className="text-lg font-light">{message}</span>
          </div>
        </div>

        {/* ✅ Tips SIN FONDO, solo texto en gris */}
        <div className="animate-fade-up" style={{ animationDelay: '0.6s' }}>
          <p className="text-gray-400 text-sm font-light leading-relaxed text-center transition-all duration-500 ease-in-out px-6">
            {currentTip}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-up { 
          animation: fade-up 0.8s ease-out forwards; 
          opacity: 0; 
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;