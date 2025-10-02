// app/api/process-voice/route.ts - PROCESAMIENTO DE VOZ CON GEMINI
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 🔒 No se inicializa globalmente. La clave se lee y se usa dentro de POST/processWithGemini.

// ✅ PROCESAMIENTO CON GEMINI
async function processWithGemini(text: string): Promise<string> {
  // CRITICAL FIX: The model name 'gemini-1.5-flash' is often deprecated or incorrectly routed. 
  // We use the most modern and accessible name: 'gemini-2.5-flash'.
  const MODEL_NAME = 'gemini-2.5-flash';
  
  // La clave de API se inyecta directamente desde el proceso.env,
  // la cual debería estar disponible en esta API Route.
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error("⚠️ Falling back to basic correction because API Key is missing in environment.");
    return basicTextCorrection(text);
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `Eres un corrector de texto especializado en procesar transcripciones de voz a texto.

Tu tarea es corregir y mejorar el siguiente texto transcrito, aplicando estas reglas:

1. **Ortografía y gramática**: Corrige errores ortográficos y gramaticales
2. **Puntuación**: Añade puntos, comas y signos de puntuación apropiados
3. **Capitalización**: Capitaliza correctamente nombres propios y el inicio de oraciones
4. **Estructura**: Mejora la estructura de las oraciones manteniendo el significado original
5. **Naturalidad**: El texto debe sonar natural y fluido
6. **Coherencia**: Asegura que el texto sea coherente y tenga sentido

IMPORTANTE:
- NO cambies el significado del texto original
- NO añadas información que no esté en el texto original
- NO uses formato markdown, solo texto plano
- Mantén el tono y estilo del hablante
- Si hay errores comunes de dictado (ej: "haber" en lugar de "a ver"), corrígelos según el contexto

Texto a corregir:
"${text}"

Responde ÚNICAMENTE con el texto corregido, sin explicaciones adicionales.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const correctedText = response.text().trim();

    if (!correctedText || correctedText.length === 0) {
      throw new Error('Respuesta vacía de Gemini');
    }

    return correctedText;

  } catch (error: any) {
    // Loguear el error para debug, pero usar fallback
    console.error('Error con Gemini:', error.message);
    return basicTextCorrection(text);
  }
}

// ... existing basicTextCorrection function ...
function basicTextCorrection(text: string): string {
  let corrected = text.trim();
  
  // Capitalizar primera letra
  if (corrected.length > 0) {
    corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
  }
  
  // Correcciones ortográficas comunes
  const corrections: { [key: string]: string } = {
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
    ' k ': ' que ',
    'haber si': 'a ver si',
    'a sido': 'ha sido',
    'aver': 'a ver',
    'ay que': 'hay que',
    'halla': 'haya',
    'valla': 'vaya',
    'tubo': 'tuvo',
    'asta': 'hasta',
    'asia': 'hacia',
  };

  for (const [wrong, right] of Object.entries(corrections)) {
    const regex = new RegExp(wrong, 'gi');
    corrected = corrected.replace(regex, right);
  }

  // Añadir punto final si no existe
  if (!/[.!?]$/.test(corrected)) {
    corrected += '.';
  }

  // Capitalizar después de puntos
  corrected = corrected.replace(/([.!?]\s+)([a-z])/g, (match, p1, p2) => {
    return p1 + p2.toUpperCase();
  });

  // Limpiar espacios múltiples
  corrected = corrected.replace(/\s+/g, ' ');

  // Limpiar espacios antes de puntuación
  corrected = corrected.replace(/\s+([.,;:!?])/g, '$1');

  return corrected;
}

// ... existing POST, GET, PUT, DELETE exports ...
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Texto no proporcionado' },
        { status: 400 }
      );
    }

    // ✅ PROCESAR CON GEMINI
    const processedText = await processWithGemini(text);

    return NextResponse.json({
      success: true,
      originalText: text,
      processedText
    });

  } catch (error) {
    console.error('Error processing voice:', error);
    
    // ✅ FALLBACK: Usar texto vacío si hay error en parsing
    return NextResponse.json({
      success: false,
      error: 'Error procesando audio'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    error: 'Method not allowed' 
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ 
    error: 'Method not allowed' 
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ 
    error: 'Method not allowed' 
  }, { status: 405 });
}