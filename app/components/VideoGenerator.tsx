'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  Calendar, 
  Pause,
  Download, 
  Settings, 
  Loader2,
  Crown,
  Heart,
  Copy,
  Trash2,
  Clock,
  Zap,
  Film,
  Sparkles,
  RefreshCw,
  Info,
  CheckCircle,
  AlertCircle,
  Lock,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cloudFunctions, helpers } from '../lib/firebase';
import { 
  GeneratedVideo,
  VideoGenerationRequest, 
  VideoGenerationResponse, 
  VideoUsageStatus,
  VIDEO_STYLES,
  VIDEO_ASPECT_RATIOS,
  VideoGeneratorUIState,
  PlanType
} from '../lib/types';
import toast from 'react-hot-toast';

interface VideoGeneratorProps {
  onClose?: () => void;
  className?: string;
}

export default function VideoGenerator({ onClose, className = '' }: VideoGeneratorProps) {
  const { userProfile, plan } = useAuth();
  
  // ✅ VERIFICACIÓN CRÍTICA: Solo PRO y PRO_MAX pueden acceder
  const isVideoAllowed = plan === 'pro' || plan === 'pro_max';
  const isPremium = plan !== 'free';
  const isProMax = plan === 'pro_max';

  // Estados principales
  const [state, setState] = useState<VideoGeneratorUIState>({
    prompt: '',
    selectedStyle: 'cinematic',
    selectedAspectRatio: '16:9',
    selectedDuration: plan === 'pro' ? 5 : plan === 'pro_max' ? 10 : 3,
    isGenerating: false,
    showAdvancedOptions: false,
    showHistory: false,
    selectedVideo: null,
    generatingVideos: []
  });

  const [usageStatus, setUsageStatus] = useState<VideoUsageStatus | null>(null);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // ✅ VERIFICACIÓN TEMPRANA: Si no tiene plan adecuado, mostrar upgrade
  if (!isVideoAllowed) {
    return (
      <div className="relative overflow-hidden">
        {/* Efectos de fondo decorativos */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-pink-500/15 rounded-full blur-2xl animate-float-delayed"></div>
          <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-float-slow"></div>
        </div>

        {/* Container de upgrade */}
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className={`floating-settings-container p-6 md:p-8 ${className}`}>
            
            {/* ✅ BOTÓN CERRAR CORREGIDO */}
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-red-500/90 hover:bg-red-600/90 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 shadow-lg border-2 border-white/20 close-button"
                style={{ 
                  zIndex: 9999999,
                  pointerEvents: 'auto'
                }}
                title="Cerrar"
              >
                <X className="w-5 h-5" style={{ pointerEvents: 'none' }} />
              </button>
            )}
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl md:text-3xl font-light text-white mb-2" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Generador de Videos
              </h2>
              <p className="text-gray-400 text-sm md:text-base font-light">
                Crea videos increíbles con inteligencia artificial
              </p>
            </div>

            {/* Mensaje de restricción */}
            <div className="floating-card p-6 text-center mb-8">
              <Lock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              
              <h3 className="text-xl font-light text-white mb-3" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Función Premium Requerida
              </h3>
              
              <p className="text-gray-300 text-sm mb-6 max-w-md mx-auto font-light">
                La generación de videos es una función exclusiva para usuarios 
                <span className="text-purple-400 font-medium"> Pro</span> y 
                <span className="text-pink-400 font-medium"> Pro Max</span>. 
                Actualiza tu plan para acceder a esta increíble herramienta.
              </p>

              {/* Plan actual */}
              <div className="inline-flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-lg mb-6">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-300 text-sm capitalize">Plan Actual: {plan}</span>
              </div>
            </div>

            {/* Características de los planes */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Plan Pro */}
              <div className="floating-card p-6 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                      Plan Pro
                    </h4>
                    <p className="text-purple-400 text-sm">Perfecto para creadores</p>
                  </div>
                </div>
                
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>50 videos por mes</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Hasta 5 segundos por video</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Múltiples proporciones</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Modelo Runway Gen-3</span>
                  </li>
                </ul>
              </div>

              {/* Plan Pro Max */}
              <div className="floating-card p-6 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20 hover:scale-105 transition-transform duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-light text-white" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                      Plan Pro Max
                    </h4>
                    <p className="text-pink-400 text-sm">Para profesionales</p>
                  </div>
                </div>
                
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>200 videos por mes</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Hasta 10 segundos por video</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Todas las proporciones</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Modelo Runway Gen-3 Turbo</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Botones de upgrade */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/upgrade?plan=pro'}
                className="floating-premium-button px-6 py-4 flex items-center justify-center space-x-3"
                style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}
              >
                <Crown className="w-5 h-5" />
                <span>Actualizar a Pro</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/upgrade?plan=pro_max'}
                className="floating-premium-button px-6 py-4 flex items-center justify-center space-x-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30"
                style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}
              >
                <Sparkles className="w-5 h-5" />
                <span>Actualizar a Pro Max</span>
              </button>
            </div>

            {/* Nota adicional */}
            <div className="text-center mt-6">
              <p className="text-gray-400 text-xs font-light">
                ¿Tienes preguntas? <a href="/contact" className="text-purple-400 hover:text-purple-300 transition-colors">Contáctanos</a>
              </p>
            </div>

          </div>
        </div>

        {/* Estilos CSS */}
        <style jsx>{`
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

          .animate-float { animation: float 6s ease-in-out infinite; }
          .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
          .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }

          .floating-settings-container {
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
            backdrop-filter: blur(30px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }

          .floating-card {
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
            backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          }

          .floating-premium-button {
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
            backdrop-filter: blur(30px);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
          }
          .floating-premium-button:hover {
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.12));
            transform: translateY(-3px) scale(1.02);
          }
        `}</style>
      </div>
    );
  }

  // ✅ RESTO DEL COMPONENTE ORIGINAL PARA USUARIOS PRO/PRO_MAX
  
  // Cargar estado inicial solo si tiene acceso
  useEffect(() => {
    if (isVideoAllowed) {
      loadUsageStatus();
    }
  }, [isVideoAllowed]);

  // Verificar estado de videos en generación
  useEffect(() => {
    if (state.generatingVideos.length > 0 && isVideoAllowed) {
      const interval = setInterval(checkGeneratingVideos, 5000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [state.generatingVideos, isVideoAllowed]);

  const loadUsageStatus = async () => {
    if (!isVideoAllowed) return;
    
    try {
      setIsLoading(true);
      const result = await cloudFunctions.getVideoUsageStatus();
      setUsageStatus(result.data);
      
      // Cargar historial de videos desde el resultado
      if (result.data.history) {
        setGeneratedVideos(result.data.history);
      }
    } catch (error) {
      console.error('Error cargando estado de videos:', error);
      toast.error('Error cargando información de videos');
    } finally {
      setIsLoading(false);
    }
  };

  const checkGeneratingVideos = async () => {
    if (state.generatingVideos.length === 0 || !isVideoAllowed) return;

    try {
      const promises = state.generatingVideos.map(async (videoId: string) => {
        try {
          const result = await cloudFunctions.checkVideoStatus({
            taskId: `task_${videoId}`,
            videoId: videoId
          });
          return { videoId, result: result.data };
        } catch (error) {
          console.error(`Error checking video ${videoId}:`, error);
          return { videoId, result: null };
        }
      });

      const results = await Promise.all(promises);

      results.forEach((result: any) => {
        if (result.result) {
          setGeneratedVideos(prev => prev.map(video =>
            video.id === result.videoId
              ? { 
                  ...video, 
                  status: result.result.status as 'generating' | 'completed' | 'failed',
                  videoUrl: result.result.videoUrl || video.videoUrl,
                  thumbnailUrl: result.result.thumbnailUrl || video.thumbnailUrl,
                  progress: result.result.progress || 0
                }
              : video
          ));

          // Si completó o falló, remover de la lista de generación
          if (result.result.status === 'completed' || result.result.status === 'failed') {
            setState((prev: VideoGeneratorUIState) => ({
              ...prev,
              generatingVideos: prev.generatingVideos.filter((id: string) => id !== result.videoId)
            }));

            if (result.result.status === 'completed') {
              toast.success('¡Video generado exitosamente!');
            } else {
              toast.error('Error generando video');
            }
          }
        }
      });

    } catch (error) {
      console.error('Error verificando videos:', error);
    }
  };

  const generateVideo = async () => {
    if (!isVideoAllowed) {
      toast.error('La generación de videos requiere un plan Pro o Pro Max');
      return;
    }

    if (!state.prompt.trim()) {
      toast.error('Por favor, describe el video que quieres generar');
      return;
    }

    if (!usageStatus) {
      toast.error('Cargando información de límites...');
      return;
    }

    if (!usageStatus || usageStatus.limits.remainingDaily <= 0) {
      toast.error('Has alcanzado tu límite diario de videos');
      return;
    }

    // Validar prompt
    const validation = helpers.validateVideoPrompt(state.prompt, usageStatus.features.maxPromptLength);
    if (!validation.valid) {
      toast.error(validation.error || 'Error validando prompt');
      return;
    }

    setState((prev: VideoGeneratorUIState) => ({ ...prev, isGenerating: true }));

    try {
      const result = await cloudFunctions.generateVideo({
        prompt: state.prompt.trim(),
        duration: state.selectedDuration,
        aspectRatio: state.selectedAspectRatio,
        style: state.selectedStyle
      });

      if (result.data?.success) {
        const videoId = result.data.videoId;
        
        const newVideo: GeneratedVideo = {
          id: videoId,
          userId: userProfile!.user.uid,
          videoUrl: '',
          thumbnailUrl: '',
          prompt: state.prompt,
          model: isProMax ? 'gen-4-turbo' : 'gen-3',
          duration: state.selectedDuration,
          aspectRatio: state.selectedAspectRatio,
          style: state.selectedStyle,  
          status: 'generating',
          createdAt: new Date(),
          cost: result.data.cost,
          runwayTaskId: result.data.taskId
        };

        setGeneratedVideos((prev: GeneratedVideo[]) => [newVideo, ...prev]);
        
        setState((prev: VideoGeneratorUIState) => ({
          ...prev,
          generatingVideos: [...prev.generatingVideos, videoId],
          prompt: ''
        }));

        toast.success(`Video en generación. Tiempo estimado: ${result.data.estimatedTime || 30} segundos`);
        
        // Actualizar límites
        await loadUsageStatus();
      }

    } catch (error: any) {
      console.error('Error generando video:', error);
      if (error.message?.includes('permission-denied') || error.message?.includes('plan Premium')) {
        toast.error('Tu plan actual no permite generar videos. Actualiza a Pro o Pro Max.');
      } else {
        toast.error(error.message || 'Error generando video');
      }
    } finally {
      setState((prev: VideoGeneratorUIState) => ({ ...prev, isGenerating: false }));
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const downloadVideo = async (videoUrl: string, videoId: string): Promise<void> => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nora-video-${videoId}.mp4`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Video descargado');
    } catch (error) {
      console.error('Error descargando video:', error);
      toast.error('Error al descargar el video');
    }
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copiado');
  };

  const deleteVideo = (videoId: string) => {
    setGeneratedVideos(prev => prev.filter(video => video.id !== videoId));
    toast.success('Video eliminado');
  };

  // Loading state para usuarios con acceso
  if (isLoading && isVideoAllowed) {
    return (
      <div className="floating-settings-container p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-white font-light">Cargando generador de videos...</p>
        </div>
      </div>
    );
  }

  if (!usageStatus && isVideoAllowed) {
    return (
      <div className="floating-settings-container p-8">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Error cargando datos</h3>
        <p className="text-gray-400 mb-4">No se pudo cargar la información de videos</p>
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

  const canGenerate = usageStatus?.limits?.remainingDaily && usageStatus.limits.remainingDaily > 0 && 
                      usageStatus?.limits?.remainingMonthly && usageStatus.limits.remainingMonthly > 0;

  return (
    <div className="relative overflow-hidden">
      {/* Efectos de fondo decorativos */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-pink-500/15 rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-float-slow"></div>
      </div>

      {/* Container principal */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className={`floating-settings-container p-6 ${className}`}>

          {/* ✅ BOTÓN CERRAR CORREGIDO */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-red-500/90 hover:bg-red-600/90 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 shadow-lg border-2 border-white/20 close-button"
              style={{ 
                zIndex: 9999999,
                pointerEvents: 'auto'
              }}
              title="Cerrar"
            >
              <X className="w-5 h-5" style={{ pointerEvents: 'none' }} />
            </button>
          )}
          
          {/* Header del generador */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
                <Video className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Generador de Videos {isProMax ? 'Pro Max' : 'Pro'}</h1>
                <p className="text-gray-400">Crea videos con IA usando Runway</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="floating-badge-premium px-3 py-1 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm font-light">{isProMax ? 'Pro Max' : 'Pro'}</span>
                </div>
              </div>
              <button
                onClick={() => setState((prev: VideoGeneratorUIState) => ({ ...prev, showHistory: !prev.showHistory }))}
                className="floating-button px-4 py-2 rounded-lg"
              >
                <Film className="w-4 h-4 inline mr-2" />
                Historial
              </button>
            </div>
          </div>

          {/* Información de uso */}
          {usageStatus && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="floating-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Videos hoy</span>
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {usageStatus?.limits?.remainingDaily ?? 0}
                </div>
                <div className="text-xs text-gray-500">
                  de {usageStatus?.limits?.daily ?? 0} disponibles
                </div>
              </div>

              <div className="floating-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Videos este mes</span>
                  <Calendar className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {usageStatus?.limits?.remainingMonthly ?? 0}
                </div>
                <div className="text-xs text-gray-500">
                  de {usageStatus?.limits?.monthly ?? 0} disponibles
                </div>
              </div>

              <div className="floating-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Duración máx.</span>
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {usageStatus?.limits?.maxDuration ?? 0}s
                </div>
                <div className="text-xs text-gray-500">
                  por video
                </div>
              </div>
            </div>
          )}

          {/* Generador principal */}
          <div className="floating-card p-6 mb-6">
            <div className="space-y-6">
              {/* Prompt */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Describe tu video
                </label>
                <div className="relative">
                  <textarea
                    value={state.prompt}
                    onChange={(e) => setState((prev: VideoGeneratorUIState) => ({ ...prev, prompt: e.target.value }))}
                    placeholder="Un dragón volando sobre montañas nevadas al amanecer..."
                    disabled={state.isGenerating}
                    className="w-full p-4 floating-info-card text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none h-24 disabled:opacity-50"
                    maxLength={usageStatus?.features.maxPromptLength || 1000}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                    {state.prompt.length}/{usageStatus?.features.maxPromptLength || 1000}
                  </div>
                </div>
              </div>

              {/* Controles básicos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Duración
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min={1}
                      max={usageStatus?.limits.maxDuration || 10}
                      step={1}
                      value={state.selectedDuration}
                      onChange={(e) => setState((prev: VideoGeneratorUIState) => ({ 
                        ...prev, 
                        selectedDuration: parseInt(e.target.value) 
                      }))}
                      disabled={state.isGenerating}
                      className="flex-1"
                    />
                    <span className="text-white text-sm w-8">
                      {state.selectedDuration}s
                    </span>
                  </div>
                </div>

                {/* Configuración avanzada */}
                {state.showAdvancedOptions && (
                  <>
                    {/* Estilo */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Estilo
                      </label>
                      <select
                        value={state.selectedStyle}
                        onChange={(e) => setState((prev: VideoGeneratorUIState) => ({ 
                          ...prev, 
                          selectedStyle: e.target.value 
                        }))}
                        className="w-full p-3 floating-info-card text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                      >
                        {VIDEO_STYLES.map((style) => (
                          <option key={style.value} value={style.value}>
                            {style.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Aspect Ratio */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Proporción
                      </label>
                      <select
                        value={state.selectedAspectRatio}
                        onChange={(e) => setState((prev: VideoGeneratorUIState) => ({ 
                          ...prev, 
                          selectedAspectRatio: e.target.value 
                        }))}
                        className="w-full p-3 floating-info-card text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                      >
                        {VIDEO_ASPECT_RATIOS.map((ratio) => (
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
                  </>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setState((prev: VideoGeneratorUIState) => ({ 
                    ...prev, 
                    showAdvancedOptions: !prev.showAdvancedOptions 
                  }))}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Opciones avanzadas</span>
                </button>

                <button
                  onClick={generateVideo}
                  disabled={!canGenerate || state.isGenerating || !state.prompt.trim()}
                  className="floating-premium-button px-8 py-3 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generar Video</span>
                    </>
                  )}
                </button>
              </div>

              {!canGenerate && (
                <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400">
                    {(!usageStatus?.limits?.remainingDaily || usageStatus.limits.remainingDaily <= 0)
                      ? 'Límite diario de videos alcanzado' 
                      : 'Límite mensual de videos alcanzado'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Videos generados */}
          {generatedVideos.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Videos Generados</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedVideos.map((video) => (
                  <div key={video.id} className="floating-card overflow-hidden group">
                    {/* Video */}
                    <div className="relative aspect-video bg-gray-900">
                      {video.status === 'completed' && video.videoUrl ? (
                        <video
                          ref={state.selectedVideo === video.id ? videoRef : undefined}
                          src={video.videoUrl}
                          className="w-full h-full object-cover"
                          controls
                          preload="metadata"
                        />
                      ) : video.status === 'generating' ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">Generando video...</p>
                          </div>
                        </div>
                      ) : video.status === 'failed' ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                            <p className="text-red-400 text-sm">Error generando</p>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                          <Video className="w-12 h-12 text-gray-600" />
                        </div>
                      )}

                      {/* Overlay con acciones */}
                      {video.status === 'completed' && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                          <button
                            onClick={() => downloadVideo(video.videoUrl, video.id)}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                          >
                            <Download className="w-4 h-4 text-white" />
                          </button>
                          
                          <button
                            onClick={() => copyPrompt(video.prompt)}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                          >
                            <Copy className="w-4 h-4 text-white" />
                          </button>
                          
                          <button
                            onClick={() => deleteVideo(video.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Info del video */}
                    <div className="p-4">
                      <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                        "{video.prompt}"
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{video.duration}s • {video.aspectRatio}</span>
                        <span className={`px-2 py-1 rounded-full ${
                          video.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          video.status === 'generating' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {video.status === 'completed' ? 'Completado' :
                           video.status === 'generating' ? 'Generando' :
                           'Error'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Estilos CSS completos */}
      <style jsx>{`
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

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }

        .floating-settings-container {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .floating-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }
        .floating-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        }

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

        .floating-premium-button {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
          backdrop-filter: blur(30px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1);
        }
        .floating-premium-button:hover:not(:disabled) {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.12));
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 16px 48px rgba(255, 255, 255, 0.2);
        }

        .floating-badge-premium {
          background: linear-gradient(145deg, rgba(251, 191, 36, 0.25), rgba(251, 191, 36, 0.15));
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.3);
          backdrop-filter: blur(20px);
        }

        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        select option {
          background-color: #1f2937;
          color: white;
        }
      `}</style>
    </div>
  );
}