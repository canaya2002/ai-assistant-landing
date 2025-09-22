'use client';

import React, { useState, useEffect } from 'react';
import { 
  Code, 
  Brain, 
  ChevronDown, 
  Zap, 
  Lock,
  Crown,
  Sparkles,
  Info
} from 'lucide-react';
import { cloudFunctions, helpers } from '../lib/firebase';
import { SPECIALIST_MODES, type SpecialtyType, type SpecialistModeLimits, type UserProfile } from '../lib/types';

interface SpecialistModeSelectorProps {
  userProfile: UserProfile;
  currentMode: 'normal' | 'developer' | 'specialist';
  currentSpecialty?: SpecialtyType;
  onModeChange: (mode: 'normal' | 'developer' | 'specialist', specialty?: SpecialtyType) => void;
  className?: string;
}

const SpecialistModeSelector: React.FC<SpecialistModeSelectorProps> = ({
  userProfile,
  currentMode,
  currentSpecialty,
  onModeChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [specialistLimits, setSpecialistLimits] = useState<SpecialistModeLimits | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar límites de modos especializados
  useEffect(() => {
    const loadSpecialistLimits = async () => {
      try {
        setLoading(true);
        const response = await cloudFunctions.getSpecialistModeLimits();
        setSpecialistLimits(response.data);
      } catch (error) {
        console.error('❌ Error en getSpecialistModeLimits:', error);
        // CREAR LÍMITES POR DEFECTO CON LA ESTRUCTURA CORRECTA
        const plan = userProfile.user.plan || 'free';
        const defaultLimits: SpecialistModeLimits = {
          plan: plan,
          limits: {
            developerMode: {
              dailyLimit: plan === 'free' ? 1 : plan === 'pro' ? 15 : -1,
              monthlyLimit: plan === 'free' ? 5 : plan === 'pro' ? 200 : -1,
              dailyRemaining: plan === 'free' ? 1 : plan === 'pro' ? 15 : -1,
              monthlyRemaining: plan === 'free' ? 5 : plan === 'pro' ? 200 : -1
            },
            specialistMode: {
              dailyLimit: plan === 'free' ? 1 : plan === 'pro' ? 10 : -1,
              monthlyLimit: plan === 'free' ? 3 : plan === 'pro' ? 150 : -1,
              dailyRemaining: plan === 'free' ? 1 : plan === 'pro' ? 10 : -1,
              monthlyRemaining: plan === 'free' ? 3 : plan === 'pro' ? 150 : -1
            },
            maxTokensPerResponse: plan === 'free' ? 1500 : plan === 'pro' ? 6000 : 12000
          },
          usage: {
            developer: {
              daily: 0,
              monthly: 0
            },
            specialist: {
              daily: 0,
              monthly: 0
            }
          },
          availableSpecialties: {
            business: { name: 'Negocios', icon: '📊', systemPrompt: 'Experto en estrategia empresarial' },
            science: { name: 'Ciencias', icon: '🔬', systemPrompt: 'Científico especializado' },
            education: { name: 'Educación', icon: '📚', systemPrompt: 'Pedagogo experto' },
            health: { name: 'Salud', icon: '⚕️', systemPrompt: 'Profesional de la salud' },
            marketing: { name: 'Marketing', icon: '📢', systemPrompt: 'Experto en marketing digital' },
            finance: { name: 'Finanzas', icon: '💰', systemPrompt: 'Analista financiero' },
            legal: { name: 'Legal', icon: '⚖️', systemPrompt: 'Asesor legal' },
            psychology: { name: 'Psicología', icon: '🧠', systemPrompt: 'Psicólogo y coach' },
            engineering: { name: 'Ingeniería', icon: '⚙️', systemPrompt: 'Ingeniero experto' },
            hr: { name: 'Recursos Humanos', icon: '👥', systemPrompt: 'Especialista en RRHH' },
            sales: { name: 'Ventas', icon: '💼', systemPrompt: 'Experto en ventas' },
            data: { name: 'Datos', icon: '📈', systemPrompt: 'Analista de datos' }
          },
          features: {
            codeGeneration: plan !== 'free',
            advancedAnalysis: plan === 'pro_max',
            priorityProcessing: plan === 'pro_max',
            unlimitedContextMemory: plan === 'pro_max'
          }
        };
        setSpecialistLimits(defaultLimits);
      } finally {
        setLoading(false);
      }
    };

    // SOLO CARGAR SI EL USUARIO ESTÁ AUTENTICADO
    if (userProfile?.user?.uid) {
      loadSpecialistLimits();
    }
  }, [userProfile?.user?.uid, userProfile?.user?.plan]);

  const handleModeSelection = (mode: 'normal' | 'developer' | 'specialist', specialty?: SpecialtyType) => {
    setIsOpen(false);
    onModeChange(mode, specialty);
  };

  const getCurrentModeInfo = () => {
    if (currentMode === 'developer') {
      return {
        icon: <Code className="w-4 h-4" />,
        name: 'Modo Desarrollador',
        description: 'Experto en programación',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10 border-blue-500/20'
      };
    } else if (currentMode === 'specialist' && currentSpecialty) {
      const specialty = SPECIALIST_MODES.find((s: any) => s.id === currentSpecialty);
      return {
        icon: <span className="text-sm">{specialty?.icon}</span>,
        name: `Modo ${specialty?.name}`,
        description: specialty?.description,
        color: `text-${specialty?.color || 'purple'}-400`,
        bgColor: `bg-${specialty?.color || 'purple'}-500/10 border-${specialty?.color || 'purple'}-500/20`
      };
    } else {
      return {
        icon: <Brain className="w-4 h-4" />,
        name: 'Chat Normal',
        description: 'Asistente general NORA',
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/10 border-gray-500/20'
      };
    }
  };

  const modeInfo = getCurrentModeInfo();
  const isPremium = userProfile.user.plan !== 'free';

  return (
    <div className={`relative ${className}`}>
      {/* Selector Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between p-3 rounded-lg border transition-all
          ${modeInfo.bgColor}
          hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/50
        `}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-md ${modeInfo.bgColor} ${modeInfo.color}`}>
            {modeInfo.icon}
          </div>
          <div className="text-left">
            <div className={`font-medium ${modeInfo.color}`}>
              {modeInfo.name}
            </div>
            <div className="text-xs text-gray-500 truncate max-w-48">
              {modeInfo.description}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Panel Desplegable */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          {/* Chat Normal */}
          <button
            onClick={() => handleModeSelection('normal')}
            className={`
              w-full p-4 text-left hover:bg-gray-800/50 transition-colors border-b border-gray-700
              ${currentMode === 'normal' ? 'bg-gray-800/50' : ''}
            `}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-md bg-gray-500/10">
                <Brain className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <div className="font-medium text-gray-200">Chat Normal</div>
                <div className="text-xs text-gray-500">Asistente general NORA</div>
              </div>
            </div>
          </button>

          {/* Modo Desarrollador */}
          <div>
            <button
              onClick={() => handleModeSelection('developer')}
              disabled={!isPremium && specialistLimits?.limits.developerMode.dailyRemaining === 0}
              className={`
                w-full p-4 text-left hover:bg-blue-900/20 transition-colors border-b border-gray-700
                ${currentMode === 'developer' ? 'bg-blue-900/20' : ''}
                ${!isPremium && specialistLimits?.limits.developerMode.dailyRemaining === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-md bg-blue-500/10">
                    <Code className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-blue-300 flex items-center space-x-2">
                      <span>Modo Desarrollador</span>
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <div className="text-xs text-gray-500">Experto en programación y desarrollo</div>
                    {specialistLimits && (
                      <div className="text-xs text-blue-400 mt-1">
                        Usos hoy: {specialistLimits.limits.developerMode.dailyRemaining === -1 
                          ? 'Ilimitado' 
                          : `${specialistLimits.limits.developerMode.dailyRemaining}/${specialistLimits.limits.developerMode.dailyLimit}`
                        }
                      </div>
                    )}
                  </div>
                </div>
                {!isPremium && (
                  <div className="flex items-center space-x-1 text-orange-400">
                    <Lock className="w-3 h-3" />
                    <span className="text-xs">Limitado</span>
                  </div>
                )}
                {userProfile.user.plan === 'pro_max' && (
                  <Crown className="w-4 h-4 text-yellow-400" />
                )}
              </div>
            </button>
          </div>

          {/* Modo Especialista - Header */}
          <div className="p-3 border-b border-gray-700 bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded bg-purple-500/10">
                  <Zap className="w-3 h-3 text-purple-400" />
                </div>
                <span className="text-sm font-medium text-purple-300">Modo Especialista</span>
                {specialistLimits && (
                  <div className="text-xs text-purple-400">
                    ({specialistLimits.limits.specialistMode.dailyRemaining === -1 
                      ? 'Ilimitado' 
                      : `${specialistLimits.limits.specialistMode.dailyRemaining}/${specialistLimits.limits.specialistMode.dailyLimit} hoy`
                    })
                  </div>
                )}
              </div>
              {!isPremium && (
                <div className="flex items-center space-x-1 text-orange-400">
                  <Lock className="w-3 h-3" />
                  <span className="text-xs">Muy limitado</span>
                </div>
              )}
            </div>
          </div>

          {/* Especialidades */}
          <div className="max-h-60 overflow-y-auto">
            {SPECIALIST_MODES.map((specialty: any) => (
              <button
                key={specialty.id}
                onClick={() => handleModeSelection('specialist', specialty.id as SpecialtyType)}
                disabled={!isPremium && specialistLimits?.limits.specialistMode.dailyRemaining === 0}
                className={`
                  w-full p-3 text-left hover:bg-gray-800/50 transition-colors border-b border-gray-700/50 last:border-b-0
                  ${currentMode === 'specialist' && currentSpecialty === specialty.id ? 'bg-gray-800/50' : ''}
                  ${!isPremium && specialistLimits?.limits.specialistMode.dailyRemaining === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-md bg-${specialty.color}-500/10 text-xl`}>
                      {specialty.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium text-${specialty.color}-300 text-sm`}>
                        {specialty.name}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1">
                        {specialty.description}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {specialty.features.slice(0, 2).map((feature: string) => (
                          <span 
                            key={feature}
                            className={`text-xs px-2 py-0.5 rounded-full bg-${specialty.color}-500/10 text-${specialty.color}-400`}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {currentMode === 'specialist' && currentSpecialty === specialty.id && (
                    <div className={`w-2 h-2 rounded-full bg-${specialty.color}-400`}></div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Información de Plan */}
          {!isPremium && (
            <div className="p-4 border-t border-gray-700 bg-gradient-to-r from-orange-500/10 to-red-500/10">
              <div className="flex items-start space-x-3">
                <Info className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="text-orange-300 font-medium mb-1">
                    Plan Gratuito - Acceso Limitado
                  </div>
                  <div className="text-gray-400 text-xs">
                    Los modos especializados tienen uso muy limitado en el plan gratuito. 
                    Actualiza a Pro para acceso completo.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpecialistModeSelector;