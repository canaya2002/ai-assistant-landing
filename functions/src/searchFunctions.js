// functions/src/searchFunctions.js - MODIFICADO PARA BÚSQUEDA MANUAL COMPLETA
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// ========================================
// 🔍 LÍMITES DE BÚSQUEDA POR PLAN (MANTENER IGUALES)
// ========================================
const SEARCH_LIMITS = {
  'free': { monthly: 50 },
  'pro': { monthly: 500 },
  'pro_max': { monthly: 2000 }
};

// ========================================
// 🔍 FUNCIONES DE BÚSQUEDA EN INTERNET
// ========================================

// Verificar límites de búsqueda web
async function checkSearchLimits(uid, plan) {
  try {
    const today = new Date();
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const searchUsageDoc = await admin.firestore().collection('search_usage').doc(uid).get();
    const searchUsageData = searchUsageDoc.data();
    
    const monthlyUsage = searchUsageData?.monthly || { searchesUsed: 0, month: monthStr };
    
    // Reset si cambió el mes
    if (monthlyUsage.month !== monthStr) {
      monthlyUsage.searchesUsed = 0;
      monthlyUsage.month = monthStr;
    }
    
    const limit = SEARCH_LIMITS[plan]?.monthly || SEARCH_LIMITS['free'].monthly;
    const remaining = limit - monthlyUsage.searchesUsed;
    
    console.log(`🔍 Verificando límites - Plan: ${plan}, Usado: ${monthlyUsage.searchesUsed}/${limit}, Restante: ${remaining}`);
    
    return {
      canSearch: remaining > 0,
      used: monthlyUsage.searchesUsed,
      limit: limit,
      remaining: remaining,
      monthlyUsage: monthlyUsage
    };
  } catch (error) {
    console.error('Error verificando límites de búsqueda:', error);
    return {
      canSearch: false,
      used: 0,
      limit: 0,
      remaining: 0,
      monthlyUsage: { searchesUsed: 0, month: 'error' }
    };
  }
}

