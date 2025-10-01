// functions/index.js - ARCHIVO COMPLETO AL 100% CON MODOS AVANZADOS
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const stripe = require('stripe')(functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY);
const OpenAI = require('openai');

// Inicializar Firebase Admin
admin.initializeApp();

// Importar funciones de video existentes
const {
  getVideoUsageStatus,
  generateVideo,
  checkVideoStatus,
  getSignedVideoUrl
} = require('./videoFunctions');

// Importar funciones especializadas existentes
const {
  getSpecialistModeLimits,
  developerModeChat,
  specialistModeChat
} = require('./specialistFunctions');

// Importar funciones de bÃºsqueda web
const {
  searchInternet,
  shouldSearchInternet,
  generateResponseWithSearch,
  extractTextFromPDF,
  checkSearchLimits,
  updateSearchUsage,
  SEARCH_LIMITS
} = require('./searchFunctions');

// ========================================
// ðŸ”’ VERIFICACIÃ“N DE SUSCRIPCIÃ“N
// ========================================
async function verifyUserSubscription(uid, requiredPlan = null) {
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Usuario no encontrado');
    }

    const userData = userDoc.data();
    const currentPlan = userData.plan || 'free';

    if (requiredPlan && currentPlan !== requiredPlan) {
      return { 
        isValid: false, 
        plan: currentPlan, 
        error: `Plan requerido: ${requiredPlan}, plan actual: ${currentPlan}` 
      };
    }

    if (currentPlan !== 'free') {
      if (!userData.stripeSubscriptionId || !userData.stripeCustomerId) {
        console.warn(`âš ï¸ Usuario ${uid} tiene plan ${currentPlan} pero faltan datos de Stripe`);
      }

      if (userData.currentPeriodEnd) {
        const endDate = userData.currentPeriodEnd.toDate ? userData.currentPeriodEnd.toDate() : new Date(userData.currentPeriodEnd);
        if (endDate < new Date()) {
          console.warn(`âš ï¸ SuscripciÃ³n vencida para usuario ${uid}`);
        }
      }

      if (userData.stripeSubscriptionId && Math.random() < 0.1) {
        try {
          const subscription = await stripe.subscriptions.retrieve(userData.stripeSubscriptionId);
          if (subscription.status !== 'active') {
            console.error(`âŒ SuscripciÃ³n inactiva en Stripe para usuario ${uid}: ${subscription.status}`);
          }
        } catch (stripeError) {
          console.error(`âŒ Error verificando suscripciÃ³n Stripe:`, stripeError);
        }
      }
    }

    return {
      isValid: true,
      plan: currentPlan,
      userData
    };
  } catch (error) {
    console.error('âŒ Error verificando suscripciÃ³n:', error);
    throw new functions.https.HttpsError('internal', 'Error verificando suscripciÃ³n');
  }
}

// ========================================
// âœ… LÃMITES DE TOKENS
// ========================================
const TOKEN_LIMITS = {
  'free': {
    daily: 66666,
    monthly: 2000000,
    maxTokensPerResponse: 1500
  },
  'pro': {
    daily: 333333,
    monthly: 10000000,
    maxTokensPerResponse: 4000
  },
  'pro_max': {
    daily: 666666,
    monthly: 20000000,
    dailyPro: 100000,
    monthlyPro: 3000000,
    maxTokensPerResponse: 8000,
    maxTokensPerResponsePro: -1
  }
};

const IMAGE_LIMITS = {
  'free': { monthly: 15 },
  'pro': { monthly: 50 },
  'pro_max': { monthly: 200 }
};

// ========================================
// EXPORTAR FUNCIONES DE VIDEO
// ========================================
exports.getVideoUsageStatus = getVideoUsageStatus;
exports.generateVideo = generateVideo;
exports.checkVideoStatus = checkVideoStatus;
exports.getSignedVideoUrl = getSignedVideoUrl;

// ========================================
// EXPORTAR FUNCIONES ESPECIALIZADAS
// ========================================
exports.getSpecialistModeLimits = getSpecialistModeLimits;
exports.developerModeChat = developerModeChat;
exports.specialistModeChat = specialistModeChat;

