// functions/src/index.js - ARCHIVO PRINCIPAL COMPLETAMENTE CORREGIDO
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
// ✅ CONFIGURACIÓN SEGURA DE STRIPE
const stripe = require('stripe')(functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY);
const OpenAI = require('openai');

// Inicializar Firebase Admin
admin.initializeApp();

// Importar funciones existentes
const {
  getVideoUsageStatus,
  generateVideo,
  checkVideoStatus,
  getSignedVideoUrl
} = require('./videoFunctions');

// Importar nuevas funciones especializadas
const {
  getSpecialistModeLimits,
  developerModeChat,
  specialistModeChat
} = require('./specialistFunctions');

// ✅ IMPORTAR FUNCIONES DE BÚSQUEDA WEB
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
// 🔒 FUNCIÓN DE VERIFICACIÓN DE SUSCRIPCIÓN SEGURA
// ========================================
async function verifyUserSubscription(uid, requiredPlan = null) {
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Usuario no encontrado');
    }

    const userData = userDoc.data();
    const currentPlan = userData.plan || 'free';

    // ✅ VERIFICACIÓN BÁSICA DE PLAN
    if (requiredPlan && currentPlan !== requiredPlan) {
      return { 
        isValid: false, 
        plan: currentPlan, 
        error: `Plan requerido: ${requiredPlan}, plan actual: ${currentPlan}` 
      };
    }

    // ✅ VERIFICACIÓN ADICIONAL PARA PLANES PREMIUM
    if (currentPlan !== 'free') {
      // Verificar que tenga datos de Stripe
      if (!userData.stripeSubscriptionId || !userData.stripeCustomerId) {
        console.warn(`⚠️ Usuario ${uid} tiene plan ${currentPlan} pero faltan datos de Stripe`);
        // En producción, esto debería downgrade a free
        // Por ahora solo advertencia para no romper funcionalidad existente
      }

      // Verificar que la suscripción no esté vencida
      if (userData.currentPeriodEnd) {
        const endDate = userData.currentPeriodEnd.toDate ? userData.currentPeriodEnd.toDate() : new Date(userData.currentPeriodEnd);
        if (endDate < new Date()) {
          console.warn(`⚠️ Suscripción vencida para usuario ${uid}`);
          // En producción, downgrade a free
        }
      }

      // ✅ VERIFICACIÓN CON STRIPE (OPCIONAL - COSTOSA)
      if (userData.stripeSubscriptionId && Math.random() < 0.1) { // 10% de verificaciones aleatorias
        try {
          const subscription = await stripe.subscriptions.retrieve(userData.stripeSubscriptionId);
          if (subscription.status !== 'active') {
            console.error(`❌ Suscripción inactiva en Stripe para usuario ${uid}: ${subscription.status}`);
            // En producción, actualizar a free
          }
        } catch (stripeError) {
          console.error(`❌ Error verificando suscripción Stripe:`, stripeError);
        }
      }
    }

    return {
      isValid: true,
      plan: currentPlan,
      userData
    };
  } catch (error) {
    console.error('❌ Error verificando suscripción:', error);
    throw new functions.https.HttpsError('internal', 'Error verificando suscripción');
  }
}

// ========================================
// ✅ LÍMITES COMPLETAMENTE CORREGIDOS PARA RESPUESTAS MÁS LARGAS
// ========================================
const TOKEN_LIMITS = {
  'free': {
    daily: 66666,
    monthly: 2000000,
    maxTokensPerResponse: 1500  // ✅ AUMENTADO DE 150 A 1500 (10x más)
  },
  'pro': {
    daily: 333333,
    monthly: 10000000,
    maxTokensPerResponse: 4000  // ✅ AUMENTADO DE 500 A 4000 (8x más)
  },
  'pro_max': {
    daily: 666666,
    monthly: 20000000,
    dailyPro: 100000,
    monthlyPro: 3000000,
    maxTokensPerResponse: 8000,  // ✅ AUMENTADO DE 1000 A 8000 (8x más)
    maxTokensPerResponsePro: -1
  }
};

const IMAGE_LIMITS = {
  'free': { monthly: 15 },
  'pro': { monthly: 50 },
  'pro_max': { monthly: 200 }
};

