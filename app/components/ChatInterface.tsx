// app/components/ChatInterface.tsx - COMPLETO PARTE 1/2
'use client';

import { useState, useRef, useEffect, memo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
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
  Zap,
  Atom
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../contexts/ConversationContext';
import { useRouter } from 'next/navigation';
import { cloudFunctions, helpers } from '../lib/firebase';
import { ChatMessage, PlanType, isValidPlan, SpecialtyType, AdvancedModeType } from '../lib/types';
import toast from 'react-hot-toast';

import SpecialistModeSelector from './SpecialistModeSelector';
import SpecialistChatInterface from './SpecialistChatInterface';
import AdvancedModeSelector from './AdvancedModeSelector';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

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

const MarkdownRenderer = memo(function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        components={{
          p: (props) => <p className="mb-3 leading-relaxed text-gray-100" {...props} />,
          h1: (props) => <h1 className="text-xl font-bold mb-4 text-white border-b border-gray-600 pb-2" {...props} />,
          h2: (props) => <h2 className="text-lg font-bold mb-3 text-white" {...props} />,
          h3: (props) => <h3 className="text-base font-bold mb-2 text-white" {...props} />,
          strong: (props) => <strong className="font-bold text-white" {...props} />,
          em: (props) => <em className="italic text-gray-200" {...props} />,
          ul: (props) => <ul className="list-disc list-inside mb-4 space-y-1 text-gray-100 ml-4" {...props} />,
          ol: (props) => <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-100 ml-4" {...props} />,
          li: (props) => <li className="mb-1 text-gray-100" {...props} />,
          code: (props) => {
            const { className, children, ...rest } = props;
            const isInline = !className;
            return isInline ? (
              <code className="bg-gray-700 px-2 py-1 rounded text-sm text-gray-200 font-mono" {...rest}>{children}</code>
            ) : (
              <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-200 overflow-x-auto my-4">
                <code {...rest}>{children}</code>
              </pre>
            );
          },
          blockquote: (props) => (
            <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-300 mb-4 bg-gray-800/50 py-2 rounded-r-lg" {...props} />
          ),
          a: (props) => (
            <a className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          table: (props) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-gray-600 rounded-lg" {...props} />
            </div>
          ),
          th: (props) => (
            <th className="border border-gray-600 px-4 py-2 bg-gray-700 text-white font-semibold text-left" {...props} />
          ),
          td: (props) => (
            <td className="border border-gray-600 px-4 py-2 text-gray-100" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

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
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-20" />
      
      <div className="absolute inset-0 z-30">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-purple-400/40 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-400/20 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '5s' }} />
        <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }} />
        
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/10 to-transparent animate-slide-x" />
          <div className="absolute bottom-32 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/10 to-transparent animate-slide-x-reverse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/5 rounded-full animate-breath" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-purple-400/10 rounded-full animate-breath-delayed" />
      </div>
    </div>
  );
});

