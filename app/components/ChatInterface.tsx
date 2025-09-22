'use client';

import { useState, useRef, useEffect, memo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { 
  Send, 
  Loader2, 
  Copy, 
  RefreshCw, 
  Menu,
  Settings,
  Plus,
  MessageCircle,
  X,
  ImageIcon,
  Sparkles,
  Mic,
  MicOff,
  Brain,
  Search,
  User,
  Bot,
  FileText,
  Upload,
  Video,
  Globe,
  AlertTriangle,
  Wifi,
  WifiOff,
  UserCircle,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../contexts/ConversationContext';
import { useRouter } from 'next/navigation';
import { cloudFunctions, helpers } from '../lib/firebase';
import { ChatMessage, PlanType, isValidPlan, SpecialtyType } from '../lib/types';
import toast from 'react-hot-toast';

// ✅ IMPORTAR TUS COMPONENTES EXISTENTES
import SpecialistModeSelector from './SpecialistModeSelector';
import SpecialistChatInterface from './SpecialistChatInterface';

// Declaraciones globales para Speech Recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

// Lazy loading para componentes pesados
const ConversationList = dynamic(() => import('./ConversationList'), {
  loading: () => <div className="w-80 h-full bg-gray-900 animate-pulse" />,
  ssr: false
});

const SettingsMenu = dynamic(() => import('./SettingsMenu'), {
  loading: () => <div className="w-96 h-full bg-gray-900 animate-pulse" />,
  ssr: false
});

const ImageGenerator = dynamic(() => import('./ImageGenerator'), {
  loading: () => <div className="bg-gray-800 rounded-xl p-4 animate-pulse h-48" />,
  ssr: false
});

const VideoGenerator = dynamic(() => import('./VideoGenerator'), {
  loading: () => <div className="bg-gray-800 rounded-xl p-4 animate-pulse h-48" />,
  ssr: false
});

// ✅ Background Video con mayor visibilidad y efectos
const VideoBackground = memo(function VideoBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video 
        className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105"
        style={{ objectPosition: 'center 30%' }}
        autoPlay 
        muted 
        loop 
        playsInline
        preload="metadata"
      >
        <source src="/images/fondo-nora-tres.mp4" type="video/mp4" />
        <source src="/fondo.webm" type="video/webm" />
      </video>
      
      {/* Overlay gradients más sutiles para mayor visibilidad del video */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-20" />
      
      {/* Efectos adicionales de movimiento */}
      <div className="absolute inset-0 z-30">
        {/* Partículas flotantes animadas */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-purple-400/40 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-400/20 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '5s' }} />
        <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }} />
        
        {/* Líneas de movimiento sutil */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/10 to-transparent animate-slide-x" />
          <div className="absolute bottom-32 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/10 to-transparent animate-slide-x-reverse" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Círculos de respiración */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/5 rounded-full animate-breath" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-purple-400/10 rounded-full animate-breath-delayed" />
      </div>
    </div>
  );
});

