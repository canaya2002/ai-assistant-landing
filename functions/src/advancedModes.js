// functions/advancedModes.js - MODOS AVANZADOS COMPLETOS

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// LÃ­mites para modos avanzados
const ADVANCED_MODE_LIMITS = {
  free: {
    travel_planner: { daily: 3, monthly: 10 },
    ai_detector: { daily: 5, monthly: 20 },
    text_humanizer: { daily: 5, monthly: 20 },
    brand_analyzer: { daily: 3, monthly: 10 },
    document_detective: { daily: 3, monthly: 10 },
    plant_doctor: { daily: 5, monthly: 20 }
  },
  pro: {
    travel_planner: { daily: 20, monthly: 100 },
    ai_detector: { daily: 50, monthly: 200 },
    text_humanizer: { daily: 50, monthly: 200 },
    brand_analyzer: { daily: 20, monthly: 100 },
    document_detective: { daily: 20, monthly: 100 },
    plant_doctor: { daily: 50, monthly: 200 }
  },
  pro_max: {
    travel_planner: { daily: -1, monthly: -1 },
    ai_detector: { daily: -1, monthly: -1 },
    text_humanizer: { daily: -1, monthly: -1 },
    brand_analyzer: { daily: -1, monthly: -1 },
    document_detective: { daily: -1, monthly: -1 },
    plant_doctor: { daily: -1, monthly: -1 }
  }
};

// ========================================
// âœ… FUNCIÃ“N: VERIFICAR LÃMITES DE MODO AVANZADO
// ========================================
async function checkAdvancedModeUsage(uid, plan, mode) {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const usageRef = admin.firestore().collection('advanced_mode_usage').doc(uid);
  const usageDoc = await usageRef.get();
  
  let dailyUsage = { count: 0, date: today };
  let monthlyUsage = { count: 0, month: currentMonth };
  
  if (usageDoc.exists) {
    const usageData = usageDoc.data();
    const modeData = usageData[mode] || {};
    
    if (modeData.daily && modeData.daily.date === today) {
      dailyUsage = modeData.daily;
    }
    
    if (modeData.monthly && modeData.monthly.month === currentMonth) {
      monthlyUsage = modeData.monthly;
    }
  }
  
  const limits = ADVANCED_MODE_LIMITS[plan]?.[mode] || ADVANCED_MODE_LIMITS.free[mode];
  
  return {
    dailyUsage,
    monthlyUsage,
    limits,
    canUse: (limits.daily === -1 || dailyUsage.count < limits.daily) &&
            (limits.monthly === -1 || monthlyUsage.count < limits.monthly)
  };
}

// ========================================
// âœ… ACTUALIZAR USO DE MODO AVANZADO
// ========================================
async function updateAdvancedModeUsage(uid, mode, dailyUsage, monthlyUsage) {
  dailyUsage.count += 1;
  monthlyUsage.count += 1;
  
  const usageRef = admin.firestore().collection('advanced_mode_usage').doc(uid);
  const currentData = (await usageRef.get()).data() || {};
  
  await usageRef.set({
    ...currentData,
    [mode]: {
      daily: dailyUsage,
      monthly: monthlyUsage
    }
  });
}

