// functions/src/index.js - VERSIÓN COMPLETA CON DALL-E
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Stripe = require('stripe');
const OpenAI = require('openai'); // NUEVO: Importar OpenAI

// Inicializar Firebase Admin
admin.initializeApp();

// Inicializar Stripe con variables de entorno
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// NUEVO: Inicializar OpenAI
const openai = new OpenAI({
  apiKey: functions.config().openai?.api_key || process.env.OPENAI_API_KEY,
});

// CONFIGURACIÓN DE MODELOS DE IMAGEN POR PLAN (ACTUALIZADA CON DALL-E)
const IMAGE_MODELS_CONFIG = {
  free: {
    model: 'dall-e-2',
    dailyLimit: 1,           // Límite muy estricto: 1 por día
    monthlyLimit: 30,        // 30 al mes como pediste
    costPerImage: 0.020,     // DALL-E 2 cuesta $0.020
    maxPromptLength: 100,
    aspectRatios: ['1:1'],
    quality: 'standard',
    size: '1024x1024'
  },
  pro: {
    model: 'dall-e-3',
    dailyLimit: 2,           // Límite estricto: 2 por día
    monthlyLimit: 50,        // 50 al mes como pediste
    costPerImage: 0.040,     // DALL-E 3 cuesta $0.040
    maxPromptLength: 500,
    aspectRatios: ['1:1', '16:9', '9:16'],
    quality: 'standard',
    size: '1024x1024'
  },
  pro_max: {
    model: 'dall-e-3',
    dailyLimit: 7,           // Límite controlado: 7 por día (200/mes aprox)
    monthlyLimit: 200,       // 200 al mes como pediste
    costPerImage: 0.040,
    maxPromptLength: 1000,
    aspectRatios: ['1:1', '16:9', '9:16', '21:9'],
    quality: 'hd',
    size: '1024x1024'
  }
};

// FUNCIÓN DE PERFIL DE USUARIO (SIN CAMBIOS)
exports.getUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;
  const email = context.auth.token.email || '';
  const name = context.auth.token.name || email.split('@')[0];

  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data();

    const plan = userData?.plan || 'free';
    const isPro = plan === 'pro';
    const isProMax = plan === 'pro_max';
    const isPremium = isPro || isProMax;

    const planLimits = {
      free: {
        dailyTokens: 6600,
        monthlyTokens: 200000,
        maxResponseTokens: 150,
        chatEnabled: true,
        voiceEnabled: false,
        multimediaEnabled: false,
        codeEnabled: false,
        pdfEnabled: false,
        imageGeneration: true
      },
      pro: {
        dailyTokens: 333000,
        monthlyTokens: 10000000,
        maxResponseTokens: 500,
        chatEnabled: true,
        voiceEnabled: true,
        multimediaEnabled: true,
        codeEnabled: true,
        pdfEnabled: true,
        imageGeneration: true
      },
      pro_max: {
        dailyTokens: -1,
        monthlyTokens: -1,
        maxResponseTokens: 1000,
        chatEnabled: true,
        voiceEnabled: true,
        multimediaEnabled: true,
        codeEnabled: true,
        pdfEnabled: true,
        imageGeneration: true
      }
    };

    const limits = planLimits[plan] || planLimits.free;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const usageDoc = await admin.firestore().collection('usage').doc(uid).get();
    const usageData = usageDoc.data();

    const dailyUsage = usageData?.daily || { tokensUsed: 0, date: todayStr };
    const monthlyUsage = usageData?.monthly || { tokensUsed: 0, month: monthStr };

    if (dailyUsage.date !== todayStr) {
      dailyUsage.tokensUsed = 0;
      dailyUsage.date = todayStr;
    }
    if (monthlyUsage.month !== monthStr) {
      monthlyUsage.tokensUsed = 0;
      monthlyUsage.month = monthStr;
    }

    return {
      user: {
        uid: uid,
        email: email,
        name: name,
        plan: plan,
        isPremium: isPremium,
        isPro: isPro,
        isProMax: isProMax
      },
      usage: {
        daily: {
          tokensUsed: dailyUsage.tokensUsed,
          tokensLimit: limits.dailyTokens,
          tokensRemaining: limits.dailyTokens === -1 ? -1 : Math.max(0, limits.dailyTokens - dailyUsage.tokensUsed),
        },
        monthly: {
          tokensUsed: monthlyUsage.tokensUsed,
          tokensLimit: limits.monthlyTokens,
          tokensRemaining: limits.monthlyTokens === -1 ? -1 : Math.max(0, limits.monthlyTokens - monthlyUsage.tokensUsed),
        }
      },
      limits: limits,
      planInfo: {
        currentPlan: plan,
        displayName: plan === 'free' ? 'Gratis' : plan === 'pro' ? 'Pro' : 'Pro Max',
        availableFeatures: {
          chat: limits.chatEnabled,
          voice: limits.voiceEnabled,
          multimedia: limits.multimediaEnabled,
          code: limits.codeEnabled,
          pdf: limits.pdfEnabled,
          liveMode: isPremium,
          imageGeneration: limits.imageGeneration
        }
      }
    };
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    throw new functions.https.HttpsError('internal', 'Error obteniendo perfil de usuario');
  }
});