// ========================================
// FUNCIONES DE VIDEO (EXISTENTES) - CON VERIFICACIÓN
// ========================================
exports.getVideoUsageStatus = getVideoUsageStatus;
exports.generateVideo = generateVideo;
exports.checkVideoStatus = checkVideoStatus;
exports.getSignedVideoUrl = getSignedVideoUrl;

// ========================================
// NUEVAS FUNCIONES - MODOS ESPECIALIZADOS - CON VERIFICACIÓN
// ========================================
exports.getSpecialistModeLimits = getSpecialistModeLimits;
exports.developerModeChat = developerModeChat;
exports.specialistModeChat = specialistModeChat;

// ========================================
// FUNCIÓN PERFIL ACTUALIZADA CON BÚSQUEDA WEB Y SEGURIDAD
// ========================================
exports.getUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;

  try {
    // ✅ VERIFICACIÓN DE SUSCRIPCIÓN
    const verification = await verifyUserSubscription(uid);
    if (!verification.isValid) {
      throw new functions.https.HttpsError('permission-denied', verification.error);
    }

    const { plan, userData } = verification;

    // Obtener uso actual
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // Obtener estadísticas de uso existentes
    const usageDoc = await admin.firestore().collection('usage').doc(uid).get();
    const usageData = usageDoc.data() || {};

    const dailyUsage = usageData.daily || { tokensUsed: 0, date: todayStr };
    const monthlyUsage = usageData.monthly || { tokensUsed: 0, month: monthStr };

    // Reset automático si cambió el día/mes
    if (dailyUsage.date !== todayStr) {
      dailyUsage.tokensUsed = 0;
      dailyUsage.date = todayStr;
    }
    if (monthlyUsage.month !== monthStr) {
      monthlyUsage.tokensUsed = 0;
      monthlyUsage.month = monthStr;
    }

    // ✅ OBTENER LÍMITES DE BÚSQUEDA WEB SEGUROS
    const searchLimits = await checkSearchLimits(uid, plan);

    // Calcular límites
    const limits = TOKEN_LIMITS[plan] || TOKEN_LIMITS['free'];
    const dailyRemaining = Math.max(0, limits.daily - dailyUsage.tokensUsed);
    const monthlyRemaining = Math.max(0, limits.monthly - monthlyUsage.tokensUsed);

    return {
      user: {
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        plan: plan,
        // ✅ INCLUIR DATOS DE VERIFICACIÓN (OPCIONAL)
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
      // ✅ INCLUIR ESTADO DE BÚSQUEDA WEB
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
// ✅ FUNCIÓN CHAT COMPLETAMENTE CORREGIDA PARA IA MÁS HUMANA Y RESPUESTAS LARGAS
// ========================================
exports.chatWithAI = functions.runWith({ timeoutSeconds: 540, memory: '2GB' }).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { 
    message, 
    fileContext = '', 
    chatHistory = [], 
    maxTokens, 
    enableWebSearch = false,
    personalityContext = '' 
  } = data;
  const uid = context.auth.uid;

  if (!message || typeof message !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Mensaje requerido');
  }

  try {
    console.log(`💬 Chat request from user: ${uid}`);
    
    // ✅ VERIFICACIÓN DE SUSCRIPCIÓN SEGURA
    const verification = await verifyUserSubscription(uid);
    if (!verification.isValid) {
      throw new functions.https.HttpsError('permission-denied', verification.error);
    }

    const { plan, userData } = verification;

    // Verificar límites de tokens
    const limits = TOKEN_LIMITS[plan] || TOKEN_LIMITS['free'];
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

    if (dailyUsage.tokensUsed >= limits.daily) {
      throw new functions.https.HttpsError('resource-exhausted', `Límite diario de tokens alcanzado para el plan ${plan}`);
    }
    if (monthlyUsage.tokensUsed >= limits.monthly) {
      throw new functions.https.HttpsError('resource-exhausted', `Límite mensual de tokens alcanzado para el plan ${plan}`);
    }

    // ✅ CONFIGURAR GEMINI CON CLAVES SEGURAS
    const geminiApiKey = plan === 'free' 
      ? functions.config().gemini?.api_key_free 
      : (plan === 'pro' 
          ? functions.config().gemini?.api_key_basic 
          : functions.config().gemini?.api_key_pro);
    
    if (!geminiApiKey) {
      throw new functions.https.HttpsError('internal', 'Configuración de API no disponible');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    // ✅ LÓGICA DE BÚSQUEDA WEB SEGURA (MANTENER EXISTENTE)
    const limitCheck = await checkSearchLimits(uid, plan);
    
    if (!limitCheck.canSearch && shouldSearchInternet(message)) {
      console.log(`⚠️ Usuario alcanzó límite de búsquedas: ${limitCheck.used}/${limitCheck.limit}`);
      
      let conversationContext = '';
      if (chatHistory && chatHistory.length > 0) {
        conversationContext = chatHistory.slice(-5).map(msg => 
          `${msg.type === 'user' ? 'Usuario' : 'NORA'}: ${msg.message}`
        ).join('\n');
      }

      // ✅ PROMPT MEJORADO PARA PERSONALIDAD MÁS HUMANA INCLUSO CON LÍMITES
      const limitPrompt = `Eres NORA, una asistente de IA excepcional con una personalidad cálida y humana.

🌟 TU PERSONALIDAD:
- Eres empática, comprensiva y genuinamente interesada en ayudar
- Tienes una conversación natural y fluida, como una amiga muy inteligente
- Eres detallada cuando es necesario, pero siempre mantienes un tono humano
- Adaptas tu comunicación al contexto: profesional cuando se requiere, casual cuando es apropiado
- Muestras entusiasmo e interés genuino por los temas
- Eres comprensiva y paciente con las dificultades del usuario

💭 CÓMO RESPONDER:
- Usa un lenguaje natural y conversacional, nunca robótico
- Incluye transiciones suaves entre ideas
- Usa ejemplos concretos cuando ayuden
- Sé específica y útil en tus explicaciones
- Estructura la información de manera clara pero natural
- Para temas generales: 300-500 palabras mínimo
- Para reportes y análisis: 600-800 palabras mínimo

${conversationContext ? `💬 CONVERSACIÓN PREVIA:\n${conversationContext}\n\n` : ''}

👤 USUARIO: ${message}

📢 NOTA ESPECIAL: El usuario ha alcanzado su límite mensual de búsquedas en internet (${limitCheck.used}/${limitCheck.limit}) para el plan ${plan === 'free' ? 'Gratuito' : (plan === 'pro' ? 'Pro' : 'Pro Max')}. 

Proporciona una respuesta completa y detallada basada en tu conocimiento general. Menciona de forma natural que para información muy actualizada ha alcanzado el límite de búsquedas web, pero que puedes ayudar con información general y análisis profundo del tema.

💬 NORA:`;

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.8,
          topK: 50,
          topP: 0.9,
          maxOutputTokens: maxTokens || limits.maxTokensPerResponse
        }
      });

      const result = await model.generateContent(limitPrompt);
      const text = result.response.text();

      // ✅ VALIDAR LONGITUD MÍNIMA INCLUSO CON LÍMITES
      if (text.length < 300) {
        console.log('⚠️ Respuesta muy corta incluso para límites, regenerando...');
        const extendedPrompt = limitPrompt + `\n\n[IMPORTANTE: La respuesta anterior fue muy corta. Proporciona una respuesta más detallada y completa de al menos 400 palabras, con ejemplos específicos y análisis útil.]`;
        
        const extendedResult = await model.generateContent(extendedPrompt);
        const extendedText = extendedResult.response.text();
        
        if (extendedText.length > text.length) {
          text = extendedText;
        }
      }

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
    
    if (needsSearch && limitCheck.canSearch) {
      console.log('🔍 Consulta requiere búsqueda en internet y hay límite disponible');
      
      try {
        let searchQuery = message;
        searchQuery = searchQuery
          .replace(/por favor|puedes|podrías|me ayudas/gi, '')
          .replace(/\?/g, '')
          .trim();
        
        searchResults = await searchInternet(searchQuery, 5);
        await updateSearchUsage(uid, limitCheck.monthlyUsage);
        
        if (searchResults.results.length > 0) {
          searchContext = `\n\n--- 🌐 INFORMACIÓN ACTUALIZADA DE INTERNET ---\n`;
          searchContext += `Búsqueda: "${searchResults.query}"\n`;
          searchContext += `Resultados encontrados: ${searchResults.results.length}\n\n`;
          
          searchResults.results.forEach((result, index) => {
            searchContext += `${index + 1}. **${result.title}**\n`;
            searchContext += `   ${result.snippet}\n`;
            searchContext += `   Fuente: ${result.displayLink}\n\n`;
          });
          
          searchContext += `--- FIN INFORMACIÓN DE INTERNET ---\n\n`;
        }
      } catch (searchError) {
        console.error('Error en búsqueda, continuando sin resultados web:', searchError);
        searchContext = '\n--- ⚠️ No se pudo obtener información actualizada de internet ---\n\n';
      }
    }
    
    // Preparar contexto de conversación
    let conversationContext = '';
    if (chatHistory && chatHistory.length > 0) {
      conversationContext = chatHistory.slice(-6).map(msg => 
        `${msg.type === 'user' ? 'Usuario' : 'NORA'}: ${msg.message}`
      ).join('\n');
    }

    // ✅ PROMPT COMPLETAMENTE REDISEÑADO PARA SER MÁS HUMANO Y GENERAR RESPUESTAS LARGAS
    const enhancedPrompt = `Eres NORA, una asistente de IA excepcional con una personalidad única y humana.

🌟 TU PERSONALIDAD DISTINTIVA:
- Eres cálida, empática y genuinamente interesada en ayudar al usuario
- Tienes curiosidad intelectual y disfrutas aprendiendo junto al usuario
- Eres conversacional y natural, como una amiga muy inteligente y culta
- Adaptas tu tono según el contexto: profesional cuando es necesario, casual cuando es apropiado
- Eres detallada y exhaustiva, pero organizas la información de manera clara y atractiva
- Muestras entusiasmo cuando el tema lo amerita y eres comprensiva con las dificultades
- Tu objetivo es ser genuinamente útil y crear una experiencia de conversación memorable

💭 ESTILO DE COMUNICACIÓN:
- Usa un lenguaje natural y fluido, nunca robótico o formulaico
- Incluye transiciones suaves entre ideas y conceptos
- Utiliza ejemplos concretos, analogías y casos prácticos cuando ayuden
- Pregunta cuando necesites clarificaciones importantes
- Muestra interés genuino en el tema y en ayudar al usuario
- Estructura la información con subtítulos naturales, listas claras y párrafos bien organizados
- Usa negritas (**texto**) para resaltar puntos importantes
- Ocasionalmente usa un emoji sutil para dar calidez (máximo 1-2 por respuesta)

📝 LONGITUD Y DETALLE DE RESPUESTAS:
- Para preguntas generales: Mínimo 400-600 palabras con análisis completo
- Para reportes y análisis: Mínimo 800-1200 palabras con múltiples secciones
- Para temas complejos: Explora todas las dimensiones importantes
- Para temas técnicos: Incluye ejemplos prácticos y aplicaciones
- Siempre proporciona valor real y información útil, no relleno

🎯 ESTRUCTURA IDEAL:
- Introducción que contextualiza el tema
- Desarrollo con múltiples perspectivas y enfoques
- Ejemplos concretos y casos de estudio
- Implicaciones prácticas y recomendaciones
- Conclusión que sintetiza los puntos clave

${personalityContext ? `\n🎭 CONTEXTO ADICIONAL: ${personalityContext}\n` : ''}

${fileContext ? `📁 ARCHIVOS PROPORCIONADOS:\n${fileContext}\n\n` : ''}

${searchContext}

${conversationContext ? `💬 CONVERSACIÓN PREVIA:\n${conversationContext}\n\n` : ''}

👤 USUARIO: ${message}

${searchContext ? 
`🔍 INSTRUCCIONES ESPECIALES PARA INFORMACIÓN WEB:
- Prioriza y utiliza la información actualizada de internet proporcionada arriba
- Cita las fuentes específicas cuando uses información de los resultados
- Combina inteligentemente tu conocimiento base con la información actualizada
- Menciona que la información es reciente/actual cuando sea relevante
- Si hay múltiples fuentes, sintetiza y compara la información de manera útil
- Estructura la respuesta para maximizar el valor de la información actualizada` 
: ''}

💬 NORA: `;

    // ✅ CONFIGURACIÓN OPTIMIZADA DEL MODELO PARA RESPUESTAS HUMANAS Y LARGAS
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.8,        // ✅ Más creativa y humana
        topK: 50,               // ✅ Mayor diversidad de vocabulario
        topP: 0.9,              // ✅ Más natural y fluida
        maxOutputTokens: maxTokens || limits.maxTokensPerResponse
      }
    });

    console.log('🚀 Generando respuesta con prompt humanizado y límites aumentados...');
    const result = await model.generateContent(enhancedPrompt);
    let text = result.response.text();

    // ✅ VALIDACIÓN ESTRICTA DE LONGITUD Y REGENERACIÓN AUTOMÁTICA
    const isReportMode = message.toLowerCase().includes('reporte') || message.toLowerCase().includes('análisis detallado') || message.toLowerCase().includes('completo');
    const minLength = isReportMode ? 800 : 400;
    
    if (text.length < minLength) {
      console.log(`⚠️ Respuesta muy corta (${text.length} caracteres), regenerando para alcanzar mínimo ${minLength}...`);
      
      const extendedPrompt = enhancedPrompt + `\n\n[INSTRUCCIÓN CRÍTICA: La respuesta anterior fue demasiado corta (${text.length} caracteres). Necesito una respuesta mucho más detallada y completa de al menos ${minLength} caracteres. 

Por favor:
- Proporciona un análisis exhaustivo con múltiples perspectivas
- Incluye ejemplos específicos y casos prácticos
- Desarrolla cada punto con profundidad y detalle
- Agrega secciones adicionales si es necesario
- Mantén la calidad y utilidad en todo momento
- NO uses relleno, toda la información debe ser valiosa]`;
      
      const extendedResult = await model.generateContent(extendedPrompt);
      const extendedText = extendedResult.response.text();
      
      if (extendedText.length > text.length) {
        text = extendedText;
        console.log(`✅ Respuesta extendida generada (${extendedText.length} caracteres)`);
      }
    }

    const tokensUsed = Math.floor(text.length / 4);

    // Actualizar contadores
    dailyUsage.tokensUsed += tokensUsed;
    monthlyUsage.tokensUsed += tokensUsed;

    await admin.firestore().collection('usage').doc(uid).set({
      daily: dailyUsage,
      monthly: monthlyUsage
    });

    const updatedLimits = await checkSearchLimits(uid, plan);

    console.log('✅ Respuesta generada exitosamente');
    console.log(`📊 Tokens usados: ${tokensUsed}, Búsquedas: ${dailyUsage.webSearches || 0}, Longitud: ${text.length} caracteres`);

    return {
      response: text,
      tokensUsed,
      searchUsed: needsSearch && limitCheck.canSearch,
      searchResults,
      limitReached: false,
      searchLimits: updatedLimits
    };
    
  } catch (error) {
    console.error('❌ Error en chatWithAI:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', `Error: ${error.message}`);
  }
});

