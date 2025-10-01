// functions/searchFunctions.js - BÃšSQUEDA WEB Y PROCESAMIENTO PDF COMPLETO
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// ========================================
// ðŸ“Š LÃMITES DE BÃšSQUEDA POR PLAN
// ========================================
const SEARCH_LIMITS = {
  'free': { monthly: 50 },
  'pro': { monthly: 500 },
  'pro_max': { monthly: 2000 }
};

// ========================================
// âœ… FUNCIÃ“N: VERIFICAR LÃMITES DE BÃšSQUEDA
// ========================================
async function checkSearchLimits(uid, plan) {
  try {
    const today = new Date();
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const searchUsageDoc = await admin.firestore().collection('search_usage').doc(uid).get();
    const searchUsageData = searchUsageDoc.data();
    
    let monthlyUsage = searchUsageData?.monthly || { searchesUsed: 0, month: monthStr };
    
    // Reset automÃ¡tico si cambiÃ³ el mes
    if (monthlyUsage.month !== monthStr) {
      monthlyUsage = { searchesUsed: 0, month: monthStr };
    }
    
    const limit = SEARCH_LIMITS[plan]?.monthly || SEARCH_LIMITS['free'].monthly;
    const remaining = Math.max(0, limit - monthlyUsage.searchesUsed);
    
    console.log(`ðŸ” LÃ­mites de bÃºsqueda - Plan: ${plan}, Usado: ${monthlyUsage.searchesUsed}/${limit}`);
    
    return {
      canSearch: remaining > 0,
      used: monthlyUsage.searchesUsed,
      limit: limit,
      remaining: remaining,
      monthlyUsage: monthlyUsage
    };
  } catch (error) {
    console.error('âŒ Error verificando lÃ­mites de bÃºsqueda:', error);
    return {
      canSearch: false,
      used: 0,
      limit: 0,
      remaining: 0,
      monthlyUsage: { searchesUsed: 0, month: 'error' }
    };
  }
}