// FUNCIÓN DE CHAT CON IA (SIN CAMBIOS)
exports.chatWithAI = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;
  const { message, chatHistory, maxTokens } = data;

  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data();
    const userPlan = userData?.plan || 'free';

    let apiKey;
    switch(userPlan) {
      case 'free': 
        apiKey = process.env.GEMINI_API_KEY_FREE || '';
        break;
      case 'pro': 
        apiKey = process.env.GEMINI_API_KEY_BASIC || '';
        break;
      case 'pro_max': 
        apiKey = process.env.GEMINI_API_KEY_PRO || '';
        break;
      default: 
        apiKey = process.env.GEMINI_API_KEY_FREE || '';
    }

    if (!apiKey) {
      console.error(`API key no configurada para el plan: ${userPlan}`);
      throw new functions.https.HttpsError('internal', 'API key no configurada');
    }

    const tokenLimits = { free: 150, pro: 500, pro_max: 1000 };
    const maxResponseTokens = maxTokens || tokenLimits[userPlan] || 150;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = `Eres NORA, un asistente de IA útil y conciso. Responde de forma directa y clara en máximo ${maxResponseTokens} tokens.\n\nPregunta: ${message}`;

    if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
      const recentContext = chatHistory.slice(-3).map(msg => 
        `${msg.type === 'user' ? 'Usuario' : 'NORA'}: ${msg.content}`
      ).join('\n');
      prompt = `Contexto reciente:\n${recentContext}\n\n${prompt}`;
    }

    console.log(`Generando respuesta para usuario ${uid} con plan ${userPlan}`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const tokensUsed = Math.ceil(text.length / 4);
    await updateTokenUsage(uid, tokensUsed);

    return {
      response: text,
      tokensUsed: tokensUsed,
      model: 'gemini-1.5-flash',
      plan: userPlan
    };

  } catch (error) {
    console.error('Error en chat:', error);
    throw new functions.https.HttpsError('internal', 'Error procesando mensaje');
  }
});

// FUNCIÓN DE STRIPE CHECKOUT (SIN CAMBIOS)
exports.createStripeCheckout = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { plan, priceId } = data;
  const userId = context.auth.uid;
  const userEmail = context.auth.token.email;

  try {
    console.log(`Creando checkout para usuario ${userId}, plan: ${plan}, priceId: ${priceId}`);

    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'}/chat?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'}/upgrade?canceled=true`,
      metadata: {
        userId: userId,
        plan: plan,
      },
    });

    console.log(`Checkout creado exitosamente: ${session.url}`);
    return { url: session.url };

  } catch (error) {
    console.error('Error creando sesión de pago:', error);
    throw new functions.https.HttpsError('internal', 'Error creando sesión de pago');
  }
});

// FUNCIÓN DE GESTIÓN DE SUSCRIPCIÓN (SIN CAMBIOS)
exports.manageSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const userId = context.auth.uid;

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    const customerId = userData?.stripeCustomerId;

    if (!customerId) {
      throw new functions.https.HttpsError('not-found', 'No se encontró información de suscripción');
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'}/chat`,
    });

    return { url: portalSession.url };

  } catch (error) {
    console.error('Error gestionando suscripción:', error);
    throw new functions.https.HttpsError('internal', 'Error accediendo a gestión de suscripción');
  }
});

