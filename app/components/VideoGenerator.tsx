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
  AlertCircle
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

export default function VideoGenerator() {
  const { userProfile, plan } = useAuth();
  
  // Estados principales
  const [state, setState] = useState<VideoGeneratorUIState>({
    prompt: '',
    selectedStyle: 'cinematic',
    selectedAspectRatio: '16:9',
    selectedDuration: plan === 'pro' ? 8 : plan === 'pro_max' ? 10 : 5,
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

  const isPremium = plan !== 'free';
  const isProMax = plan === 'pro_max';

  // Cargar estado inicial
  useEffect(() => {
    loadUsageStatus();
  }, []);

  // Verificar estado de videos en generación
  useEffect(() => {
  if (state.generatingVideos.length > 0) {
    const interval = setInterval(checkGeneratingVideos, 5000);
    return () => clearInterval(interval);
    }
    return undefined; // ✅ AGREGAR ESTA LÍNEA
    }, [state.generatingVideos]);

  const loadUsageStatus = async () => {
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
    if (state.generatingVideos.length === 0) return;

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
          // ✅ CORRECCIÓN: Type assertion para status y actualización correcta
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
    if (!state.prompt.trim()) {
      toast.error('Por favor, describe el video que quieres generar');
      return;
    }

    if (!usageStatus) {
      toast.error('Cargando información de límites...');
      return;
    }

    if (usageStatus.limits.remainingDaily <= 0) {
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
        
        // ✅ CORRECCIÓN: Crear newVideo con todos los campos requeridos
        const newVideo: GeneratedVideo = {
          id: videoId,
          userId: userProfile!.user.uid,
          videoUrl: '', // Se actualizará cuando esté listo
          thumbnailUrl: '',
          prompt: state.prompt,
          model: 'gen-4-turbo',
          duration: state.selectedDuration,
          aspectRatio: state.selectedAspectRatio, // ✅ CAMPO REQUERIDO
          style: state.selectedStyle, // ✅ CAMPO REQUERIDO  
          status: 'generating',
          createdAt: new Date(),
          cost: result.data.cost,
          runwayTaskId: result.data.taskId
        };

        // Agregar a la lista de videos
        setGeneratedVideos((prev: GeneratedVideo[]) => [newVideo, ...prev]);
        
        // Agregar a lista de videos en generación
        setState((prev: VideoGeneratorUIState) => ({
          ...prev,
          generatingVideos: [...prev.generatingVideos, videoId],
          prompt: ''
        }));

        toast.success(`Video en generación. Tiempo estimado: ${result.data.estimatedTime}s`);
        
        // Actualizar contadores
        await loadUsageStatus();
      } else {
        toast.error('Error iniciando generación de video');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(helpers.getErrorMessage(error));
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Cargando generador de videos...</p>
        </div>
      </div>
    );
  }

  if (!usageStatus) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Error cargando datos</h3>
        <p className="text-gray-400 mb-4">No se pudo cargar la información de videos</p>
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
            <Video className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Generador de Videos</h1>
            <p className="text-gray-400">Crea videos con IA usando Runway</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isProMax && <Crown className="w-6 h-6 text-yellow-400" />}
          <button
            onClick={() => setState((prev: VideoGeneratorUIState) => ({ ...prev, showHistory: !prev.showHistory }))}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Film className="w-4 h-4 inline mr-2" />
            Historial
          </button>
        </div>
      </div>

      {/* Información de uso */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Videos hoy</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {usageStatus.limits.remainingDaily}
          </div>
          <div className="text-xs text-gray-500">
            de {usageStatus.limits.daily} disponibles
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Videos este mes</span>
            <Calendar className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {usageStatus.limits.remainingMonthly}
          </div>
          <div className="text-xs text-gray-500">
            de {usageStatus.limits.monthly} disponibles
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Duración máx.</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {usageStatus.limits.maxDuration}s
          </div>
          <div className="text-xs text-gray-500">
            por video
          </div>
        </div>
      </div>

      {/* Generador principal */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
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
                className="w-full p-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none h-24 disabled:opacity-50"
                maxLength={usageStatus.features.maxPromptLength}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {state.prompt.length}/{usageStatus.features.maxPromptLength}
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
                  max={usageStatus.limits.maxDuration}
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
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
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
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
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
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                {usageStatus.limits.remainingDaily <= 0 
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
              <div key={video.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden group">
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

      {/* Plan info */}
      {!isPremium && (
        <div className="p-6 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl">
          <div className="flex items-center space-x-3 mb-3">
            <Info className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-medium text-orange-300">Plan Gratuito</h3>
          </div>
          <p className="text-gray-300 mb-4">
            La generación de videos no está disponible en el plan gratuito. 
            Actualiza a Pro para crear videos increíbles con IA.
          </p>
          <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors">
            Actualizar a Pro
          </button>
        </div>
      )}
    </div>
  );
}