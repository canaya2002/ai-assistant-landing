'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { Send, Loader2, User, Crown, TrendingUp, LogOut, Copy, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { cloudFunctions, helpers } from '../lib/firebase';
import { ChatMessage } from '../lib/types';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface ChatResponse {
  response: string;
  tokensUsed: number;
}

const ChatInterface = memo(function ChatInterface() {
  const { userProfile, refreshProfile, plan, signOut } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVideoBackground, setShowVideoBackground] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Hide video background after first user message
    if (messages.some((msg) => msg.type === 'user')) {
      setShowVideoBackground(false);
    }
  }, [messages]);

  const checkChatAccess = () => {
    if (!userProfile?.limits?.chatEnabled) {
      return {
        allowed: false,
        message: 'El chat con IA no está disponible en el plan gratuito. Actualiza a Pro para acceder.',
        upgradeRequired: true,
      };
    }
    return { allowed: true };
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const accessCheck = checkChatAccess();
    if (!accessCheck.allowed) {
      toast.error(accessCheck.message);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: input.trim(),
      timestamp: new Date(),
    };

    const messageText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await cloudFunctions.chatWithAI({
        message: messageText,
        fileContext: '',
        chatHistory: messages.slice(-10),
      }) as { data: ChatResponse };

      const aiMessage: ChatMessage = {
        id: Date.now().toString() + '_ai',
        type: 'ai',
        message: result.data.response,
        timestamp: new Date(),
        tokensUsed: result.data.tokensUsed,
      };

      setMessages((prev) => [...prev, aiMessage]);
      await refreshProfile();
      toast.success(`Respuesta generada (${result.data.tokensUsed} tokens)`);
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
        id: Date.now().toString() + '_error',
        type: 'ai',
        message: errorMessage,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorAiMessage]);
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

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión. Intenta nuevamente.');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Texto copiado al portapapeles');
    });
  };

  const handleRegenerate = async (message: ChatMessage) => {
    setIsLoading(true);
    try {
      const result = await cloudFunctions.chatWithAI({
        message: message.message,
        fileContext: '',
        chatHistory: messages.slice(-10),
      }) as { data: ChatResponse };

      const aiMessage: ChatMessage = {
        id: Date.now().toString() + '_ai',
        type: 'ai',
        message: result.data.response,
        timestamp: new Date(),
        tokensUsed: result.data.tokensUsed,
      };

      setMessages((prev) => [...prev.filter((m) => m.id !== message.id), aiMessage]);
      await refreshProfile();
      toast.success(`Respuesta regenerada (${result.data.tokensUsed} tokens)`);
    } catch (error: unknown) {
      console.error('Error regenerating:', error);
      toast.error('Error al regenerar la respuesta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-screen bg-black text-white overflow-hidden">
      {/* Video Background */}
      {showVideoBackground && (
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <video
            className="w-3/4 h-3/4 object-contain"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src="/images/fondo-nora-tres.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/70 z-10" />
        </div>
      )}

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-black/60 backdrop-blur-xl border-b border-[#737373]/30 p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/images/nora.png"
              alt="NORA Logo"
              width={48}
              height={48}
              className="hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex items-center space-x-6">
            {userProfile && (
              <div className="text-right animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="text-sm text-gray-400 mb-1">Plan {helpers.getPlanDisplayName(plan)}</div>
                {userProfile.usage.daily.tokensLimit > 0 ? (
                  <div
                    className={`text-sm ${getUsageColor(
                      helpers.getUsagePercentage(
                        userProfile.usage.daily.tokensUsed,
                        userProfile.usage.daily.tokensLimit
                      )
                    )}`}
                  >
                    {helpers.formatTokens(userProfile.usage.daily.tokensUsed)}/
                    {helpers.formatTokens(userProfile.usage.daily.tokensLimit)} tokens hoy
                  </div>
                ) : (
                  <div className="text-sm text-green-400">Tokens ilimitados</div>
                )}
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="bg-[#737373]/30 hover:bg-[#737373]/40 border border-[#737373]/50 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-light">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 pt-28 pb-24 space-y-6 max-h-[calc(100vh-180px)]">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div
              className={`max-w-3xl px-6 py-4 rounded-2xl backdrop-blur-xl border border-[#737373]/30 transition-all duration-300 ${
                message.type === 'user'
                  ? 'bg-[#737373]/30 text-white'
                  : 'bg-white/10 text-gray-100'
              } hover:shadow-xl hover:shadow-[#737373]/10`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' ? 'bg-white/20' : 'bg-[#737373]/20'
                  }`}
                >
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <span
                      className="text-xl font-bold text-[#737373]"
                      style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}
                    >
                      N
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  {message.type === 'ai' && (
                    <div className="flex justify-end space-x-2 mb-2">
                      <button
                        onClick={() => handleCopy(message.message)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Copiar"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRegenerate(message)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Regenerar"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {message.type === 'ai' && /\bpython\b/i.test(message.message) && (
                    <pre className="bg-[#737373]/20 p-4 rounded-lg text-sm leading-relaxed overflow-x-auto">
                      {message.message.match(/```(?:python)?\n([\s\S]*?)\n```/)?.[1] ||
                        message.message}
                    </pre>
                  )}
                  {message.type === 'ai' && !/\bpython\b/i.test(message.message) && (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.message}
                    </div>
                  )}
                  {message.type === 'user' && (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.message}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>{formatTime(message.timestamp)}</span>
                    {message.tokensUsed && <span>{message.tokensUsed} tokens</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fade-up">
            <div className="bg-white/10 text-gray-100 px-6 py-4 rounded-2xl flex items-center space-x-3 border border-[#737373]/30 backdrop-blur-xl">
              <div className="w-8 h-8 rounded-full bg-[#737373]/20 flex items-center justify-center">
                <span
                  className="text-xl font-bold text-[#737373]"
                  style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}
                >
                  N
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#737373]" />
                <span className="text-sm">NORA está pensando...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#737373]/30 p-6 bg-black/60 backdrop-blur-xl">
        {!userProfile?.limits?.chatEnabled ? (
          <div className="bg-[#737373]/20 border border-[#737373]/30 rounded-2xl p-6 text-center backdrop-blur-xl animate-fade-up">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Crown className="w-8 h-8 text-[#737373]" />
              <h3
                className="text-xl font-light text-white"
                style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}
              >
                Chat Premium
              </h3>
            </div>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              El chat con IA está disponible en los planes Pro y Pro Max. Actualiza tu plan para empezar a
              conversar con NORA.
            </p>
            <button
              onClick={() => window.open('/upgrade', '_blank')}
              className="bg-[#737373]/50 hover:bg-[#737373]/60 text-white px-8 py-3 rounded-xl font-light transition-all duration-300 flex items-center space-x-2 mx-auto"
            >
              <Crown className="w-5 h-5" />
              <span>Actualizar a Pro</span>
            </button>
          </div>
        ) : (
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                disabled={isLoading}
                className="w-full bg-[#737373]/20 border border-[#737373]/40 rounded-xl px-6 py-4 pr-24 text-white placeholder-gray-400 focus:outline-none focus:border-[#737373]/60 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xl transition-all duration-300"
                maxLength={1000}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                {input.length}/1000
              </div>
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-[#737373]/50 hover:bg-[#737373]/60 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl transition-all duration-300 flex items-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        )}
        {userProfile &&
          userProfile.usage.daily.tokensLimit > 0 &&
          helpers.getUsagePercentage(
            userProfile.usage.daily.tokensUsed,
            userProfile.usage.daily.tokensLimit
          ) > 80 && (
            <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl backdrop-blur-xl animate-slide-up">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                <div className="flex-1">
                  <h4
                    className="text-white font-light"
                    style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}
                  >
                    Límite de tokens casi alcanzado
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Has usado {helpers.formatTokens(userProfile.usage.daily.tokensUsed)} de{' '}
                    {helpers.formatTokens(userProfile.usage.daily.tokensLimit)} tokens hoy.
                    {plan === 'free' && ' Actualiza a Pro para más tokens.'}
                  </p>
                </div>
                {plan === 'free' && (
                  <button
                    onClick={() => window.open('/upgrade', '_blank')}
                    className="bg-[#737373]/50 hover:bg-[#737373]/60 text-white px-4 py-2 rounded-lg text-sm font-light transition-all duration-300"
                  >
                    Actualizar
                  </button>
                )}
              </div>
            </div>
          )}
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

        @keyframes slide-in-left {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
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
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out forwards;
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
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #737373;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        body {
          font-family: 'Lastica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        pre {
          background-color: #1a1a1a;
          color: #d1d5db;
          padding: 1rem;
          border-radius: 0.5rem;
          font-family: 'Courier New', Courier, monospace;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
});

export default ChatInterface;