// ========================================
// ðŸ“Š FUNCIÃ“N PERFIL DE USUARIO
// ========================================
exports.getUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;

  try {
    const verification = await verifyUserSubscription(uid);
    if (!verification.isValid) {
      throw new functions.https.HttpsError('permission-denied', verification.error);
    }

    const { plan, userData } = verification;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const usageDoc = await admin.firestore().collection('usage').doc(uid).get();
    const usageData = usageDoc.data() || {};

    const dailyUsage = usageData.daily || { tokensUsed: 0, date: todayStr };
    const monthlyUsage = usageData.monthly || { tokensUsed: 0, month: monthStr };

    if (dailyUsage.date !== todayStr) {
      dailyUsage.tokensUsed = 0;
      dailyUsage.date = todayStr;
    }
    if (monthlyUsage.month !== monthStr) {
      monthlyUsage.tokensUsed = 0;
      monthlyUsage.month = monthStr;
    }

    const searchLimits = await checkSearchLimits(uid, plan);

    const limits = TOKEN_LIMITS[plan] || TOKEN_LIMITS['free'];
    const dailyRemaining = Math.max(0, limits.daily - dailyUsage.tokensUsed);
    const monthlyRemaining = Math.max(0, limits.monthly - monthlyUsage.tokensUsed);

    return {
      user: {
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        plan: plan,
        verified: userData.verified || false,
        subscriptionStatus: userData.subscriptionStatus || 'unknown',
        currentPeriodEnd: userData.currentPeriodEnd,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      },
      usage: {
        daily: {
          tokensUsed: dailyUsage.tokensUsed,
          remainingTokens: dailyRemaining,
          date: dailyUsage.date
        },
        monthly: {
          tokensUsed: monthlyUsage.tokensUsed,
          remainingTokens: monthlyRemaining,
          month: monthlyUsage.month
        }
      },
      limits: {
        daily: limits.daily,
        monthly: limits.monthly,
        maxTokensPerResponse: limits.maxTokensPerResponse
      },
      searchLimits: {
        monthly: searchLimits.limit,
        used: searchLimits.used,
        remaining: searchLimits.remaining,
        canSearch: searchLimits.canSearch
      }
    };

  } catch (error) {
    console.error('Error obteniendo perfil del usuario:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error obteniendo perfil del usuario');
  }
});

// ========================================
// âœ… DETECTAR TIPO DE MENSAJE
// ========================================
function detectMessageType(message, fileContext, chatHistory) {
  const lowerMessage = message.toLowerCase().trim();
  const wordCount = message.trim().split(/\s+/).length;
  
  const greetings = ['hola', 'hi', 'hey', 'buenos dÃ­as', 'buenas tardes', 'buenas noches', 'quÃ© tal', 'hello'];
  if (wordCount <= 3 && greetings.some(g => lowerMessage.includes(g))) {
    return 'greeting';
  }
  
  if (wordCount <= 5 && !fileContext) {
    return 'simple';
  }
  
  if (lowerMessage.includes('reporte') || 
      lowerMessage.includes('anÃ¡lisis completo') || 
      lowerMessage.includes('anÃ¡lisis detallado') ||
      lowerMessage.includes('informe') ||
      lowerMessage.includes('documento completo')) {
    return 'report';
  }
  
  if (fileContext && fileContext.length > 100) {
    return 'file_analysis';
  }
  
  if (wordCount > 10 || 
      lowerMessage.includes('explica') || 
      lowerMessage.includes('cÃ³mo funciona') ||
      lowerMessage.includes('por quÃ©') ||
      lowerMessage.includes('diferencia entre')) {
    return 'complex';
  }
  
  return 'normal';
}

