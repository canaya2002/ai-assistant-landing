// functions/src/specialistFunctions.js - FUNCIONES ESPECIALIZADAS ACTUALIZADAS
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ========================================
// LÍMITES ACTUALIZADOS - CAMBIOS EXACTOS
// ========================================
const SPECIALIST_LIMITS = {
  'free': {
    developerMode: { daily: 1, monthly: 5 },
    specialistMode: { daily: 1, monthly: 3 },
    maxTokensPerResponse: 2500 // ✅ CAMBIO EXACTO: 2,500 tokens
  },
  'pro': {
    developerMode: { daily: 15, monthly: 200 },
    specialistMode: { daily: 10, monthly: 150 },
    maxTokensPerResponse: 6000 // ✅ CAMBIO EXACTO: 6,000 tokens
  },
  'pro_max': {
    developerMode: { daily: -1, monthly: -1 },
    specialistMode: { daily: -1, monthly: -1 },
    maxTokensPerResponse: 10000 // ✅ CAMBIO EXACTO: 10,000 tokens
  }
};

// Especialidades disponibles (mantener)
const SPECIALTIES = {
  programming: {
    name: 'Programación y Desarrollo',
    icon: '💻',
    systemPrompt: `Eres NORA CODE, un asistente especializado en programación y desarrollo de software. Tu expertise abarca:

LENGUAJES: JavaScript, Python, Java, C++, Go, Rust, TypeScript, PHP, C#, Swift, Kotlin
FRAMEWORKS: React, Vue, Angular, Next.js, Django, Flask, Spring, .NET, Laravel
BASES DE DATOS: MySQL, PostgreSQL, MongoDB, Redis, SQLite
DEVOPS: Docker, Kubernetes, AWS, GCP, Azure, CI/CD
MÓVIL: React Native, Flutter, iOS (Swift), Android (Kotlin/Java)

Proporciona:
- Código limpio y bien documentado
- Mejores prácticas y patrones de diseño
- Soluciones optimizadas y seguras
- Explicaciones técnicas claras
- Debugging y resolución de errores
- Arquitecturas escalables

Responde siempre con ejemplos de código cuando sea relevante.`
  },
  business: {
    name: 'Estrategia de Negocios',
    icon: '📈',
    systemPrompt: 'Eres un consultor experto en estrategia de negocios, análisis de mercado, planificación estratégica y gestión empresarial.'
  },
  science: {
    name: 'Ciencia e Investigación',
    icon: '🔬',
    systemPrompt: 'Eres un científico experto en metodología de investigación, análisis de datos científicos y divulgación científica.'
  },
  education: {
    name: 'Educación y Pedagogía',
    icon: '🎓',
    systemPrompt: 'Eres un pedagogo experto en diseño curricular, metodologías de enseñanza y evaluación educativa.'
  },
  health: {
    name: 'Salud y Medicina',
    icon: '⚕️',
    systemPrompt: 'Eres un profesional de la salud con conocimientos en medicina general, prevención y promoción de la salud. IMPORTANTE: Siempre recomienda consultar a un profesional médico.'
  },
  marketing: {
    name: 'Marketing Digital',
    icon: '📱',
    systemPrompt: 'Eres un especialista en marketing digital, SEO, SEM, redes sociales, análisis de métricas y estrategias de conversión.'
  },
  finance: {
    name: 'Finanzas y Economía',
    icon: '💰',
    systemPrompt: 'Eres un experto en finanzas, inversiones, análisis económico, planificación financiera y gestión de riesgos.'
  },
  legal: {
    name: 'Legal y Jurídico',
    icon: '⚖️',
    systemPrompt: 'Eres un asesor legal con conocimientos en derecho. IMPORTANTE: Proporciona información general, siempre recomienda consultar a un abogado profesional.'
  },
  psychology: {
    name: 'Psicología y Bienestar',
    icon: '🧠',
    systemPrompt: 'Eres un psicólogo especializado en bienestar mental, desarrollo personal y técnicas de autoayuda. IMPORTANTE: Para casos serios, recomienda consultar a un profesional.'
  },
  engineering: {
    name: 'Ingeniería',
    icon: '⚙️',
    systemPrompt: 'Eres un ingeniero experto en múltiples disciplinas: civil, mecánica, eléctrica, industrial. Proporcionas soluciones técnicas precisas.'
  },
  hr: {
    name: 'Recursos Humanos',
    icon: '👥',
    systemPrompt: 'Eres un especialista en recursos humanos, gestión de talento, desarrollo organizacional y cultura empresarial.'
  },
  sales: {
    name: 'Ventas y Comercial',
    icon: '🤝',
    systemPrompt: 'Eres un experto en ventas, técnicas de negociación, gestión de clientes y desarrollo comercial.'
  },
  data: {
    name: 'Ciencia de Datos',
    icon: '📊',
    systemPrompt: 'Eres un científico de datos experto en análisis estadístico, machine learning, visualización de datos y Big Data.'
  }
};

