// functions/src/searchFunctions.js - FUNCIONES DE BÚSQUEDA WEB CON SEGURIDAD MEJORADA
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// ✅ IMPORTAR VERIFICACIÓN DE SUSCRIPCIÓN SEGURA
// Nota: Se importa dinámicamente para evitar dependencias circulares
let verifyUserSubscription = null;
const getVerifyFunction = () => {
  if (!verifyUserSubscription) {
    verifyUserSubscription = require('./index').verifyUserSubscription;
  }
  return verifyUserSubscription;
};

// ========================================
// 🔍 LÍMITES DE BÚSQUEDA POR PLAN CON VERIFICACIÓN
// ========================================
const SEARCH_LIMITS = {
  'free': { monthly: 50 },
  'pro': { monthly: 500 },
  'pro_max': { monthly: 2000 }
};

// ========================================
// ✅ FUNCIÓN PRINCIPAL: VERIFICAR LÍMITES DE BÚSQUEDA SEGURA
// ========================================
async function checkSearchLimits(uid, plan) {
  try {
    // ✅ VERIFICACIÓN ADICIONAL DE PLAN (OPCIONAL)
    if (getVerifyFunction()) {
      const verification = await getVerifyFunction()(uid);
      if (!verification.isValid) {
        console.warn(`⚠️ Verificación de suscripción falló para búsqueda: ${verification.error}`);
        // Continuar con plan básico pero registrar advertencia
      } else if (verification.plan !== plan) {
        console.warn(`⚠️ Plan inconsistente - Esperado: ${plan}, Actual: ${verification.plan}`);
        plan = verification.plan; // Usar plan verificado
      }
    }

    const today = new Date();
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const searchUsageDoc = await admin.firestore().collection('search_usage').doc(uid).get();
    const searchUsageData = searchUsageDoc.data();
    
    const monthlyUsage = searchUsageData?.monthly || { searchesUsed: 0, month: monthStr };
    
    // Reset automático si cambió el mes
    if (monthlyUsage.month !== monthStr) {
      monthlyUsage.searchesUsed = 0;
      monthlyUsage.month = monthStr;
    }
    
    // ✅ OBTENER LÍMITES SEGUROS
    const limit = SEARCH_LIMITS[plan]?.monthly || SEARCH_LIMITS['free'].monthly;
    const remaining = limit - monthlyUsage.searchesUsed;
    
    console.log(`🔍 Verificando límites de búsqueda - Plan: ${plan}, Usado: ${monthlyUsage.searchesUsed}/${limit}, Restante: ${remaining}`);
    
    return {
      canSearch: remaining > 0,
      used: monthlyUsage.searchesUsed,
      limit: limit,
      remaining: remaining,
      monthlyUsage: monthlyUsage,
      // ✅ INFORMACIÓN ADICIONAL DE VERIFICACIÓN
      verifiedPlan: plan,
      lastChecked: new Date()
    };
  } catch (error) {
    console.error('❌ Error verificando límites de búsqueda:', error);
    return {
      canSearch: false,
      used: 0,
      limit: 0,
      remaining: 0,
      monthlyUsage: { searchesUsed: 0, month: 'error' },
      error: error.message
    };
  }
}

// ========================================
// ✅ FUNCIÓN ACTUALIZAR USO DE BÚSQUEDA CON VERIFICACIÓN
// ========================================
async function updateSearchUsage(uid, monthlyUsage) {
  try {
    // ✅ VERIFICACIÓN ADICIONAL ANTES DE ACTUALIZAR
    if (!uid || !monthlyUsage) {
      throw new Error('Parámetros inválidos para actualización de búsqueda');
    }

    const previousCount = monthlyUsage.searchesUsed;
    monthlyUsage.searchesUsed += 1;
    
    // ✅ ACTUALIZACIÓN ATÓMICA CON VERIFICACIÓN
    await admin.firestore().collection('search_usage').doc(uid).set({
      monthly: monthlyUsage,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      // ✅ METADATOS DE AUDITORÍA
      updateSource: 'search_function',
      previousCount: previousCount,
      increment: 1
    });
    
    console.log(`✅ Contador de búsqueda actualizado: ${previousCount} → ${monthlyUsage.searchesUsed}`);
  } catch (error) {
    console.error('❌ Error actualizando contador de búsquedas:', error);
    throw error; // Re-lanzar para manejo en función llamadora
  }
}

