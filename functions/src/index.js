// functions/src/index.js - ARCHIVO PRINCIPAL CON BÚSQUEDA MANUAL
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
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

// ✅ IMPORTAR FUNCIONES DE BÚSQUEDA WEB (MODIFICADAS)
const {
  searchInternet,
  generateResponseWithSearch, // Ahora acepta parámetro forceSearch
  extractTextFromPDF,
  checkSearchLimits,
  updateSearchUsage,
  SEARCH_LIMITS
} = require('./searchFunctions');

// ========================================
// LÍMITES ACTUALIZADOS
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
// FUNCIONES DE VIDEO (EXISTENTES)
// ========================================
exports.getVideoUsageStatus = getVideoUsageStatus;
exports.generateVideo = generateVideo;
exports.checkVideoStatus = checkVideoStatus;
exports.getSignedVideoUrl = getSignedVideoUrl;

// ========================================
// NUEVAS FUNCIONES - MODOS ESPECIALIZADOS
// ========================================
exports.getSpecialistModeLimits = getSpecialistModeLimits;
exports.developerModeChat = developerModeChat;
exports.specialistModeChat = specialistModeChat;

// ========================================
// FUNCIÓN PERFIL ACTUALIZADA CON BÚSQUEDA WEB
// ========================================
exports.getUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;

  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Usuario no encontrado');
    }

    const userData = userDoc.data();
    const plan = userData.plan || 'free';

    // Obtener uso actual
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // Obtener estadísticas de uso existentes
    const usageDoc = await admin.firestore().collection('usage').doc(uid).get();
    const usageData = usageDoc.data() || {};

    const dailyUsage = usageData.daily || { tokensUsed: 0, date: todayStr };
    const monthlyUsage = usageData.monthly || { tokensUsed: 0, month: monthStr };

    // ✅ OBTENER USO DE BÚSQUEDAS WEB
    const searchUsageDoc = await admin.firestore().collection('search_usage').doc(uid).get();
    const searchUsageData = searchUsageDoc.data() || {};
    const monthlySearchUsage = searchUsageData.monthly || { searchesUsed: 0, month: monthStr };

    // Reset si cambió el mes
    if (monthlySearchUsage.month !== monthStr) {
      monthlySearchUsage.searchesUsed = 0;
      monthlySearchUsage.month = monthStr;
    }

    // Obtener uso de modos especializados
    const specialistUsageDoc = await admin.firestore().collection('specialist_usage').doc(uid).get();
    const specialistUsageData = specialistUsageDoc.data() || {};

    const dailyDevUsage = specialistUsageData.dailyDeveloper || { count: 0, date: todayStr };
    const monthlyDevUsage = specialistUsageData.monthlyDeveloper || { count: 0, month: monthStr };
    const dailySpecUsage = specialistUsageData.dailySpecialist || { count: 0, date: todayStr };
    const monthlySpecUsage = specialistUsageData.monthlySpecialist || { count: 0, month: monthStr };

    // Configurar límites según el plan
    const limits = TOKEN_LIMITS[plan] || TOKEN_LIMITS['free'];
    const searchLimits = SEARCH_LIMITS[plan] || SEARCH_LIMITS['free'];

    return {
      user: {
        uid: uid,
        email: userData.email,
        name: userData.name,
        plan: plan,
        isPremium: plan !== 'free',
        isPro: plan === 'pro',
        isProMax: plan === 'pro_max'
      },
      usage: {
        daily: {
          tokensUsed: dailyUsage.tokensUsed,
          tokensLimit: limits.daily,
          tokensRemaining: limits.daily === -1 ? -1 : Math.max(0, limits.daily - dailyUsage.tokensUsed),
          imagesGenerated: 0,
          imagesLimit: plan === 'free' ? 0 : (plan === 'pro' ? 10 : 50),
          videosGenerated: 0,
          videosLimit: plan === 'free' ? 0 : (plan === 'pro' ? 5 : 15),
          analysesCount: 0,
          analysesLimit: plan === 'free' ? 5 : -1,
          analysesRemaining: plan === 'free' ? 5 : -1,
          chatMessagesCount: 0,
          developerModeUsed: dailyDevUsage.count,
          developerModeLimit: plan === 'free' ? 1 : (plan === 'pro' ? 15 : -1),
          developerModeRemaining: plan === 'free' ? Math.max(0, 1 - dailyDevUsage.count) : (plan === 'pro' ? Math.max(0, 15 - dailyDevUsage.count) : -1),
          specialistModeUsed: dailySpecUsage.count,
          specialistModeLimit: plan === 'free' ? 1 : (plan === 'pro' ? 10 : -1),
          specialistModeRemaining: plan === 'free' ? Math.max(0, 1 - dailySpecUsage.count) : (plan === 'pro' ? Math.max(0, 10 - dailySpecUsage.count) : -1)
        },
        monthly: {
          tokensUsed: monthlyUsage.tokensUsed,
          tokensLimit: limits.monthly,
          tokensRemaining: limits.monthly === -1 ? -1 : Math.max(0, limits.monthly - monthlyUsage.tokensUsed),
          imagesGenerated: 0,
          imagesLimit: IMAGE_LIMITS[plan]?.monthly || 0,
          videosGenerated: 0,
          videosLimit: plan === 'free' ? 0 : (plan === 'pro' ? 50 : 150),
          analysesCount: 0,
          analysesLimit: plan === 'free' ? 20 : -1,
          analysesRemaining: plan === 'free' ? 20 : -1,
          chatMessagesCount: 0,
          // ✅ NUEVOS CAMPOS - BÚSQUEDAS WEB
          webSearchesUsed: monthlySearchUsage.searchesUsed,
          webSearchesLimit: searchLimits.monthly,
          webSearchesRemaining: Math.max(0, searchLimits.monthly - monthlySearchUsage.searchesUsed)
        }
      },
      limits: {
        dailyTokens: limits.daily,
        monthlyTokens: limits.monthly,
        dailyAnalyses: plan === 'free' ? 5 : -1,
        monthlyAnalyses: plan === 'free' ? 20 : -1,
        chatEnabled: true,
        voiceEnabled: plan !== 'free',
        multimediaEnabled: plan !== 'free',
        codeEnabled: plan !== 'free',
        pdfEnabled: plan !== 'free',
        maxResponseTokens: plan === 'free' ? 2000 : (plan === 'pro' ? 4000 : 10000),
        imageGeneration: plan !== 'free',
        videoGeneration: plan !== 'free',
        maxVideoLength: plan === 'free' ? 0 : (plan === 'pro' ? 7 : 8),
        developerModeEnabled: true,
        specialistModeEnabled: true,
        developerModeDaily: plan === 'free' ? 1 : (plan === 'pro' ? 15 : -1),
        developerModeMonthly: plan === 'free' ? 5 : (plan === 'pro' ? 200 : -1),
        specialistModeDaily: plan === 'free' ? 1 : (plan === 'pro' ? 10 : -1),
        specialistModeMonthly: plan === 'free' ? 3 : (plan === 'pro' ? 150 : -1),
        maxTokensPerSpecialistResponse: plan === 'free' ? 2500 : (plan === 'pro' ? 6000 : 10000),
        // ✅ NUEVOS LÍMITES - BÚSQUEDA WEB
        webSearchEnabled: true,
        webSearchMonthly: searchLimits.monthly,
        webSearchRemaining: Math.max(0, searchLimits.monthly - monthlySearchUsage.searchesUsed)
      },
      planInfo: {
        currentPlan: plan,
        displayName: plan === 'free' ? 'Gratis' : (plan === 'pro' ? 'Pro' : 'Pro Max'),
        availableFeatures: {
          chat: true,
          voice: plan !== 'free',
          multimedia: plan !== 'free',
          code: plan !== 'free',
          pdf: plan !== 'free',
          liveMode: plan !== 'free',
          imageGeneration: plan !== 'free',
          videoGeneration: plan !== 'free',
          developerMode: true,
          specialistMode: true,
          unlimitedSpecialist: plan === 'pro_max',
          priorityProcessing: plan === 'pro_max',
          // ✅ NUEVA CARACTERÍSTICA
          webSearch: true,
          webSearchLimit: searchLimits.monthly
        }
      },
      preferences: {
        theme: 'dark',
        notifications: true,
        autoSave: true
      },
      createdAt: userData.createdAt?.toDate() || new Date(),
      lastLogin: new Date(),
      totalConversations: 0
    };

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    throw new functions.https.HttpsError('internal', 'Error obteniendo perfil de usuario');
  }
});