// Función para obtener límites de modos especializados
exports.getSpecialistModeLimits = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;

  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data();
    const plan = userData?.plan || 'free';

    const limits = SPECIALIST_LIMITS[plan];

    // Obtener uso actual
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const specialistUsageDoc = await admin.firestore().collection('specialist_usage').doc(uid).get();
    const usageData = specialistUsageDoc.data() || {};

    const dailyDevUsage = usageData.dailyDeveloper || { count: 0, date: todayStr };
    const monthlyDevUsage = usageData.monthlyDeveloper || { count: 0, month: monthStr };
    const dailySpecUsage = usageData.dailySpecialist || { count: 0, date: todayStr };
    const monthlySpecUsage = usageData.monthlySpecialist || { count: 0, month: monthStr };

    return {
      plan,
      limits: {
        developerMode: {
          dailyLimit: limits.developerMode.daily,
          monthlyLimit: limits.developerMode.monthly,
          dailyRemaining: limits.developerMode.daily === -1 ? -1 : Math.max(0, limits.developerMode.daily - dailyDevUsage.count),
          monthlyRemaining: limits.developerMode.monthly === -1 ? -1 : Math.max(0, limits.developerMode.monthly - monthlyDevUsage.count)
        },
        specialistMode: {
          dailyLimit: limits.specialistMode.daily,
          monthlyLimit: limits.specialistMode.monthly,
          dailyRemaining: limits.specialistMode.daily === -1 ? -1 : Math.max(0, limits.specialistMode.daily - dailySpecUsage.count),
          monthlyRemaining: limits.specialistMode.monthly === -1 ? -1 : Math.max(0, limits.specialistMode.monthly - monthlySpecUsage.count)
        },
        maxTokensPerResponse: limits.maxTokensPerResponse
      },
      usage: {
        developer: {
          daily: dailyDevUsage.count,
          monthly: monthlyDevUsage.count
        },
        specialist: {
          daily: dailySpecUsage.count,
          monthly: monthlySpecUsage.count
        }
      },
      availableSpecialties: SPECIALTIES,
      features: {
        codeGeneration: plan !== 'free',
        advancedAnalysis: plan !== 'free',
        priorityProcessing: plan === 'pro_max',
        unlimitedContextMemory: plan === 'pro_max'
      }
    };

  } catch (error) {
    console.error('Error obteniendo límites de modos especializados:', error);
    throw new functions.https.HttpsError('internal', 'Error obteniendo límites');
  }
});