// ========================================
// ðŸŒ MODO 1: PLANIFICADOR DE VIAJES
// ========================================
exports.travelPlanner = functions.runWith({ timeoutSeconds: 540, memory: '2GB' }).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  try {
    const uid = context.auth.uid;
    const { message, destination, budget, duration, interests = [], chatHistory = [] } = data;

    // Obtener plan del usuario
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Usuario no encontrado');
    }

    const plan = userDoc.data().plan || 'free';
    
    // Verificar lÃ­mites
    const usage = await checkAdvancedModeUsage(uid, plan, 'travel_planner');
    if (!usage.canUse) {
      throw new functions.https.HttpsError('resource-exhausted', 
        `LÃ­mite del Planificador de Viajes alcanzado. Plan ${plan}.`);
    }

    // Configurar Gemini
    const geminiApiKey = plan === 'free' 
      ? functions.config().gemini?.api_key_free 
      : (plan === 'pro' ? functions.config().gemini?.api_key_basic : functions.config().gemini?.api_key_pro);
    
    if (!geminiApiKey) {
      throw new functions.https.HttpsError('internal', 'ConfiguraciÃ³n de API no disponible');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    // BÃºsqueda de vuelos (simulada - en producciÃ³n usa API real)
    let flightContext = '';
    if (destination) {
      try {
        // AquÃ­ irÃ­a integraciÃ³n con API de vuelos real (Skyscanner, Amadeus, etc.)
        flightContext = `\nðŸ›« INFORMACIÃ“N DE VUELOS (Simulada):\n` +
          `- Destino: ${destination}\n` +
          `- Rango de precios estimado: $${Math.floor(Math.random() * 500) + 300} - $${Math.floor(Math.random() * 1000) + 700}\n` +
          `- AerolÃ­neas recomendadas: Disponibles varias opciones\n` +
          `- Mejor Ã©poca para viajar: Consultar calendarios de temporada\n\n`;
      } catch (error) {
        console.error('Error buscando vuelos:', error);
      }
    }

    // BÃºsqueda web de actividades
    let activityContext = '';
    if (destination) {
      try {
        const searchQuery = `mejores actividades turÃ­sticas en ${destination} ${interests.join(' ')}`;
        const googleSearchApiKey = functions.config().google?.search_api_key;
        const searchEngineId = functions.config().google?.search_engine_id;
        
        if (googleSearchApiKey && searchEngineId) {
          const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleSearchApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchQuery)}&num=5`;
          const searchResponse = await axios.get(searchUrl);
          
          if (searchResponse.data.items && searchResponse.data.items.length > 0) {
            activityContext = '\nðŸŽ¯ ACTIVIDADES RECOMENDADAS:\n\n';
            searchResponse.data.items.slice(0, 5).forEach((item, index) => {
              activityContext += `${index + 1}. ${item.title}\n`;
              activityContext += `   ${item.snippet}\n`;
              activityContext += `   ${item.link}\n\n`;
            });
          }
        }
      } catch (error) {
        console.error('Error buscando actividades:', error);
      }
    }

    // Contexto de conversaciÃ³n
    let conversationContext = '';
    if (chatHistory.length > 0) {
      conversationContext = chatHistory.slice(-5).map(msg => 
        `${msg.type === 'user' ? 'Viajero' : 'NORA Travel'}: ${msg.message}`
      ).join('\n');
    }

    // Prompt especializado para viajes
    const travelPrompt = `Eres NORA Travel, una experta planificadora de viajes que crea experiencias autÃ©nticas y personalizadas.

ðŸŒ TU ESPECIALIZACIÃ“N:
- Descubres experiencias locales autÃ©nticas, no solo atracciones turÃ­sticas
- Planificas itinerarios dinÃ¡micos y flexibles
- Optimizas presupuestos sin sacrificar la calidad de la experiencia
- Conoces rutas, transporte local y opciones de alojamiento Ãºnicas
- Sugieres cafeterÃ­as, galerÃ­as y lugares que solo los locales conocen

${flightContext}

${activityContext}

${conversationContext ? `CONVERSACIÃ“N PREVIA:\n${conversationContext}\n\n` : ''}

INFORMACIÃ“N DEL VIAJE:
- Destino: ${destination || 'No especificado'}
- Presupuesto: ${budget || 'Flexible'}
- DuraciÃ³n: ${duration || 'No especificada'}
- Intereses: ${interests.length > 0 ? interests.join(', ') : 'Explorar'}

SOLICITUD DEL VIAJERO: ${message}

INSTRUCCIONES:
- Crea un plan de viaje DETALLADO y PERSONALIZADO
- Incluye: vuelos sugeridos, alojamiento, actividades dÃ­a a dÃ­a, presupuesto estimado
- EnfÃ³cate en experiencias autÃ©nticas y locales
- Proporciona opciones de backup para clima o imprevistos
- Incluye tips prÃ¡cticos de transporte y seguridad
- Sugiere lugares "escondidos" que valen la pena
- Estructura: IntroducciÃ³n, Vuelos, Alojamiento, Itinerario DÃ­a a DÃ­a, Presupuesto, Tips Finales

NORA Travel:`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.8,
        topK: 50,
        topP: 0.9,
        maxOutputTokens: 3000
      }
    });

    const result = await model.generateContent(travelPrompt);
    const text = result.response.text();
    const tokensUsed = Math.floor(text.length / 4);

    // Actualizar uso
    await updateAdvancedModeUsage(uid, 'travel_planner', usage.dailyUsage, usage.monthlyUsage);

    return {
      response: text,
      tokensUsed,
      searchUsed: true,
      flightContext,
      activityContext,
      remainingDaily: usage.limits.daily === -1 ? -1 : Math.max(0, usage.limits.daily - usage.dailyUsage.count - 1),
      remainingMonthly: usage.limits.monthly === -1 ? -1 : Math.max(0, usage.limits.monthly - usage.monthlyUsage.count - 1)
    };

  } catch (error) {
    console.error('Error en travelPlanner:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error procesando planificaciÃ³n de viaje');
  }
});

// ========================================
// ðŸ¤– MODO 2: DETECTOR DE IA
// ========================================
exports.aiDetector = functions.runWith({ timeoutSeconds: 300, memory: '1GB' }).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  try {
    const uid = context.auth.uid;
    const { text, chatHistory = [] } = data;

    if (!text || text.trim().length < 50) {
      throw new functions.https.HttpsError('invalid-argument', 'El texto debe tener al menos 50 caracteres');
    }

    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Usuario no encontrado');
    }

    const plan = userDoc.data().plan || 'free';
    const usage = await checkAdvancedModeUsage(uid, plan, 'ai_detector');
    
    if (!usage.canUse) {
      throw new functions.https.HttpsError('resource-exhausted', 
        `LÃ­mite del Detector de IA alcanzado. Plan ${plan}.`);
    }

    const geminiApiKey = plan === 'free' 
      ? functions.config().gemini?.api_key_free 
      : (plan === 'pro' ? functions.config().gemini?.api_key_basic : functions.config().gemini?.api_key_pro);
    
    if (!geminiApiKey) {
      throw new functions.https.HttpsError('internal', 'ConfiguraciÃ³n de API no disponible');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    const detectorPrompt = `Eres un experto detector de texto generado por IA vs texto humano. Analiza el siguiente texto de forma forense.

TEXTO A ANALIZAR:
"""
${text}
"""

ANÃLISIS REQUERIDO:

1. **Probabilidad de ser IA** (0-100%):
   - Patrones lingÃ¼Ã­sticos repetitivos
   - Estructura demasiado perfecta
   - Vocabulario genÃ©rico o acadÃ©mico excesivo
   - Falta de errores naturales
   - Transiciones artificiales
   
2. **Probabilidad de ser Humano** (0-100%):
   - Errores ortogrÃ¡ficos o gramaticales naturales
   - Estilo personal e inconsistente
   - Referencias culturales especÃ­ficas
   - Emociones genuinas
   - Coloquialismos y modismos
   
3. **Indicadores EspecÃ­ficos**:
   - Lista 5-10 patrones encontrados
   - SeÃ±ala inconsistencias
   - Identifica "huellas digitales" de IA

4. **Veredicto**: likely_ai, likely_human, mixed, o uncertain

5. **Confianza del anÃ¡lisis**: Alta, Media, Baja

Proporciona un anÃ¡lisis DETALLADO, TÃ‰CNICO y PRECISO en formato estructurado.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.3, // Baja para anÃ¡lisis preciso
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 2000
      }
    });

    const result = await model.generateContent(detectorPrompt);
    const response = result.response.text();
    const tokensUsed = Math.floor(response.length / 4);

    // Parsear respuesta para extraer mÃ©tricas
    const aiProbMatch = response.match(/IA[:\s]+(\d+)%/i);
    const humanProbMatch = response.match(/Humano[:\s]+(\d+)%/i);
    const verdictMatch = response.match(/Veredicto[:\s]+(likely_ai|likely_human|mixed|uncertain)/i);

    const aiProbability = aiProbMatch ? parseInt(aiProbMatch[1]) : 50;
    const humanProbability = humanProbMatch ? parseInt(humanProbMatch[1]) : 50;
    const verdict = verdictMatch ? verdictMatch[1].toLowerCase() : 'uncertain';

    await updateAdvancedModeUsage(uid, 'ai_detector', usage.dailyUsage, usage.monthlyUsage);

    return {
      response,
      aiProbability,
      humanProbability,
      verdict,
      tokensUsed,
      remainingDaily: usage.limits.daily === -1 ? -1 : Math.max(0, usage.limits.daily - usage.dailyUsage.count - 1),
      remainingMonthly: usage.limits.monthly === -1 ? -1 : Math.max(0, usage.limits.monthly - usage.monthlyUsage.count - 1)
    };

  } catch (error) {
    console.error('Error en aiDetector:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error detectando IA');
  }
});