// NUEVA: FUNCIÓN DE GENERACIÓN DE IMÁGENES CON DALL-E
exports.generateImage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;
  const { prompt, aspectRatio = '1:1', style = 'realistic' } = data;

  console.log(`Generando imagen con DALL-E para usuario ${uid}: "${prompt}"`);

  try {
    // Validaciones básicas
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Prompt es requerido');
    }

    // Obtener configuración del usuario
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data();
    const userPlan = userData?.plan || 'free';
    const modelConfig = IMAGE_MODELS_CONFIG[userPlan];

    if (!modelConfig) {
      throw new functions.https.HttpsError('invalid-argument', 'Plan de usuario inválido');
    }

    console.log(`Plan: ${userPlan}, Modelo: ${modelConfig.model}, Límite diario: ${modelConfig.dailyLimit}`);

    // VERIFICACIÓN ESTRICTA DE LÍMITES DIARIOS
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const dailyUsageQuery = await admin.firestore()
      .collection('generated_images')
      .where('userId', '==', uid)
      .where('timestamp', '>=', startOfDay)
      .get();

    const dailyCount = dailyUsageQuery.size;
    console.log(`Uso diario actual: ${dailyCount}/${modelConfig.dailyLimit}`);

    if (dailyCount >= modelConfig.dailyLimit) {
      throw new functions.https.HttpsError('resource-exhausted', 
        `Límite diario alcanzado (${dailyCount}/${modelConfig.dailyLimit}). Plan ${userPlan}.`);
    }

    // VERIFICACIÓN ESTRICTA DE LÍMITES MENSUALES
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyUsageQuery = await admin.firestore()
      .collection('generated_images')
      .where('userId', '==', uid)
      .where('timestamp', '>=', startOfMonth)
      .get();

    const monthlyCount = monthlyUsageQuery.size;
    console.log(`Uso mensual actual: ${monthlyCount}/${modelConfig.monthlyLimit}`);

    if (monthlyCount >= modelConfig.monthlyLimit) {
      throw new functions.https.HttpsError('resource-exhausted', 
        `Límite mensual alcanzado (${monthlyCount}/${modelConfig.monthlyLimit}). Plan ${userPlan}.`);
    }

    // Validar longitud del prompt
    if (prompt.length > modelConfig.maxPromptLength) {
      throw new functions.https.HttpsError('invalid-argument', 
        `Prompt muy largo. Máximo ${modelConfig.maxPromptLength} caracteres, actual: ${prompt.length}`);
    }

    // Filtro de contenido básico
    const prohibitedTerms = ['nude', 'naked', 'nsfw', 'explicit', 'sexual', 'porn'];
    const lowerPrompt = prompt.toLowerCase();
    for (const term of prohibitedTerms) {
      if (lowerPrompt.includes(term)) {
        throw new functions.https.HttpsError('invalid-argument', 'Prompt contiene contenido prohibido');
      }
    }

    // Preparar prompt mejorado
    const enhancedPrompt = enhancePromptWithStyle(prompt, style);
    console.log(`Prompt mejorado: "${enhancedPrompt}"`);

    // Configurar tamaño de imagen
    const imageSize = getImageSize(aspectRatio);

    // GENERAR IMAGEN CON DALL-E
    const startTime = Date.now();
    
    try {
      const response = await openai.images.generate({
        model: modelConfig.model,
        prompt: enhancedPrompt,
        n: 1,
        size: imageSize,
        quality: modelConfig.quality === 'hd' ? 'hd' : 'standard',
        style: modelConfig.model === 'dall-e-3' ? (style === 'realistic' ? 'natural' : 'vivid') : undefined,
      });

      const generationTime = Date.now() - startTime;
      const imageUrl = response.data[0].url;

      console.log(`Imagen generada exitosamente en ${generationTime}ms`);

      // Guardar registro completo
      const imageRecord = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: uid,
        prompt: prompt.trim(),
        enhancedPrompt: enhancedPrompt,
        imageUrl: imageUrl,
        aspectRatio: aspectRatio,
        style: style,
        plan: userPlan,
        model: modelConfig.model,
        cost: modelConfig.costPerImage,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          quality: modelConfig.quality,
          generationTime: generationTime,
          size: imageSize,
          openaiRevision: response.data[0].revised_prompt || null,
          dailyCount: dailyCount + 1,
          monthlyCount: monthlyCount + 1
        }
      };

      await admin.firestore().collection('generated_images').doc(imageRecord.id).set(imageRecord);
      console.log(`Imagen guardada con ID: ${imageRecord.id}`);

      // Calcular límites restantes
      const remainingDaily = Math.max(0, modelConfig.dailyLimit - dailyCount - 1);
      const remainingMonthly = Math.max(0, modelConfig.monthlyLimit - monthlyCount - 1);

      return {
        success: true,
        imageUrl: imageUrl,
        imageId: imageRecord.id,
        cost: modelConfig.costPerImage,
        remainingDaily: remainingDaily,
        remainingMonthly: remainingMonthly,
        model: modelConfig.model,
        quality: modelConfig.quality,
        generationTime: generationTime
      };

    } catch (openaiError) {
      console.error('Error de OpenAI:', openaiError);
      
      // Manejar errores específicos de OpenAI
      if (openaiError.status === 400) {
        throw new functions.https.HttpsError('invalid-argument', 'Prompt rechazado por OpenAI (contenido inapropiado)');
      } else if (openaiError.status === 429) {
        throw new functions.https.HttpsError('resource-exhausted', 'Límite de API de OpenAI alcanzado. Intenta más tarde.');
      } else if (openaiError.status >= 500) {
        throw new functions.https.HttpsError('internal', 'Error del servidor de OpenAI');
      }
      
      throw new functions.https.HttpsError('internal', `Error generando imagen: ${openaiError.message}`);
    }

  } catch (error) {
    console.error('Error generando imagen:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Error interno: ' + error.message);
  }
});

