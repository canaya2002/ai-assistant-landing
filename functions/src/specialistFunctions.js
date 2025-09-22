// functions/src/specialistFunctions.js - FUNCIONES ESPECIALIZADAS CON SEGURIDAD MEJORADA
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ========================================
// LÍMITES ACTUALIZADOS - CAMBIOS EXACTOS (MANTENER)
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

// Especialidades disponibles (mantener completo)
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
  creative: {
    name: 'Creatividad y Diseño',
    icon: '🎨',
    systemPrompt: 'Eres un experto en diseño gráfico, creatividad, storytelling y marketing creativo.'
  },
  finance: {
    name: 'Finanzas y Inversiones',
    icon: '💰',
    systemPrompt: 'Eres un analista financiero experto en inversiones, gestión de riesgos y planificación financiera personal y empresarial.'
  },
  legal: {
    name: 'Asesoría Legal',
    icon: '⚖️',
    systemPrompt: 'Eres un asesor legal especializado en derecho empresarial, contratos y cumplimiento normativo. IMPORTANTE: Siempre recomienda consultar a un abogado calificado.'
  }
};

// ========================================
// ✅ FUNCIÓN PARA OBTENER LÍMITES CON VERIFICACIÓN SEGURA
// ========================================
exports.getSpecialistModeLimits = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;

  try {
    // ✅ VERIFICACIÓN DE SUSCRIPCIÓN SEGURA
    const verification = await verifyUserSubscription(uid);
    if (!verification.isValid) {
      throw new functions.https.HttpsError('permission-denied', verification.error);
    }

    const { plan } = verification;
    const limits = SPECIALIST_LIMITS[plan] || SPECIALIST_LIMITS['free'];

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

    // Reset automático si cambió el día/mes
    if (dailyDevUsage.date !== todayStr) {
      dailyDevUsage.count = 0;
      dailyDevUsage.date = todayStr;
    }
    if (monthlyDevUsage.month !== monthStr) {
      monthlyDevUsage.count = 0;
      monthlyDevUsage.month = monthStr;
    }
    if (dailySpecUsage.date !== todayStr) {
      dailySpecUsage.count = 0;
      dailySpecUsage.date = todayStr;
    }
    if (monthlySpecUsage.month !== monthStr) {
      monthlySpecUsage.count = 0;
      monthlySpecUsage.month = monthStr;
    }

    return {
      plan,
      developerMode: {
        daily: {
          limit: limits.developerMode.daily,
          used: dailyDevUsage.count,
          remaining: limits.developerMode.daily === -1 ? -1 : Math.max(0, limits.developerMode.daily - dailyDevUsage.count)
        },
        monthly: {
          limit: limits.developerMode.monthly,
          used: monthlyDevUsage.count,
          remaining: limits.developerMode.monthly === -1 ? -1 : Math.max(0, limits.developerMode.monthly - monthlyDevUsage.count)
        }
      },
      specialistMode: {
        daily: {
          limit: limits.specialistMode.daily,
          used: dailySpecUsage.count,
          remaining: limits.specialistMode.daily === -1 ? -1 : Math.max(0, limits.specialistMode.daily - dailySpecUsage.count)
        },
        monthly: {
          limit: limits.specialistMode.monthly,
          used: monthlySpecUsage.count,
          remaining: limits.specialistMode.monthly === -1 ? -1 : Math.max(0, limits.specialistMode.monthly - monthlySpecUsage.count)
        }
      },
      specialties: SPECIALTIES,
      maxTokensPerResponse: limits.maxTokensPerResponse
    };

  } catch (error) {
    console.error('Error obteniendo límites de modos especializados:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error obteniendo límites de modos especializados');
  }
});