// ========================================
// âœï¸ MODO 3: HUMANIZADOR DE TEXTO
// ========================================
exports.textHumanizer = functions.runWith({ timeoutSeconds: 300, memory: '1GB' }).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  try {
    const uid = context.auth.uid;
    const { text, style = 'professional', chatHistory = [] } = data;

    if (!text || text.trim().length < 20) {
      throw new functions.https.HttpsError('invalid-argument', 'El texto debe tener al menos 20 caracteres');
    }

    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Usuario no encontrado');
    }

    const plan = userDoc.data().plan || 'free';
    const usage = await checkAdvancedModeUsage(uid, plan, 'text_humanizer');
    
    if (!usage.canUse) {
      throw new functions.https.HttpsError('resource-exhausted', 
        `LÃ­mite del Humanizador alcanzado. Plan ${plan}.`);
    }

    const geminiApiKey = plan === 'free' 
      ? functions.config().gemini?.api_key_free 
      : (plan === 'pro' ? functions.config().gemini?.api_key_basic : functions.config().gemini?.api_key_pro);
    
    if (!geminiApiKey) {
      throw new functions.https.HttpsError('internal', 'ConfiguraciÃ³n de API no disponible');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    const styleInstructions = {
      casual: 'informal, relajado, conversacional, con modismos y expresiones cotidianas',
      professional: 'profesional pero natural, equilibrado entre formal y accesible',
      academic: 'acadÃ©mico pero legible, con rigor pero sin ser robÃ³tico',
      creative: 'creativo, expresivo, con personalidad y estilo Ãºnico'
    };

    const humanizerPrompt = `Eres un experto en reescritura de texto para hacerlo sonar 100% humano y natural, pasando cualquier detector de IA.

TEXTO ORIGINAL:
"""
${text}
"""

ESTILO DESEADO: ${style} (${styleInstructions[style] || styleInstructions.professional})

INSTRUCCIONES DE HUMANIZACIÃ“N:

1. **AÃ±ade Imperfecciones Naturales**:
   - VariaciÃ³n en longitud de oraciones
   - PequeÃ±as repeticiones ocasionales
   - Estructuras menos perfectas
   - Transiciones mÃ¡s naturales

2. **Inyecta Personalidad**:
   - Usa contracciones cuando sea natural
   - AÃ±ade expresiones coloquiales apropiadas
   - Incluye opiniones o Ã©nfasis sutiles
   - VarÃ­a el ritmo narrativo

3. **Elimina Patrones de IA**:
   - Rompe estructuras demasiado simÃ©tricas
   - Evita listas excesivamente organizadas
   - Reduce vocabulario acadÃ©mico innecesario
   - Elimina frases clichÃ© de IA

4. **MantÃ©n el Mensaje**:
   - No cambies el significado core
   - Preserva informaciÃ³n importante
   - MantÃ©n el tono general solicitado

PRODUCE:
1. El texto humanizado completo
2. Lista de 5-7 cambios clave realizados
3. ExplicaciÃ³n breve de por quÃ© ahora suena mÃ¡s humano

Texto humanizado:`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.9, // Alta para mayor creatividad
        topK: 50,
        topP: 0.95,
        maxOutputTokens: 3000
      }
    });

    const result = await model.generateContent(humanizerPrompt);
    const response = result.response.text();
    const tokensUsed = Math.floor(response.length / 4);

    await updateAdvancedModeUsage(uid, 'text_humanizer', usage.dailyUsage, usage.monthlyUsage);

    return {
      response,
      originalText: text,
      tokensUsed,
      remainingDaily: usage.limits.daily === -1 ? -1 : Math.max(0, usage.limits.daily - usage.dailyUsage.count - 1),
      remainingMonthly: usage.limits.monthly === -1 ? -1 : Math.max(0, usage.limits.monthly - usage.monthlyUsage.count - 1)
    };

  } catch (error) {
    console.error('Error en textHumanizer:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error humanizando texto');
  }
});