// ========================================
// âœ… CONSTRUIR PROMPT SEGÃšN TIPO
// ========================================
function buildPromptByType(type, message, fileContext, searchContext, conversationContext, deepThinking) {
  let basePrompt = '';
  
  switch(type) {
    case 'greeting':
      basePrompt = `Eres NORA, una asistente de IA amigable y conversacional.

${conversationContext ? `Contexto:\n${conversationContext}\n\n` : ''}

Usuario: ${message}

INSTRUCCIONES:
- Responde de forma BREVE, CÃLIDA y NATURAL (mÃ¡ximo 3-4 lÃ­neas)
- Solo saluda y pregunta en quÃ© puedes ayudar
- NO des listas de capacidades ni explicaciones largas
- SÃ© amigable pero concisa

NORA:`;
      break;
      
    case 'simple':
      basePrompt = `Eres NORA, una asistente de IA eficiente.

${conversationContext ? `Contexto:\n${conversationContext}\n\n` : ''}

Usuario: ${message}

INSTRUCCIONES:
- Responde DIRECTAMENTE la pregunta (mÃ¡ximo 2-3 pÃ¡rrafos cortos)
- Sin introducciones largas ni listas innecesarias
- SÃ© precisa y concisa
- Solo expande si la pregunta lo requiere

NORA:`;
      break;
      
    case 'report':
      basePrompt = `Eres NORA, una asistente de IA especializada en anÃ¡lisis profundos.

${fileContext}${searchContext}

${conversationContext ? `Contexto:\n${conversationContext}\n\n` : ''}

Usuario: ${message}

INSTRUCCIONES:
- Crea un reporte COMPLETO y DETALLADO (mÃ­nimo 800 palabras)
- Incluye: introducciÃ³n, anÃ¡lisis por secciones, ejemplos, conclusiones
- Usa estructura clara con subtÃ­tulos
- Proporciona informaciÃ³n valiosa y exhaustiva
- Incluye datos, estadÃ­sticas y ejemplos concretos

NORA:`;
      break;
      
    case 'file_analysis':
      basePrompt = `Eres NORA, una asistente de IA experta en anÃ¡lisis de documentos.

${fileContext}

${searchContext}

${conversationContext ? `Contexto:\n${conversationContext}\n\n` : ''}

Usuario: ${message}

INSTRUCCIONES:
- Analiza DETALLADAMENTE el contenido del archivo proporcionado
- Responde especÃ­ficamente sobre el contenido del documento
- Menciona hallazgos clave, patrones o informaciÃ³n relevante
- Si el usuario pregunta algo especÃ­fico, usa el contenido del archivo para responder
- Proporciona un anÃ¡lisis completo y Ãºtil (400-600 palabras mÃ­nimo)

NORA:`;
      break;
      
    case 'complex':
      basePrompt = `Eres NORA, una asistente de IA empÃ¡tica e inteligente.

${fileContext}${searchContext}

${conversationContext ? `Contexto:\n${conversationContext}\n\n` : ''}

Usuario: ${message}

INSTRUCCIONES:
- Proporciona una explicaciÃ³n COMPLETA y DETALLADA
- Incluye ejemplos prÃ¡cticos y casos de uso
- Usa analogÃ­as cuando ayuden a entender
- Estructura: introducciÃ³n, desarrollo, ejemplos, conclusiÃ³n
- Longitud apropiada: 400-600 palabras
- SÃ© clara, precisa y Ãºtil

NORA:`;
      break;
      
    case 'normal':
    default:
      basePrompt = `Eres NORA, una asistente de IA conversacional y Ãºtil.

${fileContext}${searchContext}

${conversationContext ? `Contexto:\n${conversationContext}\n\n` : ''}

Usuario: ${message}

INSTRUCCIONES:
- Responde de forma NATURAL y CONVERSACIONAL
- Adapta la longitud segÃºn la complejidad (100-300 palabras normalmente)
- SÃ© amigable pero eficiente
- Proporciona informaciÃ³n Ãºtil sin ser excesiva
- Usa ejemplos cuando ayuden

NORA:`;
  }
  
  if (deepThinking) {
    basePrompt = basePrompt.replace('INSTRUCCIONES:', 
      'MODO DEEP SEARCH ACTIVADO - Proporciona anÃ¡lisis EXTREMADAMENTE profundo y detallado.\n\nINSTRUCCIONES:');
  }
  
  return basePrompt;
}

// ========================================
// âœ… CONFIGURACIÃ“N DE GENERACIÃ“N
// ========================================
function getGenerationConfigByType(type, maxTokens, limits) {
  const baseMaxTokens = maxTokens || limits.maxTokensPerResponse;
  
  switch(type) {
    case 'greeting':
      return {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 200
      };
      
    case 'simple':
      return {
        temperature: 0.6,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 500
      };
      
    case 'report':
      return {
        temperature: 0.8,
        topK: 50,
        topP: 0.9,
        maxOutputTokens: baseMaxTokens
      };
      
    case 'file_analysis':
      return {
        temperature: 0.7,
        topK: 45,
        topP: 0.85,
        maxOutputTokens: Math.floor(baseMaxTokens * 0.8)
      };
      
    case 'complex':
      return {
        temperature: 0.75,
        topK: 45,
        topP: 0.85,
        maxOutputTokens: Math.floor(baseMaxTokens * 0.7)
      };
      
    case 'normal':
    default:
      return {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: Math.floor(baseMaxTokens * 0.5)
      };
  }
}

