// app/components/Chat/ChatLayout.tsx - CON SISTEMA DE PREFERENCIAS Y MEMORIA INTEGRADO
'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useConversations } from '../../hooks/useConversations';
import { useRouter } from 'next/navigation';
import { 
  Settings, Menu, ArrowRight, Send, Loader2, X, Plus, MessageCircle, 
  FileText, Globe, Mic, MicOff, Atom, Code, Zap, Sparkles, Check 
} from 'lucide-react';
import { 
  ChatMessage, PlanType, isValidPlan, SpecialtyType, AdvancedModeType,
  ChatWithAIInput, ChatWithAIOutput, DeveloperModeChatInput, DeveloperModeChatOutput,
  SpecialistModeChatInput, SpecialistModeChatOutput, AdvancedModeInput
} from '../../lib/types';
import { cloudFunctions } from '../../lib/firebase';
import { userPreferencesService } from '../../lib/userPreferencesService';
import toast from 'react-hot-toast';
import Image from 'next/image';
import ConversationList from '../ConversationList';
import SettingsMenu from '../SettingsMenu';
import ChatMessages from '../Chat/ChatMessages';
import ChatInputBar from '../Chat/ChatInputBar';
import SuggestedPrompts from '../Chat/SuggestedPrompts';
import ImageGenerator from '../ImageGenerator';
import VideoGenerator from '../VideoGenerator';

// ========================================
// 🎬 VIDEO BACKGROUND
// ========================================
const VideoBackground = memo(function VideoBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video 
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        autoPlay 
        muted 
        loop 
        playsInline
      >
        <source src="/images/fondo.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-20" />
    </div>
  );
});

// ========================================
// 👋 WELCOME SCREEN
// ========================================
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

