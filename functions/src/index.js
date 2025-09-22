// functions/src/index.js - ARCHIVO PRINCIPAL CON SEGURIDAD MEJORADA
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
// LÍMITES ACTUALIZADOS (MANTENER EXISTENTES)
// ========================================
const TOKEN_LIMITS = {
  'free': {
    daily: 66666,
    monthly: 2000000,
    maxTokensPerResponse: 2000
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
    maxTokensPerResponse: 10000,
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
// ✅ FUNCIÓN CHAT MEJORADA CON SEGURIDAD Y BÚSQUEDA WEB
// ========================================
exports.chatWithAI = functions.runWith({ timeoutSeconds: 540, memory: '2GB' }).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { message, fileContext = '', chatHistory = [], maxTokens } = data;
  const uid = context.auth.uid;

  if (!message || typeof message !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Mensaje requerido');
  }

  try {
    // ✅ VERIFICACIÓN DE SUSCRIPCIÓN SEGURA
    const verification = await verifyUserSubscription(uid);
    if (!verification.isValid) {
      throw new functions.https.HttpsError('permission-denied', verification.error);
    }

    const { plan } = verification;

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
          maxOutputTokens: maxTokens || limits.maxTokensPerResponse
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
    }
    
    // Preparar contexto de conversación
    let conversationContext = '';
    if (chatHistory && chatHistory.length > 0) {
      conversationContext = chatHistory.slice(-5).map(msg => 
        `${msg.type === 'user' ? 'Usuario' : 'NORA'}: ${msg.message}`
      ).join('\n');
    }

    // Crear prompt completo
    if (searchContext || fileContext) {
      const fullPrompt = `Eres NORA, un asistente de IA útil. Responde en español.

      ${fileContext ? `ARCHIVOS ADJUNTOS:\n${fileContext}\n\n` : ''}

      ${searchContext}

      ${conversationContext ? `Contexto:\n${conversationContext}\n` : ''}

      Usuario: ${message}

      ${searchContext ? 
      `INSTRUCCIONES: Usa la información actualizada de internet, cita fuentes cuando uses información específica, y menciona que la información es actual cuando sea apropiado.` 
      : ''}

      Respuesta:`;

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: maxTokens || limits.maxTokensPerResponse
        }
      });

      console.log('🚀 Generando respuesta con contexto...');
      const result = await model.generateContent(fullPrompt);
      const text = result.response.text();

      const tokensUsed = Math.floor(text.length / 4);

      // Actualizar contadores
      dailyUsage.tokensUsed += tokensUsed;
      monthlyUsage.tokensUsed += tokensUsed;

      await admin.firestore().collection('usage').doc(uid).set({
        daily: dailyUsage,
        monthly: monthlyUsage
      });

      const updatedLimits = await checkSearchLimits(uid, plan);

      return {
        response: text,
        tokensUsed,
        searchUsed: needsSearch && limitCheck.canSearch,
        searchResults,
        limitReached: false,
        searchLimits: updatedLimits
      };
    } else {
      // Respuesta simple sin contexto adicional
      if (conversationContext) {
        conversationContext = chatHistory.slice(-5).map(msg => 
          `${msg.type === 'user' ? 'Usuario' : 'NORA'}: ${msg.message}`
        ).join('\n');
      }

      const fullPrompt = `Eres NORA, un asistente de IA útil. Responde en español.

      ${fileContext ? `ARCHIVOS ADJUNTOS:\n${fileContext}\n\n` : ''}

      ${conversationContext ? `Contexto:\n${conversationContext}\n` : ''}

      Usuario: ${message}

      Respuesta:`;

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: maxTokens || limits.maxTokensPerResponse
        }
      });

      console.log('🚀 Generando respuesta sin búsqueda web...');
      const result = await model.generateContent(fullPrompt);
      const text = result.response.text();

      console.log('✅ Respuesta generada exitosamente');
      return {
        response: text,
        tokensUsed: Math.floor(text.length / 4),
        searchUsed: false
      };
    }
    
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