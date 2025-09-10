// components/ChatInterface.tsx - ERRORES CORREGIDOS
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
  X,
  Image as ImageIcon,
  Sparkles,
  Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../contexts/ConversationContext';
import { useRouter } from 'next/navigation';
import { cloudFunctions, helpers } from '../lib/firebase';
import { ChatMessage, PlanType, isValidPlan } from '../lib/types';
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

const ImageGenerator = dynamic(() => import('./ImageGenerator'), {
  loading: () => <div className="bg-white/5 rounded-xl p-4 animate-pulse h-48" />,
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
  
  // 🎨 NUEVOS ESTADOS PARA GENERACIÓN DE IMÁGENES
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [pendingImageGeneration, setPendingImageGeneration] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const messages = currentConversation?.messages || [];

  // ✅ CORRECCIÓN: Validar que plan sea un PlanType válido
  const validPlan: PlanType = isValidPlan(plan) ? plan : 'free';

  // ✅ DETECTAR DISPOSITIVO MÓVIL Y ORIENTACIÓN
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

  // ✅ AUTO-SCROLL A NUEVOS MENSAJES
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // ✅ AJUSTAR ALTURA DEL TEXTAREA
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = isMobile ? 120 : 200;
      const scrollHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input, isMobile]);

  // ✅ DETECCIÓN DE COMANDOS DE IMAGEN EN EL INPUT
  useEffect(() => {
    const imageKeywords = ['generar imagen', 'crear imagen', 'hacer imagen', 'dibujar', 'imagen de'];
    const lowerInput = input.toLowerCase();
    
    const hasImageKeyword = imageKeywords.some(keyword => lowerInput.includes(keyword));
    
    if (hasImageKeyword && !showImageGenerator && userProfile?.planInfo?.availableFeatures?.imageGeneration) {
      setPendingImageGeneration(true);
    } else {
      setPendingImageGeneration(false);
    }
  }, [input, showImageGenerator, userProfile]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.ctrlKey || e.metaKey || (isMobile && isLandscape)) {
        e.preventDefault();
        sendMessage();
      } else if (!isMobile || !isLandscape) {
        return;
      }
    }
  };

  const formatAIResponse = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s*(.*?)(?:\n|$)/g, '$1')
      .replace(/^\s*[\*\-\+]\s+/gm, '• ')
      .replace(/^\s*\d+\.\s+/gm, (match) => {
        const num = match.match(/\d+/)?.[0];
        return `${num}. `;
      })
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
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
    if (!userProfile || validPlan !== 'free') return false;
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
        maxTokens: validPlan === 'free' ? 150 : validPlan === 'pro' ? 500 : 1000
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

  // 🎨 NUEVA FUNCIÓN: MANEJAR GENERACIÓN DE IMAGEN DESDE CHAT
  const handleImageGenerated = useCallback((imageData: { imageUrl: string; prompt: string }) => {
    if (!currentConversation) {
      startNewConversation();
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user_${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      message: `Generar imagen: ${imageData.prompt}`,
      timestamp: new Date(),
      conversationId: currentConversation?.id || `conv_${Date.now()}`
    };

    const aiMessage: ChatMessage = {
      id: `msg_${Date.now()}_ai_${Math.random().toString(36).substr(2, 9)}`,
      type: 'ai',
      message: '¡Imagen generada exitosamente! Aquí tienes el resultado:',
      timestamp: new Date(),
      imageUrl: imageData.imageUrl,
      conversationId: currentConversation?.id || `conv_${Date.now()}`
    };

    addMessage(userMessage);
    setTimeout(() => {
      addMessage(aiMessage);
      setShowImageGenerator(false);
      scrollToBottom();
    }, 500);

    toast.success('¡Imagen agregada al chat!');
  }, [currentConversation, startNewConversation, addMessage, scrollToBottom]);

  // 🎨 NUEVA FUNCIÓN: DETECTAR SOLICITUD DE IMAGEN Y SUGERIR GENERADOR
  const handleImageSuggestion = () => {
    if (!userProfile?.planInfo?.availableFeatures?.imageGeneration) {
      toast.error('La generación de imágenes no está disponible en tu plan');
      return;
    }
    
    setShowImageGenerator(true);
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
        maxTokens: validPlan === 'free' ? 150 : validPlan === 'pro' ? 500 : 1000
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
      toast.error(isMobile ? 'Error enviando mensaje' : `Error enviando mensaje: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkTokensAvailable = () => {
    if (!userProfile) return { allowed: false, remaining: 0 };
    
    const remainingTokens = userProfile.usage.daily.tokensRemaining;
    return {
      allowed: remainingTokens > 0,
      remaining: remainingTokens
    };
  };

  // ✅ RENDER
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* ✅ OVERLAY Y NAVEGACIÓN MÓVIL */}
      <div className="absolute inset-0 bg-black/40 z-10">
        {/* ✅ HEADER MÓVIL */}
        <div className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/10 transition-all duration-300 ${
          chatStarted ? 'translate-y-0' : isMobile ? 'translate-y-0' : '-translate-y-full'
        }`}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowConversationList(true)}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
              
              {chatStarted && (
                <button
                  onClick={() => {
                    startNewConversation();
                    setShowImageGenerator(false);
                  }}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
              )}

              {/* 🎨 BOTÓN GENERADOR DE IMÁGENES */}
              {chatStarted && userProfile?.planInfo?.availableFeatures?.imageGeneration && (
                <button
                  onClick={() => setShowImageGenerator(!showImageGenerator)}
                  className={`p-2 rounded-lg transition-colors ${
                    showImageGenerator 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Generador de Imágenes"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {userProfile && (
                <div className="text-sm text-gray-300">
                  <span className="hidden sm:inline">
                    {helpers.formatTokens(userProfile.usage.daily.tokensRemaining)} tokens
                  </span>
                  <span className="sm:hidden">
                    {helpers.formatTokens(userProfile.usage.daily.tokensRemaining)}
                  </span>
                </div>
              )}
              
              <button
                onClick={() => setShowSettingsMenu(true)}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* ✅ CONVERSACIÓN LIST SIDEBAR */}
        {showConversationList && (
          <div className="fixed inset-0 z-50 flex">
            <div className="w-80 h-full">
              {/* ✅ CORRECCIÓN: Pasar todas las props requeridas */}
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

        {/* ✅ SETTINGS MENU */}
        {showSettingsMenu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowSettingsMenu(false)}
            />
            <div className="relative z-10 w-full max-w-md mx-4">
              {/* ✅ CORRECCIÓN: Pasar todas las props requeridas */}
              <SettingsMenu 
                isOpen={showSettingsMenu}
                onClose={() => setShowSettingsMenu(false)} 
              />
            </div>
          </div>
        )}

        {/* ✅ WELCOME SCREEN SIMPLIFICADO */}
        {!chatStarted && (
          <div className="flex items-center justify-center min-h-screen px-4 relative z-20">
            <div className="text-center max-w-2xl mx-auto">
              <div className={`${isMobile ? 'w-16 h-16' : 'w-24 h-24'} bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20`}>
                <MessageCircle className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} text-white`} />
              </div>
              
              <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-6xl'} font-light text-white mb-4 font-lastica`}>
                ¡Hola! Soy NORA
              </h2>
              
              <p className={`${isMobile ? 'text-base' : 'text-xl'} text-gray-300 mb-6 font-light leading-relaxed`}>
                Tu asistente de inteligencia artificial. Estoy aquí para ayudarte con cualquier pregunta, 
                tarea o conversación que necesites.
              </p>

              <button
                onClick={handleStartChat}
                className={`${isMobile ? 'px-6 py-3' : 'px-8 py-4'} bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white hover:bg-white/30 hover:border-white/50 transition-all duration-300 font-light`}
              >
                Comenzar conversación
              </button>

              {/* ✅ STATS RESPONSIVE */}
              {userProfile && (
                <div className={`mt-8 flex items-center justify-center ${isMobile ? 'flex-col space-y-4' : 'space-x-8'} text-sm text-gray-400`}>
                  <div className="text-center">
                    <div className="text-white font-medium">
                      {helpers.formatTokens(userProfile.usage.daily.tokensRemaining)}
                    </div>
                    <div>Tokens disponibles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-medium">{helpers.getPlanDisplayName(validPlan)}</div>
                    <div>Plan actual</div>
                  </div>
                  {userProfile.planInfo.availableFeatures.imageGeneration && (
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-white font-medium">Generación de imágenes</span>
                      </div>
                      <div>Disponible</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ✅ CHAT MESSAGES */}
        {chatStarted && (
          <div 
            ref={chatContainerRef}
            className={`${isLandscape ? 'pt-12' : 'pt-16'} ${isMobile ? 'pb-36' : 'pb-32'} min-h-screen overflow-y-auto`}
          >
            <div className="container mx-auto px-4 max-w-4xl">
              {/* 🎨 GENERADOR DE IMÁGENES EMBEDIDO */}
              {showImageGenerator && (
                <div className="mb-6">
                  <ImageGenerator 
                    isEmbedded={true}
                    onImageGenerated={handleImageGenerated}
                    className="max-w-2xl mx-auto"
                  />
                </div>
              )}

              {messages.map((message, index) => (
                <div key={message.id} className="mb-4 md:mb-6">
                  <div className={`flex gap-2 md:gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.type === 'ai' && (
                      <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0`}>
                        <MessageCircle className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
                      </div>
                    )}
                    
                    <div className={`max-w-[85%] md:max-w-[75%] ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white ml-8 md:ml-12' 
                        : 'bg-white/10 text-white backdrop-blur-sm'
                    } rounded-2xl px-3 md:px-4 py-2 md:py-3`}>
                      
                      <p className={`${isMobile ? 'text-sm' : 'text-base'} leading-relaxed whitespace-pre-wrap`}>
                        {message.message}
                      </p>

                      {/* 🎨 MOSTRAR IMAGEN SI EXISTE */}
                      {message.imageUrl && (
                        <div className="mt-3">
                          <div className="relative rounded-lg overflow-hidden bg-white/5">
                            <Image
                              src={message.imageUrl}
                              alt="Imagen generada"
                              width={400}
                              height={400}
                              className="w-full h-auto max-h-80 object-cover"
                            />
                            <div className="absolute top-2 right-2 flex space-x-1">
                              <button
                                onClick={() => helpers.downloadImage(message.imageUrl!, `nora-image-${Date.now()}.png`)}
                                className="p-1.5 bg-black/50 hover:bg-black/70 rounded backdrop-blur-sm transition-colors"
                                title="Descargar imagen"
                              >
                                <Camera className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                        <span>
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        
                        {message.type === 'ai' && (
                          <div className="flex items-center space-x-2">
                            {message.tokensUsed && (
                              <span className="text-gray-400">
                                {message.tokensUsed} tokens
                              </span>
                            )}
                            
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleCopy(message.message)}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                                title="Copiar"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              
                              <button
                                onClick={() => handleRegenerate(index)}
                                disabled={isLoading}
                                className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                                title="Regenerar"
                              >
                                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* ✅ INPUT ÁREA */}
        {chatStarted && (
          <div className={`fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-t border-white/10 p-4 transition-all duration-300`}>
            <div className="container mx-auto max-w-4xl px-4">
              
              {/* ✅ UPGRADE WARNING */}
              {shouldShowUpgradeWarning() && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-xl">
                  <div className="flex items-center space-x-3">
                    <Crown className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-white font-light ${isMobile ? 'text-sm' : ''}`}>
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
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex-shrink-0"
                    >
                      Actualizar
                    </button>
                  </div>
                </div>
              )}

              {/* 🎨 SUGERENCIA DE IMAGEN */}
              {pendingImageGeneration && !showImageGenerator && (
                <div className="mb-3 p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl backdrop-blur-xl">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-purple-200">
                        ¿Quieres generar una imagen? Usa el generador de imágenes para mejores resultados.
                      </p>
                    </div>
                    <button 
                      onClick={handleImageSuggestion}
                      className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium flex-shrink-0"
                    >
                      Generar
                    </button>
                  </div>
                </div>
              )}

              {/* ✅ INPUT CONTAINER */}
              <div className="max-w-3xl mx-auto bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-3 md:p-4">
                <div className="flex space-x-3 md:space-x-4">
                  <div className="flex-1">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isMobile ? "Escribe aquí..." : "Escribe tu mensaje..."}
                      className={`w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none`}
                      disabled={isLoading || shouldShowUpgradeWarning()}
                      rows={1}
                    />
                    {isMobile && (
                      <div className="text-xs text-gray-500 mt-1">
                        Ctrl+Enter para enviar
                      </div>
                    )}
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim() || shouldShowUpgradeWarning()}
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default ChatInterface;