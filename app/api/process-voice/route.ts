// app/api/process-voice/route.ts - PROCESAMIENTO DE VOZ MEJORADO
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Texto no proporcionado' },
        { status: 400 }
      );
    }

    // ✅ CORRECCIÓN MEJORADA CON MÁS REGLAS
    const processedText = advancedTextCorrection(text);

    return NextResponse.json({
      success: true,
      originalText: text,
      processedText
    });

  } catch (error) {
    console.error('Error processing voice:', error);
    return NextResponse.json(
      { error: 'Error procesando audio' },
      { status: 500 }
    );
  }
}

// ✅ FUNCIÓN DE CORRECCIÓN AVANZADA
function advancedTextCorrection(text: string): string {
  let corrected = text.trim();
  
  // Capitalizar primera letra
  if (corrected.length > 0) {
    corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
  }
  
  // ✅ CORRECCIONES ORTOGRÁFICAS COMUNES EN ESPAÑOL
  const corrections: { [key: string]: string } = {
    // Abreviaturas y modismos
    ' q ': ' que ',
    ' x ': ' por ',
    ' xq ': ' porque ',
    ' pq ': ' porque ',
    ' tb ': ' también ',
    ' tmb ': ' también ',
    ' bn ': ' bien ',
    ' ps ': ' pues ',
    ' xfa ': ' por favor ',
    ' pf ': ' por favor ',
    ' dnd ': ' dónde ',
    ' salu2 ': ' saludos ',
    ' mxo ': ' mucho ',
    ' muxo ': ' mucho ',
    ' msj ': ' mensaje ',
    ' msg ': ' mensaje ',
    ' tqm ': ' te quiero mucho ',
    ' tkm ': ' te quiero mucho ',
    ' xd ': ' jaja ',
    ' k ': ' que ',
    
    // Errores comunes de dictado
    'haber si': 'a ver si',
    'a sido': 'ha sido',
    'a ver': 'haber', // contexto dependiente, pero común
    'aver': 'a ver',
    'ay que': 'hay que',
    'halla': 'haya',
    'valla': 'vaya',
    'tubo': 'tuvo',
    'asta': 'hasta',
    'asia': 'hacia',
    'echo': 'hecho',
    'hecho de menos': 'echo de menos',
    
    // Números y fechas
    ' 1ro ': ' primero ',
    ' 2do ': ' segundo ',
    ' 3ro ': ' tercero ',
    
    // Mejoras de puntuación en preguntas
    'que es ': '¿qué es ',
    'como estas': '¿cómo estás',
    'como esta': '¿cómo está',
    'donde esta': '¿dónde está',
    'donde estas': '¿dónde estás',
    'cuanto es': '¿cuánto es',
    'cuanto cuesta': '¿cuánto cuesta',
    'cuando es': '¿cuándo es',
    'por que ': '¿por qué ',
    'quien es': '¿quién es',
    'cual es': '¿cuál es',
    
    // Acentos comunes que faltan en dictado
    'si dices': 'sí dices',
    'tu sabes': 'tú sabes',
    'el esta': 'él está',
    'mi dijo': 'me dijo',
    
    // Conectores y artículos
    ' d ': ' de ',
    ' pa ': ' para ',
    ' ke ': ' que ',
    ' sta ': ' está ',
    ' ta ': ' está ',
  };
  
  // Aplicar correcciones
  for (const [wrong, correct] of Object.entries(corrections)) {
    const regex = new RegExp(wrong, 'gi');
    corrected = corrected.replace(regex, correct);
  }
  
  // ✅ AÑADIR SIGNOS DE INTERROGACIÓN COMPLETOS
  corrected = addQuestionMarks(corrected);
  
  // ✅ AÑADIR PUNTO FINAL SI NO TIENE PUNTUACIÓN
  if (!/[.!?¿¡]$/.test(corrected)) {
    // Si parece pregunta, añadir ?
    if (/^(qué|cómo|cuándo|dónde|quién|cuál|por qué|para qué)/i.test(corrected)) {
      corrected += '?';
    } else {
      corrected += '.';
    }
  }
  
  // ✅ CAPITALIZAR DESPUÉS DE PUNTO
  corrected = corrected.replace(/\.\s+([a-z])/g, (match, letter) => {
    return '. ' + letter.toUpperCase();
  });
  
  // ✅ ESPACIOS MÚLTIPLES A UNO SOLO
  corrected = corrected.replace(/\s+/g, ' ');
  
  return corrected.trim();
}

// ✅ FUNCIÓN PARA AÑADIR SIGNOS DE INTERROGACIÓN
function addQuestionMarks(text: string): string {
  // Lista de palabras interrogativas en español
  const questionWords = [
    'qué', 'cómo', 'cuándo', 'dónde', 'quién', 'cuál', 'cuáles',
    'cuánto', 'cuántos', 'cuánta', 'cuántas', 'por qué', 'para qué'
  ];
  
  let result = text;
  
  // Detectar frases interrogativas y añadir signos
  for (const word of questionWords) {
    const regex = new RegExp(`\\b(${word})\\b([^.!?¿¡]*?)([.!]|$)`, 'gi');
    result = result.replace(regex, (match, qWord, content, ending) => {
      // Si ya tiene signos de interrogación, no hacer nada
      if (match.includes('¿') || match.includes('?')) {
        return match;
      }
      // Añadir signos de interrogación
      return `¿${qWord}${content}?`;
    });
  }
  
  return result;
}

// ✅ MÉTODO GET NO PERMITIDO
export async function GET() {
  return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
}