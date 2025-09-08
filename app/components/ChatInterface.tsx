// components/ChatInterface.tsx - OPTIMIZADO PARA MÓVILES
'use client';

import { useState, useRef, useEffect, memo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  Send, 
  Loader2, 
  Crown, 
  TrendingUp, 
  Copy, 
  RefreshCw, 
  Menu,
  Settings,
  Plus,
  MessageCircle,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../contexts/ConversationContext';
import { useRouter } from 'next/navigation';
import { cloudFunctions, helpers } from '../lib/firebase';
import { ChatMessage } from '../lib/types';
import toast from 'react-hot-toast';
import Image from 'next/image';

// ✅ LAZY LOADING PARA COMPONENTES PESADOS
const ConversationList = dynamic(() => import('./ConversationList'), {
  loading: () => <div className="w-80 h-full bg-black/60 animate-pulse" />,
  ssr: false
});

const SettingsMenu = dynamic(() => import('./SettingsMenu'), {
  loading: () => <div className="w-96 h-full bg-black/60 animate-pulse" />,
  ssr: false
});

// ✅ IMPORTAR EL NUEVO COMPONENTE DE VIDEO OPTIMIZADO
const MobileOptimizedVideoBackground = dynamic(() => import('./MobileOptimizedVideoBackground'), {
  loading: () => <div className="absolute inset-0 bg-black" />,
  ssr: false
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
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVideoBackground, setShowVideoBackground] = useState(true);
  const [showConversationList, setShowConversationList] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const messages = currentConversation?.messages || [];

  // ✅ DETECTAR DISPOSITIVO MÓVIL Y ORIENTACIÓN
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod'];
      return mobileKeywords.some(keyword => userAgent.includes(keyword)) || 
             window.innerWidth <= 768 ||
             'ontouchstart' in window;
    };

    const checkOrientation = () => {
      return window.innerWidth > window.innerHeight;
    };

    const updateMobileState = () => {
      setIsMobile(checkMobile());
      setIsLandscape(checkOrientation());
    };

    updateMobileState();

    const handleResize = () => {
      updateMobileState();
    };

    const handleOrientationChange = () => {
      // Delay para permitir que la orientación se complete
      setTimeout(updateMobileState, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setChatStarted(true);
      setShowVideoBackground(false);
    }
  }, [messages.length]);

  // ✅ SCROLL OPTIMIZADO PARA MÓVILES
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      // En móviles, usar scroll suave solo si no es un dispositivo de bajo rendimiento
      const behavior = isMobile ? 'auto' : 'smooth';
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  }, [isMobile]);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  // ✅ TEXTAREA AUTO-RESIZE OPTIMIZADO
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = isLandscape ? 80 : 120;
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
      
      textareaRef.current.style.overflowY = textareaRef.current.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [input, isLandscape]);

  const checkTokensAvailable = () => {
    if (!userProfile) return { allowed: false, tokensLeft: 0 };
    const tokensLeft = userProfile.usage.daily.tokensRemaining;
    return { allowed: tokensLeft > 0, tokensLeft: tokensLeft };
  };

  const formatAIResponse = (response: string) => {
    return response
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\"(.*?)\"/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .trim();
  };

  const generateTitle = (message: string): string => {
    const cleanMessage = message.trim();
    if (cleanMessage.length <= 20) return cleanMessage;
    const cutPoint = cleanMessage.lastIndexOf(' ', 19);
    return cleanMessage.substring(0, cutPoint > 10 ? cutPoint : 20);
  };

  const handleStartChat = () => {
    setChatStarted(true);
    setShowVideoBackground(false);
    if (!currentConversation) {
      startNewConversation();
    }
  };

  const shouldShowUpgradeWarning = () => {
    if (!userProfile || plan !== 'free') return false;
    const tokensUsed = userProfile.usage.daily.tokensUsed;
    const tokensLimit = userProfile.usage.daily.tokensLimit;
    const percentage = helpers.getUsagePercentage(tokensUsed, tokensLimit);
    return percentage >= 90;
  };

  // ✅ COPY OPTIMIZADO PARA MÓVILES
  const handleCopy = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback para dispositivos móviles más antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      // Feedback visual más prominente en móviles
      toast.success(isMobile ? 'Copiado ✓' : 'Texto copiado al portapapeles', {
        duration: isMobile ? 2000 : 4000
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Error al copiar texto');
    }
  };

  const handleRegenerate = async (index: number) => {
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
        maxTokens: plan === 'free' ? 150 : plan === 'pro' ? 500 : 1000
      };

      const result = await cloudFunctions.chatWithAI(inputData);
      
      if (result.data?.response) {
        toast.success('Respuesta regenerada');
        await refreshProfile();
      }
    } catch (error) {
      console.error('Error regenerating message:', error);
      toast.error('Error al regenerar respuesta');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    const messageText = input.trim();
    if (!messageText || !user || isLoading) return;

    const tokenCheck = checkTokensAvailable();
    if (!tokenCheck.allowed) {
      toast.error(isMobile ? 'Sin tokens disponibles' : 'No tienes tokens disponibles. Actualiza tu plan o espera al reset diario.');
      return;
    }

    if (!currentConversation) {
      startNewConversation();
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user_${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      message: messageText,
      timestamp: new Date(),
      conversationId: currentConversation?.id || `conv_${Date.now()}`
    };

    setInput('');
    setIsLoading(true);

    try {
      addMessage(userMessage);

      if (messages.length === 0 && currentConversation) {
        const newTitle = generateTitle(messageText);
        updateConversationTitle(currentConversation.id, newTitle);
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      const recentMessages = [...messages, userMessage].slice(-6);
      
      const inputData = {
        message: messageText,
        fileContext: '',
        chatHistory: recentMessages.slice(0, -1),
        maxTokens: plan === 'free' ? 150 : plan === 'pro' ? 500 : 1000
      };

      const result = await cloudFunctions.chatWithAI(inputData);
      
      if (result.data?.response) {
        const aiMessage: ChatMessage = {
          id: `msg_${Date.now()}_ai_${Math.random().toString(36).substr(2, 9)}`,
          type: 'ai',
          message: formatAIResponse(result.data.response),
          timestamp: new Date(),
          tokensUsed: result.data.tokensUsed,
          conversationId: currentConversation?.id || `conv_${Date.now()}`
        };

        addMessage(aiMessage);
        await refreshProfile();
      } else {
        throw new Error('No se recibió respuesta del AI');
      }
    } catch (error: unknown) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(isMobile ? 'Error enviando mensaje' : `Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ MANEJO DE TECLADO OPTIMIZADO PARA MÓVIL
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // En móviles, permitir nueva línea con Enter solo
      // En desktop, enviar con Enter y nueva línea con Shift+Enter
      if (isMobile) {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          sendMessage();
        }
        // En móviles, Enter normal agrega nueva línea
      } else {
        if (!e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
        // En desktop, Shift+Enter agrega nueva línea
      }
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNewConversation = () => {
    setChatStarted(true);
    setShowVideoBackground(false);
    startNewConversation();
    setShowConversationList(false);
  };

  // ✅ CERRAR MENÚS AL TOCAR FUERA (MÓVIL)
  const handleOverlayClick = () => {
    if (showConversationList) setShowConversationList(false);
    if (showSettingsMenu) setShowSettingsMenu(false);
  };

  return (
    <div className={`min-h-screen bg-black relative ${isMobile ? 'mobile-full-height' : ''}`}>
      {/* ✅ BACKGROUND VIDEO OPTIMIZADO */}
      {showVideoBackground && <MobileOptimizedVideoBackground />}
      
      {/* ✅ OVERLAY OPTIMIZADO PARA MÓVIL */}
      {showVideoBackground && (
        <div className="absolute inset-0 bg-black/30 z-30" />
      )}

      {/* ✅ OVERLAY PARA CERRAR MENÚS EN MÓVIL */}
      {(showConversationList || showSettingsMenu) && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={handleOverlayClick}
        />
      )}

      {/* ✅ CONVERSATION LIST OPTIMIZADO */}
      {showConversationList && (
        <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out ${
          isMobile ? 'mobile-sidebar' : 'w-80'
        } bg-black/90 backdrop-blur-xl border-r border-white/20`}>
          <ConversationList 
            isOpen={showConversationList} 
            onClose={() => setShowConversationList(false)}
            onNewConversation={handleNewConversation}
          />
        </div>
      )}

      {/* ✅ SETTINGS MENU OPTIMIZADO */}
      <SettingsMenu 
        isOpen={showSettingsMenu} 
        onClose={() => setShowSettingsMenu(false)} 
      />

      {/* ✅ MAIN CONTENT CON SAFE AREAS */}
      <div className={`relative z-40 min-h-screen transition-all duration-300 ease-in-out ${
        showConversationList && !isMobile ? 'ml-80' : 'ml-0'
      }`}>
        {/* ✅ HEADER OPTIMIZADO PARA MÓVIL */}
        <div className={`fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/10 safe-area-top ${
          isLandscape ? 'landscape-header-compact' : 'h-16'
        }`}>
          <div className={`container mx-auto px-4 md:px-6 h-full flex items-center justify-between transition-all duration-300 ${
            showConversationList && !isMobile ? 'ml-80' : 'ml-0'
          }`}>
            {/* ✅ LEFT SIDE CON TOUCH TARGETS */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={() => setShowConversationList(!showConversationList)}
                className="touch-target p-2 text-white/80 hover:text-white transition-colors rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-2 md:space-x-3">
                <Image 
                  src="/images/nora.png" 
                  alt="NORA" 
                  width={isMobile ? 28 : 32} 
                  height={isMobile ? 28 : 32}
                  className="rounded-lg"
                />
                <div className="hidden sm:block">
                  <h1 className="text-white font-light font-lastica text-sm md:text-base">NORA</h1>
                  <div className="text-xs text-gray-400 line-clamp-1">
                    {currentConversation?.title || 'Nueva conversación'}
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ RIGHT SIDE CON ESPACIADO MÓVIL */}
            <div className="flex items-center space-x-1 md:space-x-4">
              {chatStarted && (
                <button
                  onClick={handleNewConversation}
                  className="touch-target p-2 text-white/80 hover:text-white transition-colors rounded-lg"
                  title="Nueva conversación"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={() => setShowSettingsMenu(true)}
                className="touch-target p-2 text-white/80 hover:text-white transition-colors rounded-lg"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ✅ WELCOME SCREEN RESPONSIVE */}
        {!chatStarted && (
          <div className="relative z-50 min-h-screen flex flex-col items-center justify-center px-4 md:px-6 safe-area-all">
            <div className="text-center max-w-2xl mx-auto animate-mobile-fade-in">
              <div className={`${isMobile ? 'w-16 h-16' : 'w-24 h-24'} bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 backdrop-blur-sm border border-white/20`}>
                <MessageCircle className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} text-white`} />
              </div>
              
              <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-6xl'} font-light text-white mb-4 md:mb-6 font-lastica`}>
                ¡Hola! Soy NORA
              </h2>
              
              <p className={`${isMobile ? 'text-base' : 'text-xl'} text-gray-300 mb-6 md:mb-8 font-light leading-relaxed mobile-text-readable`}>
                Tu asistente de inteligencia artificial. Estoy aquí para ayudarte con cualquier pregunta, 
                tarea o conversación que necesites.
              </p>

              <button
                onClick={handleStartChat}
                className={`${isMobile ? 'mobile-btn-large' : 'px-8 py-4'} bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white hover:bg-white/30 hover:border-white/50 transition-all duration-300 font-light`}
              >
                Comenzar conversación
              </button>

              {/* ✅ STATS RESPONSIVE */}
              {userProfile && (
                <div className={`mt-8 md:mt-12 flex items-center justify-center ${isMobile ? 'flex-col space-y-4' : 'space-x-8'} text-sm text-gray-400`}>
                  <div className="text-center">
                    <div className="text-white font-medium">
                      {helpers.formatTokens(userProfile.usage.daily.tokensRemaining)}
                    </div>
                    <div>Tokens disponibles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-medium">{helpers.getPlanDisplayName(plan)}</div>
                    <div>Plan actual</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ✅ CHAT MESSAGES OPTIMIZADO */}
        {chatStarted && (
          <div 
            ref={chatContainerRef}
            className={`${isLandscape ? 'pt-12' : 'pt-16'} ${isMobile ? 'pb-36' : 'pb-32'} min-h-screen custom-scrollbar`}
          >
            <div className="container mx-auto mobile-px-reduced max-w-4xl">
              {messages.map((message, index) => (
                <div key={message.id} className="mb-4 md:mb-6 animate-mobile-slide-up">
                  <div className={`flex gap-2 md:gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.type === 'ai' && !isMobile && <div className="w-8" />}
                    
                    {message.type === 'ai' && (
                      <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0 mt-1`}>
                        <span className={`text-white font-bold ${isMobile ? 'text-xs' : 'text-sm'} font-lastica`}>N</span>
                      </div>
                    )}

                    <div
                      className={`${isMobile ? 'max-w-[85%]' : 'max-w-[70%]'} px-3 md:px-4 py-2 md:py-3 rounded-2xl border backdrop-blur-sm ${
                        message.type === 'user'
                          ? 'bg-blue-600/90 border-blue-500/30 text-white'
                          : 'bg-gray-600/90 border-gray-500/30 text-white'
                      }`}
                    >
                      <div className={`whitespace-pre-wrap ${isMobile ? 'text-sm' : 'text-sm md:text-base'} leading-relaxed mobile-text-readable`}>
                        {message.message}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                        <span>{formatTime(message.timestamp)}</span>
                        
                        {message.type === 'ai' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleCopy(message.message)}
                              className="touch-target text-gray-400 hover:text-white transition-colors p-1"
                              title="Copiar"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleRegenerate(index)}
                              disabled={isLoading}
                              className="touch-target text-gray-400 hover:text-white transition-colors p-1"
                              title="Regenerar"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {message.type === 'user' && !isMobile && <div className="w-8" />}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-2 md:gap-4 animate-mobile-fade-in">
                  <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0 mt-1`}>
                    <span className={`text-white font-bold ${isMobile ? 'text-xs' : 'text-sm'} font-lastica`}>N</span>
                  </div>
                  <div className="bg-black/60 border-white/20 px-3 md:px-4 py-2 md:py-3 rounded-2xl flex items-center space-x-3 border backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      <span className={`${isMobile ? 'text-sm' : 'text-sm'} text-gray-300`}>
                        {isMobile ? 'Pensando...' : 'NORA está pensando...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* ✅ INPUT AREA OPTIMIZADO PARA MÓVIL */}
        {chatStarted && (
          <div className={`fixed bottom-0 left-0 right-0 z-30 p-4 md:p-6 safe-area-bottom transition-all duration-300 ease-in-out ${
            showConversationList && !isMobile ? 'ml-80' : 'ml-0'
          }`}>
            <div className="container mx-auto">
              {/* ✅ WARNING MESSAGES MÓVIL */}
              {shouldShowUpgradeWarning() && (
                <div className="max-w-3xl mx-auto mb-4 p-3 md:p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-xl animate-mobile-slide-up">
                  <div className="flex items-center space-x-3">
                    <Crown className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-white font-light font-lastica ${isMobile ? 'text-sm' : ''}`}>
                        {isMobile ? '¡Sin tokens!' : '¡Límite de tokens alcanzado!'}
                      </h4>
                      <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed`}>
                        {isMobile 
                          ? 'Actualiza a Pro para continuar.' 
                          : 'Has agotado tus tokens diarios. Actualiza a Pro para continuar chateando.'
                        }
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowSettingsMenu(true)}
                      className="touch-target px-3 md:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex-shrink-0"
                    >
                      Actualizar
                    </button>
                  </div>
                </div>
              )}

              {/* ✅ INPUT CONTAINER MÓVIL */}
              <div className="max-w-3xl mx-auto bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-3 md:p-4">
                <div className="flex space-x-3 md:space-x-4">
                  <div className="flex-1">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isMobile ? "Escribe aquí..." : "Escribe tu mensaje..."}
                      className={`w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none ${
                        isLandscape ? 'chat-input-landscape' : 'chat-input-portrait'
                      } mobile-input-comfortable`}
                      disabled={isLoading || shouldShowUpgradeWarning()}
                      rows={1}
                    />
                    {/* ✅ HINT PARA MÓVILES */}
                    {isMobile && (
                      <div className="text-xs text-gray-500 mt-1">
                        {isLandscape ? 'Ctrl+Enter para enviar' : 'Ctrl+Enter para enviar, Enter para nueva línea'}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim() || shouldShowUpgradeWarning()}
                    className="touch-target-comfortable p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* ✅ TOKEN WARNING MÓVIL */}
              {userProfile &&
                userProfile.usage.daily.tokensLimit > 0 &&
                !shouldShowUpgradeWarning() &&
                helpers.getUsagePercentage(
                  userProfile.usage.daily.tokensUsed,
                  userProfile.usage.daily.tokensLimit
                ) > 80 && (
                  <div className="max-w-3xl mx-auto mt-4 p-3 md:p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl backdrop-blur-xl animate-mobile-slide-up">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-white font-light font-lastica ${isMobile ? 'text-sm' : ''}`}>
                          {isMobile ? 'Pocos tokens restantes' : 'Límite de tokens casi alcanzado'}
                        </h4>
                        <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed`}>
                          Te quedan {helpers.formatTokens(userProfile.usage.daily.tokensRemaining)} tokens hoy.
                          {plan === 'free' && (isMobile ? ' Actualiza a Pro.' : ' Actualiza a Pro para más tokens.')}
                        </p>
                      </div>
                      {plan === 'free' && (
                        <button 
                          onClick={() => setShowSettingsMenu(true)}
                          className="touch-target px-3 md:px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium flex-shrink-0"
                        >
                          Actualizar
                        </button>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default ChatInterface;