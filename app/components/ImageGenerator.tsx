'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { cloudFunctions, helpers } from '../lib/firebase';
import { 
  Camera, Loader2, Download, Share2, Trash2, 
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
  { value: 'artistic', label: 'ArtÃ­stico', icon: Palette },
  { value: 'digital_art', label: 'Arte Digital', icon: Sparkles },
  { value: 'illustration', label: 'IlustraciÃ³n', icon: ImageIcon },
  { value: 'photography', label: 'FotografÃ­a', icon: Camera },
  { value: 'painting', label: 'Pintura', icon: Palette },
  { value: 'sketch', label: 'Boceto', icon: Grid3X3 },
  { value: 'cartoon', label: 'Caricatura', icon: Sparkles }
];

const ASPECT_RATIOS: AspectRatioOption[] = [
  { value: '1:1', label: 'Cuadrado (1:1)', free: true },
  { value: '16:9', label: 'PanorÃ¡mico (16:9)', free: false },
  { value: '9:16', label: 'Vertical (9:16)', free: false },
  { value: '4:3', label: 'EstÃ¡ndar (4:3)', free: false },
  { value: '3:4', label: 'Retrato (3:4)', free: false },
  { value: '21:9', label: 'Ultra ancho (21:9)', free: false },
  { value: '1:2', label: 'Vertical largo (1:2)', free: false },
  { value: '2:1', label: 'Horizontal largo (2:1)', free: false }
];

interface ImageGeneratorProps {
  isEmbedded?: boolean;
  onImageGenerated?: (image: { imageUrl: string; prompt: string }) => void;
  className?: string;
}