// Actualizar contador de búsquedas
async function updateSearchUsage(uid, monthlyUsage) {
  try {
    monthlyUsage.searchesUsed += 1;
    
    await admin.firestore().collection('search_usage').doc(uid).set({
      monthly: monthlyUsage,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Contador actualizado: ${monthlyUsage.searchesUsed} búsquedas usadas`);
  } catch (error) {
    console.error('Error actualizando contador de búsquedas:', error);
  }
}

// Función para buscar en internet usando Google Custom Search
async function searchInternet(query, maxResults = 5) {
  try {
    // Usar las API keys configuradas
    const apiKey = 'AIzaSyB2ynNRP-YmCauIxr8d8rOJ34QG2kh1OTU';
    const searchEngineId = 'd6cce989d9365475a';
    
    if (!apiKey || !searchEngineId) {
      throw new Error('API keys de búsqueda no configuradas');
    }

    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=${maxResults}&lr=lang_es`;
    
    console.log('🔍 Buscando en internet:', query);
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Error en búsqueda: ${data.error?.message || 'Error desconocido'}`);
    }
    
    if (!data.items || data.items.length === 0) {
      return {
        query,
        results: [],
        totalResults: 0,
        searchTime: 0
      };
    }
    
    const results = data.items.map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      displayLink: item.displayLink
    }));
    
    console.log(`✅ Encontrados ${results.length} resultados para: ${query}`);
    
    return {
      query,
      results,
      totalResults: parseInt(data.searchInformation?.totalResults || 0),
      searchTime: parseFloat(data.searchInformation?.searchTime || 0)
    };
    
  } catch (error) {
    console.error('❌ Error buscando en internet:', error);
    throw error;
  }
}

// 🚫 FUNCIÓN ELIMINADA: shouldSearchInternet()
// Ya no se usa detección automática - todo es manual ahora

// 🔄 FUNCIÓN MODIFICADA: generateResponseWithSearch ahora acepta parámetro forceSearch
async function generateResponseWithSearch(message, chatHistory, plan, genAI, uid, forceSearch = false) {
  try {
    // Verificar límites ANTES de buscar (solo si forceSearch está activado)
    if (forceSearch) {
      const limitCheck = await checkSearchLimits(uid, plan);
      
      if (!limitCheck.canSearch) {
        console.log(`❌ Límite de búsquedas alcanzado para plan ${plan}`);
        
        // Generar respuesta indicando límite alcanzado
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.0-flash',
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: plan === 'free' ? 2000 : (plan === 'pro' ? 4000 : 10000)
          }
        });

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
    }
    
    let searchResults = null;
    let searchContext = '';
    
    // 🔄 NUEVA LÓGICA: Solo buscar si forceSearch es true
    if (forceSearch) {
      console.log('🔍 Búsqueda web ACTIVADA manualmente por el usuario');
      
      try {
        // Crear query optimizada para búsqueda
        let searchQuery = message;
        
        // Limpiar el query para búsqueda más efectiva
        searchQuery = searchQuery
          .replace(/por favor|puedes|podrías|me ayudas/gi, '')
          .replace(/\?/g, '')
          .trim();
        
        // Buscar en internet
        searchResults = await searchInternet(searchQuery, 5);
        
        // ACTUALIZAR CONTADOR DESPUÉS DE BÚSQUEDA EXITOSA
        const limitCheck = await checkSearchLimits(uid, plan);
        await updateSearchUsage(uid, limitCheck.monthlyUsage);
        
        if (searchResults.results.length > 0) {
          searchContext = `\n\n--- INFORMACIÓN ACTUAL DE INTERNET ---\n`;
          searchContext += `Búsqueda: "${searchResults.query}"\n`;
          searchContext += `Resultados encontrados: ${searchResults.results.length}\n\n`;
          
          searchResults.results.forEach((result, index) => {
            searchContext += `${index + 1}. ${result.title}\n`;
            searchContext += `   ${result.snippet}\n`;
            searchContext += `   Fuente: ${result.displayLink}\n\n`;
          });
          
          searchContext += `--- FIN INFORMACIÓN DE INTERNET ---\n\n`;
        }
      } catch (searchError) {
        console.error('Error en búsqueda, continuando sin resultados web:', searchError);
        searchContext = '\n--- No se pudo obtener información actualizada de internet ---\n\n';
      }
    } else {
      console.log('🚫 Búsqueda web DESACTIVADA - Respuesta normal');
    }
    
    // Preparar contexto de conversación
    let conversationContext = '';
    if (chatHistory && chatHistory.length > 0) {
      conversationContext = chatHistory.slice(-5).map(msg => 
        `${msg.type === 'user' ? 'Usuario' : 'NORA'}: ${msg.message}`
      ).join('\n');
    }
    
    // Crear prompt mejorado
    const enhancedPrompt = `Eres NORA, un asistente de IA útil. Responde en español.

${searchContext ? searchContext : ''}

${conversationContext ? `Contexto de conversación:\n${conversationContext}\n\n` : ''}

Usuario: ${message}

${searchContext ? 
`INSTRUCCIONES ESPECIALES: 
- Usa la información actualizada de internet proporcionada arriba
- Cita las fuentes cuando uses información específica
- Si la información de internet es relevante, priorízala sobre tu conocimiento base
- Menciona que la información es actual/reciente cuando sea apropiado` 
: ''}

Respuesta:`;

    // Configurar modelo según el plan
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
      searchUsed: forceSearch,
      searchResults: searchResults,
      limitReached: false,
      searchLimits: updatedLimits
    };
    
  } catch (error) {
    console.error('Error generando respuesta con búsqueda:', error);
    throw error;
  }
}

// Función auxiliar para extraer texto de PDF (MANTENER IGUAL)
async function extractTextFromPDF(base64Data) {
  try {
    const pdf = require('pdf-parse');
    const buffer = Buffer.from(base64Data, 'base64');
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.log('pdf-parse no disponible, usando método básico:', error.message);
    
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      const pdfString = buffer.toString('binary');
      
      const textMatches = pdfString.match(/\(([^)]+)\)/g);
      if (textMatches && textMatches.length > 0) {
        const extractedText = textMatches
          .map(match => match.slice(1, -1))
          .filter(text => text.length > 1 && /[a-zA-Z]/.test(text))
          .join(' ');
        
        return extractedText.length > 10 ? extractedText : null;
      }
      
      return null;
    } catch (basicError) {
      console.error('Error con extracción básica:', basicError);
      return null;
    }
  }
}

// Exportar las funciones (MODIFICADO - eliminamos shouldSearchInternet)
module.exports = {
  searchInternet,
  generateResponseWithSearch, // Ahora acepta parámetro forceSearch
  extractTextFromPDF,
  checkSearchLimits,
  updateSearchUsage,
  SEARCH_LIMITS
};