// ========================================
// ðŸŽ¨ MODO 4: ANALIZADOR DE MARCA
// ========================================
exports.brandAnalyzer = functions.runWith({ timeoutSeconds: 300, memory: '1GB' }).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  try {
    const uid = context.auth.uid;
    const { message, brandTexts = [], fileContext = '', chatHistory = [] } = data;

    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Usuario no encontrado');
    }

    const plan = userDoc.data().plan || 'free';
    const usage = await checkAdvancedModeUsage(uid, plan, 'brand_analyzer');
    
    if (!usage.canUse) {
      throw new functions.https.HttpsError('resource-exhausted', 
        `LÃ­mite del Analizador de Marca alcanzado. Plan ${plan}.`);
    }

    const geminiApiKey = plan === 'free' 
      ? functions.config().gemini?.api_key_free 
      : (plan === 'pro' ? functions.config().gemini?.api_key_basic : functions.config().gemini?.api_key_pro);
    
    if (!geminiApiKey) {
      throw new functions.https.HttpsError('internal', 'ConfiguraciÃ³n de API no disponible');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    let brandContext = '';
    if (brandTexts.length > 0) {
      brandContext = '\nðŸ“ TEXTOS DE LA MARCA:\n\n';
      brandTexts.forEach((texto, index) => {
        brandContext += `TEXTO ${index + 1}:\n${texto}\n\n`;
      });
    }

    if (fileContext) {
      brandContext += '\nðŸ“„ DOCUMENTOS ADICIONALES:\n' + fileContext + '\n\n';
    }

    const brandPrompt = `Eres un experto analista de marca especializado en identificar la voz, tono y personalidad de marcas.

${brandContext}

SOLICITUD: ${message}

ANÃLISIS REQUERIDO:

1. **Arquetipo de Marca**:
   - Identifica el arquetipo principal (ej. Innovador, Cercano, Formal, Rebelde, Sabio, etc.)
   - Justifica la elecciÃ³n con ejemplos del texto

2. **Paleta Emocional**:
   - Emociones principales que la marca evoca
   - Tono dominante (optimista, serio, divertido, inspirador, etc.)

3. **Complejidad del Lenguaje**:
   - Nivel de sofisticaciÃ³n (simple, intermedio, avanzado)
   - Vocabulario caracterÃ­stico
   - Estructura de oraciones

4. **Atributos de Personalidad**:
   - 5-7 adjetivos clave que definen la marca
   - CÃ³mo se diferencia de competidores

5. **GuÃ­a de Estilo**:
   - QuÃ© lenguaje usar / evitar
   - Ejemplos de frases "on-brand"
   - Recomendaciones para mantener consistencia

Proporciona un anÃ¡lisis PROFUNDO, ACCIONABLE y con EJEMPLOS ESPECÃFICOS.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.6,
        topK: 40,
        topP: 0.85,
        maxOutputTokens: 3000
      }
    });

    const result = await model.generateContent(brandPrompt);
    const response = result.response.text();
    const tokensUsed = Math.floor(response.length / 4);

    await updateAdvancedModeUsage(uid, 'brand_analyzer', usage.dailyUsage, usage.monthlyUsage);

    return {
      response,
      tokensUsed,
      remainingDaily: usage.limits.daily === -1 ? -1 : Math.max(0, usage.limits.daily - usage.dailyUsage.count - 1),
      remainingMonthly: usage.limits.monthly === -1 ? -1 : Math.max(0, usage.limits.monthly - usage.monthlyUsage.count - 1)
    };

  } catch (error) {
    console.error('Error en brandAnalyzer:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error analizando marca');
  }
});

// ========================================
// ðŸ” MODO 5: DETECTIVE DE DOCUMENTOS
// ========================================
exports.documentDetective = functions.runWith({ timeoutSeconds: 300, memory: '1GB' }).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  try {
    const uid = context.auth.uid;
    const { message, fileContext, chatHistory = [] } = data;

    if (!fileContext) {
      throw new functions.https.HttpsError('invalid-argument', 'Se requiere un documento para analizar');
    }

    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Usuario no encontrado');
    }

    const plan = userDoc.data().plan || 'free';
    const usage = await checkAdvancedModeUsage(uid, plan, 'document_detective');
    
    if (!usage.canUse) {
      throw new functions.https.HttpsError('resource-exhausted', 
        `LÃ­mite del Detective de Documentos alcanzado. Plan ${plan}.`);
    }

    const geminiApiKey = plan === 'free' 
      ? functions.config().gemini?.api_key_free 
      : (plan === 'pro' ? functions.config().gemini?.api_key_basic : functions.config().gemini?.api_key_pro);
    
    if (!geminiApiKey) {
      throw new functions.https.HttpsError('internal', 'ConfiguraciÃ³n de API no disponible');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    const detectivePrompt = `Eres Sherlock Holmes, un detective forense de documentos. Analiza el siguiente documento de forma meticulosa.

ðŸ“„ DOCUMENTO A ANALIZAR:
${fileContext}

PREGUNTA ESPECÃFICA: ${message}

ANÃLISIS FORENSE REQUERIDO:

1. **Autenticidad** (PuntuaciÃ³n 0-100):
   - Consistencia de estilo a lo largo del documento
   - Indicadores de mÃºltiples autores
   - Patrones que sugieren ediciÃ³n por IA
   - Coherencia temporal y contextual

2. **AnÃ¡lisis de Influencias**:
   - Identifica posibles fuentes de inspiraciÃ³n
   - Estilo similar a quÃ© autores o publicaciones
   - Referencias o citas detectadas

3. **Profundidad de Pensamiento** (PuntuaciÃ³n 0-100):
   - Nivel de pensamiento crÃ­tico
   - Complejidad argumentativa
   - Superficial vs. Profundo

4. **Inconsistencias Detectadas**:
   - Cambios abruptos de estilo
   - Contradicciones lÃ³gicas
   - Saltos inexplicables

5. **Veredicto**:
   - Resumen ejecutivo del anÃ¡lisis
   - Confianza en las conclusiones
   - Recomendaciones

Proporciona un anÃ¡lisis EXHAUSTIVO, TÃ‰CNICO y FUNDAMENTADO con evidencias especÃ­ficas del texto.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.4, // Balance entre creatividad y precisiÃ³n
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 3000
      }
    });

    const result = await model.generateContent(detectivePrompt);
    const response = result.response.text();
    const tokensUsed = Math.floor(response.length / 4);

    await updateAdvancedModeUsage(uid, 'document_detective', usage.dailyUsage, usage.monthlyUsage);

    return {
      response,
      tokensUsed,
      remainingDaily: usage.limits.daily === -1 ? -1 : Math.max(0, usage.limits.daily - usage.dailyUsage.count - 1),
      remainingMonthly: usage.limits.monthly === -1 ? -1 : Math.max(0, usage.limits.monthly - usage.monthlyUsage.count - 1)
    };

  } catch (error) {
    console.error('Error en documentDetective:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error analizando documento');
  }
});

