// components/ChatInterface.tsx
'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { 
  Send, 
  Loader2, 
  Crown, 
  TrendingUp, 
  Copy, 
  RefreshCw, 
  Menu,
  Settings,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../contexts/ConversationContext';
import { useRouter } from 'next/navigation';
import { cloudFunctions, helpers } from '../lib/firebase';
import { ChatMessage } from '../lib/types';
import toast from 'react-hot-toast';
import Image from 'next/image';
import ConversationList from './ConversationList';
import SettingsMenu from './SettingsMenu';

// Background video component
const VideoBackground = memo(function VideoBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video 
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: 'center 30%' }}
        autoPlay 
        muted 
        loop 
        playsInline
        preload="metadata"
      >
        <source src="/images/fondo.mp4" type="video/mp4" />
        <source src="/fondo.webm" type="video/webm" />
      </video>
      {/* Overlay gradients matched to landing page */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20" />
    </div>
  );
});

const ChatInterface = memo(function ChatInterface() {
  const { userProfile, refreshProfile, plan, user } = useAuth();
  const { 
    currentConversation, 
    startNewConversation, 
    addMessage,
    isLoading: conversationsLoading 
  } = useConversations();
  const router = useRouter();
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVideoBackground, setShowVideoBackground] = useState(true);
  const [showConversationList, setShowConversationList] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Obtener mensajes de la conversación actual
  const messages = currentConversation?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.some((msg) => msg.type === 'user')) {
      setShowVideoBackground(false);
    } else {
      setShowVideoBackground(true);
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const checkTokensAvailable = () => {
    if (!userProfile) return { allowed: false, tokensLeft: 0 };
    
    const tokensLeft = userProfile.usage.daily.tokensRemaining;
    return {
      allowed: tokensLeft > 0,
      tokensLeft: tokensLeft
    };
  };

  const formatAIResponse = (response: string) => {
    return response
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\"(.*?)\"/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .trim();
  };

  const sendMessage = async () => {
    const messageText = input.trim();
    if (!messageText || !user || isLoading) return;

    const tokenCheck = checkTokensAvailable();
    if (!tokenCheck.allowed) {
      return;
    }

    // Si no hay conversación actual, crear una nueva
    let conversationToUse = currentConversation;
    if (!conversationToUse) {
      startNewConversation();
      // Esperar un momento para que se cree la conversación
      await new Promise(resolve => setTimeout(resolve, 100));
      conversationToUse = currentConversation;
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      message: messageText,
      timestamp: new Date(),
      conversationId: conversationToUse?.id || `conv_${Date.now()}`
    };

    setInput('');
    setIsLoading(true);

    try {
      // Agregar mensaje del usuario inmediatamente
      addMessage(userMessage);

      // Optimización para usar menos tokens
      const recentMessages = messages.slice(-6);
      
      const inputData = {
        message: messageText,
        fileContext: '',
        chatHistory: recentMessages,
        maxTokens: plan === 'free' ? 150 : plan === 'pro' ? 500 : 1000,
      };

      const result = await cloudFunctions.chatWithAI(inputData);

      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai_${Math.random().toString(36).substr(2, 9)}`,
        type: 'ai',
        message: formatAIResponse(result.data.response),
        timestamp: new Date(),
        tokensUsed: result.data.tokensUsed,
        conversationId: conversationToUse?.id || userMessage.conversationId
      };

      // Agregar respuesta de la IA
      addMessage(aiMessage);
      await refreshProfile();
    } catch (error: unknown) {
      console.error('Error in chat:', error);
      let errorMessage = 'Error procesando tu mensaje. Intenta nuevamente.';
      if (error instanceof Error && 'code' in error) {
        if (error.code === 'resource-exhausted') {
          errorMessage = 'Has alcanzado tu límite diario. Actualiza tu plan para continuar.';
        } else if (error.code === 'permission-denied') {
          errorMessage = 'Esta función requiere una suscripción premium.';
        }
      }

      const errorAiMessage: ChatMessage = {
        id: `msg_${Date.now()}_error_${Math.random().toString(36).substr(2, 9)}`,
        type: 'ai',
        message: errorMessage,
        timestamp: new Date(),
        conversationId: conversationToUse?.id || userMessage.conversationId
      };

      addMessage(errorAiMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Texto copiado al portapapeles');
    });
  };

  const handleRegenerate = async (messageIndex: number) => {
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.type !== 'user') return;

    setIsLoading(true);
    try {
      const recentMessages = messages.slice(0, messageIndex - 1).slice(-6);
      
      const inputData = {
        message: userMessage.message as string,
        fileContext: '',
        chatHistory: recentMessages,
        maxTokens: plan === 'free' ? 150 : plan === 'pro' ? 500 : 1000,
      };

      const result = await cloudFunctions.chatWithAI(inputData);

      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai_regen_${Math.random().toString(36).substr(2, 9)}`,
        type: 'ai',
        message: formatAIResponse(result.data.response),
        timestamp: new Date(),
        tokensUsed: result.data.tokensUsed,
        conversationId: currentConversation?.id || 'temp'
      };

      if (currentConversation) {
        const updatedMessages = [...currentConversation.messages];
        updatedMessages[messageIndex] = aiMessage;
      }
      
      await refreshProfile();
      toast.success('Respuesta regenerada');
    } catch (error: unknown) {
      console.error('Error regenerating:', error);
      toast.error('Error al regenerar la respuesta.');
    } finally {
      setIsLoading(false);
    }
  };

  const shouldShowUpgradeWarning = () => {
    if (!userProfile) return false;
    return userProfile.usage.daily.tokensRemaining <= 0;
  };

  const getUpgradeTarget = () => {
    return plan === 'free' ? 'pro' : 'pro_max';
  };

  const handleStartNewConversation = () => {
    startNewConversation();
    setShowConversationList(false);
  };

  return (
    <div className="relative flex h-screen bg-black text-white overflow-hidden">
      {/* Video Background */}
      {showVideoBackground && <VideoBackground />}

      {/* Sidebar */}
      <div className={`transition-all duration-300 ease-in-out ${showConversationList ? 'w-80' : 'w-0'} overflow-hidden bg-black/60 backdrop-blur-xl border-r border-white/20`}>
        <ConversationList 
          isOpen={showConversationList} 
          onClose={() => setShowConversationList(false)} 
          onNewConversation={handleStartNewConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-20 bg-transparent backdrop-blur-xl border-b border-white/20 p-6">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowConversationList(!showConversationList)}
                className="p-2 bg-black/20 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg transition-all duration-300"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>

              <Image
                src="/images/nora.png"
                alt="NORA Logo"
                width={48}
                height={48}
                className="hover:scale-105 transition-transform duration-300"
              />
              
              {/* Título de conversación actual */}
              {currentConversation && (
                <div className="flex items-center space-x-3">
                  <div className="w-px h-8 bg-white/20" />
                  <div>
                    <h1 className="text-lg font-medium text-white truncate max-w-md">
                      {currentConversation.title}
                    </h1>
                    <p className="text-xs text-gray-400">
                      {currentConversation.messages.length} mensajes
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Botón nueva conversación */}
              {currentConversation && (
                <button
                  onClick={handleStartNewConversation}
                  className="flex items-center space-x-2 px-4 py-2 bg-black/20 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl transition-all duration-300"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span className="text-sm text-white font-light">Nueva</span>
                </button>
              )}

              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 bg-black/20 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg transition-all duration-300 relative"
              >
                <Settings className="w-5 h-5 text-white" />
              </button>
              {showSettingsMenu && (
                <SettingsMenu 
                  isOpen={showSettingsMenu}
                  onClose={() => setShowSettingsMenu(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto pt-28 pb-32">
          {messages.length === 0 && !conversationsLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center z-30 relative">
              <div className="w-20 h-20 bg-nora-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <span className="text-white font-bold text-2xl font-lastica">N</span>
              </div>
              <h2 className="text-2xl font-light text-white mb-2 font-lastica">
                ¡Hola! Soy NORA
              </h2>
            </div>
          )}

          {messages.length > 0 && (
            <div className="max-w-4xl mx-auto px-6 space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-4 animate-slide-up ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* AI Avatar */}
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm font-lastica">N</span>
                    </div>
                  )}

                  <div
                    className={`max-w-3xl px-4 py-3 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:shadow-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600/90 border-blue-500/30 text-white'
                        : 'bg-black/60 border-white/20 text-gray-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.message}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <span>{formatTime(message.timestamp)}</span>
                      
                      {message.type === 'ai' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCopy(message.message)}
                            className="text-gray-400 hover:text-white transition-colors p-1"
                            title="Copiar"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRegenerate(index)}
                            disabled={isLoading}
                            className="text-gray-400 hover:text-white transition-colors p-1"
                            title="Regenerar"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {message.type === 'user' && <div className="w-8" />}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 animate-fade-up">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-sm font-lastica">N</span>
                  </div>
                  <div className="bg-black/60 border-white/20 px-4 py-3 rounded-2xl flex items-center space-x-3 border backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      <span className="text-sm text-gray-300">NORA está pensando...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/20 p-6 bg-black/60 backdrop-blur-xl">
          {shouldShowUpgradeWarning() ? (
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6 text-center backdrop-blur-xl animate-fade-up mb-4">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Crown className="w-8 h-8 text-yellow-400" />
                <h3 className="text-xl font-light text-white font-lastica">
                  Sin tokens disponibles
                </h3>
              </div>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                Has agotado tus tokens diarios. Actualiza tu plan para seguir conversando con NORA.
              </p>
              <button
                onClick={() => window.open('/upgrade', '_blank')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-light transition-all duration-300 flex items-center space-x-2 mx-auto"
              >
                <Crown className="w-5 h-5" />
                <span>Actualizar a {getUpgradeTarget() === 'pro' ? 'Pro' : 'Pro Max'}</span>
              </button>
            </div>
          ) : (
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  disabled={isLoading}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 pr-24 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/60 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xl transition-all duration-300 resize-none min-h-[56px] max-h-[200px]"
                  maxLength={1000}
                  rows={1}
                />
                <div className="absolute right-3 bottom-3 text-xs text-gray-500">
                  {input.length}/1000
                </div>
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl transition-all duration-300 flex items-center space-x-2 self-end"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          )}
          
          {/* Warning para cuando quedan pocos tokens */}
          {userProfile &&
            userProfile.usage.daily.tokensLimit > 0 &&
            !shouldShowUpgradeWarning() &&
            helpers.getUsagePercentage(
              userProfile.usage.daily.tokensUsed,
              userProfile.usage.daily.tokensLimit
            ) > 80 && (
              <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl backdrop-blur-xl animate-slide-up">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  <div className="flex-1">
                    <h4 className="text-white font-light font-lastica">
                      Límite de tokens casi alcanzado
                    </h4>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Te quedan {helpers.formatTokens(userProfile.usage.daily.tokensRemaining)} tokens hoy.
                      {plan === 'free' && ' Actualiza a Pro para más tokens.'}
                    </p>
                  </div>
                  {plan === 'free' && (
                    <button
                      onClick={() => window.open('/upgrade', '_blank')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-light transition-all duration-300"
                    >
                      Actualizar
                    </button>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lastica:wght@300;400;500;600;700&display=swap');

        @keyframes fade-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fade-up 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
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
          background: #6b7280;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        body {
          font-family: 'Lastica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
});

export default ChatInterface;