// ========================================
// ðŸ’¬ FUNCIÃ“N CHAT CON IA - MEJORADA
// ========================================
exports.chatWithAI = functions.runWith({ timeoutSeconds: 540, memory: '2GB' }).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  try {
    const uid = context.auth.uid;
    const { 
      message, 
      fileContext = '', 
      chatHistory = [], 
      maxTokens,
      enableWebSearch = false,
      systemPrompt,
      deepThinking = false
    } = data;

    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new functions.https.HttpsError('invalid-argument', 'Mensaje invÃ¡lido');
    }

    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Usuario no encontrado');
    }

    const userData = userDoc.data();
    const plan = userData.plan || 'free';
    const limits = TOKEN_LIMITS[plan] || TOKEN_LIMITS['free'];

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);

    const usageRef = admin.firestore().collection('usage').doc(uid);
    const usageDoc = await usageRef.get();

    let dailyUsage = { tokensUsed: 0, date: todayStr };
    let monthlyUsage = { tokensUsed: 0, month: currentMonth };

    if (usageDoc.exists) {
      const usageData = usageDoc.data();
      
      if (usageData.daily && usageData.daily.date === todayStr) {
        dailyUsage = usageData.daily;
      }
      
      if (usageData.monthly && usageData.monthly.month === currentMonth) {
        monthlyUsage = usageData.monthly;
      }
    }

    if (dailyUsage.tokensUsed >= limits.daily) {
      throw new functions.https.HttpsError('resource-exhausted', 
        `LÃ­mite diario alcanzado. Plan ${plan}: ${limits.daily} tokens por dÃ­a.`);
    }

    if (monthlyUsage.tokensUsed >= limits.monthly) {
      throw new functions.https.HttpsError('resource-exhausted', 
        `LÃ­mite mensual alcanzado. Plan ${plan}: ${limits.monthly} tokens por mes.`);
    }

    const messageType = detectMessageType(message, fileContext, chatHistory);
    console.log('ðŸ“Š Tipo de mensaje detectado:', messageType);

    const geminiApiKey = plan === 'free' 
      ? functions.config().gemini?.api_key_free 
      : (plan === 'pro' 
          ? functions.config().gemini?.api_key_basic 
          : functions.config().gemini?.api_key_pro);
    
    if (!geminiApiKey) {
      throw new functions.https.HttpsError('internal', 'ConfiguraciÃ³n de API no disponible');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    let searchContext = '';
    let searchResults = null;
    let needsSearch = false;

    if (enableWebSearch && messageType !== 'greeting' && messageType !== 'simple') {
      const limitCheck = await checkSearchLimits(uid, plan);
      
      if (limitCheck.canSearch) {
        needsSearch = true;
        try {
          console.log('ðŸ” Realizando bÃºsqueda web...');
          const searchResponse = await searchInternet(message);
          searchResults = searchResponse;
          
          if (searchResults && searchResults.results && searchResults.results.length > 0) {
            searchContext = '\n\n--- ðŸŒ INFORMACIÃ“N ACTUALIZADA DE INTERNET ---\n\n';
            searchResults.results.forEach((result, index) => {
              searchContext += `${index + 1}. ${result.title}\n`;
              searchContext += `   ${result.snippet}\n`;
              searchContext += `   Fuente: ${result.displayLink}\n`;
              searchContext += `   URL: ${result.link}\n\n`;
            });
            searchContext += `--- FIN INFORMACIÃ“N DE INTERNET ---\n\n`;
          }

          dailyUsage.webSearches = (dailyUsage.webSearches || 0) + 1;
        } catch (searchError) {
          console.error('âŒ Error en bÃºsqueda web:', searchError);
          searchContext = '\n--- âš ï¸ No se pudo obtener informaciÃ³n actualizada de internet ---\n\n';
        }
      }
    }

    let processedFileContext = fileContext;
    if (fileContext && fileContext.includes('[PDF PARA PROCESAR EN BACKEND]')) {
      console.log('ðŸ“„ Detectado PDF para procesar...');
      
      const base64Match = fileContext.match(/Base64: ([A-Za-z0-9+/=]+)/);
      if (base64Match && base64Match[1]) {
        try {
          const extractedText = await extractTextFromPDF(base64Match[1]);
          if (extractedText && extractedText.length > 50) {
            processedFileContext = `\n\n--- ðŸ“„ CONTENIDO DEL PDF ---\n\n${extractedText}\n\n--- FIN DEL PDF ---\n\n`;
            console.log('âœ… PDF procesado exitosamente, longitud:', extractedText.length);
          } else {
            processedFileContext = '\n--- âš ï¸ El PDF no contiene texto extraÃ­ble o estÃ¡ vacÃ­o ---\n\n';
            console.warn('âš ï¸ No se pudo extraer texto del PDF');
          }
        } catch (pdfError) {
          console.error('âŒ Error extrayendo texto del PDF:', pdfError);
          processedFileContext = '\n--- âŒ Error procesando PDF ---\n\n';
        }
      }
    }

    let conversationContext = '';
    if (chatHistory && chatHistory.length > 0) {
      conversationContext = chatHistory.slice(-5).map(msg => 
        `${msg.type === 'user' ? 'Usuario' : 'NORA'}: ${msg.message}`
      ).join('\n');
    }

    const enhancedPrompt = buildPromptByType(
      messageType, 
      message, 
      processedFileContext, 
      searchContext, 
      conversationContext,
      deepThinking
    );

    const generationConfig = getGenerationConfigByType(messageType, maxTokens, limits);

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig
    });

    console.log('ðŸš€ Generando respuesta...');
    const result = await model.generateContent(enhancedPrompt);
    let text = result.response.text();

    if (messageType === 'complex' || messageType === 'report' || deepThinking) {
      const minLength = messageType === 'report' || deepThinking ? 800 : 400;
      
      if (text.length < minLength) {
        console.log(`âš ï¸ Respuesta corta (${text.length} caracteres), regenerando...`);
        
        const extendedPrompt = enhancedPrompt + `\n\n[INSTRUCCIÃ“N CRÃTICA: La respuesta fue muy corta (${text.length} caracteres). Proporciona una respuesta mÃ¡s detallada de al menos ${minLength} caracteres con anÃ¡lisis profundo y ejemplos concretos.]`;
        
        const extendedResult = await model.generateContent(extendedPrompt);
        const extendedText = extendedResult.response.text();
        
        if (extendedText.length > text.length) {
          text = extendedText;
          console.log(`âœ… Respuesta extendida generada (${extendedText.length} caracteres)`);
        }
      }
    }

    const tokensUsed = Math.floor(text.length / 4);

    dailyUsage.tokensUsed += tokensUsed;
    monthlyUsage.tokensUsed += tokensUsed;

    await admin.firestore().collection('usage').doc(uid).set({
      daily: dailyUsage,
      monthly: monthlyUsage
    });

    const updatedLimits = await checkSearchLimits(uid, plan);

    console.log('âœ… Respuesta generada exitosamente');
    console.log(`ðŸ“Š Tokens: ${tokensUsed}, Tipo: ${messageType}, Longitud: ${text.length} caracteres`);

    return {
      response: text,
      tokensUsed,
      searchUsed: needsSearch,
      searchResults,
      limitReached: false,
      searchLimits: updatedLimits,
      messageType
    };
    
  } catch (error) {
    console.error('âŒ Error en chatWithAI:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error procesando solicitud');
  }
});