// ✅ CHAT CON AI MODIFICADO - CON BÚSQUEDA MANUAL
exports.chatWithAI = functions.runWith({ 
  timeoutSeconds: 540, 
  memory: '1GB' 
}).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  // 🔄 MODIFICADO: Extraer enableWebSearch del input
  const { 
    message, 
    chatHistory, 
    maxTokens, 
    fileContext,
    enableWebSearch = false // ✅ NUEVO PARÁMETRO
  } = data;
  
  const uid = context.auth.uid;
  
  if (!message) {
    throw new functions.https.HttpsError('invalid-argument', 'Mensaje requerido');
  }

  try {
    // Obtener plan del usuario
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data();
    const plan = userData?.plan || 'free';
    
    console.log(`👤 Usuario ${uid} con plan ${plan}`);
    console.log(`🔍 Búsqueda web: ${enableWebSearch ? 'ACTIVADA' : 'DESACTIVADA'}`);
    
    // Usar API key según el plan
    const apiKey = plan === 'free' 
      ? functions.config().gemini?.api_key_free || 'AIzaSyB2ynNRP-YmCauIxr8d8rOJ34QG2kh1OTU'
      : (plan === 'pro' 
          ? functions.config().gemini?.api_key_basic || 'AIzaSyDygAzF9YzD6TV6jFe5KnSZcipc8kpjgWg'
          : functions.config().gemini?.api_key_pro || 'AIzaSyAmhNsGJtLDFX4Avn6kEXYW6a1083zqbkQ');
    
    const genAI = new GoogleGenerativeAI(apiKey);

    // ✅ PROCESAMIENTO DE PDFs (MANTENER EXISTENTE)
    if (fileContext && fileContext.includes('Base64:')) {
      try {
        console.log('📄 Procesando PDF en backend...');
        console.log('📄 FileContext detectado:', fileContext.substring(0, 200) + '...');
        
        const base64Match = fileContext.match(/Base64:\s*([A-Za-z0-9+/=\s]+)/);
        if (base64Match) {
          const base64Data = base64Match[1].replace(/\s/g, '');
          console.log('📄 Base64 extraído y limpiado, longitud:', base64Data.length);
          
          let extractedText = null;
          try {
            extractedText = await extractTextFromPDF(base64Data);
            console.log('📄 Texto extraído del PDF:', extractedText ? extractedText.substring(0, 200) + '...' : 'null');
          } catch (extractError) {
            console.log('📄 Error extrayendo texto, continuando sin extracción:', extractError.message);
          }
          
          let conversationContext = '';
          if (chatHistory && chatHistory.length > 0) {
            conversationContext = chatHistory.slice(-5).map(msg => 
              `${msg.type === 'user' ? 'Usuario' : 'NORA'}: ${msg.message}`
            ).join('\n');
          }
          
          let pdfPrompt;
          
          if (extractedText && extractedText.trim().length > 0) {
            pdfPrompt = `Eres NORA, un asistente de IA útil. Responde en español.

CONTENIDO DEL PDF EXTRAÍDO:
${extractedText}

${conversationContext ? `Contexto de conversación:\n${conversationContext}\n` : ''}

Usuario: ${message}

Respuesta (analiza el contenido del PDF y responde directamente):`;
          } else {
            pdfPrompt = `Eres NORA, un asistente de IA útil. Responde en español.

ARCHIVO PDF DETECTADO: He detectado que enviaste un PDF llamado "${fileContext.match(/--- ARCHIVO \d+: (.+?) ---/)?.[1] || 'documento.pdf'}". 

Aunque detecté el archivo correctamente, no pude extraer automáticamente el texto del documento. Para poder ayudarte a analizar el contenido y responder a "${message}", necesito que copies y pegues el texto específico del PDF que quieres que analice.

${conversationContext ? `Contexto de conversación:\n${conversationContext}\n` : ''}

Usuario: ${message}

Respuesta (explica que detectaste el PDF pero necesitas el contenido copiado):`;
          }
          
          const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.0-flash',
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.8,
              maxOutputTokens: maxTokens || TOKEN_LIMITS[plan]?.maxTokensPerResponse || 2000
            }
          });
          
          const result = await model.generateContent(pdfPrompt);
          const text = result.response.text();
          
          console.log('✅ Respuesta generada para PDF:', text.substring(0, 100) + '...');
          
          return {
            response: text,
            tokensUsed: Math.floor(text.length / 4),
            searchUsed: false
          };
        } else {
          console.log('❌ No se pudo extraer base64 del fileContext');
        }
      } catch (pdfError) {
        console.error('❌ Error procesando PDF:', pdfError);
      }
    }

    // ✅ NUEVA LÓGICA: PROCESAMIENTO CON BÚSQUEDA MANUAL
    console.log('🤖 Procesando consulta regular...');
    
    // 🔄 MODIFICADO: Usar enableWebSearch en lugar de detección automática
    if (enableWebSearch) {
      console.log('🔍 Usuario activó búsqueda web manualmente');
      // Usar función con búsqueda web (incluye verificación de límites)
      const result = await generateResponseWithSearch(message, chatHistory, plan, genAI, uid, true);
      console.log('✅ Respuesta generada con búsqueda web según configuración del usuario');
      return result;
    } else {
      console.log('🚫 Búsqueda web desactivada - respuesta normal');
      // Flujo normal sin búsqueda
      let conversationContext = '';
      if (chatHistory && chatHistory.length > 0) {
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
          maxOutputTokens: maxTokens || TOKEN_LIMITS[plan]?.maxTokensPerResponse || 2000
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
    throw new functions.https.HttpsError('internal', `Error: ${error.message}`);
  }
});