// ✅ FUNCIÓN developerModeChat ACTUALIZADA CON SELECTOR DE MODELO PRO_MAX
exports.developerModeChat = functions.runWith({ timeoutSeconds: 540, memory: '2GB' }).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { message, chatHistory = [], fileContext = '', selectedModel = 'flash' } = data; // ✅ AGREGAR selectedModel
  const uid = context.auth.uid;

  if (!message || message.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Mensaje requerido');
  }

  try {
    // Verificar límites
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data();
    const plan = userData?.plan || 'free';

    const limits = SPECIALIST_LIMITS[plan];

    // Verificar uso diario
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const specialistUsageDoc = await admin.firestore().collection('specialist_usage').doc(uid).get();
    const usageData = specialistUsageDoc.data() || {};

    const dailyDevUsage = usageData.dailyDeveloper || { count: 0, date: todayStr };
    
    if (limits.developerMode.daily !== -1 && dailyDevUsage.count >= limits.developerMode.daily) {
      throw new functions.https.HttpsError('resource-exhausted', `Límite diario del Modo Desarrollador alcanzado. Plan ${plan}: ${limits.developerMode.daily} usos por día.`);
    }

    // ✅ CONFIGURAR MODELO SEGÚN PLAN Y SELECCIÓN
    let modelName = 'gemini-2.0-flash'; // Modelo por defecto
    let maxTokens = limits.maxTokensPerResponse;

    // Solo PRO_MAX puede elegir el modelo
    if (plan === 'pro_max' && selectedModel === 'pro') {
      modelName = 'gemini-2.5-pro'; // ✅ CAMBIO EXACTO: usar gemini-2.5-pro
      maxTokens = -1; // Sin límite de tokens para pro
    }

    // Configurar Gemini con API key apropiada
    const geminiApiKey = plan === 'free' 
      ? functions.config().gemini?.api_key_free || 'AIzaSyB2ynNRP-YmCauIxr8d8rOJ34QG2kh1OTU'
      : (plan === 'pro' 
          ? functions.config().gemini?.api_key_basic || 'AIzaSyDygAzF9YzD6TV6jFe5KnSZcipc8kpjgWg'
          : functions.config().gemini?.api_key_pro || 'AIzaSyAmhNsGJtLDFX4Avn6kEXYW6a1083zqbkQ');

    if (!geminiApiKey) {
      throw new functions.https.HttpsError('failed-precondition', 'API key de Gemini no configurada');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: modelName }); // ✅ Usar modelo seleccionado

    // Construir contexto especializado
    const systemPrompt = SPECIALTIES.programming.systemPrompt;
    
    const conversationHistory = chatHistory
      .slice(-10) // Últimos 10 mensajes para context
      .map(msg => `${msg.type === 'user' ? 'Usuario' : 'NORA CODE'}: ${msg.message}`)
      .join('\n');

    const contextualPrompt = `${systemPrompt}

${fileContext ? `CONTEXTO DE ARCHIVO/CÓDIGO:\n${fileContext}\n` : ''}

${conversationHistory ? `HISTORIAL DE CONVERSACIÓN:\n${conversationHistory}\n` : ''}

CONSULTA ACTUAL DEL DESARROLLADOR:
${message}

Responde como NORA CODE con tu máximo expertise en programación y desarrollo:`;

    // Generar respuesta con Gemini
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: contextualPrompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens > 0 ? maxTokens : undefined, // Sin límite si es -1
        temperature: 0.3, // Menos creatividad, más precisión técnica
        topP: 0.8,
        topK: 40,
      },
    });

    const response = result.response;
    const responseText = response.text();
    const tokensUsed = responseText.length / 4; // Aproximación

    // Actualizar contadores de uso
    dailyDevUsage.count += 1;
    const monthlyDevUsage = usageData.monthlyDeveloper || { count: 0, month: monthStr };
    monthlyDevUsage.count += 1;

    await admin.firestore().collection('specialist_usage').doc(uid).set({
      ...usageData,
      dailyDeveloper: dailyDevUsage,
      monthlyDeveloper: monthlyDevUsage
    });

    // ✅ RESPUESTA ACTUALIZADA CON INFORMACIÓN DEL MODELO
    return {
      response: responseText,
      tokensUsed: Math.round(tokensUsed),
      mode: 'developer',
      remainingDaily: limits.developerMode.daily === -1 ? -1 : Math.max(0, limits.developerMode.daily - dailyDevUsage.count),
      remainingMonthly: limits.developerMode.monthly === -1 ? -1 : Math.max(0, limits.developerMode.monthly - monthlyDevUsage.count),
      specialty: 'programming',
      modelUsed: modelName, // ✅ AGREGAR modelo usado
      availableModels: plan === 'pro_max' ? ['flash', 'pro'] : ['flash'] // ✅ AGREGAR modelos disponibles
    };

  } catch (error) {
    console.error('Error en Modo Desarrollador:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error procesando consulta en Modo Desarrollador');
  }
});

