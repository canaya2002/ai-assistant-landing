// app/components/Chat/SuggestedPrompts.tsx
'use client';

import { memo, useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const SUGGESTED_PROMPTS = [
  "Resume este PDF en puntos clave",
  "Analiza mi código y sugiere mejoras",
  "Crea un plan de marketing para mi producto",
  "Escribe un email profesional para mi cliente",
  "Diseña una estrategia de contenido para redes sociales",
  "Genera ideas creativas para mi proyecto",
  "Explícame este concepto de forma simple",
  "Optimiza mi código para mejor rendimiento",
  "Crea una presentación ejecutiva sobre IA",
  "Ayúdame a depurar este error",
  "Redacta un artículo SEO sobre tecnología",
  "Genera un análisis FODA de mi negocio",
  "Crea un plan de estudio personalizado",
  "Escribe una descripción de producto atractiva",
  "Genera copy publicitario persuasivo",
  "Diseña un flujo de trabajo automatizado",
  "Crea una lista de tareas priorizadas",
  "Ayúdame a preparar una entrevista técnica",
  "Genera un guion para video de YouTube",
  "Crea preguntas frecuentes para mi sitio web",
  "Diseña una estrategia de email marketing",
  "Genera ideas para mejorar conversiones",
  "Crea un plan de lanzamiento de producto",
  "Ayúdame a escribir documentación técnica",
  "Genera propuestas de valor únicas",
  "Crea un calendario de contenido mensual",
  "Analiza datos y genera insights",
  "Diseña una arquitectura de software escalable",
  "Genera nombres creativos para mi startup",
  "Crea un pitch deck convincente"
];

// Función para seleccionar 5 prompts aleatorios sin repetir
const getRandomPrompts = (count: number = 5): string[] => {
  const shuffled = [...SUGGESTED_PROMPTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const SuggestedPrompts = memo(function SuggestedPrompts({ onSelectPrompt }: SuggestedPromptsProps) {
  const [prompts, setPrompts] = useState<string[]>(() => getRandomPrompts(5));
  const [isAnimating, setIsAnimating] = useState(false);

  // Cambiar prompts cada 8 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      // Esperar que termine la animación de salida antes de cambiar
      setTimeout(() => {
        setPrompts(getRandomPrompts(5));
        setIsAnimating(false);
      }, 300);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Dividir en 2 filas: 2 arriba, 3 abajo
  const topRow = prompts.slice(0, 2);
  const bottomRow = prompts.slice(2, 5);

  const PromptButton = ({ prompt, index }: { prompt: string; index: number }) => (
    <button
      key={`${prompt}-${index}`}
      onClick={() => onSelectPrompt(prompt)}
      className="group relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/10"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Efecto 3D de fondo */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Brillo superior */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Texto */}
      <div className="relative flex items-center gap-1.5 sm:gap-2">
        <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 group-hover:text-white transition-colors duration-300 flex-shrink-0" />
        <span className="text-xs sm:text-sm text-gray-300 group-hover:text-white transition-colors duration-300 font-light whitespace-nowrap">
          {prompt}
        </span>
      </div>

      {/* Sombra interna 3D */}
      <div className="absolute inset-0 rounded-full shadow-inner opacity-50" />
    </button>
  );

  return (
    <div className="w-full mb-3 px-2 sm:px-4">
      <div className={`flex flex-col gap-2 items-center transition-all duration-300 ${
        isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}>
        {/* FILA SUPERIOR - 2 prompts (centrados) */}
        <div className="flex gap-2 justify-center items-center">
          {topRow.map((prompt, index) => (
            <PromptButton key={`top-${index}`} prompt={prompt} index={index} />
          ))}
        </div>

        {/* FILA INFERIOR - 3 prompts (centrados) */}
        <div className="flex gap-2 justify-center items-center">
          {bottomRow.map((prompt, index) => (
            <PromptButton key={`bottom-${index}`} prompt={prompt} index={index + 2} />
          ))}
        </div>
      </div>
    </div>
  );
});

export default SuggestedPrompts;