// ✅ FUNCIÓN PARA OBTENER ESTADO DE BÚSQUEDAS WEB (MANTENER)
exports.getWebSearchStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;
  
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data();
    const plan = userData?.plan || 'free';

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
    throw new functions.https.HttpsError('internal', 'Error obteniendo estado de búsquedas web');
  }
});

// ✅ FUNCIÓN ESPECÍFICA PARA BÚSQUEDA WEB DIRECTA (OPCIONAL)
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
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data();
    const plan = userData?.plan || 'free';

    // Verificar límites
    const limitCheck = await checkSearchLimits(uid, plan);
    
    if (!limitCheck.canSearch) {
      throw new functions.https.HttpsError('resource-exhausted', 
        `Límite de búsquedas web alcanzado (${limitCheck.used}/${limitCheck.limit})`);
    }

    const results = await searchInternet(query.trim(), maxResults);
    
    // Actualizar contador
    await updateSearchUsage(uid, limitCheck.monthlyUsage);
    
    return {
      success: true,
      ...results,
      searchLimits: await checkSearchLimits(uid, plan)
    };
  } catch (error) {
    console.error('Error en búsqueda web:', error);
    throw new functions.https.HttpsError('internal', `Error en búsqueda: ${error.message}`);
  }
});

// ✅ MANTENER TODAS LAS FUNCIONES EXISTENTES
exports.getImageUsageStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;
  
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data();
    const plan = userData?.plan || 'free';

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
      history,
      warningAt80Percent,
      usagePercentage: Math.round(usagePercentage)
    };

  } catch (error) {
    console.error('Error obteniendo estado de imágenes:', error);
    throw new functions.https.HttpsError('internal', 'Error obteniendo estado de imágenes');
  }
});

