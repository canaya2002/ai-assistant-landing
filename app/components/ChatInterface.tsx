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
  ImageIcon, // ✅ CAMBIAR NOMBRE
  Sparkles,
  Mic,
  MicOff,
  Brain,
  Search,
  User,
  Bot,
  FileText,
  Upload,
  Video
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

// Background Video minimalista
const VideoBackground = memo(function VideoBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video 
        className="absolute inset-0 w-full h-full object-cover opacity-20"
        autoPlay 
        muted 
        loop 
        playsInline
        preload="metadata"
      >
        <source src="/images/fondo-nora-tres.mp4" type="video/mp4" />
        <source src="/fondo.webm" type="video/webm" />
      </video>
      <div className="absolute inset-0 bg-black/80 z-10" />
    </div>
  );
});

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
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = currentConversation?.messages || [];
  const validPlan: PlanType = isValidPlan(plan) ? plan : 'free';

  // ✅ FUNCIONES DE MICRÓFONO MEJORADAS
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

  const handleStartChat = () => {
    setChatStarted(true);
    setShowVideoBackground(false);
    if (!currentConversation) {
      startNewConversation();
    }
  };

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

  // TU FUNCIÓN SENDMESSAGE ORIGINAL PARA CHAT NORMAL
  const sendMessage = async () => {
    if (!input.trim() || isLoading || shouldShowUpgradeWarning()) return;

    const messageText = input.trim();
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
      
      // ✅ PROCESAR ARCHIVOS SUBIDOS
      let fileContext = '';
      if (uploadedFiles.length > 0) {
        toast.loading('Procesando archivos...', { id: 'processing-files' });
        
        const fileContents = await Promise.all(
          uploadedFiles.map(async (file) => {
            const content = await processFileContent(file);
            return `\n\n--- ARCHIVO: ${file.name} ---\n${content}\n--- FIN ARCHIVO ---\n`;
          })
        );
        
        fileContext = fileContents.join('\n');
        toast.dismiss('processing-files');
        toast.success('Archivos procesados');
      }
      
      const inputData = {
        message: processedMessage,
        fileContext,
        chatHistory: recentMessages.slice(0, -1),
        maxTokens: validPlan === 'free' ? 150 : validPlan === 'pro' ? 500 : 1000
      };

      const result = await cloudFunctions.chatWithAI(inputData);
      
      if (result.data?.response) {
        const aiMessage: ChatMessage = {
          id: `msg_${Date.now()}_ai`,
          type: 'ai',
          message: result.data.response,
          timestamp: new Date(),
          tokensUsed: result.data.tokensUsed,
          conversationId: updatedConversation.id
        };

        addMessage(aiMessage);
        await refreshProfile();
        
        // ✅ LIMPIAR ARCHIVOS DESPUÉS DEL ENVÍO EXITOSO
        setUploadedFiles([]);
        
        toast.success('Respuesta recibida');
      } else {
        throw new Error('Sin respuesta');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar mensaje');
    } finally {
      setIsLoading(false);
      setReportMode(false);
      toast.dismiss('processing-files'); // Limpiar toast de procesamiento si hay error
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
      
      const inputData = {
        message: userMessage.message,
        fileContext: '',
        chatHistory: recentMessages,
        maxTokens: validPlan === 'free' ? 150 : validPlan === 'pro' ? 500 : 1000
      };

      const result = await cloudFunctions.chatWithAI(inputData);
      
      if (result.data?.response) {
        const aiMessage: ChatMessage = {
          id: `msg_${Date.now()}_ai_regen`,
          type: 'ai',
          message: result.data.response,
          timestamp: new Date(),
          tokensUsed: result.data.tokensUsed,
          conversationId: currentConversation?.id || ''
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

  // ✅ FUNCIÓN PARA PROCESAR ARCHIVOS
  const processFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            // Archivo de texto
            resolve(result);
          } else if (result instanceof ArrayBuffer) {
            // Archivo binario (PDF, etc.)
            const base64 = btoa(String.fromCharCode(...new Uint8Array(result)));
            resolve(`[ARCHIVO_${file.type.toUpperCase()}] ${file.name} (${file.size} bytes)\nContenido en base64: ${base64.substring(0, 1000)}...`);
          } else {
            resolve(`[ARCHIVO] ${file.name} - No se pudo procesar el contenido`);
          }
        } catch (error) {
          console.error('Error processing file:', error);
          resolve(`[ARCHIVO] ${file.name} - Error al procesar`);
        }
      };
      
      reader.onerror = () => {
        console.error('Error reading file:', file.name);
        resolve(`[ARCHIVO] ${file.name} - Error al leer el archivo`);
      };
      
      // Leer según el tipo de archivo
      if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  // TUS FUNCIONES PRINCIPALES ORIGINALES
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} archivo(s) agregado(s)`);
    setShowToolsMenu(false);
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

  return (
    <div className="h-screen bg-black text-white overflow-hidden relative">
      {/* TU VIDEO DE FONDO ORIGINAL */}
      {showVideoBackground && <VideoBackground />}
      
      {/* TU NAVEGACIÓN SUPERIOR MINIMALISTA ORIGINAL */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo minimalista */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowConversationList(true)}
              className="lg:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-medium text-white">NORA</h1>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowConversationList(true)}
              className="hidden lg:flex p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowSettingsMenu(true)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* TUS SIDEBARS ORIGINALES */}
      {showConversationList && (
        <div className="fixed inset-0 z-40 flex">
          <div className="w-80">
            <ConversationList 
              isOpen={showConversationList}
              onClose={() => setShowConversationList(false)}
              onNewConversation={() => {
                startNewConversation();
                setShowConversationList(false);
              }}
            />
          </div>
          <div 
            className="flex-1 bg-black/50 backdrop-blur-sm" 
            onClick={() => setShowConversationList(false)}
          />
        </div>
      )}

      {showSettingsMenu && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div 
            className="flex-1 bg-black/50 backdrop-blur-sm" 
            onClick={() => setShowSettingsMenu(false)}
          />
          <div className="w-96">
            <SettingsMenu 
              isOpen={showSettingsMenu}
              onClose={() => setShowSettingsMenu(false)} 
            />
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
      <div className="h-full flex flex-col pt-16 relative z-10">
        {!chatStarted && !currentConversation?.messages.length ? (
          // Pantalla de inicio con video
          <div className="flex-1 flex items-center justify-center text-center px-4">
            <div className="max-w-md">
              <h2 className="text-3xl font-bold mb-4">
                ¡Hola! Soy NORA
              </h2>
              <p className="text-gray-400 mb-8">
                Tu asistente de IA personalizado. ¿En qué puedo ayudarte hoy?
              </p>
              <button
                onClick={handleStartChat}
                className="px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-colors"
              >
                Empezar conversación
              </button>
            </div>
          </div>
        ) : (
          // Chat activo
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* ✅ TU SELECTOR DE MODO ESPECIALISTA EXISTENTE */}
            <div className="px-6 py-3 border-b border-gray-800">
              <SpecialistModeSelector
                userProfile={userProfile!}
                currentMode={currentMode}
                currentSpecialty={currentSpecialty}
                onModeChange={handleModeChange}
              />
            </div>

            {/* ✅ DECIDIR QUÉ INTERFAZ DE CHAT USAR */}
            {currentMode === 'normal' ? (
              // TU CHAT NORMAL ORIGINAL
              <>
                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {messages.map((message: ChatMessage, index: number) => (
                    <div key={message.id} className="mb-6 group">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                          {message.type === 'user' ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>

                        <div className={`flex-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                          <div className={`inline-block max-w-full p-4 rounded-xl ${
                            message.type === 'user'
                              ? 'bg-gray-800 text-white'
                              : 'bg-gray-900 text-white'
                          }`}>
                            <div className="whitespace-pre-wrap leading-relaxed">
                              {message.message}
                            </div>

                            {message.type === 'ai' && (
                              <div className="mt-3 pt-3 border-t border-gray-700">
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
                              {deepThinkingMode || reportMode ? 'Analizando profundamente...' : 'Escribiendo...'}
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

                {/* TU ÁREA DE INPUT ORIGINAL COMPLETA */}
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

                  {/* TUS INDICADORES DE MODO ACTIVO ORIGINALES */}
                  {(reportMode || deepThinkingMode) && (
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
                    </div>
                  )}

                  {/* TU ÁREA DE INPUT COMPACTA ORIGINAL */}
                  <div className="bg-gray-900 border border-gray-700 rounded-xl p-3">
                    <div className="flex items-end space-x-3">
                      {/* TU MENÚ DE HERRAMIENTAS DESPLEGABLE ORIGINAL CON + */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowToolsMenu(!showToolsMenu);
                          }}
                          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                          title="Herramientas"
                        >
                          <Plus className={`w-4 h-4 transition-transform ${showToolsMenu ? 'rotate-45' : ''}`} />
                        </button>

                        {/* TU MENÚ DESPLEGABLE ORIGINAL CON VIDEOS */}
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

                      {/* Textarea */}
                      <div className="flex-1 relative">
                        <textarea
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyPress}
                          placeholder={shouldShowUpgradeWarning() ? "Mejora tu plan para continuar..." : "Escribe tu mensaje..."}
                          disabled={isLoading || shouldShowUpgradeWarning()}
                          className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none leading-relaxed min-h-[40px] max-h-24 py-2"
                        />
                      </div>

                      {/* ✅ MICRÓFONO MEJORADO */}
                      <button
                        onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                        disabled={shouldShowUpgradeWarning()}
                        className={`p-2 rounded-lg transition-colors ${
                          isRecording 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                        title={isRecording ? "Detener" : "Grabar"}
                      >
                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>

                      {/* Botón de envío */}
                      <button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim() || shouldShowUpgradeWarning()}
                        className={`p-2 rounded-lg transition-colors ${
                          input.trim() && !isLoading && !shouldShowUpgradeWarning()
                            ? 'bg-white text-black hover:bg-gray-200' 
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                        title="Enviar"
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
              // ✅ TUS COMPONENTES ESPECIALISTAS EXISTENTES
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
    </div>
  );
});

export default ChatInterface;