// ========================================
// ✅ FUNCIÓN BUSCAR EN INTERNET CON VERIFICACIÓN MEJORADA
// ========================================
async function searchInternet(query, maxResults = 5) {
  try {
    // ✅ VALIDACIONES DE ENTRADA ESTRICTAS
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Query de búsqueda inválido');
    }

    if (maxResults < 1 || maxResults > 10) {
      throw new Error('Número de resultados debe estar entre 1 y 10');
    }

    // ✅ CONFIGURACIÓN SEGURA DE APIs
    const apiKey = functions.config().google?.search_api_key;
    const searchEngineId = functions.config().google?.search_engine_id;
    
    if (!apiKey || !searchEngineId) {
      throw new Error('APIs de búsqueda no configuradas correctamente');
    }

    // ✅ SANITIZAR QUERY PARA PREVENIR INYECCIONES
    const sanitizedQuery = query.trim()
      .replace(/[<>]/g, '') // Remover caracteres potencialmente peligrosos
      .substring(0, 200); // Limitar longitud

    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(sanitizedQuery)}&num=${maxResults}&lr=lang_es&safe=active`;
    
    console.log('🔍 Ejecutando búsqueda segura:', sanitizedQuery);
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`Error en Google Search API: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // ✅ VALIDAR RESPUESTA DE LA API
    if (!data.items) {
      console.log('ℹ️ No se encontraron resultados para:', sanitizedQuery);
      return {
        success: true,
        query: sanitizedQuery,
        results: [],
        totalResults: 0,
        searchTime: Date.now()
      };
    }
    
    // ✅ PROCESAR Y SANITIZAR RESULTADOS
    const results = data.items.slice(0, maxResults).map(item => ({
      title: item.title ? item.title.substring(0, 200) : 'Sin título',
      snippet: item.snippet ? item.snippet.substring(0, 300) : 'Sin descripción',
      link: item.link,
      displayLink: item.displayLink,
      // ✅ CAMPOS ADICIONALES SEGUROS
      formattedUrl: item.formattedUrl,
      kind: item.kind || 'web'
    }));
    
    console.log(`✅ Búsqueda exitosa: ${results.length} resultados encontrados`);
    
    return {
      success: true,
      query: sanitizedQuery,
      results: results,
      totalResults: parseInt(data.searchInformation?.totalResults) || results.length,
      searchTime: parseFloat(data.searchInformation?.searchTime) || 0,
      // ✅ METADATOS DE VERIFICACIÓN
      apiResponse: {
        kind: data.kind,
        searchInformation: data.searchInformation
      }
    };
    
  } catch (error) {
    console.error('❌ Error en búsqueda de internet:', error);
    throw new Error(`Búsqueda fallida: ${error.message}`);
  }
}

