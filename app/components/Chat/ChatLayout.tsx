// app/components/Chat/ChatLayout.tsx (Main Orchestrator)
'use client';

import { useState, useRef, useEffect, memo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { 
  Menu, Settings, ArrowRight, Code, Zap, Brain
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useConversations } from '../../contexts/ConversationContext';
import { useRouter } from 'next/navigation';
import { cloudFunctions, helpers } from '../../lib/firebase';
import { 
    ChatMessage, PlanType, isValidPlan, SpecialtyType, AdvancedModeType,
    ChatWithAIInput, ChatWithAIOutput, DeveloperModeChatInput, DeveloperModeChatOutput, 
    SpecialistModeChatInput, SpecialistModeChatOutput, AdvancedModeOutput
} from '../../lib/types';
import toast from 'react-hot-toast';

// 1. IMPORTAMOS LOS NUEVOS SUBCOMPONENTES
import ChatInputBar from './ChatInputBar';
import ChatMessages from './ChatMessages';

// Importaciones dinÃ¡micas mantenidas
const ConversationList = dynamic(() => import('../ConversationList'), { ssr: false });
const SettingsMenu = dynamic(() => import('../SettingsMenu'), { ssr: false });
const ImageGenerator = dynamic(() => import('../ImageGenerator'), { ssr: false });
const VideoGenerator = dynamic(() => import('../VideoGenerator'), { ssr: false });
const SpecialistChatInterface = dynamic(() => import('../SpecialistChatInterface'), { ssr: false }); 

// Componentes UI de ayuda
const VideoBackground = memo(function VideoBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video 
        className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105"
        style={{ objectPosition: 'center 30%' }}
        autoPlay muted loop playsInline preload="metadata"
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
          Â¿En quÃ© puedo ayudarte el dÃ­a de hoy?
        </p>
        <button
          onClick={onStartChat}
          className="group relative inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-purple-500/50"
        >
          <span>Empezar conversaciÃ³n</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
});

