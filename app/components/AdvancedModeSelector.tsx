// app/components/AdvancedModeSelector.tsx - COMPLETO
'use client';

import React from 'react';
import { 
  Plane, 
  Shield, 
  Wand2, 
  TrendingUp, 
  FileSearch, 
  Leaf,
  X
} from 'lucide-react';
import { AdvancedModeType } from '../lib/types';

interface AdvancedMode {
  id: AdvancedModeType;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
}

interface AdvancedModeSelectorProps {
  currentMode: AdvancedModeType | null;
  onSelectMode: (mode: AdvancedModeType | null) => void;
}

const advancedModes: AdvancedMode[] = [
  {
    id: 'travel_planner',
    name: 'Travel Planner',
    description: 'Planifica viajes detallados con itinerarios personalizados',
    icon: Plane,
    color: 'from-blue-500 to-cyan-500',
    gradient: 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10'
  },
  {
    id: 'ai_detector',
    name: 'AI Detector',
    description: 'Detecta si un texto fue generado por IA',
    icon: Shield,
    color: 'from-red-500 to-orange-500',
    gradient: 'bg-gradient-to-r from-red-500/10 to-orange-500/10'
  },
  {
    id: 'text_humanizer',
    name: 'Text Humanizer',
    description: 'Convierte texto de IA en texto más humano y natural',
    icon: Wand2,
    color: 'from-purple-500 to-pink-500',
    gradient: 'bg-gradient-to-r from-purple-500/10 to-pink-500/10'
  },
  {
    id: 'brand_analyzer',
    name: 'Brand Analyzer',
    description: 'Analiza marcas y estrategias de marketing',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
    gradient: 'bg-gradient-to-r from-green-500/10 to-emerald-500/10'
  },
  {
    id: 'document_detective',
    name: 'Document Detective',
    description: 'Analiza documentos en profundidad y extrae insights',
    icon: FileSearch,
    color: 'from-yellow-500 to-amber-500',
    gradient: 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10'
  },
  {
    id: 'plant_doctor',
    name: 'Plant Doctor',
    description: 'Diagnostica problemas de plantas y ofrece soluciones',
    icon: Leaf,
    color: 'from-lime-500 to-green-500',
    gradient: 'bg-gradient-to-r from-lime-500/10 to-green-500/10'
  }
];

export default function AdvancedModeSelector({ currentMode, onSelectMode }: AdvancedModeSelectorProps) {
  return (
    <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">🚀 Modos Avanzados</h3>
            <p className="text-gray-400 text-sm">
              Selecciona un modo especializado para obtener respuestas más precisas
            </p>
          </div>
          {currentMode && (
            <button
              onClick={() => onSelectMode(null)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
            >
              <X className="w-4 h-4" />
              <span>Desactivar</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advancedModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = currentMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={`
                  relative overflow-hidden rounded-xl p-6 text-left transition-all duration-300
                  ${isActive 
                    ? 'ring-2 ring-purple-500 scale-105' 
                    : 'hover:scale-105'
                  }
                  ${mode.gradient}
                  backdrop-blur-sm border border-white/10
                `}
              >
                <div className="relative z-10">
                  <div className={`
                    inline-flex p-3 rounded-lg mb-4 bg-gradient-to-r ${mode.color}
                  `}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h4 className="text-lg font-bold text-white mb-2">
                    {mode.name}
                  </h4>
                  
                  <p className="text-sm text-gray-300">
                    {mode.description}
                  </p>

                  {isActive && (
                    <div className="mt-4 flex items-center gap-2 text-purple-400 text-sm font-medium">
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      Activo
                    </div>
                  )}
                </div>

                <div className={`
                  absolute inset-0 bg-gradient-to-r ${mode.color} opacity-0 
                  ${isActive ? 'opacity-10' : 'group-hover:opacity-5'}
                  transition-opacity duration-300
                `} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}