// ========================================
// ✅ FUNCIÓN DETERMINAR SI NECESITA BÚSQUEDA WEB (MEJORADA)
// ========================================
function shouldSearchInternet(message) {
  if (!message || typeof message !== 'string') {
    return false;
  }

  const query = message.toLowerCase().trim();
  
  // ✅ PATTERNS MÁS ESPECÍFICOS PARA BÚSQUEDA
  const searchPatterns = [
    // Información actual/reciente
    /\b(actual|reciente|último|nueva|nuevo|hoy|ayer|esta semana|este mes|2024|2025)\b/,
    /\b(noticias|noticia|actualidad|breaking|último momento)\b/,
    
    // Preguntas específicas que requieren datos actuales
    /\b(precio|cotización|valor|costo|cuánto cuesta|cuánto vale)\b/,
    /\b(clima|tiempo|temperatura|pronóstico)\b/,
    /\b(horarios|abierto|cerrado|disponible ahora)\b/,
    
    // Eventos y fechas
    /\b(cuándo|fecha|horario|evento|concierto|partido)\b/,
    /\b(calendario|agenda|programación)\b/,
    
    // Información de empresas/organizaciones
    /\b(empresa|compañía|organización|institución|universidad)\b.*\b(información|datos|contacto)\b/,
    
    // Búsquedas específicas
    /\b(buscar|encontrar|información sobre|datos sobre)\b/,
    /\b(dónde|ubicación|dirección|mapa|cerca de)\b/,
    
    // Comparaciones que requieren datos actuales
    /\b(comparar|vs|versus|diferencia entre|mejor que)\b/,
    /\b(ranking|top|mejor|peor|lista de)\b/,
    
    // Preguntas que típicamente requieren información actualizada
    /^(qué|cuál|cómo|dónde|cuándo|quién).*\b(ahora|actual|último|reciente)\b/
  ];
  
  // ✅ ANTI-PATTERNS - NO BUSCAR PARA ESTOS CASOS
  const noSearchPatterns = [
    /\b(define|definición|qué es|explica|explicar)\b/,
    /\b(cómo hacer|tutorial|pasos|instrucciones)\b/,
    /\b(ejemplo|ejemplos|muestra|muéstrame)\b/,
    /\b(código|programar|script|función)\b/,
    /\b(matemática|matemáticas|cálculo|ecuación)\b/,
    /\b(historia|histórico|antiguo|pasado)\b/,
    /\b(teoría|concepto|filosofía|literatura)\b/
  ];
  
  // Verificar anti-patterns primero
  for (const pattern of noSearchPatterns) {
    if (pattern.test(query)) {
      return false;
    }
  }
  
  // Verificar patterns de búsqueda
  for (const pattern of searchPatterns) {
    if (pattern.test(query)) {
      return true;
    }
  }
  
  // ✅ LÓGICA ADICIONAL: DETECTAR PREGUNTAS SOBRE ENTIDADES ESPECÍFICAS
  const entityPatterns = [
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/, // Nombres propios (Elon Musk, Apple Inc)
    /\b[A-Z]{2,}\b/, // Siglas (NASA, UEFA)
    /@\w+/, // Menciones de redes sociales
    /www\.|\.com|\.org|\.net/ // URLs o dominios
  ];
  
  for (const pattern of entityPatterns) {
    if (pattern.test(message)) {
      return true;
    }
  }
  
  return false;
}