// ✅ FUNCIÓN specialistModeChat ACTUALIZADA CON gemini-2.0-flash Y NUEVOS LÍMITES
exports.specialistModeChat = functions.runWith({ timeoutSeconds: 540, memory: '2GB' }).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { message, specialty, chatHistory = [], fileContext = '' } = data;
  const uid = context.auth.uid;

  if (!message || message.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Mensaje requerido');
  }

  if (!specialty || !SPECIALTIES[specialty]) {
    throw new functions.https.HttpsError('invalid-argument', 'Especialidad no válida');
  }

  try {
    // Verificar límites
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data();
    const plan = userData?.plan || 'free';

    const limits = SPECIALIST_LIMITS[plan];

    // Verificar uso diario
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const specialistUsageDoc = await admin.firestore().collection('specialist_usage').doc(uid).get();
    const usageData = specialistUsageDoc.data() || {};

    const dailySpecUsage = usageData.dailySpecialist || { count: 0, date: todayStr };
    
    if (limits.specialistMode.daily !== -1 && dailySpecUsage.count >= limits.specialistMode.daily) {
      throw new functions.https.HttpsError('resource-exhausted', `Límite diario del Modo Especialista alcanzado. Plan ${plan}: ${limits.specialistMode.daily} usos por día.`);
    }

    // Configurar Gemini con API key apropiada
    const geminiApiKey = plan === 'free' 
      ? functions.config().gemini?.api_key_free || 'AIzaSyB2ynNRP-YmCauIxr8d8rOJ34QG2kh1OTU'
      : (plan === 'pro' 
          ? functions.config().gemini?.api_key_basic || 'AIzaSyDygAzF9YzD6TV6jFe5KnSZcipc8kpjgWg'
          : functions.config().gemini?.api_key_pro || 'AIzaSyAmhNsGJtLDFX4Avn6kEXYW6a1083zqbkQ');

    if (!geminiApiKey) {
      throw new functions.https.HttpsError('failed-precondition', 'API key de Gemini no configurada');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }); // ✅ CAMBIO EXACTO: usar gemini-2.0-flash

    // Obtener prompt de especialidad
    const specialtyConfig = SPECIALTIES[specialty];
    const systemPrompt = specialtyConfig.systemPrompt;
    
    const conversationHistory = chatHistory
      .slice(-10) // Últimos 10 mensajes para context
      .map(msg => `${msg.type === 'user' ? 'Usuario' : 'NORA'}: ${msg.message}`)
      .join('\n');

    const contextualPrompt = `${systemPrompt}

${fileContext ? `CONTEXTO ADICIONAL:\n${fileContext}\n` : ''}

${conversationHistory ? `HISTORIAL DE CONVERSACIÓN:\n${conversationHistory}\n` : ''}

CONSULTA ESPECIALIZADA EN ${specialtyConfig.name.toUpperCase()}:
${message}

Responde como NORA especializada en ${specialtyConfig.name}:`;

    // Generar respuesta con Gemini
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: contextualPrompt }] }],
      generationConfig: {
        maxOutputTokens: limits.maxTokensPerResponse,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      },
    });

    const response = result.response;
    const responseText = response.text();
    const tokensUsed = responseText.length / 4; // Aproximación

    // Actualizar contadores de uso
    dailySpecUsage.count += 1;
    const monthlySpecUsage = usageData.monthlySpecialist || { count: 0, month: monthStr };
    monthlySpecUsage.count += 1;

    await admin.firestore().collection('specialist_usage').doc(uid).set({
      ...usageData,
      dailySpecialist: dailySpecUsage,
      monthlySpecialist: monthlySpecUsage
    });

    return {
      response: responseText,
      tokensUsed: Math.round(tokensUsed),
      mode: 'specialist',
      specialty: specialty,
      specialtyName: specialtyConfig.name,
      remainingDaily: limits.specialistMode.daily === -1 ? -1 : Math.max(0, limits.specialistMode.daily - dailySpecUsage.count),
      remainingMonthly: limits.specialistMode.monthly === -1 ? -1 : Math.max(0, limits.specialistMode.monthly - monthlySpecUsage.count)
    };

  } catch (error) {
    console.error('Error en Modo Especialista:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error procesando consulta en Modo Especialista');
  }
});

module.exports = {
  getSpecialistModeLimits: exports.getSpecialistModeLimits,
  developerModeChat: exports.developerModeChat,
  specialistModeChat: exports.specialistModeChat,
  SPECIALTIES,
  SPECIALIST_LIMITS
};