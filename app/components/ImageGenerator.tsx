'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { cloudFunctions, helpers } from '../lib/firebase';
import { 
  Camera, Loader2, Download, Share2, Trash2, X,
  Settings, Palette, Sparkles, Crown, AlertTriangle,
  Zap, ImageIcon, Grid3X3, Ratio, Copy, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import type { 
  ImageUsageStatus, 
  GeneratedImage, 
  PlanType, 
  ImageStyle, 
  AspectRatioOption 
} from '../lib/types';

const STYLES: ImageStyle[] = [
  { value: 'realistic', label: 'Realista', icon: Camera },
  { value: 'artistic', label: 'Artístico', icon: Palette },
  { value: 'digital_art', label: 'Arte Digital', icon: Sparkles },
  { value: 'illustration', label: 'Ilustración', icon: ImageIcon },
  { value: 'photography', label: 'Fotografía', icon: Camera },
  { value: 'painting', label: 'Pintura', icon: Palette },
  { value: 'sketch', label: 'Boceto', icon: Grid3X3 },
  { value: 'cartoon', label: 'Caricatura', icon: Sparkles }
];

const ASPECT_RATIOS: AspectRatioOption[] = [
  { value: '1:1', label: 'Cuadrado (1:1)', free: true },
  { value: '16:9', label: 'Panorámico (16:9)', free: false },
  { value: '9:16', label: 'Vertical (9:16)', free: false },
  { value: '4:3', label: 'Estándar (4:3)', free: false },
  { value: '3:4', label: 'Retrato (3:4)', free: false },
  { value: '21:9', label: 'Ultra ancho (21:9)', free: false },
  { value: '1:2', label: 'Vertical largo (1:2)', free: false },
  { value: '2:1', label: 'Horizontal largo (2:1)', free: false }
];

interface ImageGeneratorProps {
  isEmbedded?: boolean;
  onImageGenerated?: (image: { imageUrl: string; prompt: string }) => void;
  onClose?: () => void;
  className?: string;
}

export default function ImageGenerator({ 
  isEmbedded = false, 
  onImageGenerated, 
  onClose,
  className = ''
}: ImageGeneratorProps) {
  const { userProfile, plan } = useAuth();
  
  // Estados principales
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [usageStatus, setUsageStatus] = useState<ImageUsageStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isPremium = plan !== 'free';

  // Cargar estado inicial
  useEffect(() => {
    loadUsageStatus();
  }, []);

  const loadUsageStatus = async () => {
    try {
      setIsLoading(true);
      const result = await cloudFunctions.getImageUsageStatus();
      
      // ✅ CONVERSIÓN CORRECTA DE TIPOS
      const convertedStatus: ImageUsageStatus = {
        plan: result.data.plan,
        limits: {
          daily: result.data.limits.dailyLimit,
          monthly: result.data.limits.monthlyLimit,
          remainingDaily: result.data.limits.remainingDaily,
          remainingMonthly: result.data.limits.remainingMonthly,
        },
        features: result.data.features,
        history: result.data.history
      };
      
      setUsageStatus(convertedStatus);
    } catch (error) {
      console.error('Error cargando estado de imágenes:', error);
      toast.error('Error cargando información de imágenes');
    } finally {
      setIsLoading(false);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Por favor, describe la imagen que quieres generar');
      return;
    }

    if (!usageStatus) {
      toast.error('Cargando información de límites...');
      return;
    }

    if (usageStatus.limits.remainingDaily <= 0) {
      toast.error('Has alcanzado tu límite diario de imágenes');
      return;
    }

    setIsGenerating(true);

    try {
      const result = await cloudFunctions.generateImage({
        prompt: prompt.trim(),
        style: selectedStyle,
        aspectRatio: selectedAspectRatio
      });

      if (result.data?.success && result.data.imageUrl) {
        setGeneratedImage(result.data.imageUrl);
        
        // Callback para componentes padre
        if (onImageGenerated) {
          onImageGenerated({
            imageUrl: result.data.imageUrl,
            prompt: prompt
          });
        }

        // Actualizar límites
        await loadUsageStatus();
        
        toast.success('¡Imagen generada exitosamente!');
      }
    } catch (error: any) {
      console.error('Error generando imagen:', error);
      toast.error(error.message || 'Error generando imagen');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `nora-imagen-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Imagen descargada');
    } catch (error) {
      console.error('Error descargando imagen:', error);
      toast.error('Error al descargar la imagen');
    }
  };

  const shareImage = async () => {
    if (!generatedImage) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Imagen generada con NORA',
          text: prompt,
          url: generatedImage
        });
      } else {
        await navigator.clipboard.writeText(generatedImage);
        toast.success('URL copiada al portapapeles');
      }
    } catch (error) {
      console.error('Error compartiendo imagen:', error);
      toast.error('Error al compartir la imagen');
    }
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success('Prompt copiado al portapapeles');
    } catch (error) {
      toast.error('Error al copiar el prompt');
    }
  };

  if (isLoading) {
    return (
      <div className="floating-settings-container p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-white font-light">Cargando generador de imágenes...</p>
        </div>
      </div>
    );
  }

  if (!usageStatus) {
    return (
      <div className="floating-settings-container p-8">
        <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-xl font-light text-white mb-2" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
          Error cargando datos
        </h3>
        <p className="text-gray-400 mb-6 font-light">No se pudo cargar la información de uso</p>
        <button 
          onClick={loadUsageStatus}
          className="floating-premium-button px-4 py-2 flex items-center space-x-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reintentar</span>
        </button>
      </div>
    );
  }

  const canGenerate = usageStatus.limits.remainingDaily > 0 && usageStatus.limits.remainingMonthly > 0;

  return (
    <>
      <div className="relative overflow-hidden">
        {/* Efectos de fondo decorativos */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-pink-500/15 rounded-full blur-2xl animate-float-delayed"></div>
          <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-float-slow"></div>
        </div>

        {/* Container flotante principal */}
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className={`floating-settings-container p-4 md:p-6 ${className} relative`}>
            
            {/* ✅ BOTÓN CERRAR CORREGIDO */}
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-red-500/90 hover:bg-red-600/90 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 shadow-lg border-2 border-white/20 close-button"
                style={{ 
                  zIndex: 9999999,
                  pointerEvents: 'auto'
                }}
                title="Cerrar Generador de Imágenes"
              >
                <X className="w-5 h-5" style={{ pointerEvents: 'none' }} />
              </button>
            )}
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4 md:mb-6">
              <div>
                <h2 className="text-base md:text-xl font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  Generador de Imágenes
                </h2>
                <p className="text-gray-400 text-xs md:text-sm font-light">Crea imágenes con IA</p>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-2">
                {isPremium && (
                  <div className="floating-badge-premium px-2 md:px-3 py-1 rounded-lg">
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <Crown className="w-3 h-3" />
                      <span className="text-xs font-light">Pro</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="floating-button p-2 rounded-lg"
                  style={{ zIndex: 1000 }}
                  title="Configuración"
                >
                  <Settings className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            </div>

            {/* Información de límites */}
            <div className="mb-4 md:mb-6">
              <div className="floating-card p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-xs md:text-sm font-light">
                      Plan: <span className="text-purple-400 capitalize">{usageStatus.plan}</span>
                    </p>
                    <p className="text-gray-400 text-xs font-light">
                      Imágenes restantes hoy: {usageStatus.limits.remainingDaily}/{usageStatus.limits.daily}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs font-light">
                      Este mes: {usageStatus.limits.remainingMonthly}/{usageStatus.limits.monthly}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración avanzada */}
            {showSettings && (
              <div className="mb-6">
                <div className="floating-card p-4">
                  <h3 className="text-base md:text-lg font-light text-white mb-4" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Configuración
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Estilo */}
                    <div>
                      <label className="block text-white text-xs md:text-sm font-light mb-2">
                        Estilo
                      </label>
                      <select
                        value={selectedStyle}
                        onChange={(e) => setSelectedStyle(e.target.value)}
                        disabled={isGenerating}
                        className="w-full p-2 md:p-3 floating-info-card text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 text-xs md:text-sm"
                        style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}
                      >
                        {STYLES.map((style) => (
                          <option key={style.value} value={style.value}>
                            {style.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Proporción */}
                    <div>
                      <label className="block text-white text-xs md:text-sm font-light mb-2">
                        Proporción
                      </label>
                      <select
                        value={selectedAspectRatio}
                        onChange={(e) => setSelectedAspectRatio(e.target.value)}
                        disabled={isGenerating}
                        className="w-full p-2 md:p-3 floating-info-card text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 text-xs md:text-sm"
                        style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}
                      >
                        {ASPECT_RATIOS.map((ratio) => (
                          <option 
                            key={ratio.value} 
                            value={ratio.value}
                            disabled={!ratio.free && !isPremium}
                          >
                            {ratio.label} {!ratio.free && !isPremium ? '(Pro)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Campo de prompt */}
            <div className="mb-4 md:mb-6">
              <div className="floating-card p-3 md:p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-white text-sm md:text-base font-light" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    Describe tu imagen
                  </label>
                  <button
                    onClick={copyPrompt}
                    disabled={!prompt.trim()}
                    className="floating-button p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Copy className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                  </button>
                </div>
                
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Una ciudad futurista con rascacielos brillantes al atardecer..."
                    disabled={isGenerating}
                    className="w-full p-3 md:p-4 floating-info-card text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none h-16 md:h-20 disabled:opacity-50 text-xs md:text-sm"
                    style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}
                    maxLength={usageStatus.features.maxPromptLength}
                  />
                  
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500 font-light">
                    {prompt.length}/{usageStatus.features.maxPromptLength}
                  </div>
                </div>
              </div>
            </div>

            {/* Botón generar */}
            <div className="mb-6">
              <button
                onClick={generateImage}
                disabled={!canGenerate || isGenerating || !prompt.trim()}
                className="w-full floating-premium-button py-3 md:py-4 px-4 md:px-6 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    <span className="text-sm md:text-base font-light">Generando imagen...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-sm md:text-base font-light">Generar Imagen</span>
                  </>
                )}
              </button>

              {!canGenerate && (
                <p className="text-center text-red-400 text-xs md:text-sm mt-2 font-light">
                  {usageStatus.limits.remainingDaily <= 0 
                    ? 'Límite diario alcanzado' 
                    : 'Límite mensual alcanzado'
                  }
                </p>
              )}
            </div>

            {/* Imagen generada */}
            {generatedImage && (
              <div className="mb-6">
                <div className="floating-card overflow-hidden">
                  <div className="relative group">
                    {generatedImage && generatedImage.startsWith('http') ? (
                      <Image
                        src={generatedImage}
                        alt="Imagen generada"
                        width={512}
                        height={512}
                        className="w-full h-auto"
                        onError={() => setGeneratedImage(null)}
                      />
                    ) : (
                      <div className="w-full aspect-square bg-gray-800/50 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Overlay con acciones */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                      <button
                        onClick={downloadImage}
                        className="floating-button p-3 rounded-full"
                        title="Descargar"
                      >
                        <Download className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </button>
                      
                      <button
                        onClick={shareImage}
                        className="floating-button p-3 rounded-full"
                        title="Compartir"
                      >
                        <Share2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </button>
                      
                      <button
                        onClick={() => setGeneratedImage(null)}
                        className="floating-button p-3 rounded-full hover:bg-red-500/20"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3 md:p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/30">
                    <p className="text-white text-xs md:text-sm font-light line-clamp-2" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                      {prompt}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ✅ ESTILOS CSS MEJORADOS */}
      <style jsx>{`
        /* Animaciones */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-180deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(90deg); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }

        /* Contenedor principal flotante */
        .floating-settings-container {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 8px 32px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }
        .floating-settings-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        }

        /* Botón flotante */
        .floating-button {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s ease;
        }
        .floating-button:hover {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          border-color: rgba(255, 255, 255, 0.15);
          transform: scale(1.05);
        }

        /* Tarjetas flotantes */
        .floating-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.15),
            0 4px 16px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .floating-card:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.2),
            0 6px 20px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }

        /* Tarjetas de información flotantes */
        .floating-info-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        .floating-info-card:hover {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
          border-color: rgba(255, 255, 255, 0.1);
        }

        /* Botón premium flotante */
        .floating-premium-button {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
          backdrop-filter: blur(30px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          box-shadow: 
            0 8px 32px rgba(255, 255, 255, 0.1),
            0 4px 16px rgba(0, 0, 0, 0.1);
        }
        .floating-premium-button:hover:not(:disabled) {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.12));
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 
            0 16px 48px rgba(255, 255, 255, 0.2),
            0 8px 24px rgba(0, 0, 0, 0.15);
        }

        /* Badge premium flotante */
        .floating-badge-premium {
          background: linear-gradient(145deg, rgba(251, 191, 36, 0.25), rgba(251, 191, 36, 0.15));
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.3);
          backdrop-filter: blur(20px);
        }

        /* Utilidades */
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        /* Fuente global */
        * {
          font-family: 'Lastica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Selectores personalizados */
        select option {
          background-color: #1f2937;
          color: white;
        }

        /* Mejoras para pantallas pequeñas */
        @media (max-width: 640px) {
          .floating-settings-container {
            border-radius: 16px;
            margin: 0.5rem;
          }
        }

        /* ✅ ESTILOS ESPECÍFICOS PARA EL BOTÓN CERRAR */
        .fixed {
          position: fixed !important;
          z-index: 9999999 !important;
        }
      `}</style>
    </>
  );
}