export default function ImageGenerator({ 
  isEmbedded = false, 
  onImageGenerated,
  className = ''
}: ImageGeneratorProps) {
  const { user, userProfile, plan } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [usageStatus, setUsageStatus] = useState<ImageUsageStatus | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const isPremium = plan === 'pro' || plan === 'pro_max';

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod'];
      return mobileKeywords.some(keyword => userAgent.includes(keyword)) || 
             window.innerWidth <= 768;
    };

    setIsMobile(checkMobile());
  }, []);

  useEffect(() => {
    if (user) {
      loadUsageStatus();
    }
  }, [user]);

  const loadUsageStatus = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const result = await cloudFunctions.getImageUsageStatus();
      
      // âœ… CORRECCIÃ“N: Convertir GetImageUsageStatusOutput a ImageUsageStatus
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
      console.error('Error cargando estado:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error cargando informaciÃ³n de uso';
      toast.error(errorMessage);
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
      toast.error('Cargando informaciÃ³n de lÃ­mites...');
      return;
    }

    if (usageStatus.limits.remainingMonthly <= 0) {
      toast.error('Has alcanzado tu lÃ­mite mensual de imÃ¡genes');
      return;
    }

    // Validar prompt
    const validation = helpers.validateImagePrompt(prompt, usageStatus.features.maxPromptLength);
    if (!validation.valid) {
      toast.error(validation.error || 'Error validando prompt');
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = await cloudFunctions.generateImage({
        prompt: prompt.trim(),
        aspectRatio: selectedAspectRatio,
        style: selectedStyle
      });

      if (result.data?.success) {
        setGeneratedImage(result.data.imageUrl);
        toast.success(`Â¡Imagen generada! Quedan ${result.data.remainingDaily} usos hoy`);
        
        // Callback para componente padre
        if (onImageGenerated) {
          onImageGenerated({
            imageUrl: result.data.imageUrl,
            prompt: prompt.trim()
          });
        }

        // Actualizar contadores
        await loadUsageStatus();
        setPrompt('');
      } else {
        toast.error('Error generando imagen');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(helpers.getErrorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;
    
    try {
      await helpers.downloadImage(generatedImage, `nora-generated-${Date.now()}.png`);
      toast.success('Imagen descargada');
    } catch (error) {
      console.error('Error descargando:', error);
      toast.error('Error al descargar la imagen');
    }
  };

  const shareImage = async () => {
    if (!generatedImage) return;
    
    try {
      // âœ… CORRECCIÃ“N: Cambiar de 3 argumentos a 2
      await helpers.shareImage(generatedImage, `Mira esta imagen que generÃ©: "${prompt}"`);
      toast.success('Imagen compartida');
    } catch (error: any) {
      console.error('Error compartiendo:', error);
      if (error.message.includes('portapapeles')) {
        toast.success('URL copiada al portapapeles');
      } else {
        toast.error('Error al compartir la imagen');
      }
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copiado');
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Cargando generador de imÃ¡genes...</p>
        </div>
      </div>
    );
  }

  if (!usageStatus) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Error cargando datos</h3>
        <p className="text-gray-400 mb-4">No se pudo cargar la informaciÃ³n de uso</p>
        <button 
          onClick={loadUsageStatus}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Reintentar
        </button>
      </div>
    );
  }

  const canGenerate = usageStatus.limits.remainingDaily > 0 && usageStatus.limits.remainingMonthly > 0;

  return (
    <div className={`bg-gray-900 rounded-xl border border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <ImageIcon className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Generador de ImÃ¡genes</h2>
            <p className="text-gray-400 text-sm">Crea imÃ¡genes con IA</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isPremium && (
            <Crown className="w-5 h-5 text-yellow-400" />
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* LÃ­mites de uso */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Uso diario</span>
          <span className="text-sm font-medium text-white">
            {usageStatus.limits.remainingDaily} / {usageStatus.limits.daily}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ 
              width: `${Math.max(0, Math.min(100, ((usageStatus.limits.daily - usageStatus.limits.remainingDaily) / usageStatus.limits.daily) * 100))}%` 
            }}
          />
        </div>
        
        <div className="flex items-center justify-between mt-3 mb-2">
          <span className="text-sm text-gray-400">Uso mensual</span>
          <span className="text-sm font-medium text-white">
            {usageStatus.limits.remainingMonthly} / {usageStatus.limits.monthly}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ 
              width: `${Math.max(0, (usageStatus.limits.remainingMonthly / usageStatus.limits.monthly) * 100)}%` 
            }}
          />
        </div>
      </div>

      {/* ConfiguraciÃ³n avanzada */}
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-800/30 rounded-lg border border-gray-600">
          <h3 className="text-lg font-medium text-white mb-4">ConfiguraciÃ³n</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Estilo */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Estilo
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              >
                {STYLES.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ProporciÃ³n */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                ProporciÃ³n
              </label>
              <select
                value={selectedAspectRatio}
                onChange={(e) => setSelectedAspectRatio(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              >
                {ASPECT_RATIOS.map((ratio) => (
                  <option 
                    key={ratio.value} 
                    value={ratio.value}
                    disabled={!ratio.free && !isPremium}
                  >
                    {ratio.label} {!ratio.free && !isPremium && '(Pro)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Prompt input */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-white text-sm font-medium">
            Describe tu imagen
          </label>
          <button
            onClick={copyPrompt}
            disabled={!prompt.trim()}
            className="p-1 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Una ciudad futurista con rascacielos brillantes al atardecer..."
            disabled={isGenerating}
            className="w-full p-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none h-24 disabled:opacity-50"
            maxLength={usageStatus.features.maxPromptLength}
          />
          
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {prompt.length}/{usageStatus.features.maxPromptLength}
          </div>
        </div>
      </div>

      {/* BotÃ³n generar */}
      <div className="mb-6">
        <button
          onClick={generateImage}
          disabled={!canGenerate || isGenerating || !prompt.trim()}
          className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generando imagen...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generar Imagen</span>
            </>
          )}
        </button>

        {!canGenerate && (
          <p className="text-center text-red-400 text-sm mt-2">
            {usageStatus.limits.remainingDaily <= 0 
              ? 'LÃ­mite diario alcanzado' 
              : 'LÃ­mite mensual alcanzado'
            }
          </p>
        )}
      </div>

      {/* Imagen generada */}
      {generatedImage && (
        <div className="border border-gray-600 rounded-xl overflow-hidden">
          <div className="relative">
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
              <div className="w-full aspect-square bg-gray-800 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            {/* Overlay con acciones */}
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
              <button
                onClick={downloadImage}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <Download className="w-5 h-5 text-white" />
              </button>
              
              <button
                onClick={shareImage}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>
              
              <button
                onClick={() => setGeneratedImage(null)}
                className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          
          <div className="p-4 bg-gray-800">
            <p className="text-sm text-gray-300 line-clamp-2">
              "{prompt}"
            </p>
          </div>
        </div>
      )}

      {/* Info del plan */}
      {!isPremium && (
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300 font-medium text-sm">Plan Gratuito</span>
          </div>
          <p className="text-gray-300 text-sm">
            Actualiza a Pro para mÃ¡s imÃ¡genes, estilos premium y proporciones avanzadas.
          </p>
        </div>
      )}
    </div>
  );
}