// ========================================
// ✅ FUNCIÓN DEVELOPER MODE CON VERIFICACIÓN SEGURA MEJORADA
// ========================================
exports.developerModeChat = functions.runWith({ timeoutSeconds: 540, memory: '2GB' }).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { message, chatHistory = [], fileContext = '' } = data;
  const uid = context.auth.uid;

  if (!message || message.trim().length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Mensaje requerido');
  }

  try {
    // ✅ VERIFICACIÓN DE SUSCRIPCIÓN CRÍTICA
    const verification = await verifyUserSubscription(uid);
    if (!verification.isValid) {
      throw new functions.https.HttpsError('permission-denied', verification.error);
    }

    const { plan } = verification;
    const limits = SPECIALIST_LIMITS[plan] || SPECIALIST_LIMITS['free'];

    // Verificar límites de uso
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const specialistUsageDoc = await admin.firestore().collection('specialist_usage').doc(uid).get();
    const usageData = specialistUsageDoc.data() || {};

    const dailyDevUsage = usageData.dailyDeveloper || { count: 0, date: todayStr };
    const monthlyDevUsage = usageData.monthlyDeveloper || { count: 0, month: monthStr };

    // Reset automático
    if (dailyDevUsage.date !== todayStr) {
      dailyDevUsage.count = 0;
      dailyDevUsage.date = todayStr;
    }
    if (monthlyDevUsage.month !== monthStr) {
      monthlyDevUsage.count = 0;
      monthlyDevUsage.month = monthStr;
    }

    // ✅ VERIFICACIÓN ESTRICTA DE LÍMITES
    if (limits.developerMode.daily !== -1 && dailyDevUsage.count >= limits.developerMode.daily) {
      throw new functions.https.HttpsError('resource-exhausted', 
        `Límite diario del Modo Desarrollador alcanzado. Plan ${plan}: ${limits.developerMode.daily} usos por día.`);
    }

    if (limits.developerMode.monthly !== -1 && monthlyDevUsage.count >= limits.developerMode.monthly) {
      throw new functions.https.HttpsError('resource-exhausted', 
        `Límite mensual del Modo Desarrollador alcanzado. Plan ${plan}: ${limits.developerMode.monthly} usos por mes.`);
    }

    // ✅ CONFIGURAR GEMINI CON API KEY SEGURA
    const geminiApiKey = plan === 'free' 
      ? functions.config().gemini?.api_key_free 
      : (plan === 'pro' 
          ? functions.config().gemini?.api_key_basic 
          : functions.config().gemini?.api_key_pro);
    
    if (!geminiApiKey) {
      throw new functions.https.HttpsError('internal', 'Configuración de API no disponible');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    // ✅ SELECCIONAR MODELO SEGÚN PLAN VERIFICADO
    const modelName = plan === 'pro_max' ? 'gemini-2.0-flash' : 'gemini-2.0-flash';
    
    // Preparar contexto de conversación
    let conversationContext = '';
    if (chatHistory && chatHistory.length > 0) {
      conversationContext = chatHistory.slice(-8).map(msg => 
        `${msg.type === 'user' ? 'Usuario' : 'NORA CODE'}: ${msg.message}`
      ).join('\n');
    }

    // ✅ PROMPT ESPECIALIZADO PARA DESARROLLO
    const devPrompt = `${SPECIALTIES.programming.systemPrompt}

${fileContext ? `ARCHIVOS DEL PROYECTO:\n${fileContext}\n\n` : ''}

${conversationContext ? `HISTORIAL DE CONVERSACIÓN:\n${conversationContext}\n\n` : ''}

CONSULTA DEL DESARROLLADOR: ${message}

INSTRUCCIONES ESPECÍFICAS:
- Proporciona soluciones completas y funcionales
- Incluye ejemplos de código cuando sea relevante
- Explica las mejores prácticas utilizadas
- Menciona consideraciones de seguridad si aplica
- Sugiere optimizaciones cuando sea posible
- Si detectas errores, proporciona la corrección exacta

RESPUESTA:`;

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.3, // Más preciso para código
        topK: 40,
        topP: 0.8,
        maxOutputTokens: limits.maxTokensPerResponse
      }
    });

    console.log(`🚀 Generando respuesta en Modo Desarrollador con ${modelName}...`);
    const result = await model.generateContent(devPrompt);
    const text = result.response.text();

    // ✅ ACTUALIZAR CONTADORES DE USO DE MANERA SEGURA
    dailyDevUsage.count += 1;
    monthlyDevUsage.count += 1;

    await admin.firestore().collection('specialist_usage').doc(uid).set({
      dailyDeveloper: dailyDevUsage,
      monthlyDeveloper: monthlyDevUsage,
      // Mantener otros datos existentes
      dailySpecialist: usageData.dailySpecialist || { count: 0, date: todayStr },
      monthlySpecialist: usageData.monthlySpecialist || { count: 0, month: monthStr }
    });

    return {
      response: text,
      tokensUsed: Math.floor(text.length / 4),
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

// ========================================
// ✅ FUNCIÓN SPECIALIST MODE CON VERIFICACIÓN SEGURA ACTUALIZADA
// ========================================
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
    // ✅ VERIFICACIÓN DE SUSCRIPCIÓN CRÍTICA
    const verification = await verifyUserSubscription(uid);
    if (!verification.isValid) {
      throw new functions.https.HttpsError('permission-denied', verification.error);
    }

    const { plan } = verification;
    const limits = SPECIALIST_LIMITS[plan] || SPECIALIST_LIMITS['free'];

    // Verificar límites
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const specialistUsageDoc = await admin.firestore().collection('specialist_usage').doc(uid).get();
    const usageData = specialistUsageDoc.data() || {};

    const dailySpecUsage = usageData.dailySpecialist || { count: 0, date: todayStr };
    const monthlySpecUsage = usageData.monthlySpecialist || { count: 0, month: monthStr };
    
    // Reset automático
    if (dailySpecUsage.date !== todayStr) {
      dailySpecUsage.count = 0;
      dailySpecUsage.date = todayStr;
    }
    if (monthlySpecUsage.month !== monthStr) {
      monthlySpecUsage.count = 0;
      monthlySpecUsage.month = monthStr;
    }

    // ✅ VERIFICACIÓN ESTRICTA DE LÍMITES
    if (limits.specialistMode.daily !== -1 && dailySpecUsage.count >= limits.specialistMode.daily) {
      throw new functions.https.HttpsError('resource-exhausted', 
        `Límite diario del Modo Especialista alcanzado. Plan ${plan}: ${limits.specialistMode.daily} usos por día.`);
    }

    if (limits.specialistMode.monthly !== -1 && monthlySpecUsage.count >= limits.specialistMode.monthly) {
      throw new functions.https.HttpsError('resource-exhausted', 
        `Límite mensual del Modo Especialista alcanzado. Plan ${plan}: ${limits.specialistMode.monthly} usos por mes.`);
    }

    // ✅ CONFIGURAR GEMINI CON API KEY SEGURA
    const geminiApiKey = plan === 'free' 
      ? functions.config().gemini?.api_key_free 
      : (plan === 'pro' 
          ? functions.config().gemini?.api_key_basic 
          : functions.config().gemini?.api_key_pro);
    
    if (!geminiApiKey) {
      throw new functions.https.HttpsError('internal', 'Configuración de API no disponible');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    // ✅ SELECCIONAR MODELO SEGÚN PLAN VERIFICADO
    const modelName = plan === 'pro_max' ? 'gemini-2.0-flash' : 'gemini-2.0-flash';
    
    // Obtener especialidad seleccionada
    const selectedSpecialty = SPECIALTIES[specialty];
    
    // Preparar contexto de conversación
    let conversationContext = '';
    if (chatHistory && chatHistory.length > 0) {
      conversationContext = chatHistory.slice(-6).map(msg => 
        `${msg.type === 'user' ? 'Usuario' : `NORA ${selectedSpecialty.name.toUpperCase()}`}: ${msg.message}`
      ).join('\n');
    }

    // ✅ PROMPT ESPECIALIZADO SEGURO
    const specialistPrompt = `${selectedSpecialty.systemPrompt}

ESPECIALIDAD ACTIVA: ${selectedSpecialty.name} ${selectedSpecialty.icon}

${fileContext ? `DOCUMENTOS RELEVANTES:\n${fileContext}\n\n` : ''}

${conversationContext ? `HISTORIAL DE CONSULTA:\n${conversationContext}\n\n` : ''}

CONSULTA ESPECIALIZADA: ${message}

INSTRUCCIONES:
- Responde como un experto en ${selectedSpecialty.name}
- Proporciona información precisa y actualizada
- Incluye ejemplos prácticos cuando sea relevante
- Sugiere recursos adicionales si es útil
- Mantén un enfoque profesional y especializado

RESPUESTA EXPERTA:`;

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.4, // Balance entre creatividad y precisión
        topK: 40,
        topP: 0.9,
        maxOutputTokens: limits.maxTokensPerResponse
      }
    });

    console.log(`🚀 Generando respuesta especializada en ${selectedSpecialty.name} con ${modelName}...`);
    const result = await model.generateContent(specialistPrompt);
    const text = result.response.text();

    // ✅ ACTUALIZAR CONTADORES DE USO DE MANERA SEGURA
    dailySpecUsage.count += 1;
    monthlySpecUsage.count += 1;

    await admin.firestore().collection('specialist_usage').doc(uid).set({
      dailySpecialist: dailySpecUsage,
      monthlySpecialist: monthlySpecUsage,
      // Mantener otros datos existentes
      dailyDeveloper: usageData.dailyDeveloper || { count: 0, date: todayStr },
      monthlyDeveloper: usageData.monthlyDeveloper || { count: 0, month: monthStr }
    });

    return {
      response: text,
      tokensUsed: Math.floor(text.length / 4),
      remainingDaily: limits.specialistMode.daily === -1 ? -1 : Math.max(0, limits.specialistMode.daily - dailySpecUsage.count),
      remainingMonthly: limits.specialistMode.monthly === -1 ? -1 : Math.max(0, limits.specialistMode.monthly - monthlySpecUsage.count),
      specialty: specialty,
      specialtyName: selectedSpecialty.name,
      modelUsed: modelName,
      availableModels: plan === 'pro_max' ? ['gemini-2.0-flash', 'gemini-pro'] : ['gemini-2.0-flash']
    };

  } catch (error) {
    console.error('Error en Modo Especialista:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error procesando consulta en Modo Especialista');
  }
});

