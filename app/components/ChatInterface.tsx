// app/components/ChatInterface.tsx - VERSIÓN CORREGIDA
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
  Atom,
  PanelRightOpen
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
    </div>
  );
});

const WelcomeScreen = memo(function WelcomeScreen({ onStartChat }: { onStartChat: () => void }) {
  return (
    <div className="h-full flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
          <h1 className="relative text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl">
            Bienvenido a NORA
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
          ¿En qué puedo ayudarte el día de hoy?
        </p>

        <button
          onClick={onStartChat}
          className="group relative inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-purple-500/50"
        >
          <span>Empezar conversación</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
});

interface WebSearchIndicatorProps {
  userProfile: any;
}

const WebSearchIndicator: React.FC<WebSearchIndicatorProps> = ({ userProfile }) => {
  const webSearchesUsed = userProfile?.usage?.monthly?.webSearchesUsed || 0;
  const webSearchesLimit = userProfile?.usage?.monthly?.webSearchesLimit || 0;
  
  if (webSearchesLimit === -1) return null;
  
  const webSearchesRemaining = Math.max(0, webSearchesLimit - webSearchesUsed);
  const percentage = (webSearchesUsed / webSearchesLimit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = webSearchesRemaining === 0;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">Búsquedas web</span>
        <span className={`font-medium ${isAtLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-gray-300'}`}>
          {webSearchesUsed} / {webSearchesLimit}
        </span>
      </div>
      
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            isAtLimit ? 'bg-red-400' : isNearLimit ? 'bg-yellow-400' : 'bg-green-400'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {(isNearLimit || isAtLimit) && (
        <div className={`mt-1 text-xs ${isAtLimit ? 'text-red-400' : 'text-yellow-400'}`}>
          {isAtLimit 
            ? `Límite agotado - ${userProfile.planInfo?.displayName || 'Plan actual'}` 
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
  
  const [advancedMode, setAdvancedMode] = useState<AdvancedModeType | null>(null);
  const [showAdvancedModes, setShowAdvancedModes] = useState(false);

  const [showSideMenu, setShowSideMenu] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = currentConversation?.messages || [];
  const validPlan: PlanType = isValidPlan(plan) ? plan : 'free';

  // Función para cerrar todos los menús
  const closeAllMenus = () => {
    setShowToolsMenu(false);
    setShowSideMenu(false);
    setShowConversationList(false);
    setShowSettingsMenu(false);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsLandscape(window.innerWidth > window.innerHeight && window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (currentConversation && currentConversation.messages.length > 0) {
      setChatStarted(true);
      setShowVideoBackground(false);
    }
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 96) + 'px';
    }
  }, [input]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'es-ES';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceText(transcript);
        setInput(transcript);
        setShowVoiceText(true);
        
        setTimeout(() => {
          setShowVoiceText(false);
        }, 3000);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast.error('Error en reconocimiento de voz');
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const processFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        if (file.type === 'application/json') {
          try {
            const json = JSON.parse(content);
            resolve(`Contenido JSON:\n${JSON.stringify(json, null, 2)}`);
          } catch {
            resolve(content);
          }
        } else {
          resolve(content);
        }
      };
      
      reader.onerror = () => reject(new Error(`Error leyendo ${file.name}`));
      
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const startVoiceRecording = () => {
    if (!recognition) {
      toast.error('Reconocimiento de voz no disponible');
      return;
    }

    try {
      recognition.start();
      setIsRecording(true);
      toast.success('Escuchando...');
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast.error('Error iniciando reconocimiento');
    }
  };

  const stopVoiceRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const handleStartChat = async () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowVideoBackground(false);
      setChatStarted(true);
      setIsTransitioning(false);
      
      if (!currentConversation) {
        startNewConversation();
      }
      
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const shouldShowUpgradeWarning = () => {
    if (!userProfile) return false;
    
    const dailyTokensRemaining = userProfile.usage.daily.tokensRemaining || 0;
    const monthlyTokensRemaining = userProfile.usage.monthly.tokensRemaining || 0;
    
    return dailyTokensRemaining <= 0 || monthlyTokensRemaining <= 0;
  };

  const copyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Mensaje copiado');
    } catch (error) {
      toast.error('Error al copiar');
    }
  };

  const regenerateResponse = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1 || messageIndex === 0) return;

    const userMessage = messages[messageIndex - 1];
    if (userMessage.type !== 'user') return;
    
    setIsLoading(true);

    try {
      const recentMessages = messages.slice(0, messageIndex - 1).slice(-5);

      const systemPrompt = validPlan === 'pro' || validPlan === 'pro_max'
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
    closeAllMenus();
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleReportMode = () => {
    setReportMode(!reportMode);
    closeAllMenus();
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
    closeAllMenus();
  };

  const toggleVideoGenerator = () => {
    setShowVideoGenerator(!showVideoGenerator);
    closeAllMenus();
  };

  const handleModeChange = (mode: 'normal' | 'developer' | 'specialist', specialty?: SpecialtyType) => {
    setCurrentMode(mode);
    setCurrentSpecialty(specialty);
  };

  const toggleWebSearch = () => {
    setWebSearchEnabled(!webSearchEnabled);
    toast.success(
      !webSearchEnabled 
        ? 'Búsqueda web activada' 
        : 'Búsqueda web desactivada'
    );
  };

  const callAdvancedModeFunction = async (mode: AdvancedModeType, input: any) => {
    switch (mode) {
      case 'travel_planner':
        return await cloudFunctions.travelPlanner(input);
      case 'ai_detector':
        return await cloudFunctions.aiDetector(input);
      case 'text_humanizer':
        return await cloudFunctions.textHumanizer(input);
      case 'brand_analyzer':
        return await cloudFunctions.brandAnalyzer(input);
      case 'document_detective':
        return await cloudFunctions.documentDetective(input);
      case 'plant_doctor':
        return await cloudFunctions.plantDoctor(input);
      default:
        throw new Error(`Modo avanzado no reconocido: ${mode}`);
    }
  };

  const sendMessage = async () => {
    const hasContent = input.trim() || uploadedFiles.length > 0;
    
    if (!hasContent || isLoading) return;

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
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_user`,
      type: 'user',
      message: messageText,
      timestamp: new Date(),
      tokensUsed: 0,
      conversationId: workingConversation.id,
      ...(originalFiles.length > 0 && { files: originalFiles.map(f => f.name) })
    };
    
    addMessage(userMessage);
    
    await new Promise(resolve => setTimeout(resolve, 50));

    const updatedConversation = {
      ...workingConversation,
      messages: [...workingConversation.messages, userMessage],
      updatedAt: new Date()
    };

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
        processedMessage = `Como NORA, necesito hacer un análisis profundo sobre: "${messageText}".`;
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

      if (advancedMode) {
        const advancedInput = {
          message: processedMessage,
          chatHistory: recentMessages.slice(0, -1).map(msg => ({
            role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.message
          })),
          ...(fileContext && { fileContext })
        };

        const result = await callAdvancedModeFunction(advancedMode, advancedInput);

        if (result.data?.response) {
          const aiMessage: ChatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_ai`,
            type: 'ai',
            message: result.data.response,
            timestamp: new Date(),
            tokensUsed: result.data.tokensUsed || 0,
            conversationId: updatedConversation.id,
            mode: 'advanced',
            advancedMode: advancedMode
          };

          addMessage(aiMessage);
          await refreshProfile();
          setAdvancedMode(null);
        }
      } else {
        const systemPrompt = validPlan === 'pro' || validPlan === 'pro_max'
          ? `Eres NORA, una asistente de IA avanzada. Proporciona respuestas detalladas.`
          : `Eres NORA. Responde de forma DIRECTA y CONCISA.`;

        const inputData = {
          message: processedMessage,
          fileContext,
          chatHistory: recentMessages.slice(0, -1),
          maxTokens: validPlan === 'free' ? 1200 : validPlan === 'pro' ? 3000 : 6000,
          enableWebSearch: webSearchEnabled,
          systemPrompt,
          deepThinking: deepThinkingMode
        };

        const result = await cloudFunctions.chatWithAI(inputData);

        if (result.data?.response) {
          const aiMessage: ChatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_ai`,
            type: 'ai',
            message: result.data.response,
            timestamp: new Date(),
            tokensUsed: result.data.tokensUsed,
            conversationId: updatedConversation.id,
            searchUsed: result.data.searchUsed || false,
            searchResults: result.data.searchResults,
            limitReached: result.data.limitReached || false
          };

          addMessage(aiMessage);
          await refreshProfile();
          
          if (result.data.limitReached) {
            toast.error('Has alcanzado el límite de tu plan');
          }
        }
      }

      if (reportMode) setReportMode(false);
      if (deepThinkingMode) setDeepThinkingMode(false);

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Error al enviar mensaje';
      if (error.message?.includes('limit')) {
        errorMessage = 'Límite alcanzado';
      }
      
      toast.error(errorMessage);
      setInput(originalInput);
      setUploadedFiles(originalFiles);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="h-screen bg-black text-white overflow-hidden relative">
      {showVideoBackground && <VideoBackground />}
      
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] bg-black animate-slide-right" />
      )}
      
      <div className={`fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm transition-all duration-300 ${
        showConversationList && !isMobile ? 'ml-80' : ''
      }`}>
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <button
              onClick={() => {
                if (showConversationList) {
                  setShowConversationList(false);
                } else {
                  closeAllMenus();
                  setShowConversationList(true);
                }
              }}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="flex items-center"
            >
              <Image
                src="/images/nora.png"
                alt="NORA"
                width={80}
                height={80}
                className="rounded-full w-14 h-14 md:w-20 md:h-20"
              />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (showSettingsMenu) {
                  setShowSettingsMenu(false);
                } else {
                  closeAllMenus();
                  setShowSettingsMenu(true);
                }
              }}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showConversationList && (
        <div className={`fixed top-16 left-0 bottom-0 z-40 ${isMobile ? 'right-0' : 'w-80'} bg-gray-900 border-r border-gray-800 overflow-hidden`}>
          <ConversationList 
            isOpen={showConversationList}
            onClose={() => setShowConversationList(false)}
            onNewConversation={() => {
              startNewConversation();
              setShowConversationList(false);
            }}
          />
        </div>
      )}

      {showSettingsMenu && (
        <div className="fixed top-16 right-0 bottom-0 z-40 w-96 bg-gray-900 border-l border-gray-800">
          <SettingsMenu 
            isOpen={showSettingsMenu}
            onClose={() => setShowSettingsMenu(false)} 
          />
        </div>
      )}

      <div className={`fixed top-16 left-0 right-0 bottom-0 transition-all duration-300 ${
        showConversationList && !isMobile ? 'ml-80' : ''
      }`}>
        {!chatStarted && !currentConversation?.messages.length ? (
          <WelcomeScreen onStartChat={handleStartChat} />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden h-full">
            {currentMode === 'normal' ? (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((message: ChatMessage, index: number) => (
                      <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} group`}>
                        <div className={`flex items-start space-x-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          
                          {message.type === 'ai' && (
                            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden">
                              <Image
                                src="/images/noralogoicon.png"
                                alt="NORA"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div className={`flex-1 rounded-2xl ${
                            message.type === 'user' 
                              ? 'bg-gray-700/80 border-2 border-gray-600/50 rounded-br-sm' 
                              : 'floating-card border-2 border-white/15 rounded-bl-sm'
                          } p-4 shadow-lg animate-card-in`} style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                            
                            {message.files && message.files.length > 0 && (
                              <div className="mb-3 flex flex-wrap gap-2">
                                {message.files.map((fileName, idx) => (
                                  <div key={idx} className="flex items-center space-x-2 bg-gray-700/50 px-3 py-1 rounded-lg text-xs">
                                    <FileText className="w-3 h-3" />
                                    <span>{fileName}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {message.searchUsed && message.searchResults && (
                              <div className="mb-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <div className="flex items-center space-x-2 text-green-400 text-sm mb-2">
                                  <Globe className="w-4 h-4" />
                                  <span className="font-medium">Búsqueda Web Realizada</span>
                                </div>
                                <p className="text-xs text-gray-300">{message.searchResults.query}</p>
                              </div>
                            )}

                            {message.advancedMode && (
                              <div className="mb-2 inline-flex items-center space-x-1 bg-purple-500/20 px-2 py-1 rounded text-xs text-purple-300">
                                <Sparkles className="w-3 h-3" />
                                <span>Modo: {message.advancedMode.replace('_', ' ')}</span>
                              </div>
                            )}

                            <MarkdownRenderer content={message.message} />

                            {message.type === 'ai' && (
                              <div className="flex items-center space-x-2 mt-2">
                                <button
                                  onClick={() => copyMessage(message.message)}
                                  className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                                  title="Copiar mensaje"
                                >
                                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                                </button>
                                
                                <button
                                  onClick={() => regenerateResponse(message.id)}
                                  disabled={isLoading}
                                  className="p-1.5 hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                                  title="Regenerar respuesta"
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
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
                          <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden">
                            <Image
                              src="/images/noralogoicon.png"
                              alt="NORA"
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
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
                                 webSearchEnabled ? 'Buscando en la web...' : 'Pensando...'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {showImageGenerator && (
                  <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <div className="max-w-4xl mx-auto p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center space-x-2">
                          <ImageIcon className="w-5 h-5 text-purple-400" />
                          <span>Generador de Imágenes</span>
                        </h3>
                        <button
                          onClick={() => setShowImageGenerator(false)}
                          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <ImageGenerator 
                        isEmbedded={true}
                        onImageGenerated={(image) => {
                          const imageMessage: ChatMessage = {
                            id: `msg_${Date.now()}_image`,
                            type: 'ai',
                            message: `Imagen generada: ${image.prompt}`,
                            timestamp: new Date(),
                            conversationId: currentConversation?.id || '',
                            imageUrl: image.imageUrl
                          };
                          addMessage(imageMessage);
                          setShowImageGenerator(false);
                        }}
                      />
                    </div>
                  </div>
                )}

                {showVideoGenerator && (
                  <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <div className="max-w-4xl mx-auto p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center space-x-2">
                          <Video className="w-5 h-5 text-pink-400" />
                          <span>Generador de Videos</span>
                        </h3>
                        <button
                          onClick={() => setShowVideoGenerator(false)}
                          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <VideoGenerator onClose={() => setShowVideoGenerator(false)} />
                    </div>
                  </div>
                )}

                <div className="bg-black/80 backdrop-blur-sm">
                  <div className="max-w-4xl mx-auto p-4">
                    {uploadedFiles.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg text-sm">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-300">{file.name}</span>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {reportMode && (
                      <div className="mb-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-purple-400">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm font-medium">Modo Reporte Activado</span>
                        </div>
                        <button
                          onClick={() => setReportMode(false)}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {webSearchEnabled && (
                      <div className="mb-3">
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2 text-green-400">
                              <Globe className="w-4 h-4" />
                              <span className="text-sm font-medium">Búsqueda Web Activada</span>
                            </div>
                            <button
                              onClick={() => setWebSearchEnabled(false)}
                              className="text-green-400 hover:text-green-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <WebSearchIndicator userProfile={userProfile} />
                        </div>
                      </div>
                    )}

                    {showVoiceText && voiceText && (
                      <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center space-x-2 text-blue-400 mb-1">
                          <Mic className="w-4 h-4" />
                          <span className="text-xs font-medium">Texto reconocido:</span>
                        </div>
                        <p className="text-sm text-gray-300">{voiceText}</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-1 md:space-x-2 floating-input-container px-2 md:px-4 py-3">
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        multiple
                        accept=".txt,.pdf,.doc,.docx,.json,.csv,.xlsx,.xls"
                        className="hidden"
                      />

                      <div className="relative">
                        <button
                          onClick={() => {
                            if (showToolsMenu) {
                              setShowToolsMenu(false);
                            } else {
                              closeAllMenus();
                              setShowToolsMenu(true);
                            }
                          }}
                          className="floating-icon-button p-1.5 md:p-2"
                        >
                          <Plus className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 transition-transform duration-300 ${showToolsMenu ? 'rotate-45' : ''}`} />
                        </button>

                        {showToolsMenu && (
                          <div className="absolute bottom-full left-0 mb-2 floating-menu w-48 z-50">
                            <button
                              onClick={toggleImageGenerator}
                              className="floating-menu-item"
                            >
                              <span className="text-sm font-light">Generar imagen</span>
                            </button>
                            
                            <button
                              onClick={toggleVideoGenerator}
                              className="floating-menu-item"
                            >
                              <span className="text-sm font-light">Generar video</span>
                            </button>

                            <button
                              onClick={toggleWebSearch}
                              className={`floating-menu-item ${webSearchEnabled ? 'text-white' : 'text-gray-400'}`}
                            >
                              <span className="text-sm font-light">
                                {webSearchEnabled ? 'Desactivar búsqueda' : 'Activar búsqueda'}
                              </span>
                            </button>
                            
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="floating-menu-item"
                            >
                              <span className="text-sm font-light">Subir archivos</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => {
                            if (showSideMenu) {
                              setShowSideMenu(false);
                            } else {
                              closeAllMenus();
                              setShowSideMenu(true);
                            }
                          }}
                          className="floating-icon-button p-1.5 md:p-2"
                        >
                          <svg 
                            className={`w-4 h-4 md:w-5 md:h-5 transition-colors duration-300 ${showSideMenu ? 'text-white' : 'text-gray-400'}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                        </button>

                        {showSideMenu && (
                          <div className="absolute bottom-full left-0 mb-2 w-64 floating-menu overflow-visible z-50">
                            
                            <button
                              onClick={() => {
                                setCurrentMode('normal');
                                setCurrentSpecialty(undefined);
                                setShowSideMenu(false);
                                toast.success('Chat Normal activado');
                              }}
                              className="floating-menu-item border-b border-white/10"
                            >
                              <div className="flex items-center space-x-2">
                                <MessageCircle className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-light text-white">Chat Normal</span>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                setCurrentMode('developer');
                                setShowSideMenu(false);
                                toast.success('Modo Desarrollador activado');
                              }}
                              className="floating-menu-item border-b border-white/10"
                            >
                              <div className="flex items-center space-x-2">
                                <Brain className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-light text-white">Modo Desarrollador</span>
                              </div>
                            </button>

                            <div className="border-b border-white/10 relative group">
                              <div className="w-full px-4 py-3 hover:bg-white/5 cursor-pointer transition-all duration-300">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Brain className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-light text-white">Especialistas</span>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                              </div>
                              <div className="absolute left-full bottom-0 ml-1 w-56 floating-submenu opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 max-h-96 overflow-y-auto custom-scroll">
                                {['Negocios', 'Ciencias', 'Educación', 'Salud', 'Marketing', 'Finanzas', 'Legal', 'Psicología', 'Ingeniería', 'Recursos Humanos', 'Ventas', 'Datos', 'Creatividad', 'Cardiología', 'Dermatología', 'Nutrición', 'Pediatría'].map((spec) => (
                                  <button
                                    key={spec}
                                    onClick={() => {
                                      setCurrentMode('specialist');
                                      setCurrentSpecialty(spec.toLowerCase().replace(/\s+/g, '_') as SpecialtyType);
                                      setShowSideMenu(false);
                                      toast.success(`Modo ${spec} activado`);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-white/5 transition-all duration-300 text-sm text-gray-300 font-light"
                                  >
                                    {spec}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="border-b border-white/10 relative group">
                              <div className="w-full px-4 py-3 hover:bg-white/5 cursor-pointer transition-all duration-300">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Zap className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-light text-white">Modos Avanzados</span>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                              </div>
                              <div className="absolute left-full bottom-0 ml-1 w-56 floating-submenu opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                <button
                                  onClick={() => {
                                    setAdvancedMode('travel_planner');
                                    setShowSideMenu(false);
                                    toast.success('Travel Planner activado');
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-white/5 transition-all duration-300 text-sm text-gray-300 font-light"
                                >
                                  Travel Planner
                                </button>
                                <button
                                  onClick={() => {
                                    setAdvancedMode('brand_analyzer');
                                    setShowSideMenu(false);
                                    toast.success('Brand Analyzer activado');
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-white/5 transition-all duration-300 text-sm text-gray-300 font-light"
                                >
                                  Brand Analyzer
                                </button>
                                <button
                                  onClick={() => {
                                    setAdvancedMode('plant_doctor');
                                    setShowSideMenu(false);
                                    toast.success('Plant Doctor activado');
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-white/5 transition-all duration-300 text-sm text-gray-300 font-light"
                                >
                                  Plant Doctor
                                </button>
                              </div>
                            </div>

                            <div className="relative group">
                              <div className="w-full px-4 py-3 hover:bg-white/5 cursor-pointer transition-all duration-300">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-light text-white">Documentos</span>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                              </div>
                              <div className="absolute left-full bottom-0 ml-1 w-56 floating-submenu opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                <button
                                  onClick={() => {
                                    setAdvancedMode('document_detective');
                                    setShowSideMenu(false);
                                    toast.success('Document Detective activado');
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-white/5 transition-all duration-300 text-sm text-gray-300 font-light"
                                >
                                  Document Detective
                                </button>
                                <button
                                  onClick={() => {
                                    setAdvancedMode('ai_detector');
                                    setShowSideMenu(false);
                                    toast.success('AI Detector activado');
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-white/5 transition-all duration-300 text-sm text-gray-300 font-light"
                                >
                                  AI Detector
                                </button>
                                <button
                                  onClick={() => {
                                    setAdvancedMode('text_humanizer');
                                    setShowSideMenu(false);
                                    toast.success('Text Humanizer activado');
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-white/5 transition-all duration-300 text-sm text-gray-300 font-light"
                                >
                                  Text Humanizer
                                </button>
                                <button
                                  onClick={() => {
                                    toggleReportMode();
                                    setShowSideMenu(false);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-white/5 transition-all duration-300 text-sm text-gray-300 font-light"
                                >
                                  Generar Reporte
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 relative flex items-center">
                        <textarea
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyPress}
                          placeholder="Escribe tu mensaje..."
                          disabled={isLoading}
                          rows={1}
                          className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-sm flex items-center"
                          style={{
                            maxHeight: '96px',
                            minHeight: '24px',
                            lineHeight: '24px',
                            paddingTop: '0px',
                            paddingBottom: '0px'
                          }}
                        />
                      </div>

                      <button
                        onClick={toggleDeepSearch}
                        className="floating-icon-button p-1.5 md:p-2"
                      >
                        <Atom className={`w-4 h-4 md:w-5 md:h-5 transition-colors duration-300 ${deepThinkingMode ? 'text-white' : 'text-gray-400'}`} />
                      </button>

                      <button
                        onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                        className="floating-icon-button p-1.5 md:p-2"
                      >
                        {isRecording ? (
                          <MicOff className="w-4 h-4 md:w-5 md:h-5 text-red-400 animate-pulse" />
                        ) : (
                          <Mic className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                        )}
                      </button>

                      <button
                        onClick={sendMessage}
                        disabled={isLoading || (!input.trim() && uploadedFiles.length === 0)}
                        className={`floating-send-button p-1.5 md:p-2 ${
                          (input.trim() || uploadedFiles.length > 0) && !isLoading
                            ? 'active'
                            : 'disabled'
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 md:w-5 md:h-5" />
                        )}
                      </button>
                    </div>
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
                  onNewMessage={addMessage}
                  onError={(error) => toast.error(error)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Lastica:wght@300;400;500;600;700&display=swap');
        
        @keyframes card-in {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-card-in { 
          animation: card-in 0.8s ease-out forwards; 
        }

        .floating-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.08);
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

        .floating-input-container {
          background: linear-gradient(145deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5));
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 8px 32px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .floating-icon-button {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          transition: all 0.3s ease;
        }
        
        .floating-icon-button:hover {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          border-color: rgba(255, 255, 255, 0.15);
          transform: scale(1.05);
        }

        .floating-send-button {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .floating-send-button.active {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 8px 32px rgba(255, 255, 255, 0.1),
            0 4px 16px rgba(0, 0, 0, 0.1);
        }
        
        .floating-send-button.active:hover {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.12));
          transform: scale(1.05);
          box-shadow: 
            0 12px 40px rgba(255, 255, 255, 0.15),
            0 6px 20px rgba(0, 0, 0, 0.15);
        }
        
        .floating-send-button.disabled {
          background: linear-gradient(145deg, rgba(107, 114, 128, 0.15), rgba(107, 114, 128, 0.08));
          color: #9ca3af;
          cursor: not-allowed;
          opacity: 0.5;
        }

        .floating-menu {
          background: linear-gradient(145deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.8));
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.4),
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .floating-menu-item {
          width: 100%;
          padding: 0.75rem 1rem;
          text-align: left;
          transition: all 0.3s ease;
          background: transparent;
          border: none;
          color: white;
        }
        
        .floating-menu-item:hover {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
        }

        .floating-submenu {
          background: linear-gradient(145deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.8));
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.4),
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .custom-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
        }
        
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 3px;
        }
        
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        * {
          font-family: 'Lastica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        @keyframes slide-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-slide-right {
          animation: slide-right 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
});

export default ChatInterface;