// ========================================
// ðŸ” BÃšSQUEDA WEB
// ========================================
exports.getWebSearchStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;
  
  try {
    const verification = await verifyUserSubscription(uid);
    if (!verification.isValid) {
      throw new functions.https.HttpsError('permission-denied', verification.error);
    }

    const { plan } = verification;
    const searchLimits = await checkSearchLimits(uid, plan);

    return {
      plan,
      limits: {
        monthly: searchLimits.limit,
        used: searchLimits.used,
        remaining: searchLimits.remaining
      },
      canSearch: searchLimits.canSearch,
      usagePercentage: Math.round((searchLimits.used / searchLimits.limit) * 100)
    };

  } catch (error) {
    console.error('Error obteniendo estado de bÃºsquedas web:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error obteniendo estado de bÃºsquedas web');
  }
});

exports.searchWeb = functions.runWith({ 
  timeoutSeconds: 60, 
  memory: '512MB' 
}).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { query, maxResults = 5 } = data;
  const uid = context.auth.uid;
  
  if (!query || typeof query !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Query de bÃºsqueda requerido');
  }

  try {
    const verification = await verifyUserSubscription(uid);
    if (!verification.isValid) {
      throw new functions.https.HttpsError('permission-denied', verification.error);
    }

    const { plan } = verification;
    const limitCheck = await checkSearchLimits(uid, plan);
    
    if (!limitCheck.canSearch) {
      throw new functions.https.HttpsError('resource-exhausted', 
        `LÃ­mite de bÃºsquedas web alcanzado (${limitCheck.used}/${limitCheck.limit})`);
    }

    const results = await searchInternet(query.trim(), maxResults);
    await updateSearchUsage(uid, limitCheck.monthlyUsage);
    
    return {
      success: true,
      ...results,
      searchLimits: await checkSearchLimits(uid, plan)
    };
  } catch (error) {
    console.error('Error en bÃºsqueda web:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', `Error en bÃºsqueda: ${error.message}`);
  }
});