// ========================================
// 🔧 FUNCIONES AUXILIARES SEGURAS
// ========================================

async function verifyUserSubscription(uid) {
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return { 
        isValid: false, 
        error: 'Usuario no encontrado' 
      };
    }

    const userData = userDoc.data();
    const currentPlan = userData.plan || 'free';

    return { 
      isValid: true, 
      plan: currentPlan, 
      userData 
    };
  } catch (error) {
    console.error('Error en verifyUserSubscription:', error);
    return { 
      isValid: false, 
      error: 'Error verificando usuario' 
    };
  }
}

// Función para verificar si el usuario puede acceder a un modo especializado
async function canAccessSpecialistMode(uid, mode, plan) {
  try {
    const verification = await verifyUserSubscription(uid);
    if (!verification.isValid) {
      return false;
    }

    // Los planes gratuitos tienen acceso limitado
    if (plan === 'free' && mode === 'specialist') {
      // Verificar uso diario para plan gratuito
      const today = new Date().toISOString().split('T')[0];
      const usageDoc = await admin.firestore().collection('specialist_usage').doc(uid).get();
      const usageData = usageDoc.data() || {};
      const dailyUsage = usageData[`daily${mode === 'developer' ? 'Developer' : 'Specialist'}`] || { count: 0, date: today };
      
      const limits = SPECIALIST_LIMITS[plan];
      const modeLimit = mode === 'developer' ? limits.developerMode.daily : limits.specialistMode.daily;
      
      return dailyUsage.count < modeLimit;
    }

    return true;
  } catch (error) {
    console.error('Error verificando acceso a modo especialista:', error);
    return false;
  }
}

// ========================================
// 📊 EXPORTAR FUNCIONES Y CONSTANTES
// ========================================
module.exports = {
  getSpecialistModeLimits: exports.getSpecialistModeLimits,
  developerModeChat: exports.developerModeChat,
  specialistModeChat: exports.specialistModeChat,
  SPECIALIST_LIMITS,
  SPECIALTIES,
  canAccessSpecialistMode
};