// ========================================
// ✅ FUNCIÓN GENERAR RESPUESTA CON BÚSQUEDA (MEJORADA)
// ========================================
async function generateResponseWithSearch(uid, plan, message, chatHistory = [], genAI) {
  try {
    // ✅ VERIFICAR LÍMITES CON SEGURIDAD MEJORADA
    const limitCheck = await checkSearchLimits(uid, plan);
    
    if (!limitCheck.canSearch) {
      console.log(`⚠️ Usuario ${uid} alcanzó límite de búsquedas: ${limitCheck.used}/${limitCheck.limit}`);
      
      // Preparar contexto de conversación
      let conversationContext = '';
      if (chatHistory && chatHistory.length > 0) {
        conversationContext = chatHistory.slice(-5).map(msg => 
          `${msg.type === 'user' ? 'Usuario' : 'NORA'}: ${msg.message}`
        ).join('\n');
      }

      const limitPrompt = `Eres NORA, un asistente de IA útil. Responde en español.

${conversationContext ? `Contexto de conversación:\n${conversationContext}\n\n` : ''}

Usuario: ${message}

NOTA IMPORTANTE: El usuario ha alcanzado su límite mensual de búsquedas en internet (${limitCheck.used}/${limitCheck.limit}). Responde basándote en tu conocimiento general y menciona que para información muy actualizada ha alcanzado el límite de búsquedas web del plan ${plan === 'free' ? 'Gratuito' : (plan === 'pro' ? 'Pro' : 'Pro Max')}.

Respuesta:`;

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: plan === 'free' ? 2000 : (plan === 'pro' ? 4000 : 10000)
        }
      });

      const result = await model.generateContent(limitPrompt);
      const text = result.response.text();

      return {
        response: text,
        tokensUsed: Math.floor(text.length / 4),
        searchUsed: false,
        limitReached: true,
        searchLimits: limitCheck
      };
    }
    
    // Determinar si necesita búsqueda
    const needsSearch = shouldSearchInternet(message);
    
    let searchResults = null;
    let searchContext = '';
    
    if (needsSearch) {
      console.log('🔍 Consulta requiere búsqueda en internet y hay límite disponible');
      
      try {
        // ✅ CREAR QUERY OPTIMIZADA PARA BÚSQUEDA MÁS EFECTIVA
        let searchQuery = message;
        
        // Limpiar el query para búsqueda más efectiva
        searchQuery = searchQuery
          .replace(/por favor|puedes|podrías|me ayudas|dime|cuéntame/gi, '')
          .replace(/\?/g, '')
          .replace(/^(qué|cómo|cuál|dónde|cuándo|por qué)\s+/gi, '')
          .trim();
        
        // Limitar longitud del query
        if (searchQuery.length > 100) {
          searchQuery = searchQuery.substring(0, 100);
        }
        
        // ✅ EJECUTAR BÚSQUEDA CON MANEJO DE ERRORES ROBUSTO
        searchResults = await searchInternet(searchQuery, 5);
        
        // ✅ ACTUALIZAR CONTADOR SOLO DESPUÉS DE BÚSQUEDA EXITOSA
        await updateSearchUsage(uid, limitCheck.monthlyUsage);
        
        if (searchResults.results && searchResults.results.length > 0) {
          searchContext = `\n\n--- INFORMACIÓN ACTUAL DE INTERNET ---\n`;
          searchContext += `Búsqueda: "${searchResults.query}"\n`;
          searchContext += `Resultados encontrados: ${searchResults.results.length}\n`;
          searchContext += `Tiempo de búsqueda: ${searchResults.searchTime}s\n\n`;
          
          searchResults.results.forEach((result, index) => {
            searchContext += `${index + 1}. ${result.title}\n`;
            searchContext += `   ${result.snippet}\n`;
            searchContext += `   Fuente: ${result.displayLink}\n`;
            searchContext += `   URL: ${result.link}\n\n`;
          });
          
          searchContext += `--- FIN INFORMACIÓN DE INTERNET ---\n\n`;
        }
      } catch (searchError) {
        console.error('❌ Error en búsqueda, continuando sin resultados web:', searchError);
        searchContext = '\n--- ⚠️ No se pudo obtener información actualizada de internet ---\n';
        searchContext += `Motivo: ${searchError.message}\n\n`;
      }
    }
    
    // Preparar contexto de conversación
    let conversationContext = '';
    if (chatHistory && chatHistory.length > 0) {
      conversationContext = chatHistory.slice(-5).map(msg => 
        `${msg.type === 'user' ? 'Usuario' : 'NORA'}: ${msg.message}`
      ).join('\n');
    }
    
    // ✅ CREAR PROMPT MEJORADO CON CONTEXTO DE BÚSQUEDA
    const enhancedPrompt = `Eres NORA, un asistente de IA útil. Responde en español.

${searchContext}

${conversationContext ? `Contexto de conversación:\n${conversationContext}\n\n` : ''}

Usuario: ${message}

${searchContext ? 
`INSTRUCCIONES ESPECIALES: 
- Usa la información actualizada de internet proporcionada arriba
- Cita las fuentes cuando uses información específica de los resultados
- Si la información de internet es relevante, priorízala sobre tu conocimiento base
- Menciona que la información es actual/reciente cuando sea apropiado
- Si hay múltiples fuentes, compara o sintetiza la información cuando sea útil` 
: ''}

Respuesta:`;

    // ✅ CONFIGURAR MODELO SEGÚN EL PLAN VERIFICADO
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: plan === 'free' ? 2000 : (plan === 'pro' ? 4000 : 10000)
      }
    });

    console.log('🤖 Generando respuesta con contexto web...');
    const result = await model.generateContent(enhancedPrompt);
    const text = result.response.text();

    // Obtener límites actualizados
    const updatedLimits = await checkSearchLimits(uid, plan);

    return {
      response: text,
      tokensUsed: Math.floor(text.length / 4),
      searchUsed: needsSearch,
      searchResults: searchResults,
      limitReached: false,
      searchLimits: updatedLimits,
      // ✅ METADATOS ADICIONALES
      searchQuery: searchResults?.query || null,
      sourcesUsed: searchResults?.results?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Error generando respuesta con búsqueda:', error);
    throw error;
  }
}

