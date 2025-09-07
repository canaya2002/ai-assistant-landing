// functions/src/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Stripe = require('stripe');

// Inicializar Firebase Admin
admin.initializeApp();

// Inicializar Stripe
const stripe = new Stripe(functions.config().stripe?.secret_key || '', {
  apiVersion: '2023-10-16',
});

// Función para obtener perfil de usuario
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
        pdfEnabled: false
      },
      pro: {
        dailyTokens: 333000,
        monthlyTokens: 10000000,
        maxResponseTokens: 500,
        chatEnabled: true,
        voiceEnabled: true,
        multimediaEnabled: true,
        codeEnabled: true,
        pdfEnabled: true
      },
      pro_max: {
        dailyTokens: 466000,
        monthlyTokens: -1,
        maxResponseTokens: 1000,
        chatEnabled: true,
        voiceEnabled: true,
        multimediaEnabled: true,
        codeEnabled: true,
        pdfEnabled: true
      }
    };

    const limits = planLimits[plan] || planLimits.free;

    const usageDoc = await admin.firestore().collection('usage').doc(uid).get();
    const usageData = usageDoc.data();

    const dailyTokensUsed = usageData?.daily?.tokensUsed || 0;
    const monthlyTokensUsed = usageData?.monthly?.tokensUsed || 0;

    return {
      user: { uid, email, name, plan, isPremium, isPro, isProMax },
      usage: {
        daily: {
          tokensUsed: dailyTokensUsed,
          tokensLimit: limits.dailyTokens,
          tokensRemaining: Math.max(0, limits.dailyTokens - dailyTokensUsed),
          analysesCount: 0, analysesLimit: 2, analysesRemaining: 2, chatMessagesCount: 0
        },
        monthly: {
          tokensUsed: monthlyTokensUsed,
          tokensLimit: limits.monthlyTokens,
          tokensRemaining: limits.monthlyTokens === -1 ? -1 : Math.max(0, limits.monthlyTokens - monthlyTokensUsed),
          analysesCount: 0, analysesLimit: 50, analysesRemaining: 50, chatMessagesCount: 0
        }
      },
      limits: {
        dailyTokens: limits.dailyTokens, monthlyTokens: limits.monthlyTokens,
        dailyAnalyses: 2, monthlyAnalyses: 50, chatEnabled: limits.chatEnabled,
        voiceEnabled: limits.voiceEnabled, multimediaEnabled: limits.multimediaEnabled,
        codeEnabled: limits.codeEnabled, pdfEnabled: limits.pdfEnabled, maxResponseTokens: limits.maxResponseTokens
      },
      planInfo: {
        currentPlan: plan,
        displayName: plan === 'free' ? 'Gratis' : plan === 'pro' ? 'Pro' : 'Pro Max',
        availableFeatures: {
          chat: limits.chatEnabled, voice: limits.voiceEnabled, multimedia: limits.multimediaEnabled,
          code: limits.codeEnabled, pdf: limits.pdfEnabled, liveMode: isPremium
        }
      }
    };
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    throw new functions.https.HttpsError('internal', 'Error obteniendo perfil de usuario');
  }
});