// ========================================
// ðŸŒ± MODO 6: DOCTOR DE PLANTAS
// ========================================
exports.plantDoctor = functions.runWith({ timeoutSeconds: 300, memory: '1GB' }).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  try {
    const uid = context.auth.uid;
    const { message, imageBase64, chatHistory = [] } = data;

    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Usuario no encontrado');
    }

    const plan = userDoc.data().plan || 'free';
    const usage = await checkAdvancedModeUsage(uid, plan, 'plant_doctor');
    
    if (!usage.canUse) {
      throw new functions.https.HttpsError('resource-exhausted', 
        `LÃ­mite del Doctor de Plantas alcanzado. Plan ${plan}.`);
    }

    const geminiApiKey = plan === 'free' 
      ? functions.config().gemini?.api_key_free 
      : (plan === 'pro' ? functions.config().gemini?.api_key_basic : functions.config().gemini?.api_key_pro);
    
    if (!geminiApiKey) {
      throw new functions.https.HttpsError('internal', 'ConfiguraciÃ³n de API no disponible');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    let imageContext = '';
    if (imageBase64) {
      imageContext = '\nðŸ–¼ï¸ IMAGEN PROPORCIONADA: [El usuario ha compartido una imagen de la planta]\n\n';
      // Nota: Gemini puede analizar imÃ¡genes directamente, aquÃ­ simplificamos
    }

    const plantPrompt = `Eres un botÃ¡nico experto y doctor de plantas especializado en diagnÃ³stico y tratamiento.

${imageContext}

CONSULTA DEL USUARIO: ${message}

DIAGNÃ“STICO REQUERIDO:

1. **IdentificaciÃ³n** (si aplica):
   - Nombre de la planta
   - Especie y variedad
   - CaracterÃ­sticas distintivas

2. **EvaluaciÃ³n de Salud**:
   - Estado general (Excelente/Bueno/Regular/Malo/CrÃ­tico)
   - Problemas visibles detectados

3. **DiagnÃ³stico de Problemas** (si los hay):
   - Plagas identificadas
   - Enfermedades detectadas
   - Deficiencias nutricionales
   - Problemas de riego/luz/temperatura
   - Nivel de gravedad (Bajo/Medio/Alto)

4. **Plan de Tratamiento**:
   - Soluciones orgÃ¡nicas y sostenibles
   - Tratamientos quÃ­micos (si es necesario)
   - Pasos especÃ­ficos a seguir
   - Cronograma de tratamiento

5. **Cuidados Ã“ptimos**:
   - Cantidad de luz necesaria
   - Frecuencia y cantidad de riego
   - Tipo de suelo recomendado
   - Temperatura ideal
   - FertilizaciÃ³n sugerida

6. **PrevenciÃ³n**:
   - CÃ³mo evitar problemas futuros
   - Inspecciones regulares recomendadas
   - SeÃ±ales de alerta temprana

Proporciona un anÃ¡lisis COMPLETO, PRÃCTICO y ACCIONABLE con instrucciones claras paso a paso.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.5,
        topK: 40,
        topP: 0.85,
        maxOutputTokens: 2500
      }
    });

    const result = await model.generateContent(plantPrompt);
    const response = result.response.text();
    const tokensUsed = Math.floor(response.length / 4);

    await updateAdvancedModeUsage(uid, 'plant_doctor', usage.dailyUsage, usage.monthlyUsage);

    return {
      response,
      tokensUsed,
      remainingDaily: usage.limits.daily === -1 ? -1 : Math.max(0, usage.limits.daily - usage.dailyUsage.count - 1),
      remainingMonthly: usage.limits.monthly === -1 ? -1 : Math.max(0, usage.limits.monthly - usage.monthlyUsage.count - 1)
    };

  } catch (error) {
    console.error('Error en plantDoctor:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error diagnosticando planta');
  }
});

module.exports = {
  travelPlanner: exports.travelPlanner,
  aiDetector: exports.aiDetector,
  textHumanizer: exports.textHumanizer,
  brandAnalyzer: exports.brandAnalyzer,
  documentDetective: exports.documentDetective,
  plantDoctor: exports.plantDoctor
};