// ✅ COMPONENTE: Pantalla de bienvenida SIMPLE Y LIMPIA con efectos sutiles
const WelcomeScreen = memo(function WelcomeScreen({ onStartChat }: { onStartChat: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center text-center px-4 relative">
      {/* Efectos de luz sutiles con solo blanco/gris */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-white/3 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gray-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Título principal con sombra sutil */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 tracking-wide animate-fade-up drop-shadow-2xl" 
            style={{ 
              fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif',
              textShadow: '0 0 40px rgba(255, 255, 255, 0.1), 0 0 80px rgba(255, 255, 255, 0.05)'
            }}>
          Bienvenido a Nora
        </h1>

        {/* Subtítulo con glow sutil */}
        <p className="text-xl md:text-2xl text-white/90 mb-12 animate-fade-up leading-relaxed font-light drop-shadow-lg" 
           style={{ 
             animationDelay: '0.5s',
             textShadow: '0 0 20px rgba(255, 255, 255, 0.08)'
           }}>
          ¿En qué puedo ayudarte el día de hoy?
        </p>

        {/* Botón de empezar conversación con efectos de luz */}
        <div className="animate-fade-up" style={{ animationDelay: '1s' }}>
          <button
            onClick={onStartChat}
            className="relative px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-light hover:bg-white/15 hover:border-white/30 transition-all duration-300 text-lg shadow-2xl hover:shadow-white/20"
            style={{
              boxShadow: '0 0 30px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Glow interior sutil */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/5 pointer-events-none" />
            <span className="relative z-10">Empezar conversación</span>
          </button>
        </div>
      </div>
    </div>
  );
});

// ✅ COMPONENTE: Indicador de búsqueda web
const WebSearchIndicator = ({ message }: { message: ChatMessage }) => {
  if (!message.searchUsed && !message.limitReached) return null;

  return (
    <div className="flex items-center gap-2 mb-2 text-xs">
      {message.searchUsed && !message.limitReached && (
        <div className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
          <Search className="w-3 h-3" />
          <span>Información actualizada de internet</span>
          {message.searchResults && (
            <span className="text-gray-400">
              ({message.searchResults.results.length} fuentes)
            </span>
          )}
        </div>
      )}
      
      {message.limitReached && (
        <div className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
          <AlertTriangle className="w-3 h-3" />
          <span>Límite de búsquedas web alcanzado</span>
        </div>
      )}
    </div>
  );
};

// ✅ COMPONENTE: Límites de búsqueda web
const WebSearchLimits = ({ userProfile }: { userProfile: any }) => {
  const webSearchesUsed = userProfile?.usage?.monthly?.webSearchesUsed || 0;
  const webSearchesLimit = userProfile?.usage?.monthly?.webSearchesLimit || 0;
  const webSearchesRemaining = userProfile?.usage?.monthly?.webSearchesRemaining || 0;
  
  if (!userProfile?.limits?.webSearchEnabled) return null;

  const percentage = webSearchesLimit > 0 ? (webSearchesUsed / webSearchesLimit) * 100 : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = webSearchesRemaining === 0;

  return (
    <div className="px-4 py-2 border-t border-gray-700">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Globe className="w-3 h-3 text-blue-400" />
          <span className="text-gray-400">Búsquedas web</span>
        </div>
        <div className={`font-medium ${
          isAtLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-green-400'
        }`}>
          {webSearchesUsed.toLocaleString()}/{webSearchesLimit.toLocaleString()}
        </div>
      </div>
      
      {/* Barra de progreso */}
      <div className="mt-1 w-full bg-gray-700 rounded-full h-1">
        <div 
          className={`h-1 rounded-full transition-all duration-300 ${
            isAtLimit ? 'bg-red-400' : isNearLimit ? 'bg-yellow-400' : 'bg-green-400'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {/* Mensaje de estado */}
      {(isNearLimit || isAtLimit) && (
        <div className={`mt-1 text-xs ${isAtLimit ? 'text-red-400' : 'text-yellow-400'}`}>
          {isAtLimit 
            ? `Límite agotado - ${userProfile.planInfo.displayName}` 
            : `${webSearchesRemaining} búsquedas restantes`
          }
        </div>
      )}
    </div>
  );
};

const ChatInterface = memo(function ChatInterface() {
  const { userProfile, refreshProfile, plan, user } = useAuth();
  const { 
    currentConversation, 
    startNewConversation, 
    addMessage,
    updateConversationTitle,
    isLoading: conversationsLoading 
  } = useConversations();
  const router = useRouter();
  
  // Estados existentes - TU FUNCIONALIDAD COMPLETA
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVideoBackground, setShowVideoBackground] = useState(true);
  const [showConversationList, setShowConversationList] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [showVideoGenerator, setShowVideoGenerator] = useState(false);
  const [pendingImageGeneration, setPendingImageGeneration] = useState(false);

  // Estados para voz
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [voiceText, setVoiceText] = useState('');
  const [showVoiceText, setShowVoiceText] = useState(false);

  // Estados para pensamiento extendido - TUS FUNCIONES
  const [deepThinkingMode, setDeepThinkingMode] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [reportMode, setReportMode] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // ✅ ESTADOS PARA TUS COMPONENTES ESPECIALISTAS EXISTENTES
  const [currentMode, setCurrentMode] = useState<'normal' | 'developer' | 'specialist'>('normal');
  const [currentSpecialty, setCurrentSpecialty] = useState<SpecialtyType | undefined>();

  // ✅ ESTADO PARA BÚSQUEDA WEB MANUAL
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = currentConversation?.messages || [];
  const validPlan: PlanType = isValidPlan(plan) ? plan : 'free';

  // ✅ FUNCIONES DE MICRÓFONO MEJORADAS - TUS FUNCIONES EXISTENTES
  const checkMicrophoneSupport = (): boolean => {
    return !!(
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition))
    );
  };

  const checkMicrophonePermissions = async (): Promise<boolean> => {
    try {
      if ('permissions' in navigator && navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        return permissionStatus.state === 'granted';
      }
      return true;
    } catch (error) {
      console.log('Cannot check microphone permissions:', error);
      return true;
    }
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error: any) {
      console.error('Error requesting microphone permission:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('❌ Permisos del micrófono denegados. Por favor permite el acceso en la configuración del navegador.');
      } else if (error.name === 'NotFoundError') {
        toast.error('❌ No se encontró micrófono. Verifica que tengas un micrófono conectado.');
      } else if (error.name === 'NotSupportedError') {
        toast.error('❌ El micrófono no es compatible con este navegador.');
      } else {
        toast.error('❌ Error accediendo al micrófono. Revisa la configuración de tu navegador.');
      }
      
      return false;
    }
  };

  const initializeSpeechRecognition = (): any => {
    if (typeof window === 'undefined') return null;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error('❌ Reconocimiento de voz no disponible en este navegador.');
      return null;
    }

    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = 'es-ES';
    recognitionInstance.maxAlternatives = 1;
    
    if ('webkitSpeechRecognition' in window) {
      recognitionInstance.webkitServicePath = '/speech-api/v1/recognize';
    }

    return recognitionInstance;
  };

  const startVoiceRecording = async () => {
    if (!checkMicrophoneSupport()) {
      toast.error('❌ Tu navegador no soporta reconocimiento de voz.');
      return;
    }

    if (!recognition) {
      toast.error('❌ Reconocimiento de voz no disponible. Recarga la página.');
      return;
    }

    try {
      const hasPermission = await checkMicrophonePermissions();
      
      if (!hasPermission) {
        const permissionGranted = await requestMicrophonePermission();
        if (!permissionGranted) {
          return;
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        toast.error('❌ No se pudo acceder al micrófono.');
        return;
      }

      setIsRecording(true);
      recognition.start();
      
      toast.success('🎤 Grabando... Habla ahora', {
        duration: 2000,
        icon: '🎤'
      });

      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
      }, 100);

    } catch (error: any) {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
      
      if (error.name === 'NotAllowedError') {
        toast.error('❌ Permisos del micrófono denegados. Ve a la configuración del navegador y permite el acceso al micrófono para este sitio.');
      } else if (error.name === 'NotFoundError') {
        toast.error('❌ No se encontró micrófono. Verifica que tengas un micrófono conectado y funcionando.');
      } else if (error.name === 'NotReadableError') {
        toast.error('❌ El micrófono está siendo usado por otra aplicación. Cierra otras aplicaciones que puedan estar usando el micrófono.');
      } else if (error.name === 'OverconstrainedError') {
        toast.error('❌ Configuración de micrófono no compatible. Intenta con otro micrófono.');
      } else if (error.name === 'SecurityError') {
        toast.error('❌ Error de seguridad. Asegúrate de estar usando HTTPS.');
      } else {
        toast.error(`❌ Error accediendo al micrófono: ${error.message || 'Error desconocido'}`);
      }
    }
  };

  const stopVoiceRecording = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    setIsRecording(false);
    toast.success('🛑 Grabación detenida');
  };

  // ✅ FUNCIÓN CORREGIDA - ENVIAR PDF COMPLETO AL BACKEND
  const processFileContent = async (file: File): Promise<string> => {
    console.log('Procesando archivo:', file.name, file.type, Math.round(file.size/1024) + 'KB');
    
    return new Promise(async (resolve) => {
      if (file.type === 'application/pdf') {
        try {
          // Convertir PDF a base64 para enviar al backend
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result.split(',')[1]); // Quitar prefijo data:application/pdf;base64,
            };
            reader.readAsDataURL(file);
          });
          
          // ✅ CAMBIO CRÍTICO: ENVIAR EL BASE64 COMPLETO, NO SOLO 100 CARACTERES
          const pdfData = `[PDF PARA PROCESAR EN BACKEND]: ${file.name}
Tamaño: ${Math.round(file.size / 1024)} KB
Base64: ${base64}

INSTRUCCIÓN PARA EL BACKEND: Este es un PDF en base64. Extrae el texto completo y analízalo para responder la pregunta del usuario.`;
          
          console.log('PDF convertido a base64 para backend - Longitud:', base64.length);
          resolve(pdfData);
          
        } catch (error) {
          console.error('Error procesando PDF:', error);
          resolve(`[ARCHIVO PDF]: ${file.name}
Tamaño: ${Math.round(file.size / 1024)} KB
Estado: Error procesando archivo

INSTRUCCIÓN: Informa al usuario que se detectó el PDF pero hubo un error procesándolo.`);
        }
      } else if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
        // Archivos de texto
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          resolve(typeof result === 'string' ? 
            `[ARCHIVO DE TEXTO]: ${file.name}\n\nContenido:\n${result}` : 
            `[ARCHIVO]: ${file.name} - Error leyendo`);
        };
        reader.onerror = () => resolve(`[ARCHIVO]: ${file.name} - Error`);
        reader.readAsText(file);
      } else {
        // Otros archivos
        resolve(`[ARCHIVO]: ${file.name}\nTipo: ${file.type}\nTamaño: ${Math.round(file.size / 1024)} KB`);
      }
    });
  };

  // Todos los efectos existentes - MANTENER EXACTO
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod'];
      return mobileKeywords.some(keyword => userAgent.includes(keyword)) || 
             window.innerWidth <= 768;
    };

    const checkOrientation = () => {
      setIsLandscape(window.innerHeight < window.innerWidth && window.innerHeight < 600);
    };

    setIsMobile(checkMobile());
    checkOrientation();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = isMobile ? 100 : 120;
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, maxHeight) + 'px';
    }
  }, [input, isMobile]);

  // ✅ USEEFFECT MEJORADO PARA SPEECH RECOGNITION
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const recognitionInstance = initializeSpeechRecognition();
    
    if (recognitionInstance) {
      recognitionInstance.onresult = (event: any) => {
        try {
          const transcript = event.results[0][0].transcript;
          const confidence = event.results[0][0].confidence;
          
          console.log(`Speech recognition result: "${transcript}" (confidence: ${confidence})`);
          
          if (transcript && transcript.trim().length > 0) {
            setVoiceText(transcript);
            setShowVoiceText(true);
            toast.success(`✅ Texto reconocido: "${transcript.substring(0, 30)}${transcript.length > 30 ? '...' : ''}"`);
          } else {
            toast.error('❌ No se detectó texto. Intenta hablar más claro.');
          }
        } catch (error) {
          console.error('Error processing speech result:', error);
          toast.error('❌ Error procesando el resultado de voz.');
        }
        setIsRecording(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error, event);
        setIsRecording(false);
        
        switch (event.error) {
          case 'no-speech':
            toast.error('❌ No se detectó voz. Intenta hablar más fuerte.');
            break;
          case 'audio-capture':
            toast.error('❌ Error capturando audio. Verifica tu micrófono.');
            break;
          case 'not-allowed':
            toast.error('❌ Permisos denegados. Permite el acceso al micrófono.');
            break;
          case 'network':
            toast.error('❌ Error de red. Verifica tu conexión a internet.');
            break;
          case 'service-not-allowed':
            toast.error('❌ Servicio de reconocimiento no permitido en este sitio.');
            break;
          case 'bad-grammar':
            toast.error('❌ Error en la gramática del reconocimiento.');
            break;
          case 'language-not-supported':
            toast.error('❌ Idioma no soportado.');
            break;
          default:
            toast.error(`❌ Error de reconocimiento: ${event.error}`);
        }
      };

      recognitionInstance.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
      };

      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.abort();
        } catch (error) {
          console.log('Error during recognition cleanup:', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setShowToolsMenu(false);
    if (showToolsMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
    
    return () => {
      // Cleanup si es necesario
    };
  }, [showToolsMenu]);

  // TUS FUNCIONES ORIGINALES - COMPLETAS
  const shouldShowUpgradeWarning = () => {
    if (!userProfile || validPlan !== 'free') return false;
    const tokensUsed = userProfile.usage.daily.tokensUsed;
    const tokensLimit = userProfile.usage.daily.tokensLimit;
    const percentage = helpers.getUsagePercentage(tokensUsed, tokensLimit);
    return percentage >= 90;
  };

  // ✅ FUNCIÓN: Manejar inicio de chat con animación
  const handleStartChat = useCallback(() => {
    setIsTransitioning(true);
    
    // Animación de desplazamiento tipo cortina
    setTimeout(() => {
      setChatStarted(true);
      setShowVideoBackground(false);
      setIsTransitioning(false);
      if (!currentConversation) {
        startNewConversation();
      }
    }, 800);
  }, [currentConversation, startNewConversation]);

  // ✅ FUNCIÓN PARA MANEJAR NUEVOS MENSAJES DE ESPECIALISTAS
  const handleNewMessage = (message: ChatMessage) => {
    addMessage(message);
    if (!currentConversation) {
      startNewConversation();
    }
  };

  // ✅ FUNCIÓN PARA MANEJAR CAMBIOS DE MODO
  const handleModeChange = (mode: 'normal' | 'developer' | 'specialist', specialty?: SpecialtyType) => {
    setCurrentMode(mode);
    setCurrentSpecialty(specialty);
  };

  // ✅ NUEVA FUNCIÓN PARA TOGGLE DE BÚSQUEDA WEB
  const toggleWebSearch = () => {
    setWebSearchEnabled(!webSearchEnabled);
    toast.success(
      !webSearchEnabled 
        ? '🔍 Búsqueda web activada - Las consultas buscarán información actualizada' 
        : '🚫 Búsqueda web desactivada - Respuestas basadas en conocimiento interno'
    );
  };

  // ✅ TU FUNCIÓN SENDMESSAGE ACTUALIZADA CON BÚSQUEDA WEB MANUAL
  const sendMessage = async () => {
    // Permitir envío si hay archivos aunque no haya texto
    const hasContent = input.trim() || uploadedFiles.length > 0;
    
    if (!hasContent || isLoading || shouldShowUpgradeWarning()) return;

    const messageText = input.trim() || "Analiza los archivos adjuntos";
    setInput('');

    if (!currentConversation) {
      startNewConversation();
    }

    const workingConversation = currentConversation || {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user?.uid || '',
      title: 'Nueva conversación',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      isArchived: false,
      tags: []
    };

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      type: 'user',
      message: messageText,
      timestamp: new Date(),
      tokensUsed: 0,
      conversationId: workingConversation.id
    };

    const updatedConversation = {
      ...workingConversation,
      messages: [...workingConversation.messages, userMessage],
      updatedAt: new Date()
    };

    setTimeout(() => addMessage(userMessage), 100);

    if (workingConversation.messages.length === 0) {
      const generateTitle = (message: string): string => {
        const cleanMessage = message.trim();
        if (cleanMessage.length <= 20) return cleanMessage;
        const cutPoint = cleanMessage.lastIndexOf(' ', 19);
        return cleanMessage.substring(0, cutPoint > 10 ? cutPoint : 20);
      };
      const newTitle = generateTitle(messageText);
      updateConversationTitle(updatedConversation.id, newTitle);
    }

    setIsLoading(true);

    try {
      const recentMessages = updatedConversation.messages.slice(-6);
      
      let processedMessage = messageText;
      if (reportMode) {
        processedMessage = `Genera un reporte completo y detallado sobre: ${messageText}. Incluye análisis profundo, datos relevantes y conclusiones.`;
      } else if (deepThinkingMode) {
        processedMessage = `Analiza de forma exhaustiva: ${messageText}`;
      }
      
      // Procesar archivos subidos con debugging mejorado
      let fileContext = '';
      if (uploadedFiles.length > 0) {
        console.log('📁 Iniciando procesamiento de', uploadedFiles.length, 'archivo(s)');
        toast.loading(`Procesando ${uploadedFiles.length} archivo(s)...`, { id: 'processing-files' });
        
        try {
          const fileContents = await Promise.all(
            uploadedFiles.map(async (file, index) => {
              console.log(`📄 Procesando archivo ${index + 1}/${uploadedFiles.length}:`, file.name);
              const content = await processFileContent(file);
              return `\n\n--- ARCHIVO ${index + 1}: ${file.name} ---\n${content}\n--- FIN ARCHIVO ${index + 1} ---\n`;
            })
          );
          
          fileContext = fileContents.join('\n');
          console.log('✅ Todos los archivos procesados. Contexto total length:', fileContext.length);
          toast.dismiss('processing-files');
          toast.success(`${uploadedFiles.length} archivo(s) procesados correctamente`);
        } catch (fileError) {
          console.error('❌ Error procesando archivos:', fileError);
          toast.dismiss('processing-files');
          toast.error('Error procesando algunos archivos, pero se intentará enviar');
          fileContext = `Error procesando archivos: ${uploadedFiles.map(f => f.name).join(', ')}`;
        }
      }
      
      // ✅ MODIFICADO: Incluir enableWebSearch en el input
      const inputData = {
        message: processedMessage,
        fileContext,
        chatHistory: recentMessages.slice(0, -1),
        maxTokens: validPlan === 'free' ? 150 : validPlan === 'pro' ? 500 : 1000,
        enableWebSearch: webSearchEnabled // ✅ NUEVO PARÁMETRO
      };

      console.log('🚀 Enviando datos al backend:', {
        messageLength: processedMessage.length,
        fileContextLength: fileContext.length,
        hasFiles: uploadedFiles.length > 0,
        fileNames: uploadedFiles.map(f => f.name),
        webSearchEnabled: webSearchEnabled // ✅ NUEVO LOG
      });

      console.log('📡 Llamando a cloudFunctions.chatWithAI...');
      const result = await cloudFunctions.chatWithAI(inputData);
      console.log('📡 Respuesta del backend:', result);
      
      if (result?.data?.response) {
        console.log('✅ Respuesta válida recibida:', result.data.response.substring(0, 100) + '...');
        
        // ✅ NUEVO: Mostrar indicadores específicos de búsqueda web
        if (result.data.searchUsed) {
          console.log('🔍 La respuesta incluyó búsqueda en internet');
          if (result.data.limitReached) {
            toast.error('⚠️ Límite de búsquedas web alcanzado - respuesta basada en conocimiento general');
          } else {
            toast.success('🔍 Respuesta con información actualizada de internet');
          }
        }
        
        const aiMessage: ChatMessage = {
          id: `msg_${Date.now()}_ai`,
          type: 'ai',
          message: result.data.response,
          timestamp: new Date(),
          tokensUsed: result.data.tokensUsed,
          conversationId: updatedConversation.id,
          // ✅ NUEVO: Agregar metadata de búsqueda
          searchUsed: result.data.searchUsed || false,
          searchResults: result.data.searchResults,
          limitReached: result.data.limitReached || false
        };

        addMessage(aiMessage);
        await refreshProfile();
        
        console.log('✅ Mensaje enviado exitosamente, limpiando archivos');
        setUploadedFiles([]);
        
        const toastMessage = result.data.searchUsed 
          ? (result.data.limitReached ? 'Respuesta generada (límite de búsquedas alcanzado)' : 'Respuesta con información actualizada')
          : uploadedFiles.length > 0 
            ? 'Respuesta recibida - Archivo analizado'
            : 'Respuesta recibida';
            
        toast.success(toastMessage);
      } else {
        console.error('❌ Respuesta inválida del backend:', result);
        throw new Error(`Sin respuesta válida del servidor. Recibido: ${JSON.stringify(result)}`);
      }
    } catch (error: any) {
      console.error('❌ Error enviando mensaje:', error);
      toast.error('Error al enviar mensaje');
      console.log('⚠️ Manteniendo archivos debido al error');
    } finally {
      setIsLoading(false);
      setReportMode(false);
      toast.dismiss('processing-files');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copiado');
    } catch (error) {
      toast.error('Error al copiar');
    }
  };

  const handleRegenerate = async (index: number): Promise<void> => {
    if (isLoading || index < 0) return;
    
    const messageToRegenerate = messages[index];
    if (messageToRegenerate.type !== 'ai') return;
    
    const userMessage = messages[index - 1];
    if (!userMessage) return;
    
    setIsLoading(true);
    try {
      const recentMessages = messages.slice(0, index - 1);
      
      // ✅ MODIFICADO: Incluir enableWebSearch en regeneración
      const inputData = {
        message: userMessage.message,
        fileContext: '',
        chatHistory: recentMessages,
        maxTokens: validPlan === 'free' ? 150 : validPlan === 'pro' ? 500 : 1000,
        enableWebSearch: webSearchEnabled // ✅ NUEVO PARÁMETRO
      };

      const result = await cloudFunctions.chatWithAI(inputData);
      
      if (result.data?.response) {
        const aiMessage: ChatMessage = {
          id: `msg_${Date.now()}_ai_regen`,
          type: 'ai',
          message: result.data.response,
          timestamp: new Date(),
          tokensUsed: result.data.tokensUsed,
          conversationId: currentConversation?.id || '',
          // ✅ NUEVO: Agregar metadata de búsqueda para regeneración
          searchUsed: result.data.searchUsed || false,
          searchResults: result.data.searchResults,
          limitReached: result.data.limitReached || false
        };

        addMessage(aiMessage);
        await refreshProfile();
        toast.success('Mensaje regenerado');
      } else {
        throw new Error('Sin respuesta');
      }
    } catch (error: any) {
      console.error('Error regenerating message:', error);
      toast.error('Error al regenerar mensaje');
    } finally {
      setIsLoading(false);
    }
    
    return;
  };

  const confirmVoiceText = () => {
    setInput(voiceText);
    setShowVoiceText(false);
    setVoiceText('');
  };

  const cancelVoiceText = () => {
    setShowVoiceText(false);
    setVoiceText('');
  };

  // TUS FUNCIONES PRINCIPALES ORIGINALES
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('📁 Archivos subidos:', files.map(f => ({name: f.name, type: f.type, size: f.size})));
    setUploadedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} archivo(s) agregado(s)`);
    setShowToolsMenu(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const removedFile = uploadedFiles[index];
    console.log('🗑️ Removiendo archivo:', removedFile?.name);
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleReportMode = () => {
    setReportMode(!reportMode);
    setShowToolsMenu(false);
    if (!reportMode) {
      toast.success('Modo reporte activado');
    }
  };

  const toggleDeepSearch = () => {
    setDeepThinkingMode(!deepThinkingMode);
    setShowToolsMenu(false);
    if (!deepThinkingMode) {
      toast.success('Deep Search activado');
    }
  };

  const toggleImageGenerator = () => {
    setShowImageGenerator(!showImageGenerator);
    setShowToolsMenu(false);
  };

  const toggleVideoGenerator = () => {
    setShowVideoGenerator(!showVideoGenerator);
    setShowToolsMenu(false);
  };

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="h-screen bg-black text-white overflow-hidden relative">
      {/* TU VIDEO DE FONDO MEJORADO */}
      {showVideoBackground && <VideoBackground />}
      
      {/* Overlay de transición */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] bg-black animate-slide-right" />
      )}
      
      {/* ✅ NAVEGACIÓN SUPERIOR REDISEÑADA - HEADER QUE SE DESPLAZA */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800 transition-all duration-300 ${
        showConversationList && !isMobile ? 'ml-80' : ''
      }`}>
        <div className="flex items-center justify-between px-6 py-4">
          {/* ✅ Logo separado con hamburguesa estilo gota de agua */}
          <div className="flex items-center space-x-8">
            {/* ✅ Menú hamburguesa estilo gota de agua como iOS */}
            <button
              onClick={() => setShowConversationList(!showConversationList)}
              className="group transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/10"
            >
              <div className="flex flex-col space-y-1">
                <div className={`h-0.5 bg-gray-400 rounded-full transition-all duration-300 ${showConversationList ? 'w-4 rotate-45 translate-y-1.5' : 'w-6'}`} />
                <div className={`h-0.5 bg-gray-400 rounded-full transition-all duration-300 ${showConversationList ? 'w-0' : 'w-4'}`} />
                <div className={`h-0.5 bg-gray-400 rounded-full transition-all duration-300 ${showConversationList ? 'w-4 -rotate-45 -translate-y-1.5' : 'w-6'}`} />
              </div>
            </button>
            
            {/* ✅ Logo de NORA más separado */}
            <div className="flex items-center">
              <Image 
                src="/images/nora.png" 
                alt="NORA Logo" 
                width={50}
                height={50}
                className="hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
          </div>

          {/* ✅ Icono de perfil MÁS DELGADO con hover scale */}
          <div className="flex items-center">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="group transition-transform duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/10"
            >
              <UserCircle className="w-6 h-6 text-gray-400 stroke-1" />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ SIDEBARS SIN NEBLINA - CHAT SIGUE VISIBLE */}
      {showConversationList && (
        <div className={`fixed inset-0 z-40 flex transition-all duration-300 ${isMobile ? '' : 'transform'}`}>
          <div className={`w-80 transition-transform duration-300 ${showConversationList ? 'translate-x-0' : '-translate-x-full'}`}>
            <ConversationList 
              isOpen={showConversationList}
              onClose={() => setShowConversationList(false)}
              onNewConversation={() => {
                startNewConversation();
                setShowConversationList(false);
              }}
            />
          </div>
          {/* ✅ SIN NEBLINA EN DESKTOP - CHAT SIGUE VISIBLE */}
          {isMobile && (
            <div 
              className="flex-1 bg-black/50 backdrop-blur-sm" 
              onClick={() => setShowConversationList(false)}
            />
          )}
        </div>
      )}

      {showSettingsMenu && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div 
            className="flex-1 bg-black/50 backdrop-blur-sm" 
            onClick={() => setShowSettingsMenu(false)}
          />
          {/* ✅ SETTINGS MENU QUE SE DESPLAZA CON HEADER */}
          <div className={`w-96 transition-all duration-300 ${
            showConversationList && !isMobile ? 'mr-80' : ''
          }`}>
            <SettingsMenu 
              isOpen={showSettingsMenu}
              onClose={() => setShowSettingsMenu(false)} 
            />
            {userProfile && <WebSearchLimits userProfile={userProfile} />}
          </div>
        </div>
      )}

      {/* TUS GENERADORES ORIGINALES */}
      {showImageGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto">
            <button
              onClick={() => setShowImageGenerator(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <ImageGenerator />
          </div>
        </div>
      )}

      {showVideoGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-auto">
            <button
              onClick={() => setShowVideoGenerator(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <VideoGenerator />
          </div>
        </div>
      )}

      {/* Chat principal */}
      <div className={`h-full flex flex-col pt-20 relative z-10 transition-all duration-300 ${
        showConversationList && !isMobile ? 'ml-80' : ''
      }`}>
        {!chatStarted && !currentConversation?.messages.length ? (
          // ✅ Pantalla de bienvenida rediseñada
          <WelcomeScreen onStartChat={handleStartChat} />
        ) : (
          // Chat activo
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* TU SELECTOR DE MODO ESPECIALISTA EXISTENTE */}
            <div className="px-6 py-3 border-b border-gray-800">
              <SpecialistModeSelector
                userProfile={userProfile!}
                currentMode={currentMode}
                currentSpecialty={currentSpecialty}
                onModeChange={handleModeChange}
              />
            </div>

            {/* DECIDIR QUÉ INTERFAZ DE CHAT USAR */}
            {currentMode === 'normal' ? (
              // TU CHAT NORMAL ORIGINAL CON BÚSQUEDA WEB
              <>
                {/* ✅ MENSAJES MÁS COMPACTOS Y MENOS GORDITOS */}
                <div className="flex-1 overflow-y-auto px-4 py-4 max-w-4xl mx-auto">
                  {messages.map((message: ChatMessage, index: number) => (
                    <div key={message.id} className="mb-4 group">
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                          {message.type === 'user' ? (
                            <User className="w-3 h-3 text-white" />
                          ) : (
                            <Bot className="w-3 h-3 text-white" />
                          )}
                        </div>

                        <div className={`flex-1 max-w-3xl ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                          {/* ✅ INDICADOR DE BÚSQUEDA WEB */}
                          {message.type === 'ai' && (
                            <WebSearchIndicator message={message} />
                          )}
                          
                          <div className={`inline-block p-3 rounded-2xl ${
                            message.type === 'user'
                              ? 'bg-gray-800 text-white max-w-md'
                              : 'bg-gray-900 text-white max-w-2xl'
                          }`}>
                            <div className="whitespace-pre-wrap leading-relaxed text-sm">
                              {message.message}
                            </div>

                            {message.type === 'ai' && (
                              <div className="mt-2 pt-2 border-t border-gray-700">
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleCopy(message.message)}
                                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                                    title="Copiar"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleRegenerate(index)}
                                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                                    title="Regenerar"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Indicador de carga */}
                  {isLoading && (
                    <div className="mb-6 flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-900 rounded-xl p-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                            <span className="text-gray-400 text-sm">
                              {deepThinkingMode || reportMode ? 'Analizando profundamente...' : 
                               webSearchEnabled ? 'Buscando información actualizada...' : 'Escribiendo...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* TU TEXTO DE VOZ ORIGINAL */}
                {showVoiceText && (
                  <div className="px-6 py-4 border-t border-gray-800">
                    <div className="bg-gray-800 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Texto detectado:</span>
                        <button
                          onClick={cancelVoiceText}
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-white mb-3">{voiceText}</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={confirmVoiceText}
                          className="px-3 py-1 bg-white text-black rounded-lg text-sm"
                        >
                          Usar texto
                        </button>
                        <button
                          onClick={cancelVoiceText}
                          className="px-3 py-1 bg-gray-700 text-white rounded-lg text-sm"
                        >
                          Descartar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TU ÁREA DE INPUT ORIGINAL COMPLETA MÁS DELGADA */}
                <div className="px-6 pb-6">
                  {/* Archivos subidos */}
                  {uploadedFiles.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg px-3 py-1 flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{file.name}</span>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 hover:bg-gray-700 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Aviso de límite */}
                  {shouldShowUpgradeWarning() && (
                    <div className="mb-4 bg-yellow-900/50 border border-yellow-700 rounded-xl p-4">
                      <p className="text-yellow-300 text-sm mb-2">
                        Has alcanzado el 90% de tu límite diario. 
                        Mejora tu plan para continuar.
                      </p>
                      <button
                        onClick={() => router.push('/upgrade')}
                        className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Mejorar plan
                      </button>
                    </div>
                  )}

                  {/* ✅ INDICADORES DE MODO ACTIVO CON BÚSQUEDA WEB */}
                  {(reportMode || deepThinkingMode || webSearchEnabled) && (
                    <div className="mb-4 flex space-x-2">
                      {reportMode && (
                        <div className="bg-blue-900/50 border border-blue-700 rounded-lg px-3 py-1 text-blue-300 text-sm">
                          Modo Reporte
                        </div>
                      )}
                      {deepThinkingMode && (
                        <div className="bg-purple-900/50 border border-purple-700 rounded-lg px-3 py-1 text-purple-300 text-sm">
                          Deep Search
                        </div>
                      )}
                      {webSearchEnabled && (
                        <div className="bg-green-900/50 border border-green-700 rounded-lg px-3 py-1 text-green-300 text-sm">
                          🔍 Búsqueda Web Activada
                        </div>
                      )}
                    </div>
                  )}

                  {/* ✅ ÁREA DE INPUT REDISEÑADA - MÁS DELGADA Y COMPACTA */}
                  <div className="bg-gray-800/30 backdrop-blur-xl rounded-full p-3 border border-gray-700/30 max-w-3xl mx-auto">
                    <div className="flex items-center space-x-3">
                      {/* ✅ MENÚ DE HERRAMIENTAS SIN MARGEN NI FONDO */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowToolsMenu(!showToolsMenu);
                          }}
                          className="hover:bg-gray-700/30 rounded-full p-1 transition-colors"
                          title="Herramientas"
                        >
                          <Plus className={`w-5 h-5 text-gray-400 transition-transform ${showToolsMenu ? 'rotate-45' : ''}`} />
                        </button>

                        {/* MENÚ DESPLEGABLE */}
                        {showToolsMenu && (
                          <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 w-48">
                            <button
                              onClick={toggleImageGenerator}
                              className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 text-left"
                            >
                              <ImageIcon className="w-4 h-4" />
                              <span className="text-sm">Generar imagen</span>
                            </button>
                            
                            <button
                              onClick={toggleVideoGenerator}
                              className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 text-left"
                            >
                              <Video className="w-4 h-4" />
                              <span className="text-sm">Generar video</span>
                              {plan === 'free' && (
                                <span className="text-xs bg-yellow-600 px-1 rounded">Pro</span>
                              )}
                            </button>
                            
                            <button
                              onClick={toggleDeepSearch}
                              className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 text-left"
                            >
                              <Brain className="w-4 h-4" />
                              <span className="text-sm">Deep Search</span>
                            </button>
                            
                            <button
                              onClick={toggleReportMode}
                              className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 text-left"
                            >
                              <FileText className="w-4 h-4" />
                              <span className="text-sm">Generar reporte</span>
                            </button>

                            {/* BOTÓN DE BÚSQUEDA WEB EN EL MENÚ */}
                            <button
                              onClick={toggleWebSearch}
                              className={`w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 text-left ${
                                webSearchEnabled ? 'text-green-400' : 'text-gray-300'
                              }`}
                            >
                              {webSearchEnabled ? (
                                <Wifi className="w-4 h-4" />
                              ) : (
                                <WifiOff className="w-4 h-4" />
                              )}
                              <span className="text-sm">
                                {webSearchEnabled ? 'Desactivar búsqueda' : 'Activar búsqueda web'}
                              </span>
                            </button>
                            
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 text-left"
                            >
                              <Upload className="w-4 h-4" />
                              <span className="text-sm">Subir archivos</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* ✅ TEXTAREA MÁS COMPACTA */}
                      <div className="flex-1 relative">
                        <textarea
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyPress}
                          placeholder={
                            shouldShowUpgradeWarning() 
                              ? "Mejora tu plan para continuar..." 
                              : webSearchEnabled 
                                ? "Escribe tu mensaje (búsqueda web activada)..." 
                                : "Escribe tu mensaje..."
                          }
                          disabled={isLoading || shouldShowUpgradeWarning()}
                          className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none leading-relaxed min-h-[32px] max-h-20 py-1 text-sm"
                        />
                      </div>

                      {/* ✅ MICRÓFONO SIN MARGEN NI FONDO */}
                      <button
                        onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                        disabled={shouldShowUpgradeWarning()}
                        className={`hover:bg-gray-700/30 rounded-full p-1 transition-colors ${
                          isRecording ? 'text-red-400' : 'text-gray-400'
                        }`}
                        title={isRecording ? "Detener" : "Grabar"}
                      >
                        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>

                      {/* ✅ BOTÓN DE ENVÍO CON ESTILO */}
                      <button
                        onClick={sendMessage}
                        disabled={isLoading || (!input.trim() && uploadedFiles.length === 0) || shouldShowUpgradeWarning()}
                        className={`p-2 rounded-full transition-all duration-300 ${
                          (input.trim() || uploadedFiles.length > 0) && !isLoading && !shouldShowUpgradeWarning()
                            ? webSearchEnabled 
                              ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg' 
                              : 'bg-white text-black hover:bg-gray-200 shadow-lg'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                        title={webSearchEnabled ? "Enviar con búsqueda web" : "Enviar"}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // TUS COMPONENTES ESPECIALISTAS EXISTENTES
              <div className="flex-1 overflow-hidden">
                <SpecialistChatInterface
                  userProfile={userProfile!}
                  currentMode={currentMode}
                  currentSpecialty={currentSpecialty}
                  chatHistory={messages}
                  onNewMessage={handleNewMessage}
                  onError={(error) => toast.error(error)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* TU INPUT OCULTO PARA ARCHIVOS ORIGINAL */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.csv,.xlsx"
      />

      {/* ✅ ESTILOS CSS PARA ANIMACIONES */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lastica:wght@300;400;500;600;700&display=swap');
        
        @keyframes fade-up-slow {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(0px) translateX(10px); }
          75% { transform: translateY(10px) translateX(5px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(10px) translateX(-5px); }
          50% { transform: translateY(0px) translateX(-10px); }
          75% { transform: translateY(-10px) translateX(-5px); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-size: 200% 200%; background-position: left center; }
          50% { background-size: 200% 200%; background-position: right center; }
        }
        
        @keyframes width-expand {
          0% { width: 0; }
          100% { width: 8rem; }
        }
        
        @keyframes typewriter {
          0% { width: 0; }
          100% { width: 100%; }
        }
        
        @keyframes slide-x {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes slide-x-reverse {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        @keyframes breath {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.1; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.3; }
        }
        
        @keyframes breath-delayed {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.05; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.2; }
        }
        
        @keyframes slide-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
        
        .animate-slide-right {
          animation: slide-right 0.8s ease-in-out forwards;
        }
        
        .animate-fade-up-slow { 
          animation: fade-up-slow 1.2s ease-out forwards; 
          opacity: 0; 
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          opacity: 0;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-width-expand {
          animation: width-expand 1.5s ease-out forwards;
        }
        
        .animate-typewriter {
          overflow: hidden;
          white-space: nowrap;
          animation: typewriter 2s steps(40) forwards;
          animation-delay: 0.5s;
          width: 0;
          display: inline-block;
        }
        
        .animate-slide-x {
          animation: slide-x 8s linear infinite;
        }
        
        .animate-slide-x-reverse {
          animation: slide-x-reverse 10s linear infinite;
        }
        
        .animate-breath {
          animation: breath 4s ease-in-out infinite;
        }
        
        .animate-breath-delayed {
          animation: breath-delayed 6s ease-in-out infinite;
          animation-delay: 1s;
        }

        /* Ensure smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1f2937;
        }
        ::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        /* Lastica font fallbacks */
        body {
          font-family: 'Lastica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
});

export default ChatInterface;