// ========================================
// ðŸ–¼ï¸ IMÃGENES
// ========================================
exports.getImageUsageStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;
  
  try {
    const verification = await verifyUserSubscription(uid);
    if (!verification.isValid) {
      throw new functions.https.HttpsError('permission-denied', verification.error);
    }

    const { plan } = verification;
    const config = IMAGE_LIMITS[plan] || IMAGE_LIMITS['free'];
    const monthlyLimit = config.monthly;

    const today = new Date();
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const imageUsageDoc = await admin.firestore().collection('image_usage').doc(uid).get();
    const imageUsageData = imageUsageDoc.data();

    const monthlyUsage = imageUsageData?.monthly || { imagesGenerated: 0, month: monthStr };
    
    if (monthlyUsage.month !== monthStr) {
      monthlyUsage.imagesGenerated = 0;
      monthlyUsage.month = monthStr;
    }

    const usedCount = monthlyUsage.imagesGenerated;
    const usagePercentage = monthlyLimit > 0 ? (usedCount / monthlyLimit) * 100 : 0;
    const warningAt80Percent = usagePercentage >= 80;

    const imagesSnapshot = await admin.firestore()
      .collection('generated_images')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const history = imagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    }));

    return {
      plan,
      limits: {
        remainingMonthly: Math.max(0, monthlyLimit - usedCount),
        remainingDaily: monthlyLimit,
        monthlyLimit: monthlyLimit,
        dailyLimit: monthlyLimit
      },
      features: {
        maxPromptLength: plan === 'free' ? 0 : (plan === 'pro' ? 500 : 1000),
        model: 'dall-e-3',
        quality: plan === 'pro_max' ? 'hd' : 'standard',
        aspectRatios: plan === 'free' ? [] : ['1:1', '16:9', '9:16'],
        costPerImage: plan === 'pro' ? 0.04 : 0.08
      },
      usage: {
        monthlyUsed: usedCount,
        usagePercentage: Math.round(usagePercentage),
        warningAt80Percent: warningAt80Percent
      },
      history
    };

  } catch (error) {
    console.error('Error obteniendo estado de imÃ¡genes:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error obteniendo estado de imÃ¡genes');
  }
});