// NUEVA: FUNCIÓN DE ESTADO DE USO DE IMÁGENES CON DALL-E (SIN LÍMITES DIARIOS)
exports.getImageUsageStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;

  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data();
    const userPlan = userData?.plan || 'free';
    
    const modelConfig = IMAGE_MODELS_CONFIG[userPlan];
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // SOLO CONTAR USO MENSUAL (SIN LÍMITES DIARIOS)
    let monthlyCount = 0;

    try {
      const monthlyUsage = await admin.firestore()
        .collection('generated_images')
        .where('userId', '==', uid)
        .where('timestamp', '>=', startOfMonth)
        .get();
      
      monthlyCount = monthlyUsage.size;
    } catch (queryError) {
      console.error('Error consultando uso de imágenes:', queryError);
    }

    const remainingMonthly = Math.max(0, modelConfig.monthlyLimit - monthlyCount);
    
    // DETERMINAR SI MOSTRAR ADVERTENCIA
    const usagePercentage = (monthlyCount / modelConfig.monthlyLimit) * 100;
    const shouldShowWarning = monthlyCount >= modelConfig.warningThreshold;

    let history = [];
    try {
      const recentImages = await admin.firestore()
        .collection('generated_images')
        .where('userId', '==', uid)
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

      history = recentImages.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
    } catch (historyError) {
      console.error('Error obteniendo historial:', historyError);
    }

    return {
      plan: userPlan,
      limits: {
        daily: -1,  // Sin límite diario
        monthly: modelConfig.monthlyLimit,
        remainingDaily: -1,  // Sin límite diario
        remainingMonthly: remainingMonthly
      },
      usage: {
        monthlyCount: monthlyCount,
        usagePercentage: Math.round(usagePercentage),
        warningThreshold: modelConfig.warningThreshold,
        shouldShowWarning: shouldShowWarning
      },
      features: {
        model: modelConfig.model,
        quality: modelConfig.quality,
        aspectRatios: modelConfig.aspectRatios,
        maxPromptLength: modelConfig.maxPromptLength,
        costPerImage: modelConfig.costPerImage
      },
      history: history
    };
    
  } catch (error) {
    console.error('Error obteniendo estado de uso:', error);
    
    const fallbackConfig = IMAGE_MODELS_CONFIG.free;
    return {
      plan: 'free',
      limits: {
        daily: 999999,  // Sin límite diario (número grande)
        monthly: fallbackConfig.monthlyLimit,
        remainingDaily: 999999,  // Sin límite diario (número grande)
        remainingMonthly: fallbackConfig.monthlyLimit
      },
      usage: {
        monthlyCount: 0,
        usagePercentage: 0,
        warningThreshold: fallbackConfig.warningThreshold,
        shouldShowWarning: false
      },
      features: {
        model: fallbackConfig.model,
        quality: fallbackConfig.quality,
        aspectRatios: fallbackConfig.aspectRatios,
        maxPromptLength: fallbackConfig.maxPromptLength,
        costPerImage: fallbackConfig.costPerImage
      },
      history: []
    };
  }
});