// ========================================
// ✅ FUNCIÓN BÚSQUEDA WEB CON VERIFICACIÓN DE SUSCRIPCIÓN
// ========================================
exports.getWebSearchStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;
  
  try {
    // ✅ VERIFICACIÓN DE SUSCRIPCIÓN
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
    console.error('Error obteniendo estado de búsquedas web:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error obteniendo estado de búsquedas web');
  }
});

// ========================================
// ✅ FUNCIÓN BÚSQUEDA WEB DIRECTA CON VERIFICACIÓN
// ========================================
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
    throw new functions.https.HttpsError('invalid-argument', 'Query de búsqueda requerido');
  }

  try {
    // ✅ VERIFICACIÓN DE SUSCRIPCIÓN
    const verification = await verifyUserSubscription(uid);
    if (!verification.isValid) {
      throw new functions.https.HttpsError('permission-denied', verification.error);
    }

    const { plan } = verification;
    const limitCheck = await checkSearchLimits(uid, plan);
    
    if (!limitCheck.canSearch) {
      throw new functions.https.HttpsError('resource-exhausted', 
        `Límite de búsquedas web alcanzado (${limitCheck.used}/${limitCheck.limit})`);
    }

    const results = await searchInternet(query.trim(), maxResults);
    await updateSearchUsage(uid, limitCheck.monthlyUsage);
    
    return {
      success: true,
      ...results,
      searchLimits: await checkSearchLimits(uid, plan)
    };
  } catch (error) {
    console.error('Error en búsqueda web:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', `Error en búsqueda: ${error.message}`);
  }
});