exports.generateImage = functions.runWith({ timeoutSeconds: 540, memory: '2GB' }).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { prompt, aspectRatio = '1:1', style = 'realistic' } = data;
  const uid = context.auth.uid;

  if (!prompt || typeof prompt !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Prompt requerido');
  }

  try {
    const verification = await verifyUserSubscription(uid);
    if (!verification.isValid) {
      throw new functions.https.HttpsError('permission-denied', verification.error);
    }

    const { plan } = verification;

    if (plan === 'free') {
      throw new functions.https.HttpsError('permission-denied', 'La generaciÃ³n de imÃ¡genes requiere un plan premium');
    }

    const config = IMAGE_LIMITS[plan] || IMAGE_LIMITS['pro'];
    const monthlyLimit = config.monthly;

    const today = new Date();
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const imageUsageDoc = await admin.firestore().collection('image_usage').doc(uid).get();
    const imageUsageData = imageUsageDoc.data();

    const monthlyUsage = imageUsageData?.monthly || { imagesGenerated: 0, month: monthStr };
    
    if (monthlyUsage.month !== monthStr) {
      monthlyUsage.imagesGenerated = 0;
      monthlyUsage.month = monthStr;
    }

    if (monthlyUsage.imagesGenerated >= monthlyLimit) {
      throw new functions.https.HttpsError('resource-exhausted', 'LÃ­mite mensual de imÃ¡genes alcanzado');
    }

    const openaiApiKey = functions.config().openai?.api_key || process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new functions.https.HttpsError('internal', 'ConfiguraciÃ³n de OpenAI no disponible');
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt.trim(),
      n: 1,
      size: aspectRatio === '16:9' ? '1792x1024' : (aspectRatio === '9:16' ? '1024x1792' : '1024x1024'),
      quality: plan === 'pro_max' ? 'hd' : 'standard',
      response_format: 'url',
      style: style === 'artistic' ? 'vivid' : 'natural'
    });

    const imageUrl = response.data[0].url;
    const imageId = admin.firestore().collection('generated_images').doc().id;

    await admin.firestore().collection('generated_images').doc(imageId).set({
      id: imageId,
      userId: uid,
      prompt: prompt.trim(),
      imageUrl: imageUrl,
      aspectRatio,
      style,
      model: 'dall-e-3',
      quality: plan === 'pro_max' ? 'hd' : 'standard',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      cost: plan === 'pro' ? 0.04 : 0.08
    });

    monthlyUsage.imagesGenerated += 1;
    await admin.firestore().collection('image_usage').doc(uid).set({
      monthly: monthlyUsage
    });

    const remainingMonthly = Math.max(0, monthlyLimit - monthlyUsage.imagesGenerated);

    return {
      success: true,
      imageUrl: imageUrl,
      imageId: imageId,
      cost: plan === 'pro' ? 0.04 : 0.08,
      remainingDaily: remainingMonthly,
      remainingMonthly: remainingMonthly,
      model: 'dall-e-3',
      quality: plan === 'pro_max' ? 'hd' : 'standard'
    };

  } catch (error) {
    console.error('Error generando imagen:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', `Error: ${error.message}`);
  }
});

// ========================================
// ðŸ’³ STRIPE
// ========================================
exports.createStripeCheckout = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { plan, priceId } = data;
  const uid = context.auth.uid;

  const validPriceIds = {
    pro: 'price_1S8id6Pa2fV72c7wyqjkxdpw',
    pro_max: 'price_1S12wKPa2fV72c7wX2NRAwQF'
  };

  if (!validPriceIds[plan] || priceId !== validPriceIds[plan]) {
    throw new functions.https.HttpsError('invalid-argument', 'Plan o precio invÃ¡lido');
  }

  try {
    const verification = await verifyUserSubscription(uid);
    if (!verification.isValid) {
      throw new functions.https.HttpsError('permission-denied', verification.error);
    }

    const { userData } = verification;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${functions.config().app?.url || 'https://nora-ai.vercel.app'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${functions.config().app?.url || 'https://nora-ai.vercel.app'}/upgrade?canceled=true`,
      customer_email: userData.email,
      metadata: {
        userId: uid,
        plan: plan,
        timestamp: Date.now().toString(),
        securityHash: require('crypto').createHash('sha256').update(`${uid}-${plan}-${priceId}`).digest('hex').substring(0, 16)
      }
    });

    return {
      success: true,
      url: session.url,
      sessionId: session.id
    };

  } catch (error) {
    console.error('Error creando checkout de Stripe:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error procesando el pago');
  }
});

exports.manageSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;

  try {
    const verification = await verifyUserSubscription(uid);
    if (!verification.isValid) {
      throw new functions.https.HttpsError('permission-denied', verification.error);
    }

    const { userData } = verification;

    if (!userData.stripeCustomerId) {
      throw new functions.https.HttpsError('failed-precondition', 'No tienes una suscripciÃ³n activa');
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userData.stripeCustomerId,
      return_url: `${functions.config().app?.url || 'https://nora-ai.vercel.app'}/chat`,
    });

    return { 
      success: true, 
      url: portalSession.url 
    };

  } catch (error) {
    console.error('Error creando portal de facturaciÃ³n:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error accediendo a la gestiÃ³n de suscripciÃ³n');
  }
});

// ========================================
// ðŸŒŸ EXPORTAR MODOS AVANZADOS
// ========================================
const advancedModes = require('./advancedModes');

exports.travelPlanner = advancedModes.travelPlanner;
exports.aiDetector = advancedModes.aiDetector;
exports.textHumanizer = advancedModes.textHumanizer;
exports.brandAnalyzer = advancedModes.brandAnalyzer;
exports.documentDetective = advancedModes.documentDetective;
exports.plantDoctor = advancedModes.plantDoctor;

exports.verifyUserSubscription = verifyUserSubscription;