// WEBHOOK DE STRIPE (SIN CAMBIOS)
exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    console.log(`Webhook recibido: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await updateUserSubscription(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        console.log('Pago exitoso:', event.data.object.id);
        break;
      case 'invoice.payment_failed':
        console.log('Pago fallido:', event.data.object.id);
        break;
      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Error procesando webhook:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// FUNCIONES AUXILIARES

// Mejorar prompt según el estilo
function enhancePromptWithStyle(prompt, style) {
  const styleEnhancements = {
    realistic: `high quality, photorealistic, detailed, ${prompt}`,
    artistic: `artistic style, creative, expressive artwork, ${prompt}`,
    digital_art: `digital art, concept art, detailed illustration, ${prompt}`,
    illustration: `illustration, vector art, clean design, ${prompt}`,
    photography: `professional photography, high resolution, ${prompt}`,
    painting: `oil painting style, masterpiece, fine art, ${prompt}`,
    sketch: `pencil sketch, hand-drawn, artistic sketch, ${prompt}`,
    cartoon: `cartoon style, animated, colorful illustration, ${prompt}`
  };

  return styleEnhancements[style] || `high quality, ${prompt}`;
}

// Obtener tamaño de imagen según aspect ratio
function getImageSize(aspectRatio) {
  const sizes = {
    '1:1': '1024x1024',
    '16:9': '1792x1024',
    '9:16': '1024x1792',
    '21:9': '1792x1024',
    '4:3': '1024x1024',
    '3:4': '1024x1024'
  };
  
  return sizes[aspectRatio] || '1024x1024';
}

// Actualizar suscripción de usuario (SIN CAMBIOS)
async function updateUserSubscription(subscription) {
  try {
    const customerId = subscription.customer;
    const status = subscription.status;
    const priceId = subscription.items.data[0]?.price.id;

    const planMapping = {
      'price_1S12wKPa2fV72c7w123456': 'pro',
      'price_1S12wKPa2fV72c7w789012': 'pro_max'
    };

    const plan = planMapping[priceId] || 'free';

    const usersQuery = await admin.firestore()
      .collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersQuery.empty) {
      console.log(`No se encontró usuario con customerId: ${customerId}`);
      return;
    }

    const userDoc = usersQuery.docs[0];
    await userDoc.ref.update({
      plan: status === 'active' ? plan : 'free',
      subscriptionStatus: status,
      subscriptionId: subscription.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Usuario actualizado: ${userDoc.id}, plan: ${plan}, status: ${status}`);

  } catch (error) {
    console.error('Error actualizando suscripción:', error);
  }
}

// Manejar cancelación de suscripción (SIN CAMBIOS)
async function handleSubscriptionCancellation(subscription) {
  try {
    const customerId = subscription.customer;

    const usersQuery = await admin.firestore()
      .collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (!usersQuery.empty) {
      const userDoc = usersQuery.docs[0];
      await userDoc.ref.update({
        plan: 'free',
        subscriptionStatus: 'canceled',
        canceledAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Suscripción cancelada para usuario: ${userDoc.id}`);
    }

  } catch (error) {
    console.error('Error manejando cancelación:', error);
  }
}

// Actualizar uso de tokens (SIN CAMBIOS)
async function updateTokenUsage(userId, tokensUsed) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  try {
    await admin.firestore().collection('usage').doc(userId).set({
      daily: {
        tokensUsed: admin.firestore.FieldValue.increment(tokensUsed),
        lastUpdate: admin.firestore.FieldValue.serverTimestamp(),
        date: todayStr
      },
      monthly: {
        tokensUsed: admin.firestore.FieldValue.increment(tokensUsed),
        lastUpdate: admin.firestore.FieldValue.serverTimestamp(),
        month: monthStr
      }
    }, { merge: true });
  } catch (error) {
    console.error('Error actualizando uso de tokens:', error);
  }
}