exports.generateImage = functions.runWith({ 
  timeoutSeconds: 540, 
  memory: '1GB' 
}).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;
  const { prompt, aspectRatio = '1:1', style = 'natural' } = data;

  if (!prompt || prompt.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Prompt requerido');
  }

  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data();
    const plan = userData?.plan || 'free';

    const config = IMAGE_LIMITS[plan] || IMAGE_LIMITS['free'];
    const monthlyLimit = config.monthly;
    
    if (monthlyLimit === 0) {
      throw new functions.https.HttpsError('permission-denied', 'Generación de imágenes no disponible en tu plan');
    }

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

    const openai = new OpenAI({
      apiKey: functions.config().openai?.api_key || process.env.OPENAI_API_KEY
    });

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt.trim(),
      n: 1,
      size: aspectRatio === '16:9' ? '1792x1024' : (aspectRatio === '9:16' ? '1024x1792' : '1024x1024'),
      quality: plan === 'pro_max' ? 'hd' : 'standard'
    });

    const imageUrl = response.data[0].url;
    const imageId = admin.firestore().collection('generated_images').doc().id;

    await admin.firestore().collection('generated_images').doc(imageId).set({
      id: imageId,
      userId: uid,
      imageUrl: imageUrl,
      prompt: prompt.trim(),
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
    throw new functions.https.HttpsError('internal', `Error: ${error.message}`);
  }
});

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
    throw new functions.https.HttpsError('invalid-argument', 'Plan o precio inválido');
  }

  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${functions.config().app?.url || 'https://nora-ai.vercel.app'}/chat?success=true`,
      cancel_url: `${functions.config().app?.url || 'https://nora-ai.vercel.app'}/chat?canceled=true`,
      customer_email: userData.email,
      metadata: {
        userId: uid,
        plan: plan
      }
    });

    return {
      success: true,
      url: session.url
    };

  } catch (error) {
    console.error('Error creando checkout de Stripe:', error);
    throw new functions.https.HttpsError('internal', 'Error procesando el pago');
  }
});

exports.manageSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  return { success: true, url: 'https://billing.stripe.com/example' };
});