// app/videos/page.tsx - CÓDIGO COMPLETO CON TODAS LAS CORRECCIONES
'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  Play, 
  Pause,
  Download, 
  Share2,
  Settings, 
  Loader2,
  X,
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
  Grid,
  List
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
import ProtectedRoute from '../components/ProtectedRoute';

// Componente principal de videos
function VideoPage() {
  const { userProfile, plan } = useAuth();
  
  // Estados principales
  const [state, setState] = useState<VideoGeneratorUIState>({
    prompt: '',
    selectedStyle: 'cinematic',
    selectedAspectRatio: '16:9',
    selectedDuration: plan === 'pro' ? 8 : plan === 'pro_max' ? 10 : 5,
    isGenerating: false,
    showAdvancedOptions: false,
    showHistory: true,
    selectedVideo: null,
    generatingVideos: []
  });
  
  const [usageStatus, setUsageStatus] = useState<VideoUsageStatus | null>(null);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Referencias
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});

  // Cargar estado inicial - useEffect corregido
  useEffect(() => {
    loadVideoUsageStatus();
    return undefined;
  }, []);

  // Polling para videos en generación
  useEffect(() => {
    if (state.generatingVideos.length > 0) {
      const interval = setInterval(() => {
        checkGeneratingVideos();
      }, 5000);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [state.generatingVideos]);

  const loadVideoUsageStatus = async () => {
    try {
      setIsLoading(true);
      const result = await cloudFunctions.getVideoUsageStatus();
      
      if (result.data) {
        setUsageStatus(result.data);
        setGeneratedVideos(result.data.history || []);
      }
    } catch (error) {
      console.error('Error loading video usage:', error);
      toast.error('Error cargando estado de videos');
    } finally {
      setIsLoading(false);
    }
  };

  const checkGeneratingVideos = async () => {
    try {
      const promises = state.generatingVideos.map(async (videoId) => {
        const video = generatedVideos.find(v => v.id === videoId);
        if (!video?.runwayTaskId) return null;

        try {
          const result = await cloudFunctions.checkVideoStatus({
            taskId: video.runwayTaskId,
            videoId: video.id
          });

          return { videoId, status: result.data };
        } catch (error) {
          console.error(`Error checking video ${videoId}:`, error);
          return null;
        }
      });

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        if (result && result.status) {
          const { videoId, status } = result;
          
          setGeneratedVideos(prev => prev.map(video => 
            video.id === videoId 
                ? { 
                    ...video, 
                    status: status.status as 'generating' | 'completed' | 'failed', // ✅ ESPECÍFICO
                    videoUrl: status.videoUrl || video.videoUrl,
                    thumbnailUrl: status.thumbnailUrl || video.thumbnailUrl,
                    progress: status.progress || 0
                }
                : video
          ));

          if (status.status === 'completed' || status.status === 'failed') {
            setState(prev => ({
              ...prev,
              generatingVideos: prev.generatingVideos.filter(id => id !== videoId)
            }));

            if (status.status === 'completed') {
              toast.success('¡Video generado exitosamente!');
            } else {
              toast.error('Error generando video');
            }
          }
        }
      });
    } catch (error) {
      console.error('Error checking generating videos:', error);
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

    if ((usageStatus?.limits?.remainingMonthly ?? 0) <= 0) {
      toast.error('Has alcanzado tu límite mensual de videos');
      return;
    }

    if ((usageStatus?.limits?.remainingDaily ?? 0) <= 0) {
      toast.error('Has alcanzado tu límite diario de videos');
      return;
    }

    const validation = helpers.validateVideoPrompt(state.prompt, usageStatus.features.maxPromptLength);
    if (!validation.valid) {
      toast.error(validation.error || 'Error validando prompt');
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true }));
    
    try {
      const result = await cloudFunctions.generateVideo({
        prompt: state.prompt.trim(),
        aspectRatio: state.selectedAspectRatio,
        style: state.selectedStyle,
        duration: state.selectedDuration
      });

      if (result.data?.success) {
        // ✅ CORRECCIÓN 1: Crear objeto newVideo correctamente
        const newVideo: GeneratedVideo = {
        id: result.data.videoId,
        userId: userProfile?.user?.uid || '',
        videoUrl: '', // ✅ Inicializar vacío
        thumbnailUrl: '',
        prompt: state.prompt.trim(),
        model: 'gen-4-turbo',
        duration: state.selectedDuration,
        aspectRatio: state.selectedAspectRatio, // ✅ REQUERIDO
        style: state.selectedStyle, // ✅ REQUERIDO
        status: result.data.status as 'generating' | 'completed' | 'failed',
        createdAt: new Date(),
        cost: result.data.cost,
        runwayTaskId: result.data.taskId
        };
        
        setGeneratedVideos(prev => [newVideo, ...prev]);
        
        if (newVideo.status === 'generating') {
          setState(prev => ({
            ...prev,
            generatingVideos: [...prev.generatingVideos, newVideo.id]
          }));
        }

        toast.success(`¡Video iniciado! (${result.data.cost.toFixed(3)}$ - ${state.selectedDuration}s)`);
        
        await loadVideoUsageStatus();
        setState(prev => ({ ...prev, prompt: '' }));
      }
    } catch (error: unknown) {
      console.error('Error generando video:', error);
      const errorMessage = helpers.getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const downloadVideo = async (video: GeneratedVideo) => {
    if (!video.videoUrl) return;

    try {
      const response = await fetch(video.videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `nora-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      toast.success('Video descargado');
    } catch (error) {
      toast.error('Error descargando video');
    }
  };

  const shareVideo = async (video: GeneratedVideo) => {
    if (!video.videoUrl) return;

    try {
      // ✅ CORRECCIÓN 2: navigator.canShare condition corregida
      if (navigator.share && typeof navigator.canShare === 'function') {
        await navigator.share({
          title: 'Video generado con NORA AI',
          text: `Mira este video que generé: "${video.prompt}"`,
          url: video.videoUrl
        });
        toast.success('Video compartido');
      } else {
        await navigator.clipboard.writeText(video.videoUrl);
        toast.success('URL copiada al portapapeles');
      }
    } catch (error) {
      toast.error('Error compartiendo video');
    }
  };

  const copyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success('Prompt copiado');
    } catch (error) {
      toast.error('Error copiando prompt');
    }
  };

  const deleteVideo = async (videoId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este video?')) {
      setGeneratedVideos(prev => prev.filter(v => v.id !== videoId));
      toast.success('Video eliminado');
    }
  };

  const canGenerate = () => {
    return plan !== 'free' && 
           (usageStatus?.limits?.remainingMonthly ?? 0) > 0 && 
           (usageStatus?.limits?.remainingDaily ?? 0) > 0 && 
           !state.isGenerating;
  };

  const getPlanBadge = () => {
    const colors: Record<string, string> = {
      free: 'bg-gray-500',
      pro: 'bg-blue-500', 
      pro_max: 'bg-yellow-500'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[plan] || 'bg-gray-500'} text-white`}>
        {plan?.toUpperCase()}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-600 rounded-xl">
                <Video className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Generador de Videos</h1>
                <p className="text-gray-400">Powered by Runway Gen-4 Turbo</p>
              </div>
            </div>
            {getPlanBadge()}
          </div>

          {/* Plan Restrictions */}
          {plan === 'free' && (
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-6 mb-8">
              <div className="flex items-center space-x-3">
                <Info className="w-6 h-6 text-yellow-400" />
                <div>
                  <h3 className="text-yellow-300 font-medium">Plan Gratuito</h3>
                  <p className="text-yellow-300/80 text-sm">
                    La generación de videos requiere un plan Pro o Pro Max.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Usage Stats */}
          {usageStatus && plan !== 'free' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Videos Restantes</span>
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-white text-2xl font-bold">
                  {(usageStatus?.limits?.remainingMonthly ?? 0)}
                </p>
                <p className="text-gray-400 text-xs">
                  {/* ✅ CORRECCIÓN 3: Cambiar monthlyLimit por monthly */}
                  de {usageStatus.limits.monthly} mensuales
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Duración Máx</span>
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-white text-2xl font-bold">
                  {usageStatus.limits.maxDuration}s
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Generados Hoy</span>
                  <Film className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-white text-2xl font-bold">
                  {/* ✅ CORRECCIÓN 4: Usar cálculo manual en lugar de usageStatus.usage */}
                  {generatedVideos.filter(v => {
                    const today = new Date();
                    const videoDate = new Date(v.createdAt);
                    return videoDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Generados</span>
                  <Video className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-white text-2xl font-bold">
                  {generatedVideos.length}
                </p>
              </div>
            </div>
          )}

          {/* Generation Form */}
          <div className="bg-white/5 rounded-xl p-8 mb-8">
            <div className="space-y-6">
              {/* Prompt Input */}
              <div>
                <label className="block text-white text-lg font-medium mb-3">
                  Descripción del Video
                </label>
                <textarea
                  ref={promptRef}
                  value={state.prompt}
                  onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="Describe el video que quieres generar..."
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none resize-none"
                  rows={4}
                  maxLength={500}
                  disabled={state.isGenerating || plan === 'free'}
                />
                <div className="flex justify-between mt-2">
                  <p className="text-gray-400 text-sm">
                    {state.prompt.length}/500 caracteres
                  </p>
                  <p className="text-gray-400 text-sm">
                    Duración: {state.selectedDuration} segundos
                  </p>
                </div>
              </div>

              {/* Advanced Options */}
              {plan !== 'free' && (
                <div className="space-y-4">
                  <button
                    onClick={() => setState(prev => ({ 
                      ...prev, 
                      showAdvancedOptions: !prev.showAdvancedOptions 
                    }))}
                    className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Opciones Avanzadas</span>
                  </button>

                  {state.showAdvancedOptions && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white/5 rounded-lg">
                      {/* Style */}
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Estilo
                        </label>
                        <select
                          value={state.selectedStyle}
                          onChange={(e) => setState(prev => ({ 
                            ...prev, 
                            selectedStyle: e.target.value 
                          }))}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
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
                          onChange={(e) => setState(prev => ({ 
                            ...prev, 
                            selectedAspectRatio: e.target.value 
                          }))}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                        >
                          {VIDEO_ASPECT_RATIOS.map((ratio) => (
                            <option key={ratio.value} value={ratio.value}>
                              {ratio.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Duración (segundos)
                        </label>
                        <input
                          type="range"
                          min="3"
                          max={usageStatus?.limits.maxDuration || 10}
                          value={state.selectedDuration}
                          onChange={(e) => setState(prev => ({ 
                            ...prev, 
                            selectedDuration: parseInt(e.target.value) 
                          }))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>3s</span>
                          <span>{state.selectedDuration}s</span>
                          <span>{usageStatus?.limits.maxDuration || 10}s</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={generateVideo}
                disabled={!canGenerate() || !state.prompt.trim()}
                className={`w-full py-4 rounded-lg font-medium transition-all ${
                  canGenerate() && state.prompt.trim()
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {state.isGenerating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generando Video...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Generar Video</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Videos History */}
          {generatedVideos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Videos Generados</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-600' : 'hover:bg-white/10'} transition-colors`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-600' : 'hover:bg-white/10'} transition-colors`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {generatedVideos.length} videos
                  </span>
                </div>
              </div>

              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {generatedVideos.map((video) => (
                  <div key={video.id} className={`bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all ${viewMode === 'list' ? 'flex' : ''}`}>
                    {/* Video Player */}
                    <div className={`${viewMode === 'grid' ? 'aspect-video' : 'w-48 h-32'} bg-black relative flex-shrink-0`}>
                      {video.status === 'generating' ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-2" />
                            <p className="text-white text-sm">Generando...</p>
                          </div>
                        </div>
                      ) : video.status === 'failed' ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                            <p className="text-red-400 text-sm">Error</p>
                          </div>
                        </div>
                      ) : video.videoUrl ? (
                        <video
                          ref={(el) => {
                            if (el) {
                              videoRefs.current[video.id] = el;
                            }
                          }}
                          src={video.videoUrl}
                          className="w-full h-full object-cover"
                          controls
                          preload="metadata"
                          poster={video.thumbnailUrl}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Video className="w-8 h-8 text-gray-400" />
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-2 left-2">
                        {video.status === 'completed' && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                        {video.status === 'generating' && (
                          <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                        )}
                        {video.status === 'failed' && (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>

                      {/* Duration Badge */}
                      <div className="absolute bottom-2 right-2 bg-black/75 px-2 py-1 rounded text-white text-xs">
                        {video.duration}s
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <p className="text-white text-sm mb-2 line-clamp-2">
                        {video.prompt}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <span>{video.model}</span>
                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {video.videoUrl && video.status === 'completed' && (
                          <>
                            <button
                              onClick={() => downloadVideo(video)}
                              className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
                              title="Descargar"
                            >
                              <Download className="w-4 h-4 text-white" />
                            </button>
                            
                            <button
                              onClick={() => shareVideo(video)}
                              className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
                              title="Compartir"
                            >
                              <Share2 className="w-4 h-4 text-white" />
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => copyPrompt(video.prompt)}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
                          title="Copiar prompt"
                        >
                          <Copy className="w-4 h-4 text-white" />
                        </button>

                        <button
                          onClick={() => deleteVideo(video.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded transition-colors ml-auto"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VideosPage() {
  return (
    <ProtectedRoute>
      <VideoPage />
    </ProtectedRoute>
  );
}