// ========================================
// 💬 COMPONENTE PRINCIPAL
// ========================================
export default function ChatLayout() {
  const { userProfile, refreshProfile, plan, user } = useAuth();
  
  // Hook de Firestore
  const { 
    currentConversation,
    conversations,
    loading: conversationsLoading,
    createConversation,
    addMessage: addMessageToFirestore,
    loadConversation,
    updateTitle,
    setCurrentConversation
  } = useConversations();
  
  const router = useRouter();
  
  // Estados de la Interfaz
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVideoBackground, setShowVideoBackground] = useState(true);
  const [showConversationList, setShowConversationList] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [showVideoGenerator, setShowVideoGenerator] = useState(false);
  
  // Estados de Modos y Funcionalidad
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [voiceText, setVoiceText] = useState('');
  const [showVoiceText, setShowVoiceText] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [deepThinkingMode, setDeepThinkingMode] = useState(false);
  const [reportMode, setReportMode] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [currentMode, setCurrentMode] = useState<'normal' | 'developer' | 'specialist'>('normal');
  const [currentSpecialty, setCurrentSpecialty] = useState<SpecialtyType | undefined>();
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [advancedMode, setAdvancedMode] = useState<AdvancedModeType | null>(null);
  
  // Referencias
  const messagesEndRef = useRef<HTMLDivElement>(null); 
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null); 
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const maxTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Variables calculadas
  const messages = currentConversation?.messages || [];
  const validPlan: PlanType = isValidPlan(plan) ? plan : 'free';

  // ========================================
  // 🔧 FUNCIONES HELPER
  // ========================================
  const closeAllMenus = useCallback(() => {
    setShowConversationList(false);
    setShowSettingsMenu(false);
  }, []);

  const startNewConversation = useCallback(() => {
    if (!user) {
      console.error('❌ No user para crear conversación');
      return;
    }
    setCurrentConversation(null);
    console.log('✅ Lista para nueva conversación (se creará al enviar primer mensaje)');
  }, [user, setCurrentConversation]);

  const addMessage = useCallback(async (message: ChatMessage, conversationId?: string) => {
    const targetConversationId = conversationId || currentConversation?.id;
    
    if (!targetConversationId) {
      console.error('❌ No hay conversación activa');
      return false;
    }

    const success = await addMessageToFirestore(
      targetConversationId,
      message,
      validPlan
    );

    if (!success) {
      return false;
    }

    return true;
  }, [currentConversation, addMessageToFirestore, validPlan]);

  const updateConversationTitle = useCallback(async (conversationId: string, title: string) => {
    await updateTitle(conversationId, title);
  }, [updateTitle]);

  // ========================================
  // 📤 ENVIAR MENSAJE PRINCIPAL CON MEMORIA DE USUARIO
  // ========================================
  const sendCoreMessage = async (messageText: string) => {
    const hasContent = messageText.trim() || uploadedFiles.length > 0;
    if (!hasContent || isLoading) return;

    const originalFiles = [...uploadedFiles];
    
    setInput(''); 
    setUploadedFiles([]);
    
    let workingConversation = currentConversation;
    
    if (!workingConversation) {
      const title = messageText.substring(0, 30) + (messageText.length > 30 ? '...' : '');
      const newConv = await createConversation(title, currentMode, validPlan);
      
      if (!newConv) {
        setInput(messageText);
        setUploadedFiles(originalFiles);
        return;
      }
      
      workingConversation = newConv;
    }

    const userMessage: ChatMessage = { 
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_user`, 
      type: 'user', 
      message: messageText, 
      timestamp: new Date(), 
      tokensUsed: 0, 
      conversationId: workingConversation.id, 
      ...(originalFiles.length > 0 && { files: originalFiles.map(f => f.name) }) 
    };

    const userMessageAdded = await addMessage(userMessage, workingConversation.id);
    if (!userMessageAdded) {
      setInput(messageText);
      setUploadedFiles(originalFiles);
      return;
    }

    setIsLoading(true); 
    setChatStarted(true);

    try {
      const recentMessages = [...workingConversation.messages, userMessage].slice(-6);
      let processedMessage = messageText;
      
      if (reportMode) {
        processedMessage = `Como NORA, tu asistente personal experta, necesito crear un reporte completo sobre: "${messageText}".`;
      } else if (deepThinkingMode) {
        processedMessage = `Como NORA, necesito hacer un análisis profundo sobre: "${messageText}".`;
      }
      
      // ========================================
      // ✅ NUEVO: LEER PREFERENCIAS Y CONSTRUIR CONTEXTO DE USUARIO
      // ========================================
      let userContext = '';
      try {
        const preferences = await userPreferencesService.getPreferences();
        
        // Construir contexto personalizado
        const contextParts: string[] = [];
        
        // 1. Información de comandos frecuentes (extraer datos personales)
        if (preferences.frequentCommands && preferences.frequentCommands.length > 0) {
          const personalInfo: string[] = [];
          
          preferences.frequentCommands.forEach((cmd: any) => {
            // Detectar información personal en los comandos
            const command = cmd.command.toLowerCase();
            
            // Nombres
            if (command.includes('mi nombre es') || command.includes('me llamo')) {
              personalInfo.push(`- ${cmd.command}`);
            }
            
            // Profesión
            if (command.includes('soy') || command.includes('trabajo como') || command.includes('profesión')) {
              personalInfo.push(`- ${cmd.command}`);
            }
            
            // Ubicación
            if (command.includes('vivo en') || command.includes('soy de')) {
              personalInfo.push(`- ${cmd.command}`);
            }
            
            // Otros datos personales
            if (command.includes('tengo') && (command.includes('años') || command.includes('hijos'))) {
              personalInfo.push(`- ${cmd.command}`);
            }

            // Gustos y preferencias
            if (command.includes('me gusta') || command.includes('prefiero')) {
              personalInfo.push(`- ${cmd.command}`);
            }
          });
          
          if (personalInfo.length > 0) {
            contextParts.push('Información personal del usuario que mencionó antes:\n' + personalInfo.join('\n'));
          }
        }
        
        // 2. Proyectos activos
        if (preferences.activeProjects && preferences.activeProjects.length > 0) {
          const projects = preferences.activeProjects.map((p: any) => `- ${p.name} (${p.type}): ${p.description || 'Sin descripción'}`).join('\n');
          contextParts.push(`Proyectos activos del usuario:\n${projects}`);
        }
        
        if (contextParts.length > 0) {
          userContext = '\n\n--- CONTEXTO DEL USUARIO ---\n' + contextParts.join('\n\n') + '\n--- FIN CONTEXTO ---\n';
          console.log('🧠 Contexto de usuario cargado:', userContext);
        }
        
      } catch (prefError) {
        console.log('⚠️ No se pudieron cargar preferencias (no crítico)');
        // Continuar sin contexto de usuario
      }
      
      // Procesar archivos
      let fileContext = '';
      if (originalFiles.length > 0) {
        toast.loading(`Procesando ${originalFiles.length} archivo(s)...`, { id: 'processing-files' });
        const fileContents = await Promise.all(originalFiles.map(async (file, index) => { 
          const content = await processFileContent(file); 
          return `\n\n--- ARCHIVO ${index + 1}: ${file.name} ---\n${content}\n--- FIN ARCHIVO ${index + 1} ---\n`; 
        }));
        fileContext = fileContents.join('\n');
        toast.dismiss('processing-files');
        toast.success(`${originalFiles.length} archivo(s) procesados`);
      }

      let result: any;
      let aiMessage: ChatMessage;

      // MANEJAR DIFERENTES MODOS
      if (advancedMode) {
        const advancedInput: AdvancedModeInput = { 
          message: processedMessage + userContext, // ✅ Agregar contexto de usuario
          chatHistory: recentMessages.slice(0, -1).map(msg => ({ 
            role: msg.type === 'user' ? 'user' as const : 'assistant' as const, 
            content: msg.message 
          }))
        };
        result = await callAdvancedModeFunction(advancedMode, advancedInput);
        aiMessage = {
          id: `msg_${Date.now()}_ai`,
          type: 'ai',
          message: result.data.response,
          timestamp: new Date(),
          tokensUsed: result.data.tokensUsed,
          conversationId: workingConversation.id,
          advancedMode
        };
      } else if (currentMode === 'developer') {
        const devInput: DeveloperModeChatInput = {
          message: processedMessage + userContext, // ✅ Agregar contexto de usuario
          chatHistory: recentMessages.slice(0, -1)
        };
        result = await cloudFunctions.developerModeChat(devInput);
        aiMessage = {
          id: `msg_${Date.now()}_ai`,
          type: 'ai',
          message: result.data.response,
          timestamp: new Date(),
          tokensUsed: result.data.tokensUsed,
          conversationId: workingConversation.id,
          mode: 'developer'
        };
      } else if (currentMode === 'specialist' && currentSpecialty) {
        const specInput: SpecialistModeChatInput = {
          message: processedMessage + userContext, // ✅ Agregar contexto de usuario
          specialty: currentSpecialty,
          chatHistory: recentMessages.slice(0, -1)
        };
        result = await cloudFunctions.specialistModeChat(specInput);
        aiMessage = {
          id: `msg_${Date.now()}_ai`,
          type: 'ai',
          message: result.data.response,
          timestamp: new Date(),
          tokensUsed: result.data.tokensUsed,
          conversationId: workingConversation.id,
          mode: 'specialist',
          specialty: currentSpecialty
        };
      } else {
        // ✅ MODIFICADO: System prompt con instrucciones de memoria
        const baseSystemPrompt = validPlan === 'pro' || validPlan === 'pro_max' 
          ? `Eres NORA, una asistente de IA avanzada con memoria de usuario. Proporciona respuestas detalladas.` 
          : `Eres NORA con memoria del usuario. Responde de forma DIRECTA y CONCISA.`;
        
        const systemPrompt = baseSystemPrompt + 
          '\n\nIMPORTANTE: Tienes acceso a información personal del usuario de conversaciones anteriores que aparece en el CONTEXTO DEL USUARIO. ' +
          'Cuando el usuario pregunte algo que esté en el contexto proporcionado (como su nombre, profesión, gustos, etc.), usa esa información naturalmente sin mencionar que está en un "contexto". ' +
          'Si el usuario te pregunta su nombre o información personal, responde como si lo recordaras de conversaciones anteriores. ' +
          'Ejemplo: si preguntan "¿sabes cómo me llamo?" y en el contexto dice "mi nombre es Carlos", responde "Sí, te llamas Carlos" de forma natural.';

        const inputData: ChatWithAIInput = {
          message: processedMessage + userContext, // ✅ Agregar contexto de usuario al mensaje
          fileContext,
          chatHistory: recentMessages.slice(0, -1),
          maxTokens: validPlan === 'free' ? 1200 : validPlan === 'pro' ? 3000 : 6000,
          enableWebSearch: webSearchEnabled,
          systemPrompt,
          deepThinking: deepThinkingMode || reportMode
        };
        
        result = await cloudFunctions.chatWithAI(inputData);
        const chatResult = result.data as ChatWithAIOutput;
        
        aiMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_ai`,
          type: 'ai',
          message: chatResult.response,
          timestamp: new Date(),
          tokensUsed: chatResult.tokensUsed,
          conversationId: workingConversation.id,
          searchUsed: chatResult.searchUsed || false,
          searchResults: chatResult.searchResults,
          limitReached: chatResult.limitReached || false
        };
      }

      await addMessage(aiMessage!, workingConversation.id);
      await refreshProfile();

      // ✅ GUARDAR EN SISTEMA DE PREFERENCIAS
      try {
        // 1. Actualizar última sesión
        await userPreferencesService.updateLastSession(
          workingConversation.id,
          messageText,
          `Último mensaje: ${messageText.substring(0, 100)}`
        );

        // 2. Registrar comando frecuente (primeras 50 caracteres)
        await userPreferencesService.recordFrequentCommand(
          messageText.substring(0, 50),
          currentMode === 'developer' ? 'desarrollo' : 
          currentMode === 'specialist' ? 'especialista' : 
          'general'
        );

        console.log('✅ Preferencias actualizadas correctamente');
      } catch (prefError) {
        console.error('⚠️ Error actualizando preferencias (no crítico):', prefError);
        // No mostrar error al usuario, esto es opcional
      }

      if (reportMode) setReportMode(false);
      if (deepThinkingMode) setDeepThinkingMode(false);

    } catch (error: any) {
      let errorMessage = error.message?.includes('limit') || error.message?.includes('Límite')
        ? error.message 
        : 'Error al enviar mensaje';
      toast.error(errorMessage);
      
      setInput(messageText);
      setUploadedFiles(originalFiles);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = () => {
    sendCoreMessage(input);
  };

  // ========================================
  // 🔄 REGENERAR RESPUESTA
  // ========================================
  const regenerateResponse = async (messageId: string) => {
    const messageIndex = messages.findIndex((m: ChatMessage) => m.id === messageId);
    if (messageIndex === -1 || messageIndex === 0) return;
    const userMessage = messages[messageIndex - 1];
    if (userMessage.type !== 'user') return;
    
    setIsLoading(true);
    try {
      const recentMessages = messages.slice(0, messageIndex - 1).slice(-5);
      const systemPrompt = validPlan === 'pro' || validPlan === 'pro_max' 
        ? `Eres NORA, una asistente de IA avanzada. Proporciona respuestas detalladas.` 
        : `Eres NORA. Responde de forma DIRECTA y CONCISA.`;

      const inputData: ChatWithAIInput = {
        message: userMessage.message,
        fileContext: '',
        chatHistory: recentMessages,
        maxTokens: validPlan === 'free' ? 1200 : validPlan === 'pro' ? 3000 : 6000,
        enableWebSearch: webSearchEnabled,
        systemPrompt,
        deepThinking: true
      };
      
      const result = await cloudFunctions.chatWithAI(inputData);
      const chatResult = result.data as ChatWithAIOutput; 

      if (chatResult?.response) {
        const aiMessage: ChatMessage = {
          id: `msg_${Date.now()}_ai_regen`,
          type: 'ai',
          message: chatResult.response,
          timestamp: new Date(),
          conversationId: currentConversation?.id || '',
          tokensUsed: chatResult.tokensUsed,
          searchUsed: chatResult.searchUsed || false,
          searchResults: chatResult.searchResults,
          limitReached: chatResult.limitReached || false
        };
        
        await addMessage(aiMessage, currentConversation?.id);
        await refreshProfile();
        toast.success('Mensaje regenerado');
      }
    } catch (error) {
      toast.error('Error al regenerar');
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // 📋 COPIAR MENSAJE
  // ========================================
  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Mensaje copiado');
  };

  // ========================================
  // 📁 PROCESAR ARCHIVOS
  // ========================================
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
      reader.readAsText(file);
    });
  };

  // ========================================
  // 🎤 RECONOCIMIENTO DE VOZ
  // ========================================
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'es-ES';
      
      const MAX_RECORDING_TIME = 120000;
      const SILENCE_TIMEOUT = 3000;

      const resetSilenceTimer = () => {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
          console.log('🔇 Silencio detectado. Deteniendo...');
          recognitionInstance.stop();
        }, SILENCE_TIMEOUT);
      };

      recognitionInstance.onstart = () => {
        setIsRecording(true);
        setShowVoiceText(true);
        finalTranscriptRef.current = '';
        
        maxTimerRef.current = setTimeout(() => {
          console.log('⏱️ Tiempo máximo alcanzado');
          recognitionInstance.stop();
        }, MAX_RECORDING_TIME);
        
        resetSilenceTimer();
      };

      recognitionInstance.onresult = (event: any) => {
        resetSilenceTimer();
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript;
        }

        const displayText = finalTranscriptRef.current + interimTranscript;
        setVoiceText(displayText);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
        if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        
        if (finalTranscriptRef.current.trim()) {
          setFinalTranscript(finalTranscriptRef.current.trim());
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const processVoiceTranscript = async (transcript: string) => {
    if (!transcript || transcript.trim().length === 0) {
      toast.error('No se capturó audio');
      setVoiceText('');
      setShowVoiceText(false);
      return;
    }

    try {
      toast.loading('🧠 Corrigiendo ortografía...', { id: 'voice-proc' });
      
      const response = await fetch('/api/process-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript.trim() }),
      });
      
      if (!response.ok) {
        throw new Error('Error al corregir texto');
      }

      const data = await response.json();
      const correctedText = data.processedText || transcript;
      
      console.log('📝 Transcripción original:', transcript);
      console.log('✅ Texto corregido:', correctedText);
      
      setInput(correctedText);
      toast.dismiss('voice-proc');
      toast.success('Texto corregido');
      
      await sendCoreMessage(correctedText);

    } catch (error) {
      console.error('Voice processing failed:', error);
      toast.dismiss('voice-proc');
      toast.error('❌ Error al corregir. Usando transcripción original.');
      
      await sendCoreMessage(transcript);
      
    } finally {
      setTimeout(() => {
        setVoiceText('');
        setShowVoiceText(false);
      }, 3000);
    }
  };

  useEffect(() => {
    if (finalTranscript) {
      setFinalTranscript('');
      processVoiceTranscript(finalTranscript);
    }
  }, [finalTranscript]);

  const startVoiceRecording = useCallback(() => {
    if (recognition) {
      try {
        recognition.start();
        toast.success('🎤 Grabación iniciada');
      } catch (error) {
        console.error('Error iniciando grabación:', error);
        toast.error('Error al iniciar grabación');
      }
    } else {
      toast.error('Reconocimiento de voz no disponible');
    }
  }, [recognition]);

  const stopVoiceRecording = useCallback(() => {
    if (recognition) {
      recognition.stop();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
      toast.dismiss('voice-rec');
      toast.loading('🧠 Corrigiendo ortografía...', { id: 'voice-proc' });
    }
  }, [recognition]);

  // ========================================
  // 🎛️ MODOS AVANZADOS
  // ========================================
  const callAdvancedModeFunction = async (mode: AdvancedModeType, input: any) => {
    switch (mode) {
      case 'travel_planner': return await cloudFunctions.travelPlanner(input);
      case 'ai_detector': return await cloudFunctions.aiDetector(input);
      case 'text_humanizer': return await cloudFunctions.textHumanizer(input);
      case 'brand_analyzer': return await cloudFunctions.brandAnalyzer(input);
      case 'document_detective': return await cloudFunctions.documentDetective(input);
      case 'plant_doctor': return await cloudFunctions.plantDoctor(input);
      default: throw new Error(`Modo avanzado no reconocido: ${mode}`);
    }
  };

  // ========================================
  // 🎯 HANDLERS DE UI
  // ========================================
  const handleStartChat = async () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowVideoBackground(false);
      setChatStarted(true);
      setIsTransitioning(false);
      if (textareaRef.current) textareaRef.current.focus();
    }, 800);
  };

  const handleSelectPrompt = async (prompt: string) => {
    if (!chatStarted) {
      setIsTransitioning(true);
      setTimeout(() => {
        setShowVideoBackground(false);
        setChatStarted(true);
        setIsTransitioning(false);
      }, 800);
    }
    
    await sendCoreMessage(prompt);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} archivo(s) agregado(s)`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => { 
    setUploadedFiles(prev => prev.filter((_, i) => i !== index)); 
  };

  const toggleImageGenerator = () => { 
    setShowImageGenerator(prev => !prev); 
    closeAllMenus(); 
  };

  const toggleVideoGenerator = () => { 
    setShowVideoGenerator(prev => !prev); 
    closeAllMenus(); 
  };

  const handleModeChange = useCallback((mode: 'normal' | 'developer' | 'specialist', specialty?: SpecialtyType) => {
    setCurrentMode(mode);
    setCurrentSpecialty(specialty);
  }, []);

  // ========================================
  // 🎧 EFECTOS
  // ========================================
  useEffect(() => {
    const checkMobile = () => { setIsMobile(window.innerWidth < 768); };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (currentConversation && currentConversation.messages.length > 0) {
      console.log('✅ Conversación cargada en ChatLayout:', currentConversation.id);
      
      setChatStarted(true);
      setShowVideoBackground(false);
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [currentConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 96) + 'px';
    }
  }, [input]);

  // ========================================
  // 🎨 RENDER
  // ========================================
  if (!user || !userProfile) return null;

  return (
    <div className="h-screen bg-black text-white overflow-hidden relative">
      {showVideoBackground && <VideoBackground />}
      
      {isTransitioning && (<div className="fixed inset-0 z-[100] bg-black animate-slide-right" />)}
      
      {/* HEADER */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm transition-all duration-300 main-header ${
        showConversationList && !isMobile ? 'ml-80' : ''
      }`}>
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <button 
              onClick={() => { 
                setShowSettingsMenu(false);
                setShowConversationList(prev => !prev); 
              }} 
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={() => router.push('/')} className="flex items-center">
              <Image src="/images/nora.png" alt="NORA" width={80} height={80} className="rounded-full w-14 h-14 md:w-20 md:h-20" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => { 
                setShowConversationList(false);
                setShowSettingsMenu(prev => !prev); 
              }} 
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* SIDEBARS */}
      {showConversationList && (
        <div className={`fixed top-16 left-0 bottom-0 z-40 ${isMobile ? 'right-0' : 'w-80'} bg-gray-900 border-r border-gray-800 overflow-hidden sidebar-panel-conv`}>
          <ConversationList 
            isOpen={showConversationList} 
            onClose={() => setShowConversationList(false)} 
            onNewConversation={() => { 
              setCurrentConversation(null);
              setShowConversationList(false); 
            }}
            onLoadConversation={loadConversation}
            currentConversationId={currentConversation?.id}
          />
        </div>
      )}
      
      {showSettingsMenu && (
        <div className="fixed top-16 right-0 bottom-0 z-40 w-96 bg-gray-900 border-l border-gray-800 sidebar-panel-settings">
          <SettingsMenu isOpen={showSettingsMenu} onClose={() => setShowSettingsMenu(false)} />
        </div>
      )}

      {/* MAIN CONTENT */}
      <div ref={mainContentRef} className={`fixed top-16 left-0 right-0 bottom-0 transition-all duration-300 ${
        showConversationList && !isMobile ? 'ml-80' : ''
      }`}>
        {!chatStarted && !currentConversation?.messages.length ? (
          <WelcomeScreen onStartChat={handleStartChat} />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden h-full">
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              regenerateResponse={regenerateResponse}
              copyMessage={copyMessage}
              messagesEndRef={messagesEndRef}
              currentMode={currentMode}
              advancedMode={advancedMode}
              reportMode={reportMode}
              deepThinkingMode={deepThinkingMode}
            />
            
            {(showImageGenerator || showVideoGenerator) && (
              <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto p-4">
                  {showImageGenerator && (
                    <ImageGenerator 
                      isEmbedded={true} 
                      onImageGenerated={(image: any) => { 
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
                      onClose={() => setShowImageGenerator(false)} 
                    />
                  )}
                  {showVideoGenerator && (
                    <VideoGenerator onClose={() => setShowVideoGenerator(false)} />
                  )}
                </div>
              </div>
            )}

            {messages.length === 0 && !isLoading && (
              <div className="flex-shrink-0 pb-2">
                <SuggestedPrompts onSelectPrompt={handleSelectPrompt} />
              </div>
            )}
            
            <ChatInputBar
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
              isLoading={isLoading}
              userProfile={userProfile}
              currentMode={currentMode}
              currentSpecialty={currentSpecialty}
              webSearchEnabled={webSearchEnabled}
              setWebSearchEnabled={setWebSearchEnabled}
              deepThinkingMode={deepThinkingMode}
              setDeepThinkingMode={setDeepThinkingMode}
              reportMode={reportMode}
              setReportMode={setReportMode}
              advancedMode={advancedMode}
              setAdvancedMode={setAdvancedMode}
              handleModeChange={handleModeChange}
              uploadedFiles={uploadedFiles}
              removeFile={removeFile}
              handleFileUpload={handleFileUpload}
              isRecording={isRecording}
              startVoiceRecording={startVoiceRecording}
              stopVoiceRecording={stopVoiceRecording}
              voiceText={voiceText}
              showVoiceText={showVoiceText}
              toggleImageGenerator={toggleImageGenerator}
              toggleVideoGenerator={toggleVideoGenerator}
              textareaRef={textareaRef}
              fileInputRef={fileInputRef}
            />
          </div>
        )}
      </div>
    </div>
  );
}