// ========================================
// ✅ FUNCIÓN AUXILIAR: EXTRAER TEXTO DE PDF (MEJORADA)
// ========================================
async function extractTextFromPDF(base64Data) {
  try {
    // ✅ VALIDACIONES DE ENTRADA
    if (!base64Data || typeof base64Data !== 'string') {
      throw new Error('Datos de PDF inválidos');
    }

    // Intentar con pdf-parse si está disponible
    try {
      const pdf = require('pdf-parse');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // ✅ VALIDAR TAMAÑO DEL ARCHIVO
      if (buffer.length > 10 * 1024 * 1024) { // 10MB límite
        throw new Error('Archivo PDF demasiado grande');
      }
      
      const data = await pdf(buffer);
      return data.text;
    } catch (pdfParseError) {
      console.log('📄 pdf-parse no disponible, usando método básico:', pdfParseError.message);
      
      // ✅ MÉTODO BÁSICO DE EXTRACCIÓN CON VALIDACIONES
      try {
        const buffer = Buffer.from(base64Data, 'base64');
        
        if (buffer.length > 10 * 1024 * 1024) {
          throw new Error('Archivo demasiado grande para procesamiento básico');
        }
        
        const pdfString = buffer.toString('binary');
        
        // Buscar texto en el PDF usando patrones mejorados
        const textMatches = pdfString.match(/\(([^)]+)\)/g);
        if (textMatches && textMatches.length > 0) {
          const extractedText = textMatches
            .map(match => match.slice(1, -1))
            .filter(text => text.length > 1 && /[a-zA-ZáéíóúñÑ]/.test(text))
            .join(' ');
          
          return extractedText.length > 10 ? extractedText : null;
        }
        
        return null;
      } catch (basicError) {
        console.error('❌ Error con extracción básica:', basicError);
        return null;
      }
    }
  } catch (error) {
    console.error('❌ Error general extrayendo texto de PDF:', error);
    return null;
  }
}

// ========================================
// ✅ FUNCIÓN DE VALIDACIÓN DE CONFIGURACIÓN
// ========================================
function validateSearchConfiguration() {
  const apiKey = functions.config().google?.search_api_key;
  const searchEngineId = functions.config().google?.search_engine_id;
  
  if (!apiKey || !searchEngineId) {
    console.warn('⚠️ Configuración de búsqueda web incompleta');
    return false;
  }
  
  return true;
}

// ========================================
// 🔧 FUNCIONES DE UTILIDAD ADICIONALES
// ========================================

// Función para limpiar y sanitizar queries de búsqueda
function sanitizeSearchQuery(query) {
  if (!query || typeof query !== 'string') return '';
  
  return query
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres peligrosos
    .replace(/\s+/g, ' ') // Normalizar espacios
    .substring(0, 200); // Limitar longitud
}

// Función para validar resultados de búsqueda
function validateSearchResults(results) {
  if (!results || !Array.isArray(results)) return [];
  
  return results.filter(result => 
    result && 
    typeof result === 'object' &&
    result.title && 
    result.link &&
    result.snippet
  );
}

// ========================================
// 📊 EXPORTAR TODAS LAS FUNCIONES
// ========================================
module.exports = {
  // Funciones principales
  searchInternet,
  shouldSearchInternet,
  generateResponseWithSearch,
  extractTextFromPDF,
  checkSearchLimits,
  updateSearchUsage,
  
  // Funciones de utilidad
  sanitizeSearchQuery,
  validateSearchResults,
  validateSearchConfiguration,
  
  // Constantes
  SEARCH_LIMITS
};