export default function ChatLayout() {
  const { userProfile, refreshProfile, plan, user } = useAuth();
  const { 
    currentConversation, startNewConversation, addMessage, updateConversationTitle
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
  
  // NEW state for long-listening pipeline
  const [finalTranscript, setFinalTranscript] = useState('');
  
  // Voice Refs
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const maxTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Variables calculadas
  const messages = currentConversation?.messages || [];
  const validPlan: PlanType = isValidPlan(plan) ? plan : 'free';

  // --- LÃ“GICA DE UI Y ESTADO ---

  const closeAllMenus = useCallback(() => {
    setShowConversationList(false);
    setShowSettingsMenu(false);
  }, []);
  
  // Fix: Cierre de menÃºs al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        const isMenuOpen = showConversationList || showSettingsMenu || showImageGenerator || showVideoGenerator;
        if (!isMenuOpen) return;

        const sidebar = document.querySelector('.sidebar-panel-conv');
        const settings = document.querySelector('.sidebar-panel-settings');
        const header = document.querySelector('.main-header');
        const inputBar = document.querySelector('.floating-input-container'); 

        const isClickInSidebar = sidebar && sidebar.contains(event.target as Node);
        const isClickInSettings = settings && settings.contains(event.target as Node);
        const isClickInHeader = header && header.contains(event.target as Node);
        const isClickInInputBar = inputBar && inputBar.contains(event.target as Node);
        
        // Cierra los sidebars principales si el clic estÃ¡ fuera de ellos y fuera de los botones de toggle
        if (!isClickInSidebar && showConversationList) {
            if (!isClickInHeader) setShowConversationList(false);
        }
        if (!isClickInSettings && showSettingsMenu) {
            if (!isClickInHeader) setShowSettingsMenu(false);
        }
        
        // Cierra los modales de generadores si el clic estÃ¡ fuera
        if (showImageGenerator && !isClickInInputBar) setShowImageGenerator(false);
        if (showVideoGenerator && !isClickInInputBar) setShowVideoGenerator(false);
    };

    const timeout = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
    }, 100); 

    return () => {
        clearTimeout(timeout);
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, [showConversationList, showSettingsMenu, showImageGenerator, showVideoGenerator]);


  useEffect(() => {
    const checkMobile = () => { setIsMobile(window.innerWidth < 768); };
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 96) + 'px';
    }
  }, [input]);
  
  // --- REFACTORING VOICE RECOGNITION EFFECT ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      // --- CRUCIAL CHANGES FOR LONG LISTENING ---
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      // ------------------------------------------
      recognitionInstance.lang = 'es-ES';
      
      const MAX_RECORDING_TIME = 120000; // 2 minutes in ms
      const SILENCE_TIMEOUT = 3000;      // 3 seconds in ms

      const resetSilenceTimer = () => {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
          console.log('🔇 Silence detected. Stopping recording.');
          recognitionInstance.stop();
        }, SILENCE_TIMEOUT);
      };

      const resetMaxTimer = () => {
        if (maxTimerRef.current) {
          clearTimeout(maxTimerRef.current);
        }
        maxTimerRef.current = setTimeout(() => {
          console.log('⏱️ Max recording time reached. Stopping recording.');
          recognitionInstance.stop();
        }, MAX_RECORDING_TIME);
      };


      recognitionInstance.onstart = () => {
        setIsRecording(true);
        finalTranscriptRef.current = '';
        setVoiceText('');
        resetSilenceTimer();
        resetMaxTimer();
        toast.loading('🎙️ Escuchando... Di algo y haré la corrección.', { id: 'voice-rec' });
      };

      recognitionInstance.onresult = (event: any) => {
        resetSilenceTimer(); // Reset silence timer on every voice result

        let interimTranscript = '';
        let finalSegment = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalSegment += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Accumulate final segments
        if (finalSegment) {
          finalTranscriptRef.current += finalSegment;
        }

        // Show interim transcript or accumulated final transcript
        setVoiceText(interimTranscript || finalTranscriptRef.current.trim());
      };

      recognitionInstance.onerror = (event: any) => { 
        console.error('Error en reconocimiento de voz:', event);
        setIsRecording(false); 
        toast.dismiss('voice-rec');
        toast.error('❌ Error o no se detectó voz.'); 
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
      };
      
      recognitionInstance.onend = () => { 
        setIsRecording(false); 
        toast.dismiss('voice-rec');
        
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (maxTimerRef.current) clearTimeout(maxTimerRef.current);

        const finalResult = finalTranscriptRef.current.trim();
        if (finalResult.length > 0) {
          console.log('Final transcript accumulated. Ready to process:', finalResult);
          setFinalTranscript(finalResult); // Set the final result to trigger processing
        } else {
          console.log('Recording ended without valid final transcript.');
          setVoiceText('');
        }
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // --- NEW EFFECT TO HANDLE FINAL TRANSCRIPT PROCESSING ---
  useEffect(() => {
    if (finalTranscript) {
      // Clear finalTranscript state immediately to prevent re-triggering
      setFinalTranscript('');
      
      // Start processing pipeline
      processVoiceTranscript(finalTranscript);
    }
  }, [finalTranscript, user?.uid, currentConversation?.id]); // Dependencias para evitar warnings
  
  const handleStartChat = async () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowVideoBackground(false);
      setChatStarted(true);
      setIsTransitioning(false);
      if (!currentConversation) startNewConversation();
      if (textareaRef.current) textareaRef.current.focus();
    }, 800);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} archivo(s) agregado(s)`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const removeFile = (index: number) => { setUploadedFiles(prev => prev.filter((_, i) => i !== index)); };
  const toggleImageGenerator = () => { setShowImageGenerator(prev => !prev); closeAllMenus(); };
  const toggleVideoGenerator = () => { setShowVideoGenerator(prev => !prev); closeAllMenus(); };
  const handleModeChange = useCallback((mode: 'normal' | 'developer' | 'specialist', specialty?: SpecialtyType) => {
    setCurrentMode(mode);
    setCurrentSpecialty(specialty);
  }, []);

  const processFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (file.type === 'application/json') {
          try {
            const json = JSON.parse(content);
            resolve(`Contenido JSON:\n${JSON.stringify(json, null, 2)}`);
          } catch { resolve(content); }
        } else { resolve(content); }
      };
      reader.onerror = () => reject(new Error(`Error leyendo ${file.name}`));
      // Only PDF/Text files are expected here; images are multimodal now.
      reader.readAsText(file);
    });
  };

  const copyMessage = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast.success('Mensaje copiado'); } 
    catch (error) { toast.error('Error al copiar'); }
  };
  
  // --- VOICE RECORDING HANDLERS ---
  const startVoiceRecording = useCallback(() => { 
    if (recognition) {
      try {
        recognition.start();
      } catch (e) {
        console.error('Recognition already started or error in start:', e);
        // Force stop if it appears to be already running
        if (isRecording) stopVoiceRecording();
        else recognition.start();
      }
    } else {
      toast.error('❌ API de voz no disponible en tu navegador.');
    }
  }, [recognition, isRecording]);

  const stopVoiceRecording = useCallback(() => { 
    if (recognition) {
      recognition.stop();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
      toast.dismiss('voice-rec');
      toast.loading('🧠 Corrigiendo y procesando texto...', { id: 'voice-proc' });
    }
  }, [recognition]);

  const processVoiceTranscript = async (transcript: string) => {
    if (!transcript.trim()) {
      toast.error('No se detectó voz o el texto es muy corto.');
      return;
    }

    try {
      // 1. Send to /api/process-voice for correction
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
      
      // 2. Set corrected text as the final input and send message
      setInput(correctedText);
      
      // Clear the temporary voice processing toast
      toast.dismiss('voice-proc');
      
      // 3. Trigger main message sending pipeline immediately with the corrected input
      await sendCoreMessage(correctedText);

    } catch (error) {
      console.error('Voice processing failed:', error);
      toast.dismiss('voice-proc');
      toast.error('❌ Error al procesar voz. Usando transcripción original.');
      // Fallback: Use original transcript if API fails
      await sendCoreMessage(transcript);
    } finally {
      // Clean up display state after a short delay
      setTimeout(() => {
        setVoiceText('');
        setShowVoiceText(false);
      }, 3000);
    }
  };
  // --- END VOICE RECORDING HANDLERS ---


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

  const sendCoreMessage = async (messageText: string) => {
    const hasContent = messageText.trim() || uploadedFiles.length > 0;
    if (!hasContent || isLoading) return;

    // Use a copy of the current files for the message, then clear the state.
    const originalFiles = [...uploadedFiles];
    
    // Clear input/files states immediately
    setInput(''); 
    setUploadedFiles([]);
    
    if (!currentConversation) await startNewConversation();

    const workingConversation = currentConversation || { id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, userId: user?.uid || '', title: 'Nueva conversaciÃ³n', messages: [], createdAt: new Date(), updatedAt: new Date(), lastActivity: new Date(), messageCount: 0, isArchived: false, tags: [] };

    const userMessage: ChatMessage = { id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_user`, type: 'user', message: messageText, timestamp: new Date(), tokensUsed: 0, conversationId: workingConversation.id, ...(originalFiles.length > 0 && { files: originalFiles.map(f => f.name) }) };
    addMessage(userMessage);

    const updatedConversation = { ...workingConversation, messages: [...workingConversation.messages, userMessage], updatedAt: new Date() };
    if (workingConversation.messages.length === 0) updateConversationTitle(updatedConversation.id, messageText.substring(0, 20));

    setIsLoading(true); setChatStarted(true);

    try {
      const recentMessages = updatedConversation.messages.slice(-6);
      let processedMessage = messageText;
      if (reportMode) processedMessage = `Como NORA, tu asistente personal experta, necesito crear un reporte completo sobre: "${messageText}".`;
      else if (deepThinkingMode) processedMessage = `Como NORA, necesito hacer un anÃ¡lisis profundo sobre: "${messageText}".`;
      
      let fileContext = '';
      if (originalFiles.length > 0) {
        toast.loading(`Procesando ${originalFiles.length} archivo(s)...`, { id: 'processing-files' });
        const fileContents = await Promise.all(originalFiles.map(async (file, index) => { const content = await processFileContent(file); return `\n\n--- ARCHIVO ${index + 1}: ${file.name} ---\n${content}\n--- FIN ARCHIVO ${index + 1} ---\n`; }));
        fileContext = fileContents.join('\n');
        toast.dismiss('processing-files');
        toast.success(`${originalFiles.length} archivo(s) procesados`);
      }

      let result: any;
      let aiMessage: ChatMessage;

      if (advancedMode) {
        const advancedInput = { message: processedMessage, chatHistory: recentMessages.slice(0, -1).map(msg => ({ role: msg.type === 'user' ? 'user' as const : 'assistant' as const, content: msg.message })), ...(fileContext && { fileContext }) };
        result = await callAdvancedModeFunction(advancedMode, advancedInput);
        const advancedResult = result.data as AdvancedModeOutput;

        aiMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_ai`, type: 'ai', message: advancedResult.response, timestamp: new Date(),
          tokensUsed: advancedResult.tokensUsed || 0, conversationId: updatedConversation.id,
          mode: 'advanced', advancedMode: advancedMode || undefined, 
        };
        setAdvancedMode(null);
      } else if (currentMode === 'normal') {
        const systemPrompt = validPlan === 'pro' || validPlan === 'pro_max' ? `Eres NORA, una asistente de IA avanzada. Proporciona respuestas detalladas.` : `Eres NORA. Responde de forma DIRECTA y CONCISA.`;
        const inputData: ChatWithAIInput = { message: processedMessage, fileContext, chatHistory: recentMessages.slice(0, -1), maxTokens: validPlan === 'free' ? 1200 : validPlan === 'pro' ? 3000 : 6000, enableWebSearch: webSearchEnabled, systemPrompt, deepThinking: deepThinkingMode };
        result = await cloudFunctions.chatWithAI(inputData);
        const chatResult = result.data as ChatWithAIOutput;

        aiMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_ai`, type: 'ai', message: chatResult.response, timestamp: new Date(),
          tokensUsed: chatResult.tokensUsed, conversationId: updatedConversation.id,
          searchUsed: chatResult.searchUsed || false, searchResults: chatResult.searchResults,
          limitReached: chatResult.limitReached || false
        };
        if (chatResult.limitReached) toast.error('Has alcanzado el lÃ­mite de tu plan');
      } else { // Developer or Specialist Mode
        const specialty = currentMode === 'developer' ? 'programming' as SpecialtyType : currentSpecialty;
        
        if (currentMode === 'developer') {
            const input: DeveloperModeChatInput = { message: processedMessage, chatHistory: recentMessages.slice(0, -1), fileContext };
            result = await cloudFunctions.developerModeChat(input);
            const devResult = result.data as DeveloperModeChatOutput;
            
            aiMessage = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_ai`, type: 'ai', message: devResult.response, timestamp: new Date(),
                tokensUsed: devResult.tokensUsed, conversationId: updatedConversation.id,
                mode: 'developer', specialty: 'programming' as SpecialtyType
            };
        } else {
            const input: SpecialistModeChatInput = { message: processedMessage, specialty: specialty as SpecialtyType, chatHistory: recentMessages.slice(0, -1), fileContext };
            result = await cloudFunctions.specialistModeChat(input);
            const specResult = result.data as SpecialistModeChatOutput;

             aiMessage = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_ai`, type: 'ai', message: specResult.response, timestamp: new Date(),
                tokensUsed: specResult.tokensUsed, conversationId: updatedConversation.id,
                mode: 'specialist', specialty: specResult.specialty, specialtyName: specResult.specialtyName
            };
        }
      }

      addMessage(aiMessage!);
      await refreshProfile();

      if (reportMode) setReportMode(false);
      if (deepThinkingMode) setDeepThinkingMode(false);

    } catch (error: any) {
      let errorMessage = error.message?.includes('limit') ? 'LÃ­mite alcanzado' : 'Error al enviar mensaje';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = () => {
    // This is the handler for the button click
    sendCoreMessage(input);
  };

  const regenerateResponse = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1 || messageIndex === 0) return;
    const userMessage = messages[messageIndex - 1];
    if (userMessage.type !== 'user') return;
    
    setIsLoading(true);
    try {
      const recentMessages = messages.slice(0, messageIndex - 1).slice(-5);
      const systemPrompt = validPlan === 'pro' || validPlan === 'pro_max' ? `Eres NORA, una asistente de IA avanzada. Proporciona respuestas detalladas.` : `Eres NORA. Responde de forma DIRECTA y CONCISA.`;

      const inputData: ChatWithAIInput = {
        message: userMessage.message, fileContext: '', chatHistory: recentMessages,
        maxTokens: validPlan === 'free' ? 1200 : validPlan === 'pro' ? 3000 : 6000,
        enableWebSearch: webSearchEnabled, systemPrompt, deepThinking: true // Deep thinking for regen
      };
      const result = await cloudFunctions.chatWithAI(inputData);
      
      const chatResult = result.data as ChatWithAIOutput; 

      if (chatResult?.response) {
        const aiMessage: ChatMessage = {
          id: `msg_${Date.now()}_ai_regen`, type: 'ai', message: chatResult.response, timestamp: new Date(),
          conversationId: currentConversation?.id || '', tokensUsed: chatResult.tokensUsed,
          searchUsed: chatResult.searchUsed || false, searchResults: chatResult.searchResults,
          limitReached: chatResult.limitReached || false
        };
        addMessage(aiMessage);
        await refreshProfile();
        toast.success('Mensaje regenerado');
      }
    } catch (error) {
      toast.error('Error al regenerar');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !userProfile) return null;

  // --- RENDERIZADO PRINCIPAL ---
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
                setShowSettingsMenu(false); // Close other menu
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
                setShowConversationList(false); // Close other menu
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
          <ConversationList isOpen={showConversationList} onClose={() => setShowConversationList(false)} onNewConversation={() => { startNewConversation(); setShowConversationList(false); }} />
        </div>
      )}
      {showSettingsMenu && (
        <div className="fixed top-16 right-0 bottom-0 z-40 w-96 bg-gray-900 border-l border-gray-800 sidebar-panel-settings">
          <SettingsMenu isOpen={showSettingsMenu} onClose={() => setShowSettingsMenu(false)} />
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div ref={mainContentRef} className={`fixed top-16 left-0 right-0 bottom-0 transition-all duration-300 ${
        showConversationList && !isMobile ? 'ml-80' : ''
      }`}>
        {!chatStarted && !currentConversation?.messages.length ? (
          <WelcomeScreen onStartChat={handleStartChat} />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden h-full">
            
            {/* 3. MENSAJES O INTERFAZ ESPECIALIZADA */}
            {currentMode === 'normal' || currentMode === 'developer' || currentMode === 'specialist' ? (
              <>
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
                
                {/* Modals for Generators */}
                {(showImageGenerator || showVideoGenerator) && (
                  <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                    <div className="max-w-4xl mx-auto p-4">
                      {showImageGenerator && <ImageGenerator isEmbedded={true} onImageGenerated={(image) => { const imageMessage: ChatMessage = { id: `msg_${Date.now()}_image`, type: 'ai', message: `Imagen generada: ${image.prompt}`, timestamp: new Date(), conversationId: currentConversation?.id || '', imageUrl: image.imageUrl }; addMessage(imageMessage); setShowImageGenerator(false); }} onClose={() => setShowImageGenerator(false)} />}
                      {showVideoGenerator && <VideoGenerator onClose={() => setShowVideoGenerator(false)} />}
                    </div>
                  </div>
                )}
                
                {/* 4. CHAT INPUT BAR */}
                <ChatInputBar
                  input={input} setInput={setInput} sendMessage={sendMessage} isLoading={isLoading} userProfile={userProfile}
                  currentMode={currentMode} currentSpecialty={currentSpecialty}
                  webSearchEnabled={webSearchEnabled} setWebSearchEnabled={setWebSearchEnabled}
                  deepThinkingMode={deepThinkingMode} setDeepThinkingMode={setDeepThinkingMode}
                  reportMode={reportMode} setReportMode={setReportMode}
                  advancedMode={advancedMode} setAdvancedMode={setAdvancedMode} handleModeChange={handleModeChange}
                  uploadedFiles={uploadedFiles} removeFile={removeFile} handleFileUpload={handleFileUpload}
                  isRecording={isRecording} startVoiceRecording={startVoiceRecording} stopVoiceRecording={stopVoiceRecording}
                  voiceText={voiceText} showVoiceText={showVoiceText}
                  toggleImageGenerator={toggleImageGenerator} toggleVideoGenerator={toggleVideoGenerator}
                  textareaRef={textareaRef} fileInputRef={fileInputRef}
                />
              </>
            ) : (
              // Interfaz para modos especiales (Developer/Specialist)
              <div className="flex-1 overflow-hidden p-4">
                <SpecialistChatInterface
                  userProfile={userProfile!} currentMode={currentMode} currentSpecialty={currentSpecialty}
                  chatHistory={messages} onNewMessage={addMessage} onError={(error) => toast.error(error)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ESTILOS GLOBALES REQUERIDOS */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lastica:wght@300;400;500;600;700&display=swap');
        
        .floating-card { background: linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03)); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1); transition: all 0.3s ease; }
        .floating-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.12); }
        .floating-input-container { background: linear-gradient(145deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 9999px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1); }
        .floating-icon-button { background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02)); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 9999px; transition: all 0.3s ease; }
        .floating-icon-button:hover { background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05)); border-color: rgba(255, 255, 255, 0.15); transform: scale(1.05); }
        .floating-send-button { background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02)); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 9999px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .floating-send-button.active { background: linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08)); border: 2px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1), 0 4px 16px rgba(0, 0, 0, 0.1); }
        .floating-send-button.active:hover { background: linear-gradient(145deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.12)); transform: scale(1.05); box-shadow: 0 12px 40px rgba(255, 255, 255, 0.15), 0 6px 20px rgba(0, 0, 0, 0.15); }
        .floating-send-button.disabled { background: linear-gradient(145deg, rgba(107, 114, 128, 0.15), rgba(107, 114, 128, 0.08)); color: #9ca3af; cursor: not-allowed; opacity: 0.5; }
        .floating-menu { background: linear-gradient(145deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.8)); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1); overflow: hidden; }
        .floating-menu-item { width: 100%; padding: 0.75rem 1rem; text-align: left; transition: all 0.3s ease; background: transparent; border: none; color: white; }
        .floating-menu-item:hover { background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04)); }
        .floating-submenu { background: linear-gradient(145deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.8)); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1); }
        .custom-scroll { scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.15) transparent; }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.25); }
        * { font-family: 'Lastica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        @keyframes card-in { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-card-in { animation: card-in 0.8s ease-out forwards; }
        @keyframes slide-right { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-slide-right { animation: slide-right 0.8s ease-out; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 1s ease-out; }
      `}</style>
    </div>
  );
}