const WelcomeScreen = memo(function WelcomeScreen({ onStartChat }: { onStartChat: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center text-center px-4 relative">
      <div className="max-w-2xl mx-auto relative z-10">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 tracking-wide animate-fade-up drop-shadow-2xl" 
            style={{ 
              fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif',
              textShadow: '0 0 40px rgba(255, 255, 255, 0.1), 0 0 80px rgba(255, 255, 255, 0.05)'
            }}>
          Bienvenido a Nora
        </h1>

        <p className="text-xl md:text-2xl text-white/90 mb-12 animate-fade-up leading-relaxed font-light drop-shadow-lg" 
           style={{ 
             animationDelay: '0.5s',
             textShadow: '0 0 20px rgba(255, 255, 255, 0.08)'
           }}>
          Â¿En quÃ© puedo ayudarte el dÃ­a de hoy?
        </p>

        <div className="animate-fade-up" style={{ animationDelay: '1s' }}>
          <button
            onClick={onStartChat}
            className="relative px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-light hover:bg-white/15 hover:border-white/30 transition-all duration-300 text-lg shadow-2xl hover:shadow-white/20"
            style={{
              boxShadow: '0 0 30px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/5 pointer-events-none" />
            <span className="relative z-10">Empezar conversaciÃ³n</span>
          </button>
        </div>
      </div>
    </div>
  );
});

const WebSearchIndicator = ({ message }: { message: ChatMessage }) => {
  if (!message.searchUsed && !message.limitReached) return null;

  return (
    <div className="flex items-center gap-2 mb-2 text-xs">
      {message.searchUsed && !message.limitReached && (
        <div className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
          <Search className="w-3 h-3" />
          <span>InformaciÃ³n actualizada de internet</span>
          {message.searchResults && (
            <span className="text-gray-400">
              ({message.searchResults.results?.length || 0} fuentes)
            </span>
          )}
        </div>
      )}
      
      {message.limitReached && (
        <div className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
          <AlertTriangle className="w-3 h-3" />
          <span>LÃ­mite de bÃºsquedas web alcanzado</span>
        </div>
      )}
    </div>
  );
};

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
          <span className="text-gray-400">BÃºsquedas web</span>
        </div>
        <div className={`font-medium ${
          isAtLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-green-400'
        }`}>
          {webSearchesUsed.toLocaleString()}/{webSearchesLimit.toLocaleString()}
        </div>
      </div>
      
      <div className="mt-1 w-full bg-gray-700 rounded-full h-1">
        <div 
          className={`h-1 rounded-full transition-all duration-300 ${
            isAtLimit ? 'bg-red-400' : isNearLimit ? 'bg-yellow-400' : 'bg-green-400'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {(isNearLimit || isAtLimit) && (
        <div className={`mt-1 text-xs ${isAtLimit ? 'text-red-400' : 'text-yellow-400'}`}>
          {isAtLimit 
            ? `LÃ­mite agotado - ${userProfile.planInfo?.displayName || 'Plan actual'}` 
            : `${webSearchesRemaining} bÃºsquedas restantes`
          }
        </div>
      )}
    </div>
  );
};

// app/components/ChatInterface.tsx - COMPLETO PARTE 2/2
// CONTINÃšA DESDE PARTE 1...

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

  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [voiceText, setVoiceText] = useState('');
  const [showVoiceText, setShowVoiceText] = useState(false);

  const [deepThinkingMode, setDeepThinkingMode] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [reportMode, setReportMode] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const [currentMode, setCurrentMode] = useState<'normal' | 'developer' | 'specialist'>('normal');
  const [currentSpecialty, setCurrentSpecialty] = useState<SpecialtyType | undefined>();

  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  
  // âœ… ESTADOS DE MODOS AVANZADOS
  const [advancedMode, setAdvancedMode] = useState<AdvancedModeType | null>(null);
  const [showAdvancedModes, setShowAdvancedModes] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = currentConversation?.messages || [];
  console.log('ðŸŽ¨ RENDERIZANDO - Total mensajes:', messages.length, messages.map(m => ({id: m.id, type: m.type})));

  const validPlan: PlanType = isValidPlan(plan) ? plan : 'free';

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
        toast.error('Permisos del micrÃ³fono denegados.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No se encontrÃ³ micrÃ³fono.');
      } else if (error.name === 'NotSupportedError') {
        toast.error('El micrÃ³fono no es compatible con este navegador.');
      } else {
        toast.error('Error accediendo al micrÃ³fono.');
      }
      
      return false;
    }
  };

  const initializeSpeechRecognition = (): any => {
    if (typeof window === 'undefined') return null;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error('Reconocimiento de voz no disponible en este navegador.');
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
      toast.error('Tu navegador no soporta reconocimiento de voz.');
      return;
    }

    if (!recognition) {
      toast.error('Reconocimiento de voz no disponible.');
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
        toast.error('No se pudo acceder al micrÃ³fono.');
        return;
      }

      setIsRecording(true);
      recognition.start();

      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
      }, 100);

    } catch (error: any) {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
      toast.error('Error accediendo al micrÃ³fono.');
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
  };

  const processFileContent = async (file: File): Promise<string> => {
    console.log('Procesando archivo:', file.name, file.type, Math.round(file.size/1024) + 'KB');
    
    return new Promise(async (resolve) => {
      if (file.type === 'application/pdf') {
        try {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result.split(',')[1]);
            };
            reader.readAsDataURL(file);
          });
          
          const pdfData = `[PDF PARA PROCESAR EN BACKEND]: ${file.name}
TamaÃ±o: ${Math.round(file.size / 1024)} KB
Base64: ${base64}

INSTRUCCIÃ“N PARA EL BACKEND: Este es un PDF en base64. Extrae el texto completo y analÃ­zalo para responder la pregunta del usuario.`;
          
          console.log('PDF convertido a base64 para backend - Longitud:', base64.length);
          resolve(pdfData);
          
        } catch (error) {
          console.error('Error procesando PDF:', error);
          resolve(`[ARCHIVO PDF]: ${file.name} - Error procesando archivo`);
        }
      } else if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
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
        resolve(`[ARCHIVO]: ${file.name}\nTipo: ${file.type}\nTamaÃ±o: ${Math.round(file.size / 1024)} KB`);
      }
    });
  };

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
      const maxHeight = isMobile ? 80 : 100;
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, maxHeight) + 'px';
    }
  }, [input, isMobile]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const recognitionInstance = initializeSpeechRecognition();
    
    if (recognitionInstance) {
      recognitionInstance.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('TranscripciÃ³n:', transcript);
        
        try {
          toast.loading('Procesando audio...', { id: 'voice-processing' });
          
          const response = await fetch('/api/process-voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: transcript })
          });

          const data = await response.json();
          
          if (data.processedText) {
            setInput(data.processedText);
            toast.success('Audio procesado', { id: 'voice-processing' });
          } else {
            setInput(transcript);
            toast.dismiss('voice-processing');
          }
        } catch (error) {
          console.error('Error procesando audio:', error);
          setInput(transcript);
          toast.dismiss('voice-processing');
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        switch (event.error) {
          case 'no-speech':
            toast.error('No se detectÃ³ voz.');
            break;
          case 'audio-capture':
            toast.error('Error capturando audio.');
            break;
          case 'not-allowed':
            toast.error('Permisos denegados.');
            break;
          default:
            toast.error(`Error: ${event.error}`);
        }
      };

      recognitionInstance.onstart = () => {
        setIsRecording(true);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.abort();
        } catch (error) {
          console.log('Error during cleanup:', error);
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
    
    return () => {};
  }, [showToolsMenu]);

  const shouldShowUpgradeWarning = () => {
    if (!userProfile || validPlan !== 'free') return false;
    const tokensUsed = userProfile.usage?.daily?.tokensUsed || 0;
    const tokensLimit = userProfile.usage?.daily?.tokensLimit || 0;
    if (tokensLimit === 0) return false;
    const percentage = helpers.getUsagePercentage(tokensUsed, tokensLimit);
    return percentage >= 90;
  };

  const handleStartChat = useCallback(() => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setChatStarted(true);
      setShowVideoBackground(false);
      setIsTransitioning(false);
      if (!currentConversation) {
        startNewConversation();
      }
    }, 800);
  }, [currentConversation, startNewConversation]);

  const handleNewMessage = (message: ChatMessage) => {
    addMessage(message);
    if (!currentConversation) {
      startNewConversation();
    }
  };

  const handleModeChange = (mode: 'normal' | 'developer' | 'specialist', specialty?: SpecialtyType) => {
    setCurrentMode(mode);
    setCurrentSpecialty(specialty);
  };

  const toggleWebSearch = () => {
    setWebSearchEnabled(!webSearchEnabled);
    toast.success(
      !webSearchEnabled 
        ? 'BÃºsqueda web activada' 
        : 'BÃºsqueda web desactivada'
    );
  };

  // âœ…âœ…âœ… SENDMESSAGE COMPLETO CON MODOS AVANZADOS INTEGRADOS
  const sendMessage = async () => {
    const hasContent = input.trim() || uploadedFiles.length > 0;
    
    if (!hasContent || isLoading || shouldShowUpgradeWarning()) return;

    const messageText = input.trim() || "Analiza los archivos adjuntos";
    
    const originalInput = input;
    const originalFiles = [...uploadedFiles];

    setInput('');
    setUploadedFiles([]);

    if (!currentConversation) {
      await startNewConversation();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const workingConversation = currentConversation || {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user?.uid || '',
      title: 'Nueva conversaciÃ³n',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      isArchived: false,
      tags: []
    };

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_user`,
      type: 'user',
      message: messageText,
      timestamp: new Date(),
      tokensUsed: 0,
      conversationId: workingConversation.id,
      ...(originalFiles.length > 0 && { files: originalFiles.map(f => f.name) })
    };

    console.log('ðŸ”¥ ANTES DE ADDMESSAGE - workingConversation messages:', workingConversation.messages.length);
    
    addMessage(userMessage);
    
    await new Promise(resolve => setTimeout(resolve, 50));

    const updatedConversation = {
      ...workingConversation,
      messages: [...workingConversation.messages, userMessage],
      updatedAt: new Date()
    };

    console.log('ðŸ”¥ DESPUÃ‰S DE AGREGAR USER - updatedConversation messages:', updatedConversation.messages.length);

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
    setChatStarted(true);

    try {
      const recentMessages = updatedConversation.messages.slice(-6);
      
      let processedMessage = messageText;
      if (reportMode) {
        processedMessage = `Como NORA, tu asistente personal experta, necesito crear un reporte completo sobre: "${messageText}".`;
      } else if (deepThinkingMode) {
        processedMessage = `Como NORA, necesito hacer un anÃ¡lisis profundo sobre: "${messageText}".`;
      }
      
      let fileContext = '';
      if (originalFiles.length > 0) {
        toast.loading(`Procesando ${originalFiles.length} archivo(s)...`, { id: 'processing-files' });
        
        try {
          const fileContents = await Promise.all(
            originalFiles.map(async (file, index) => {
              const content = await processFileContent(file);
              return `\n\n--- ARCHIVO ${index + 1}: ${file.name} ---\n${content}\n--- FIN ARCHIVO ${index + 1} ---\n`;
            })
          );
          
          fileContext = fileContents.join('\n');
          toast.dismiss('processing-files');
          toast.success(`${originalFiles.length} archivo(s) procesados`);
        } catch (fileError) {
          console.error('Error procesando archivos:', fileError);
          toast.dismiss('processing-files');
          toast.error('Error procesando archivos');
          fileContext = `Error procesando archivos: ${originalFiles.map(f => f.name).join(', ')}`;
        }
      }

      // âœ…âœ…âœ… SI HAY MODO AVANZADO ACTIVO
      if (advancedMode) {
        console.log('ðŸš€ MODO AVANZADO ACTIVO:', advancedMode);
        
        let result;
        
        const advancedInput = {
          message: processedMessage,
          chatHistory: recentMessages.slice(0, -1).map(msg => ({
            role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.message
          })),
          fileContext: fileContext || undefined,
          style: 'professional' as const
        };
        
        try {
          switch (advancedMode) {
            case 'travel_planner':
              result = await cloudFunctions.travelPlanner(advancedInput);
              break;
            
            case 'ai_detector':
              result = await cloudFunctions.aiDetector(advancedInput);
              break;
            
            case 'text_humanizer':
              result = await cloudFunctions.textHumanizer(advancedInput);
              break;
            
            case 'brand_analyzer':
              result = await cloudFunctions.brandAnalyzer(advancedInput);
              break;
            
            case 'document_detective':
              result = await cloudFunctions.documentDetective(advancedInput);
              break;
            
            case 'plant_doctor':
              result = await cloudFunctions.plantDoctor(advancedInput);
              break;
          }
          
          if (result?.data?.response) {
            const aiMessage: ChatMessage = {
              id: `msg_${Date.now()}_ai`,
              type: 'ai',
              message: result.data.response,
              timestamp: new Date(),
              tokensUsed: result.data.tokensUsed,
              conversationId: updatedConversation.id,
              mode: 'advanced',
              advancedMode: advancedMode
            };
            
            console.log('ðŸ”¥ AGREGANDO MENSAJE AI AVANZADO');
            addMessage(aiMessage);
            await refreshProfile();
            toast.success(`Respuesta de ${advancedMode.replace('_', ' ')}`);
            setIsLoading(false);
            setReportMode(false);
            setDeepThinkingMode(false);
            return; // âœ… NO CONTINUAR CON FLUJO NORMAL
          }
        } catch (advError) {
          console.error('Error en modo avanzado:', advError);
          toast.error('Error en modo avanzado, usando modo normal');
          // Continuar con flujo normal si falla
        }
      }

      // âœ… FLUJO NORMAL (si no hay modo avanzado o si fallÃ³)
      const systemPrompt = deepThinkingMode 
        ? `Eres NORA, una asistente de IA avanzada en modo Deep Search. Proporciona respuestas EXTREMADAMENTE detalladas y profundas.`
        : `Eres NORA, una asistente de IA empÃ¡tica y conversacional. Responde de forma DIRECTA, CLARA y CONCISA. Para preguntas simples, da SOLO la respuesta sin explicaciones adicionales. SÃ© humana pero eficiente.`;

      const inputData = {
        message: processedMessage,
        fileContext,
        chatHistory: recentMessages.slice(0, -1),
        maxTokens: validPlan === 'free' ? 1200 : validPlan === 'pro' ? 3000 : 6000,
        enableWebSearch: webSearchEnabled,
        systemPrompt,
        deepThinking: deepThinkingMode
      };

      console.log('Enviando datos al backend...');
      const result = await cloudFunctions.chatWithAI(inputData);
      console.log('Respuesta del backend:', result);
      
      if (result?.data?.response) {
        console.log('Respuesta vÃ¡lida recibida, longitud:', result.data.response.length);
        
        const aiMessage: ChatMessage = {
          id: `msg_${Date.now()}_ai`,
          type: 'ai',
          message: result.data.response,
          timestamp: new Date(),
          tokensUsed: result.data.tokensUsed,
          conversationId: updatedConversation.id,
          searchUsed: result.data.searchUsed || false,
          searchResults: result.data.searchResults,
          limitReached: result.data.limitReached || false
        };

        console.log('ðŸ”¥ AGREGANDO MENSAJE AI NORMAL');
        addMessage(aiMessage);
        await refreshProfile();
        toast.success('Respuesta recibida');
      } else {
        console.error('Respuesta invÃ¡lida del backend:', result);
        throw new Error('Sin respuesta vÃ¡lida del servidor');
      }
    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      toast.error('Error al enviar mensaje');
      setUploadedFiles(originalFiles);
    } finally {
      setIsLoading(false);
      setReportMode(false);
      setDeepThinkingMode(false);
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
      
      const systemPrompt = deepThinkingMode 
        ? `Eres NORA, una asistente de IA avanzada. Proporciona respuestas detalladas.`
        : `Eres NORA. Responde de forma DIRECTA y CONCISA.`;

      const inputData = {
        message: userMessage.message,
        fileContext: '',
        chatHistory: recentMessages,
        maxTokens: validPlan === 'free' ? 1200 : validPlan === 'pro' ? 3000 : 6000,
        enableWebSearch: webSearchEnabled,
        systemPrompt,
        deepThinking: deepThinkingMode
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
          searchUsed: result.data.searchUsed || false,
          searchResults: result.data.searchResults,
          limitReached: result.data.limitReached || false
        };

        addMessage(aiMessage);
        await refreshProfile();
        toast.success('Mensaje regenerado');
      }
    } catch (error) {
      console.error('Error regenerando:', error);
      toast.error('Error al regenerar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} archivo(s) agregado(s)`);
    setShowToolsMenu(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
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

// app/components/ChatInterface.tsx - COMPLETO PARTE 3/3 (JSX)
// CONTINÃšA DESDE PARTE 2...

  return (
    <div className="h-screen bg-black text-white overflow-hidden relative">
      {showVideoBackground && <VideoBackground />}
      
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] bg-black animate-slide-right" />
      )}
      
      <div className={`fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800 transition-all duration-300 ${
        showConversationList && !isMobile ? 'ml-80' : ''
      }`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-8">
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

          <div className="flex items-center space-x-4">
            {/* âœ… BOTÃ“N DE MODOS AVANZADOS */}
            <button
              onClick={() => setShowAdvancedModes(!showAdvancedModes)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                advancedMode 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline">Modos Avanzados</span>
            </button>

            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="group transition-transform duration-200 hover:scale-110 p-2 rounded-full hover:bg-white/10"
            >
              <UserCircle className="w-6 h-6 text-gray-400 stroke-1" />
            </button>
          </div>
        </div>
      </div>

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

      <div className={`h-full flex flex-col pt-20 relative z-10 transition-all duration-300 ${
        showConversationList && !isMobile ? 'ml-80' : ''
      }`}>
        {!chatStarted && !currentConversation?.messages.length ? (
          <WelcomeScreen onStartChat={handleStartChat} />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* âœ… SELECTOR DE MODOS AVANZADOS */}
            {showAdvancedModes && (
              <div className="border-b border-gray-800">
                <AdvancedModeSelector
                  currentMode={advancedMode}
                  onSelectMode={setAdvancedMode}
                />
              </div>
            )}

            <div className="px-6 py-3 border-b border-gray-800">
              <SpecialistModeSelector
                userProfile={userProfile!}
                currentMode={currentMode}
                currentSpecialty={currentSpecialty}
                onModeChange={handleModeChange}
              />
            </div>

            {currentMode === 'normal' ? (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((message: ChatMessage, index: number) => (
                      <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} group`}>
                        <div className={`flex items-start space-x-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-gray-600">
                            {message.type === 'user' ? (
                              <User className="w-4 h-4 text-blue-400" />
                            ) : (
                              <Bot className="w-4 h-4 text-purple-400" />
                            )}
                          </div>

                          <div className={`flex-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                            
                            {message.type === 'ai' && (
                              <>
                                <WebSearchIndicator message={message} />
                                {/* âœ… BADGE DE MODO AVANZADO */}
                                {message.advancedMode && (
                                  <div className="mb-2 flex items-center gap-2 text-xs text-purple-300 bg-purple-500/10 px-2 py-1 rounded inline-flex">
                                    <Sparkles className="w-3 h-3" />
                                    <span className="capitalize">
                                      {message.advancedMode.replace('_', ' ')}
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                            
                            <div className={`inline-block p-4 rounded-2xl shadow-xl backdrop-blur-xl ${
                              message.type === 'user'
                                ? 'bg-white/10 text-white border border-white/20 max-w-md rounded-br-sm'
                                : 'bg-black/40 text-gray-100 border border-white/10 max-w-3xl rounded-bl-sm'
                            }`}
                            style={{
                              backdropFilter: 'blur(20px) saturate(180%)',
                              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                              boxShadow: message.type === 'user' 
                                ? '0 8px 32px 0 rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                : '0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                            }}>
                              
                              {message.type === 'ai' ? (
                                <MarkdownRenderer content={message.message} />
                              ) : (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                  {message.message}
                                </p>
                              )}
                              
                              <div className={`mt-3 pt-2 border-t ${message.type === 'user' ? 'border-blue-500/30' : 'border-gray-600'} text-xs ${message.type === 'user' ? 'text-blue-200' : 'text-gray-500'} flex items-center justify-between`}>
                                <span>{message.timestamp.toLocaleTimeString()}</span>
                                {message.tokensUsed && (
                                  <span className="opacity-70">{message.tokensUsed} tokens</span>
                                )}
                              </div>
                            </div>

                            {message.type === 'ai' && (
                              <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleCopy(message.message)}
                                  className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600 transition-colors text-gray-400 hover:text-white"
                                  title="Copiar"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRegenerate(index)}
                                  className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600 transition-colors text-gray-400 hover:text-white"
                                  title="Regenerar"
                                  disabled={isLoading}
                                >
                                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-3 max-w-[85%]">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-gray-600">
                            <Bot className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl rounded-bl-sm p-4 border border-gray-700">
                            <div className="flex items-center space-x-3">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                              <span className="text-gray-300 text-sm">
                                {advancedMode ? `Procesando en modo ${advancedMode.replace('_', ' ')}...` :
                                 reportMode ? 'Generando reporte...' : 
                                 deepThinkingMode ? 'Analizando...' : 
                                 webSearchEnabled ? 'Buscando...' : 'Escribiendo...'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <div className="px-4 pb-4">
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

                  {shouldShowUpgradeWarning() && (
                    <div className="mb-4 bg-yellow-900/50 border border-yellow-700 rounded-xl p-4">
                      <p className="text-yellow-300 text-sm mb-2">
                        Has alcanzado el 90% de tu lÃ­mite diario.
                      </p>
                      <button
                        onClick={() => router.push('/upgrade')}
                        className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Mejorar plan
                      </button>
                    </div>
                  )}

                  {(reportMode || deepThinkingMode || webSearchEnabled || advancedMode) && (
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
                          BÃºsqueda Web
                        </div>
                      )}
                      {advancedMode && (
                        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-700 rounded-lg px-3 py-1 text-purple-300 text-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {advancedMode.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-gray-800/30 backdrop-blur-xl rounded-full p-2 border border-gray-700/30 max-w-3xl mx-auto flex items-center">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowToolsMenu(!showToolsMenu);
                        }}
                        className="hover:bg-gray-700/30 rounded-full p-1 transition-colors transform hover:scale-105"
                      >
                        <Plus className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showToolsMenu ? 'rotate-45' : ''}`} />
                      </button>

                      {showToolsMenu && (
                        <div className="absolute bottom-full left-0 mb-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg shadow-lg py-2 w-48 animate-slide-up">
                          <button
                            onClick={toggleImageGenerator}
                            className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-700/50 text-left transition-colors"
                          >
                            <span className="text-sm">Generar imagen</span>
                          </button>
                          
                          <button
                            onClick={toggleVideoGenerator}
                            className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-700/50 text-left transition-colors"
                          >
                            <span className="text-sm">Generar video</span>
                          </button>
                          
                          <button
                            onClick={toggleReportMode}
                            className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-700/50 text-left transition-colors"
                          >
                            <span className="text-sm">Generar reporte</span>
                          </button>

                          <button
                            onClick={toggleWebSearch}
                            className={`w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-700/50 text-left transition-colors ${
                              webSearchEnabled ? 'text-green-400' : 'text-gray-300'
                            }`}
                          >
                            <span className="text-sm">
                              {webSearchEnabled ? 'Desactivar bÃºsqueda' : 'Activar bÃºsqueda'}
                            </span>
                          </button>
                          
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-700/50 text-left transition-colors"
                          >
                            <span className="text-sm">Subir archivos</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 relative flex items-center">
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={
                          shouldShowUpgradeWarning() 
                            ? "Mejora tu plan..." 
                            : "Escribe tu mensaje..."
                        }
                        disabled={isLoading || shouldShowUpgradeWarning()}
                        className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none leading-tight min-h-[24px] max-h-16 py-1 text-sm text-center"
                      />
                    </div>

                    <button
                      onClick={toggleDeepSearch}
                      className="hover:bg-gray-700/30 rounded-full p-1 transition-colors transform hover:scale-105"
                    >
                      <Atom className={`w-5 h-5 ${deepThinkingMode ? 'text-purple-400' : 'text-gray-400'}`} />
                    </button>

                    <button
                      onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                      disabled={shouldShowUpgradeWarning()}
                      className={`hover:bg-gray-700/30 rounded-full p-1 transition-colors transform hover:scale-105 ${
                        isRecording ? 'text-red-400 animate-pulse' : 'text-gray-400'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={sendMessage}
                      disabled={isLoading || (!input.trim() && uploadedFiles.length === 0) || shouldShowUpgradeWarning()}
                      className={`p-2 rounded-full transition-all duration-300 transform hover:scale-105 ${
                        (input.trim() || uploadedFiles.length > 0) && !isLoading && !shouldShowUpgradeWarning()
                          ? webSearchEnabled 
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg' 
                            : advancedMode
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                            : 'bg-white text-black hover:bg-gray-200 shadow-lg'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
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

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.csv,.xlsx"
      />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lastica:wght@300;400;500;600;700&display=swap');
        
        @keyframes slide-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
        
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
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
        
        .animate-slide-right {
          animation: slide-right 0.8s ease-in-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
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

        html {
          scroll-behavior: smooth;
        }

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

        body {
          font-family: 'Lastica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
});

export default ChatInterface;