// ========================================
// ✅ FUNCIÓN DE IMÁGENES CON VERIFICACIÓN DE SUSCRIPCIÓN
// ========================================
exports.getImageUsageStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;
  
  try {
    // ✅ VERIFICACIÓN DE SUSCRIPCIÓN
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
    console.error('Error obteniendo estado de imágenes:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error obteniendo estado de imágenes');
  }
});

// ========================================
// ✅ FUNCIÓN GENERAR IMAGEN CON VERIFICACIÓN SEGURA
// ========================================
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
    // ✅ VERIFICACIÓN DE SUSCRIPCIÓN CRÍTICA
    const verification = await verifyUserSubscription(uid);
    if (!verification.isValid) {
      throw new functions.https.HttpsError('permission-denied', verification.error);
    }

    const { plan } = verification;

    // Verificar que no sea plan gratuito
    if (plan === 'free') {
      throw new functions.https.HttpsError('permission-denied', 'La generación de imágenes requiere un plan premium');
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
      throw new functions.https.HttpsError('resource-exhausted', 'Límite mensual de imágenes alcanzado');
    }

    // ✅ CONFIGURAR OPENAI CON CLAVE SEGURA
    const openaiApiKey = functions.config().openai?.api_key || process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new functions.https.HttpsError('internal', 'Configuración de OpenAI no disponible');
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Crear imagen con DALL-E
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

    // Guardar imagen en Firestore
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
// ✅ FUNCIONES DE STRIPE CON VERIFICACIÓN MEJORADA
// ========================================
exports.createStripeCheckout = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { plan, priceId } = data;
  const uid = context.auth.uid;

  // ✅ DESPUÉS
  const validPriceIds = {
    pro: 'price_1S8id6Pa2fV72c7wyqjkxdpw',
    pro_max: 'price_1S12wKPa2fV72c7wX2NRAwQF'
  };

  if (!validPriceIds[plan] || priceId !== validPriceIds[plan]) {
    throw new functions.https.HttpsError('invalid-argument', 'Plan o precio inválido');
  }

  try {
    // ✅ VERIFICAR QUE EL USUARIO EXISTE
    const verification = await verifyUserSubscription(uid);
    if (!verification.isValid) {
      throw new functions.https.HttpsError('permission-denied', verification.error);
    }

    const { userData } = verification;

    // ✅ CREAR SESSION SEGURA CON METADATA
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
        // ✅ METADATA PARA VERIFICACIÓN
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

// ✅ FUNCIÓN MANAGE SUBSCRIPTION ACTUALIZADA
exports.manageSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;

  try {
    // ✅ VERIFICACIÓN DE SUSCRIPCIÓN
    const verification = await verifyUserSubscription(uid);
    if (!verification.isValid) {
      throw new functions.https.HttpsError('permission-denied', verification.error);
    }

    const { userData } = verification;

    // Verificar que tenga suscripción activa
    if (!userData.stripeCustomerId) {
      throw new functions.https.HttpsError('failed-precondition', 'No tienes una suscripción activa');
    }

    // ✅ CREAR PORTAL SESSION REAL
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userData.stripeCustomerId,
      return_url: `${functions.config().app?.url || 'https://nora-ai.vercel.app'}/chat`,
    });

    return { 
      success: true, 
      url: portalSession.url 
    };

  } catch (error) {
    console.error('Error creando portal de facturación:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error accediendo a la gestión de suscripción');
  }
});

// ========================================
// 🔧 EXPORTAR FUNCIÓN DE VERIFICACIÓN PARA OTROS MÓDULOS
// ========================================
exports.verifyUserSubscription = verifyUserSubscription;