// Función para chat con IA
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
    const config = functions.config();
    
    switch(userPlan) {
      case 'free': apiKey = config.gemini?.api_key_free || ''; break;
      case 'pro': apiKey = config.gemini?.api_key_basic || ''; break;
      case 'pro_max': apiKey = config.gemini?.api_key_pro || ''; break;
      default: apiKey = config.gemini?.api_key_free || '';
    }

    if (!apiKey) {
      throw new functions.https.HttpsError('internal', 'API key no configurada');
    }

    const tokenLimits = { free: 150, pro: 500, pro_max: 1000 };
    const maxResponseTokens = maxTokens || tokenLimits[userPlan] || 150;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = `Eres NORA, un asistente de IA útil y conciso. Responde de forma directa y clara en máximo ${maxResponseTokens} tokens.\n\nPregunta: ${message}`;

    if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
      const recentContext = chatHistory.slice(-3).map(msg => 
        `${msg.type === 'user' ? 'Usuario' : 'NORA'}: ${msg.message}`
      ).join('\n');
      prompt += `\n\nContexto reciente:\n${recentContext}`;
    }

    prompt += '\n\nRespuesta:';

    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    const cleanedResponse = responseText
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\"(.*?)\"/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .trim();

    const tokensUsed = Math.floor(cleanedResponse.length / 4);

    const usageRef = admin.firestore().collection('usage').doc(uid);
    await usageRef.set({
      daily: { tokensUsed: admin.firestore.FieldValue.increment(tokensUsed) },
      monthly: { tokensUsed: admin.firestore.FieldValue.increment(tokensUsed) },
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { response: cleanedResponse, tokensUsed: tokensUsed };

  } catch (error) {
    console.error('Error en chat:', error);
    throw new functions.https.HttpsError('internal', 'Error procesando mensaje');
  }
});

// Función para crear checkout de Stripe
exports.createStripeCheckout = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { plan, priceId } = data;
  const userId = context.auth.uid;
  const userEmail = context.auth.token.email;

  const validPriceIds = {
    'price_1S08CYPa2fV72c7wm3DC8M3y': 'pro',
    'price_1S12wKPa2fV72c7wX2NRAwQF': 'pro_max'
  };

  if (!validPriceIds[priceId]) {
    throw new functions.https.HttpsError('invalid-argument', 'Price ID inválido');
  }

  try {
    const config = functions.config();
    
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail || undefined,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${config.app?.url || 'https://localhost:3000'}/chat?upgrade=success`,
      cancel_url: `${config.app?.url || 'https://localhost:3000'}/upgrade?canceled=true`,
      metadata: { userId: userId, plan: plan }
    });

    return { url: session.url };

  } catch (error) {
    console.error('Error creando checkout:', error);
    throw new functions.https.HttpsError('internal', 'Error creando sesión de pago');
  }
});

// Función para gestionar suscripción
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

    const config = functions.config();

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${config.app?.url || 'https://localhost:3000'}/chat`,
    });

    return { url: portalSession.url };

  } catch (error) {
    console.error('Error gestionando suscripción:', error);
    throw new functions.https.HttpsError('internal', 'Error accediendo a gestión de suscripción');
  }
});

// Webhook para manejar eventos de Stripe
exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const config = functions.config();

  try {
    const event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      config.stripe?.webhook_secret || ''
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await updateUserSubscription(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await cancelUserSubscription(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await resetUserTokens(event.data.object.customer);
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Funciones auxiliares para webhooks
async function updateUserSubscription(subscription) {
  const customerId = subscription.customer;
  
  const usersQuery = await admin.firestore()
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .get();

  if (!usersQuery.empty) {
    const userDoc = usersQuery.docs[0];
    const plan = subscription.metadata?.plan || 'pro';
    
    await userDoc.ref.update({
      plan: plan,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      isPremium: true,
      isPro: plan === 'pro',
      isProMax: plan === 'pro_max',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}

async function cancelUserSubscription(subscription) {
  const customerId = subscription.customer;
  
  const usersQuery = await admin.firestore()
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .get();

  if (!usersQuery.empty) {
    const userDoc = usersQuery.docs[0];
    
    await userDoc.ref.update({
      plan: 'free',
      subscriptionStatus: 'canceled',
      isPremium: false,
      isPro: false,
      isProMax: false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}

async function resetUserTokens(customerId) {
  const usersQuery = await admin.firestore()
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .get();

  if (!usersQuery.empty) {
    const userDoc = usersQuery.docs[0];
    const userId = userDoc.id;
    
    await admin.firestore().collection('usage').doc(userId).update({
      'monthly.tokensUsed': 0,
      lastReset: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}