// ========================================
// âœ… FUNCIÃ“N: ACTUALIZAR USO DE BÃšSQUEDA
// ========================================
async function updateSearchUsage(uid, monthlyUsage) {
  try {
    monthlyUsage.searchesUsed += 1;
    
    await admin.firestore().collection('search_usage').doc(uid).set({
      monthly: monthlyUsage,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`âœ… Contador de bÃºsqueda actualizado: ${monthlyUsage.searchesUsed}`);
  } catch (error) {
    console.error('âŒ Error actualizando contador de bÃºsquedas:', error);
    throw error;
  }
}

// ========================================
// âœ… FUNCIÃ“N: BUSCAR EN INTERNET
// ========================================
async function searchInternet(query, maxResults = 5) {
  try {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('Query de bÃºsqueda invÃ¡lido');
    }

    if (maxResults < 1 || maxResults > 10) {
      throw new Error('NÃºmero de resultados debe estar entre 1 y 10');
    }

    const apiKey = functions.config().google?.search_api_key;
    const searchEngineId = functions.config().google?.search_engine_id;
    
    if (!apiKey || !searchEngineId) {
      throw new Error('APIs de bÃºsqueda no configuradas');
    }

    const sanitizedQuery = query.trim().substring(0, 200);
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(sanitizedQuery)}&num=${maxResults}&lr=lang_es&safe=active`;
    
    console.log('ðŸ” Ejecutando bÃºsqueda:', sanitizedQuery);
    
    const response = await axios.get(searchUrl);
    
    if (!response.data.items) {
      console.log('â„¹ï¸ No se encontraron resultados');
      return {
        success: true,
        query: sanitizedQuery,
        results: [],
        totalResults: 0
      };
    }
    
    const results = response.data.items.slice(0, maxResults).map(item => ({
      title: item.title || 'Sin tÃ­tulo',
      snippet: item.snippet || 'Sin descripciÃ³n',
      link: item.link,
      displayLink: item.displayLink
    }));
    
    console.log(`âœ… BÃºsqueda exitosa: ${results.length} resultados`);
    
    return {
      success: true,
      query: sanitizedQuery,
      results: results,
      totalResults: parseInt(response.data.searchInformation?.totalResults) || results.length
    };
    
  } catch (error) {
    console.error('âŒ Error en bÃºsqueda:', error);
    throw new Error(`BÃºsqueda fallida: ${error.message}`);
  }
}

// ========================================
// âœ… FUNCIÃ“N: DETERMINAR SI NECESITA BÃšSQUEDA WEB
// ========================================
function shouldSearchInternet(message) {
  if (!message || typeof message !== 'string') {
    return false;
  }

  const query = message.toLowerCase().trim();
  
  const searchPatterns = [
    /\b(actual|reciente|Ãºltimo|nueva|nuevo|hoy|ayer|esta semana|este mes|2024|2025)\b/,
    /\b(noticias|noticia|actualidad|breaking)\b/,
    /\b(precio|cotizaciÃ³n|valor|costo|cuÃ¡nto cuesta)\b/,
    /\b(clima|tiempo|temperatura|pronÃ³stico)\b/,
    /\b(horarios|abierto|cerrado|disponible ahora)\b/,
    /\b(cuÃ¡ndo|fecha|horario|evento)\b/,
    /\b(buscar|encontrar|informaciÃ³n sobre)\b/,
    /\b(dÃ³nde|ubicaciÃ³n|direcciÃ³n|cerca de)\b/,
    /\b(comparar|vs|mejor|ranking|top)\b/
  ];
  
  const noSearchPatterns = [
    /\b(define|definiciÃ³n|quÃ© es|explica)\b/,
    /\b(cÃ³mo hacer|tutorial|pasos)\b/,
    /\b(ejemplo|ejemplos|muestra)\b/,
    /\b(cÃ³digo|programar|funciÃ³n)\b/,
    /\b(matemÃ¡tica|cÃ¡lculo|ecuaciÃ³n)\b/,
    /\b(historia|histÃ³rico|antiguo)\b/,
    /\b(teorÃ­a|concepto|filosofÃ­a)\b/
  ];
  
  for (const pattern of noSearchPatterns) {
    if (pattern.test(query)) {
      return false;
    }
  }
  
  for (const pattern of searchPatterns) {
    if (pattern.test(query)) {
      return true;
    }
  }
  
  return false;
}

// ========================================
// âœ… FUNCIÃ“N: GENERAR RESPUESTA CON BÃšSQUEDA
// ========================================
async function generateResponseWithSearch(uid, plan, message, chatHistory, genAI, limits) {
  try {
    const limitCheck = await checkSearchLimits(uid, plan);
    
    if (!limitCheck.canSearch) {
      console.log(`âš ï¸ Usuario ${uid} alcanzÃ³ lÃ­mite de bÃºsquedas`);
      
      let conversationContext = '';
      if (chatHistory && chatHistory.length > 0) {
        conversationContext = chatHistory.slice(-5).map(msg => 
          `${msg.type === 'user' ? 'Usuario' : 'NORA'}: ${msg.message}`
        ).join('\n');
      }

      const limitPrompt = `Eres NORA, una asistente de IA empÃ¡tica y conversacional.

${conversationContext ? `Contexto de conversaciÃ³n:\n${conversationContext}\n\n` : ''}

Usuario: ${message}

NOTA: El usuario ha alcanzado su lÃ­mite mensual de bÃºsquedas web (${limitCheck.used}/${limitCheck.limit}). Proporciona una respuesta detallada basada en tu conocimiento general. Menciona de forma natural que para informaciÃ³n muy actualizada ha alcanzado el lÃ­mite de bÃºsquedas web.

NORA:`;

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: limits.maxTokensPerResponse
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
    
    const needsSearch = shouldSearchInternet(message);
    
    let searchResults = null;
    let searchContext = '';
    
    if (needsSearch) {
      console.log('ðŸ” Realizando bÃºsqueda web');
      
      try {
        let searchQuery = message
          .replace(/por favor|puedes|podrÃ­as|me ayudas/gi, '')
          .replace(/\?/g, '')
          .trim()
          .substring(0, 100);
        
        searchResults = await searchInternet(searchQuery, 5);
        await updateSearchUsage(uid, limitCheck.monthlyUsage);
        
        if (searchResults.results && searchResults.results.length > 0) {
          searchContext = `\n\n--- ðŸŒ INFORMACIÃ“N DE INTERNET ---\n`;
          searchContext += `BÃºsqueda: "${searchResults.query}"\n\n`;
          
          searchResults.results.forEach((result, index) => {
            searchContext += `${index + 1}. ${result.title}\n`;
            searchContext += `   ${result.snippet}\n`;
            searchContext += `   Fuente: ${result.displayLink}\n\n`;
          });
          
          searchContext += `--- FIN INFORMACIÃ“N DE INTERNET ---\n\n`;
        }
      } catch (searchError) {
        console.error('âŒ Error en bÃºsqueda:', searchError);
        searchContext = '\n--- âš ï¸ No se pudo obtener informaciÃ³n de internet ---\n\n';
      }
    }
    
    let conversationContext = '';
    if (chatHistory && chatHistory.length > 0) {
      conversationContext = chatHistory.slice(-5).map(msg => 
        `${msg.type === 'user' ? 'Usuario' : 'NORA'}: ${msg.message}`
      ).join('\n');
    }
    
    const enhancedPrompt = `Eres NORA, una asistente de IA Ãºtil.

${searchContext}

${conversationContext ? `Contexto:\n${conversationContext}\n\n` : ''}

Usuario: ${message}

${searchContext ? 
`INSTRUCCIONES:
- Usa la informaciÃ³n actualizada de internet
- Cita las fuentes especÃ­ficas
- Combina tu conocimiento con la informaciÃ³n web
- Menciona que la informaciÃ³n es actual` 
: ''}

Respuesta:`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: limits.maxTokensPerResponse
      }
    });

    const result = await model.generateContent(enhancedPrompt);
    const text = result.response.text();

    const updatedLimits = await checkSearchLimits(uid, plan);

    return {
      response: text,
      tokensUsed: Math.floor(text.length / 4),
      searchUsed: needsSearch,
      searchResults: searchResults,
      limitReached: false,
      searchLimits: updatedLimits
    };
    
  } catch (error) {
    console.error('âŒ Error generando respuesta:', error);
    throw error;
  }
}

// ========================================
// ðŸ“„ FUNCIÃ“N: EXTRAER TEXTO DE PDF (MEJORADA)
// ========================================
async function extractTextFromPDF(base64Data) {
  try {
    console.log('ðŸ“„ Iniciando extracciÃ³n de PDF');
    
    if (!base64Data || typeof base64Data !== 'string') {
      throw new Error('Datos de PDF invÃ¡lidos');
    }

    const buffer = Buffer.from(base64Data, 'base64');
    
    if (buffer.length > 10 * 1024 * 1024) {
      throw new Error('Archivo PDF demasiado grande (mÃ¡ximo 10MB)');
    }
    
    console.log(`ðŸ“Š TamaÃ±o del PDF: ${Math.round(buffer.length / 1024)} KB`);

    // MÃ‰TODO 1: Intentar con pdf-parse
    try {
      const pdf = require('pdf-parse');
      const data = await pdf(buffer);
      
      if (data.text && data.text.trim().length > 50) {
        console.log(`âœ… Texto extraÃ­do con pdf-parse: ${data.text.length} caracteres`);
        return cleanExtractedText(data.text);
      }
      
      console.log('âš ï¸ pdf-parse no extrajo suficiente texto');
    } catch (pdfParseError) {
      console.log('âš ï¸ pdf-parse no disponible:', pdfParseError.message);
    }

    // MÃ‰TODO 2: ExtracciÃ³n bÃ¡sica con regex
    try {
      const pdfString = buffer.toString('binary');
      
      const textPattern1 = /\(([^)]+)\)/g;
      const matches1 = pdfString.match(textPattern1);
      
      const textPattern2 = /<([^>]+)>/g;
      const matches2 = pdfString.match(textPattern2);
      
      const allMatches = [
        ...(matches1 || []).map(m => m.slice(1, -1)),
        ...(matches2 || []).map(m => m.slice(1, -1))
      ];
      
      if (allMatches.length > 0) {
        const extractedText = allMatches
          .filter(text => {
            return text.length > 1 && 
                   /[a-zA-ZÃ¡Ã©Ã­Ã³ÃºÃ±Ã‘]/.test(text) && 
                   !text.startsWith('/') && 
                   !text.includes('<<');
          })
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (extractedText.length > 50) {
          console.log(`âœ… Texto extraÃ­do con mÃ©todo bÃ¡sico: ${extractedText.length} caracteres`);
          return cleanExtractedText(extractedText);
        }
      }
      
      console.log('âš ï¸ No se pudo extraer texto suficiente');
      return 'El archivo PDF no contiene texto extraÃ­ble o estÃ¡ protegido. Puede contener imÃ¡genes que requieren OCR.';
      
    } catch (basicError) {
      console.error('âŒ Error en extracciÃ³n bÃ¡sica:', basicError);
      throw new Error('No se pudo procesar el PDF');
    }
    
  } catch (error) {
    console.error('âŒ Error general en extractTextFromPDF:', error);
    throw new Error(`Error procesando PDF: ${error.message}`);
  }
}

// ========================================
// ðŸ§¹ FUNCIÃ“N: LIMPIAR TEXTO EXTRAÃDO
// ========================================
function cleanExtractedText(text) {
  if (!text) return '';
  
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/  +/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ========================================
// ðŸ”§ FUNCIONES DE UTILIDAD
// ========================================

function sanitizeSearchQuery(query) {
  if (!query || typeof query !== 'string') return '';
  
  return query
    .trim()
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .substring(0, 200);
}

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

function validateSearchConfiguration() {
  const apiKey = functions.config().google?.search_api_key;
  const searchEngineId = functions.config().google?.search_engine_id;
  
  if (!apiKey || !searchEngineId) {
    console.warn('âš ï¸ ConfiguraciÃ³n de bÃºsqueda web incompleta');
    return false;
  }
  
  return true;
}

// ========================================
// ðŸ“¦ EXPORTAR TODAS LAS FUNCIONES
// ========================================
module.exports = {
  searchInternet,
  shouldSearchInternet,
  generateResponseWithSearch,
  extractTextFromPDF,
  checkSearchLimits,
  updateSearchUsage,
  sanitizeSearchQuery,
  validateSearchResults,
  validateSearchConfiguration,
  cleanExtractedText,
  SEARCH_LIMITS
};