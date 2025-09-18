'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Loader2, 
  AlertTriangle, 
  Code, 
  Sparkles, 
  Brain,
  Zap,
  Crown,
  Info,
  Clock,
  CheckCircle
} from 'lucide-react';
import { cloudFunctions, helpers } from '../lib/firebase';
import { 
  type ChatMessage, 
  type SpecialtyType, 
  type UserProfile,
  type DeveloperModeChatInput,
  type SpecialistModeChatInput,
  SPECIALIST_MODES 
} from '../lib/types';

interface SpecialistChatInterfaceProps {
  userProfile: UserProfile;
  currentMode: 'normal' | 'developer' | 'specialist';
  currentSpecialty?: SpecialtyType;
  chatHistory: ChatMessage[];
  onNewMessage: (message: ChatMessage) => void;
  onError: (error: string) => void;
  className?: string;
}

const SpecialistChatInterface: React.FC<SpecialistChatInterfaceProps> = ({
  userProfile,
  currentMode,
  currentSpecialty,
  chatHistory,
  onNewMessage,
  onError,
  className = ''
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingUses, setRemainingUses] = useState<{
    developer: { daily: number, monthly: number },
    specialist: { daily: number, monthly: number }
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cargar informaciÃ³n de usos restantes
  useEffect(() => {
    const loadRemainingUses = async () => {
      try {
        const response = await cloudFunctions.getSpecialistModeLimits();
        const limits = response.data;
        setRemainingUses({
          developer: {
            daily: limits.limits.developerMode.dailyRemaining,
            monthly: limits.limits.developerMode.monthlyRemaining
          },
          specialist: {
            daily: limits.limits.specialistMode.dailyRemaining,
            monthly: limits.limits.specialistMode.monthlyRemaining
          }
        });
      } catch (error) {
        console.error('Error cargando usos restantes:', error);
      }
    };

    loadRemainingUses();
  }, [currentMode]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const getModeInfo = () => {
    if (currentMode === 'developer') {
      return {
        icon: <Code className="w-4 h-4 text-blue-400" />,
        name: 'NORA CODE',
        description: 'Experto en programaciÃ³n y desarrollo',
        color: 'blue',
        gradient: 'from-blue-500/20 to-cyan-500/20'
      };
    } else if (currentMode === 'specialist' && currentSpecialty) {
      const specialty = SPECIALIST_MODES.find(s => s.id === currentSpecialty);
      return {
        icon: <span className="text-lg">{specialty?.icon}</span>,
        name: `NORA ${specialty?.name.toUpperCase()}`,
        description: specialty?.description || '',
        color: specialty?.color || 'purple',
        gradient: `from-${specialty?.color || 'purple'}-500/20 to-${specialty?.color || 'purple'}-600/20`
      };
    } else {
      return {
        icon: <Brain className="w-4 h-4 text-gray-400" />,
        name: 'NORA',
        description: 'Asistente general',
        color: 'gray',
        gradient: 'from-gray-500/20 to-gray-600/20'
      };
    }
  };

  const canSendMessage = () => {
    if (currentMode === 'developer') {
      return remainingUses?.developer.daily !== 0;
    } else if (currentMode === 'specialist') {
      return remainingUses?.specialist.daily !== 0;
    }
    return true; // Chat normal siempre disponible
  };

  const getLimitMessage = () => {
    const plan = userProfile.user.plan;
    
    if (currentMode === 'developer') {
      if (remainingUses?.developer.daily === 0) {
        return plan === 'free' 
          ? 'LÃ­mite diario del Modo Desarrollador alcanzado. Actualiza a Pro para mÃ¡s acceso.'
          : 'LÃ­mite diario alcanzado. Se restablece maÃ±ana.';
      }
    } else if (currentMode === 'specialist') {
      if (remainingUses?.specialist.daily === 0) {
        return plan === 'free'
          ? 'LÃ­mite diario del Modo Especialista alcanzado. Actualiza a Pro para mÃ¡s acceso.'
          : 'LÃ­mite diario alcanzado. Se restablece maÃ±ana.';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading || !canSendMessage()) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      message: message.trim(),
      timestamp: new Date(),
      conversationId: 'current',
      mode: currentMode,
      specialty: currentSpecialty
    };

    onNewMessage(userMessage);
    setMessage('');
    setIsLoading(true);

    try {
      let response;
      
      if (currentMode === 'developer') {
        const input: DeveloperModeChatInput = {
          message: message.trim(),
          chatHistory: chatHistory.slice(-10),
          fileContext: ''
        };
        const result = await cloudFunctions.developerModeChat(input);
        response = result.data;
      } else if (currentMode === 'specialist' && currentSpecialty) {
        const input: SpecialistModeChatInput = {
          message: message.trim(),
          specialty: currentSpecialty,
          chatHistory: chatHistory.slice(-10),
          fileContext: ''
        };
        const result = await cloudFunctions.specialistModeChat(input);
        response = result.data;
      } else {
        // Chat normal - usar la funciÃ³n existente
        const result = await cloudFunctions.chatWithAI({
          message: message.trim(),
          chatHistory: chatHistory.slice(-10),
          maxTokens: userProfile.limits.maxResponseTokens
        });
        response = result.data;
      }

      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        message: response.response,
        timestamp: new Date(),
        conversationId: 'current',
        tokensUsed: response.tokensUsed,
        mode: currentMode,
        specialty: currentSpecialty,
        specialtyName: 'specialtyName' in response ? response.specialtyName as string : undefined
      };

      onNewMessage(aiMessage);

      // âœ… CORRECCIÃ“N: Actualizar usos restantes solo para modos especializados
      if ('remainingDaily' in response && 'remainingMonthly' in response) {
        setRemainingUses(prev => {
          if (!prev) return null;
          
          if (currentMode === 'developer') {
            return {
              ...prev,
              developer: {
                daily: response.remainingDaily as number,
                monthly: response.remainingMonthly as number
              }
            };
          } else if (currentMode === 'specialist') {
            return {
              ...prev,
              specialist: {
                daily: response.remainingDaily as number,
                monthly: response.remainingMonthly as number
              }
            };
          }
          return prev;
        });
      }
      // Nota: Chat normal no actualiza remainingUses porque no tiene esos campos

    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      onError(helpers.getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const modeInfo = getModeInfo();
  const limitMessage = getLimitMessage();
  const isPremium = userProfile.user.plan !== 'free';
  const isProMax = userProfile.user.plan === 'pro_max';

  return (
    <div className={`${className}`}>
      {/* Header de Modo Actual */}
      <div className={`mb-4 p-4 rounded-xl border bg-gradient-to-r ${modeInfo.gradient} border-${modeInfo.color}-500/30`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-${modeInfo.color}-500/20`}>
              {modeInfo.icon}
            </div>
            <div>
              <div className={`font-bold text-${modeInfo.color}-300 flex items-center space-x-2`}>
                <span>{modeInfo.name}</span>
                {(currentMode === 'developer' || currentMode === 'specialist') && (
                  <Sparkles className="w-4 h-4" />
                )}
                {isProMax && (currentMode === 'developer' || currentMode === 'specialist') && (
                  <Crown className="w-4 h-4 text-yellow-400" />
                )}
              </div>
              <div className="text-sm text-gray-400">
                {modeInfo.description}
              </div>
            </div>
          </div>

          {/* Contador de Usos */}
          {(currentMode === 'developer' || currentMode === 'specialist') && remainingUses && (
            <div className="text-right">
              <div className={`text-sm font-medium text-${modeInfo.color}-300`}>
                {currentMode === 'developer' 
                  ? remainingUses.developer.daily === -1 
                    ? 'Ilimitado' 
                    : `${remainingUses.developer.daily} usos hoy`
                  : remainingUses.specialist.daily === -1
                    ? 'Ilimitado'
                    : `${remainingUses.specialist.daily} usos hoy`
                }
              </div>
              <div className="text-xs text-gray-500">
                Plan: {userProfile.planInfo.displayName}
              </div>
            </div>
          )}
        </div>

        {/* CaracterÃ­sticas del Modo Actual */}
        {currentMode === 'specialist' && currentSpecialty && (
          <div className="mt-3 flex flex-wrap gap-2">
            {SPECIALIST_MODES.find(s => s.id === currentSpecialty)?.features?.map((feature: string) => (
              <span 
                key={feature}
                className={`text-xs px-3 py-1 rounded-full bg-${modeInfo.color}-500/10 text-${modeInfo.color}-400 border border-${modeInfo.color}-500/20`}
              >
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Mensaje de LÃ­mite */}
      {limitMessage && (
        <div className="mb-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-orange-300 font-medium">LÃ­mite Alcanzado</div>
              <div className="text-xs text-orange-200 mt-1">{limitMessage}</div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Mensaje */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              currentMode === 'developer' 
                ? "Describe tu problema de programaciÃ³n, comparte cÃ³digo o haz preguntas tÃ©cnicas..."
                : currentMode === 'specialist'
                  ? `Haz tu consulta especializada en ${SPECIALIST_MODES.find(s => s.id === currentSpecialty)?.name}...`
                  : "Escribe tu mensaje..."
            }
            disabled={isLoading || !canSendMessage()}
            className={`
              w-full p-4 pr-12 rounded-xl border bg-gray-800/50 text-white
              placeholder:text-gray-400 resize-none min-h-[60px] max-h-32
              focus:outline-none focus:ring-2 focus:ring-${modeInfo.color}-500/50 focus:border-${modeInfo.color}-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
              ${canSendMessage() ? `border-${modeInfo.color}-500/30` : 'border-red-500/30'}
            `}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          <button
            type="submit"
            disabled={!message.trim() || isLoading || !canSendMessage()}
            className={`
              absolute right-2 bottom-2 p-2 rounded-lg transition-colors
              ${canSendMessage() 
                ? `bg-${modeInfo.color}-500 hover:bg-${modeInfo.color}-600 text-white`
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* InformaciÃ³n Adicional */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            {(currentMode === 'developer' || currentMode === 'specialist') && (
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Modo Especializado Activo</span>
              </div>
            )}
            {isLoading && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Procesando con {modeInfo.name}...</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isPremium && (
              <div className="flex items-center space-x-1 text-green-400">
                <CheckCircle className="w-3 h-3" />
                <span>Plan {userProfile.planInfo.displayName}</span>
              </div>
            )}
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Enter</kbd>
            <span>para enviar</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SpecialistChatInterface;