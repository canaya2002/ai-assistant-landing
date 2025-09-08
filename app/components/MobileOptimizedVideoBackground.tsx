// components/MobileOptimizedVideoBackground.tsx - NUEVO COMPONENTE OPTIMIZADO
'use client';

import { useState, useEffect, memo } from 'react';
import Image from 'next/image';

interface MobileOptimizedVideoBackgroundProps {
  className?: string;
}

const MobileOptimizedVideoBackground = memo(function MobileOptimizedVideoBackground({ 
  className = "absolute inset-0 z-0 overflow-hidden" 
}: MobileOptimizedVideoBackgroundProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Detectar dispositivos móviles
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      return mobileKeywords.some(keyword => userAgent.includes(keyword)) || 
             window.innerWidth <= 768 ||
             'ontouchstart' in window ||
             navigator.maxTouchPoints > 0;
    };

    // Detectar dispositivos de bajo rendimiento
    const checkLowPerformance = () => {
      // Detectar conexión lenta
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const slowConnection = connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g');
      
      // Detectar hardware limitado
      const hardwareConcurrency = navigator.hardwareConcurrency || 0;
      const limitedHardware = hardwareConcurrency <= 2;
      
      // Detectar memoria limitada (experimental)
      const deviceMemory = (navigator as any).deviceMemory || 0;
      const limitedMemory = deviceMemory <= 2;

      return slowConnection || limitedHardware || limitedMemory;
    };

    // Detectar preferencia de usuario para reducir movimiento
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setIsMobile(checkMobile());
    setIsLowPerformance(checkLowPerformance() || prefersReducedMotion);

    // Listener para cambios de orientación/tamaño
    const handleResize = () => {
      setIsMobile(checkMobile());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Si es móvil o dispositivo de bajo rendimiento, mostrar imagen estática
  if (isMobile || isLowPerformance) {
    return (
      <div className={className}>
        <Image
          src="/images/fondo-static.jpg" // Imagen estática optimizada
          alt="Background"
          fill
          className="object-cover object-center"
          priority
          quality={85}
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
        {/* Overlays para imagen estática */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />
        
        {/* Indicador visual de optimización móvil */}
        <div className="absolute bottom-4 right-4 z-30 opacity-50">
          <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
            📱 Optimizado
          </div>
        </div>
      </div>
    );
  }

  // Para desktop, mostrar video con carga lazy
  return (
    <div className={className}>
      {/* Placeholder mientras carga el video */}
      {!videoLoaded && (
        <Image
          src="/images/fondo-static.jpg"
          alt="Background loading"
          fill
          className="object-cover object-center"
          priority
          quality={75}
          sizes="100vw"
        />
      )}
      
      {/* Video para desktop */}
      <video 
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          videoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ objectPosition: 'center 30%' }}
        autoPlay 
        muted 
        loop 
        playsInline
        preload="metadata"
        onLoadedData={() => setVideoLoaded(true)}
        onError={() => {
          console.warn('Video failed to load, falling back to image');
          setIsMobile(true); // Fallback a imagen si el video falla
        }}
      >
        <source src="/images/fondo.mp4" type="video/mp4" />
        <source src="/images/fondo.webm" type="video/webm" />
        
        {/* Fallback para navegadores sin soporte de video */}
        <Image
          src="/images/fondo-static.jpg"
          alt="Video fallback"
          fill
          className="object-cover object-center"
          quality={85}
          sizes="100vw"
        />
      </video>
      
      {/* Overlays para video */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />
    </div>
  );
});

export default MobileOptimizedVideoBackground;