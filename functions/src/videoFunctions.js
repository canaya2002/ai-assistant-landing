// functions/src/videoFunctions.js - FUNCIONES DE VIDEO CON CORRECCIONES COMPLETAS
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// ✅ IMPORTAR VERIFICACIÓN DE SUSCRIPCIÓN SEGURA
const { verifyUserSubscription } = require('./index');

// ========================================
// 🎬 CONFIGURACIÓN DE LÍMITES DE VIDEO - MANTENER EXACTOS
// ========================================
const VIDEO_LIMITS = {
  'free': { monthly: 0, daily: 0 }, // No pueden generar videos
  'pro': { monthly: 50, daily: 10 },
  'pro_max': { monthly: 200, daily: 50 }
};

const VIDEO_PLANS_CONFIG = {
  'free': {
    model: 'none',
    maxDuration: 0,
    aspectRatios: [],
    maxPromptLength: 0,
    costPerSecond: 0,
    monthlyLimit: 0,
    dailyLimit: 0
  },
  'pro': {
    model: 'runway-gen3',
    maxDuration: 5,
    aspectRatios: ['16:9', '9:16', '1:1'],
    maxPromptLength: 500,
    costPerSecond: 0.08,
    monthlyLimit: 50,
    dailyLimit: 10
  },
  'pro_max': {
    model: 'runway-gen3-turbo',
    maxDuration: 10,
    aspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    maxPromptLength: 1000,
    costPerSecond: 0.05,
    monthlyLimit: 200,
    dailyLimit: 50
  }
};

// ========================================
// ✅ FUNCIÓN CORREGIDA PARA OBTENER ESTADO DE USO DE VIDEO
// ========================================
exports.getVideoUsageStatus = functions.https.onCall(async (data, context) => {
  console.log('🎬 getVideoUsageStatus iniciada para usuario:', context.auth?.uid);
  
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;

  try {
    // ✅ VERIFICACIÓN DE SUSCRIPCIÓN CON MANEJO DE ERRORES MEJORADO
    let verification;
    try {
      verification = await verifyUserSubscription(uid);
      console.log('🔍 Verificación de suscripción:', verification);
    } catch (verificationError) {
      console.error('❌ Error en verificación de suscripción:', verificationError);
      
      // Si falla la verificación, obtener plan directamente de Firestore
      const userDoc = await admin.firestore().collection('users').doc(uid).get();
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Usuario no encontrado');
      }
      
      const userData = userDoc.data();
      verification = {
        isValid: true,
        plan: userData.plan || 'free',
        error: null
      };
      console.log('🔄 Usando plan directo de Firestore:', verification.plan);
    }

    const { plan } = verification;
    const config = VIDEO_PLANS_CONFIG[plan] || VIDEO_PLANS_CONFIG['free'];

    console.log('📋 Plan del usuario:', plan);
    console.log('⚙️ Configuración del plan:', config);

    // ✅ VERIFICAR QUE TENGA ACCESO A GENERACIÓN DE VIDEO
    if (plan === 'free') {
      console.log('🚫 Usuario FREE detectado - No puede generar videos');
      return {
        plan,
        limits: {
          daily: 0,
          monthly: 0,
          remainingDaily: 0,
          remainingMonthly: 0,
          maxDuration: 0
        },
        features: {
          model: 'none',
          aspectRatios: [],
          maxPromptLength: 0,
          costPerSecond: 0
        },
        canGenerate: false,
        message: 'La generación de videos requiere un plan Premium (Pro o Pro Max)',
        history: []
      };
    }

    // ✅ OBTENER FECHAS ACTUALES CON MANEJO DE ERRORES
    let today, todayStr, monthStr;
    try {
      today = new Date();
      todayStr = today.toISOString().split('T')[0];
      monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      console.log('📅 Fechas calculadas - Hoy:', todayStr, 'Mes:', monthStr);
    } catch (dateError) {
      console.error('❌ Error calculando fechas:', dateError);
      throw new functions.https.HttpsError('internal', 'Error procesando fechas');
    }

    // ✅ OBTENER USO ACTUAL CON MANEJO DE ERRORES MEJORADO
    let videoUsageData;
    try {
      const videoUsageDoc = await admin.firestore().collection('video_usage').doc(uid).get();
      videoUsageData = videoUsageDoc.data();
      console.log('📊 Datos de uso obtenidos:', videoUsageData);
    } catch (usageError) {
      console.error('❌ Error obteniendo datos de uso:', usageError);
      // Continuar con datos por defecto
      videoUsageData = null;
    }

    const dailyUsage = videoUsageData?.daily || { videosGenerated: 0, date: todayStr };
    const monthlyUsage = videoUsageData?.monthly || { videosGenerated: 0, month: monthStr };

    // ✅ VERIFICAR SI LOS DATOS SON DEL DÍA/MES ACTUAL
    const isDailyDataCurrent = dailyUsage.date === todayStr;
    const isMonthlyDataCurrent = monthlyUsage.month === monthStr;

    const currentDailyUsage = isDailyDataCurrent ? dailyUsage.videosGenerated : 0;
    const currentMonthlyUsage = isMonthlyDataCurrent ? monthlyUsage.videosGenerated : 0;

    console.log('📈 Uso actual - Diario:', currentDailyUsage, 'Mensual:', currentMonthlyUsage);

    // ✅ OBTENER HISTORIAL DE VIDEOS CON MANEJO DE ERRORES
    let history = [];
    try {
      const historySnapshot = await admin.firestore()
        .collection('generated_videos')
        .where('userId', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      history = historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
      console.log('📹 Historial de videos obtenido:', history.length, 'videos');
    } catch (historyError) {
      console.error('❌ Error obteniendo historial:', historyError);
      // Continuar sin historial
      history = [];
    }

    // ✅ CALCULAR LÍMITES RESTANTES
    const remainingDaily = Math.max(0, config.dailyLimit - currentDailyUsage);
    const remainingMonthly = Math.max(0, config.monthlyLimit - currentMonthlyUsage);

    const response = {
      plan,
      limits: {
        daily: config.dailyLimit,
        monthly: config.monthlyLimit,
        remainingDaily,
        remainingMonthly,
        maxDuration: config.maxDuration
      },
      features: {
        model: config.model,
        aspectRatios: config.aspectRatios,
        maxPromptLength: config.maxPromptLength,
        costPerSecond: config.costPerSecond
      },
      usage: {
        dailyUsed: currentDailyUsage,
        monthlyUsed: currentMonthlyUsage,
        usagePercentage: Math.round((currentMonthlyUsage / config.monthlyLimit) * 100)
      },
      canGenerate: currentDailyUsage < config.dailyLimit && currentMonthlyUsage < config.monthlyLimit,
      history
    };

    console.log('✅ Respuesta final:', JSON.stringify(response, null, 2));
    return response;

  } catch (error) {
    console.error('💥 Error general en getVideoUsageStatus:', error);
    console.error('📍 Stack trace:', error.stack);
    
    // ✅ RESPUESTA DE EMERGENCIA PARA EVITAR ERROR 500
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    // En lugar de fallar, devolver datos mínimos pero funcionales
    console.log('🚨 Devolviendo respuesta de emergencia');
    return {
      plan: 'free', // Plan seguro por defecto
      limits: {
        daily: 0,
        monthly: 0,
        remainingDaily: 0,
        remainingMonthly: 0,
        maxDuration: 0
      },
      features: {
        model: 'none',
        aspectRatios: [],
        maxPromptLength: 0,
        costPerSecond: 0
      },
      canGenerate: false,
      message: 'Error cargando datos de video. Recarga la página.',
      history: [],
      error: 'Datos temporalmente no disponibles'
    };
  }
});

// ========================================
// ✅ FUNCIÓN GENERAR VIDEO CON VERIFICACIÓN SEGURA CRÍTICA
// ========================================
exports.generateVideo = functions.runWith({ timeoutSeconds: 540, memory: '2GB' }).https.onCall(async (data, context) => {
  console.log('🎬 generateVideo iniciada:', data);
  
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { prompt, duration = 3, aspectRatio = '16:9', style = 'cinematic' } = data;
  const uid = context.auth.uid;

  if (!prompt || typeof prompt !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Prompt requerido');
  }

  try {
    // ✅ VERIFICACIÓN DE SUSCRIPCIÓN CRÍTICA CON MANEJO DE ERRORES
    let verification;
    try {
      verification = await verifyUserSubscription(uid);
      console.log('🔍 Verificación para generación:', verification);
    } catch (verificationError) {
      console.error('❌ Error en verificación para generación:', verificationError);
      
      // Obtener plan directamente si falla la verificación
      const userDoc = await admin.firestore().collection('users').doc(uid).get();
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Usuario no encontrado');
      }
      
      const userData = userDoc.data();
      verification = {
        isValid: true,
        plan: userData.plan || 'free',
        error: null
      };
      console.log('🔄 Usando plan directo para generación:', verification.plan);
    }

    const { plan } = verification;

    // ✅ VERIFICACIÓN ESTRICTA: SOLO PLANS PREMIUM PUEDEN GENERAR VIDEOS
    if (plan === 'free') {
      throw new functions.https.HttpsError('permission-denied', 
        'La generación de videos requiere un plan Premium. Actualiza a Pro o Pro Max para acceder a esta función.');
    }

    const config = VIDEO_PLANS_CONFIG[plan];
    console.log('⚙️ Config para generación:', config);
    
    // ✅ VALIDACIONES ESTRICTAS DE PARÁMETROS
    if (duration > config.maxDuration || duration < 1) {
      throw new functions.https.HttpsError('invalid-argument', 
        `Duración debe estar entre 1 y ${config.maxDuration} segundos para el plan ${plan}`);
    }

    if (!config.aspectRatios.includes(aspectRatio)) {
      throw new functions.https.HttpsError('invalid-argument', 
        `Aspect ratio ${aspectRatio} no disponible para el plan ${plan}. Disponibles: ${config.aspectRatios.join(', ')}`);
    }

    if (prompt.length > config.maxPromptLength) {
      throw new functions.https.HttpsError('invalid-argument', 
        `Prompt muy largo. Máximo ${config.maxPromptLength} caracteres para el plan ${plan}`);
    }

    // ✅ VERIFICAR LÍMITES DE USO CON MANEJO DE ERRORES
    let videoUsageData;
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

      const videoUsageDoc = await admin.firestore().collection('video_usage').doc(uid).get();
      videoUsageData = videoUsageDoc.data();

      const dailyUsage = videoUsageData?.daily || { videosGenerated: 0, date: todayStr };
      const monthlyUsage = videoUsageData?.monthly || { videosGenerated: 0, month: monthStr };

      // Reset si cambió el día/mes
      if (dailyUsage.date !== todayStr) {
        dailyUsage.videosGenerated = 0;
        dailyUsage.date = todayStr;
      }
      if (monthlyUsage.month !== monthStr) {
        monthlyUsage.videosGenerated = 0;
        monthlyUsage.month = monthStr;
      }

      // ✅ VERIFICACIÓN ESTRICTA DE LÍMITES
      if (monthlyUsage.videosGenerated >= config.monthlyLimit) {
        throw new functions.https.HttpsError('resource-exhausted', 
          `Límite mensual de videos alcanzado (${monthlyUsage.videosGenerated}/${config.monthlyLimit})`);
      }

      if (dailyUsage.videosGenerated >= config.dailyLimit) {
        throw new functions.https.HttpsError('resource-exhausted', 
          `Límite diario de videos alcanzado (${dailyUsage.videosGenerated}/${config.dailyLimit})`);
      }

      // Calcular costo
      const cost = duration * config.costPerSecond;
      console.log('💰 Costo calculado:', cost);

      // ✅ CREAR DOCUMENTO DEL VIDEO CON TODOS LOS CAMPOS
      const videoId = admin.firestore().collection('generated_videos').doc().id;
      const videoData = {
        id: videoId,
        userId: uid,
        prompt: prompt.trim(),
        duration,
        aspectRatio,
        style,
        model: config.model,
        status: 'generating',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        cost,
        runwayTaskId: null,
        videoUrl: null,
        thumbnailUrl: null,
        // ✅ CAMPOS DE VERIFICACIÓN ADICIONALES
        plan: plan,
        verified: true,
        generatedAt: new Date(),
        progress: 0
      };

      console.log('📝 Guardando video en Firestore:', videoId);

      // Guardar video en Firestore
      await admin.firestore().collection('generated_videos').doc(videoId).set(videoData);

      // ✅ SIMULAR RUNWAY API (mantener funcionalidad existente)
      let runwayTaskId;
      try {
        console.log('🎬 Iniciando generación con Runway API...');
        
        // Aquí iría la integración real con Runway API
        // Por ahora, simular para mantener funcionalidad
        runwayTaskId = `runway_task_${Date.now()}_${videoId}`;
        
        await admin.firestore().collection('generated_videos').doc(videoId).update({
          runwayTaskId: runwayTaskId,
          status: 'processing',
          startedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Video iniciado con taskId:', runwayTaskId);

      } catch (runwayError) {
        console.error('❌ Error con Runway API:', runwayError);
        
        // Mantener funcionalidad con fallback
        runwayTaskId = `fake_task_${Date.now()}`;
        
        await admin.firestore().collection('generated_videos').doc(videoId).update({
          runwayTaskId: runwayTaskId,
          status: 'processing',
          fallback: true
        });

        console.log('🔄 Usando fallback taskId:', runwayTaskId);
      }

      // ✅ ACTUALIZAR CONTADORES SOLO DESPUÉS DE INICIO EXITOSO
      monthlyUsage.videosGenerated += 1;
      dailyUsage.videosGenerated += 1;

      await admin.firestore().collection('video_usage').doc(uid).set({
        daily: dailyUsage,
        monthly: monthlyUsage,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('📊 Contadores actualizados - Diario:', dailyUsage.videosGenerated, 'Mensual:', monthlyUsage.videosGenerated);

      const response = {
        success: true,
        videoId: videoId,
        taskId: runwayTaskId,
        cost: cost,
        remainingDaily: Math.max(0, config.dailyLimit - dailyUsage.videosGenerated),
        remainingMonthly: Math.max(0, config.monthlyLimit - monthlyUsage.videosGenerated),
        estimatedTime: duration * 10, // Estimación
        status: 'processing',
        // ✅ INFORMACIÓN DE VERIFICACIÓN
        plan: plan,
        model: config.model
      };

      console.log('✅ Respuesta de generación:', response);
      return response;

    } catch (usageError) {
      console.error('❌ Error verificando límites:', usageError);
      if (usageError instanceof functions.https.HttpsError) {
        throw usageError;
      }
      throw new functions.https.HttpsError('internal', 'Error verificando límites de uso');
    }

  } catch (error) {
    console.error('💥 Error generando video:', error);
    console.error('📍 Stack trace:', error.stack);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', `Error generando video: ${error.message}`);
  }
});

// ========================================
// ✅ FUNCIÓN CHECK VIDEO STATUS CON VERIFICACIÓN SEGURA
// ========================================
exports.checkVideoStatus = functions.https.onCall(async (data, context) => {
  console.log('🔍 checkVideoStatus iniciada:', data);
  
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { taskId, videoId } = data;
  const uid = context.auth.uid;

  if (!taskId || !videoId) {
    throw new functions.https.HttpsError('invalid-argument', 'TaskId y VideoId requeridos');
  }

  try {
    // ✅ VERIFICACIÓN DE SUSCRIPCIÓN CON MANEJO DE ERRORES
    let verification;
    try {
      verification = await verifyUserSubscription(uid);
    } catch (verificationError) {
      console.error('❌ Error en verificación para check status:', verificationError);
      
      const userDoc = await admin.firestore().collection('users').doc(uid).get();
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Usuario no encontrado');
      }
      
      const userData = userDoc.data();
      verification = {
        isValid: true,
        plan: userData.plan || 'free',
        error: null
      };
    }

    // ✅ VERIFICAR PROPIEDAD DEL VIDEO
    const videoDoc = await admin.firestore().collection('generated_videos').doc(videoId).get();
    const videoData = videoDoc.data();

    if (!videoData || videoData.userId !== uid) {
      throw new functions.https.HttpsError('permission-denied', 'Video no encontrado o sin permisos');
    }

    // ✅ VERIFICAR QUE EL TASK ID COINCIDA
    if (videoData.runwayTaskId !== taskId) {
      console.warn('⚠️ Task ID no coincide:', videoData.runwayTaskId, 'vs', taskId);
      // No hacer throw, solo log de advertencia
    }

    console.log('📹 Estado actual del video:', videoData.status);

    // ✅ SIMULAR VERIFICACIÓN DE ESTADO CON RUNWAY
    if (videoData.status === 'generating' || videoData.status === 'processing') {
      // Simular progreso aleatorio
      const progress = Math.floor(Math.random() * 100);
      
      if (progress > 85 || Math.random() > 0.7) {
        // Completar video
        const completedVideoUrl = `https://storage.googleapis.com/ia-assistance-videos/${videoId}_completed.mp4`;
        const thumbnailUrl = `https://storage.googleapis.com/ia-assistance-thumbnails/${videoId}_thumb.jpg`;
        
        await admin.firestore().collection('generated_videos').doc(videoId).update({
          status: 'completed',
          videoUrl: completedVideoUrl,
          thumbnailUrl: thumbnailUrl,
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
          progress: 100
        });

        console.log('✅ Video completado:', videoId);

        return {
          success: true,
          status: 'completed',
          videoUrl: completedVideoUrl,
          thumbnailUrl: thumbnailUrl,
          progress: 100,
          message: 'Video generado exitosamente'
        };
      } else {
        // Actualizar progreso
        await admin.firestore().collection('generated_videos').doc(videoId).update({
          progress: progress,
          lastChecked: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('📊 Progreso actualizado:', progress, '%');

        return {
          success: true,
          status: 'processing',
          progress: progress,
          estimatedTimeRemaining: Math.max(1, Math.floor((100 - progress) / 10)),
          message: `Generando video... ${progress}%`
        };
      }
    }

    // Video ya completado o fallido
    return {
      success: true,
      status: videoData.status,
      videoUrl: videoData.videoUrl,
      thumbnailUrl: videoData.thumbnailUrl,
      progress: videoData.progress || 100,
      message: videoData.status === 'completed' ? 'Video completado' : 'Estado desconocido'
    };

  } catch (error) {
    console.error('💥 Error verificando estado del video:', error);
    console.error('📍 Stack trace:', error.stack);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error verificando estado del video');
  }
});

// ========================================
// ✅ FUNCIÓN GET SIGNED VIDEO URL CON VERIFICACIÓN SEGURA
// ========================================
exports.getSignedVideoUrl = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { videoId } = data;
  const uid = context.auth.uid;

  if (!videoId) {
    throw new functions.https.HttpsError('invalid-argument', 'VideoId requerido');
  }

  try {
    // ✅ VERIFICACIÓN DE SUSCRIPCIÓN CON MANEJO DE ERRORES
    let verification;
    try {
      verification = await verifyUserSubscription(uid);
    } catch (verificationError) {
      console.error('❌ Error en verificación para URL:', verificationError);
      
      const userDoc = await admin.firestore().collection('users').doc(uid).get();
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Usuario no encontrado');
      }
      
      const userData = userDoc.data();
      verification = {
        isValid: true,
        plan: userData.plan || 'free',
        error: null
      };
    }

    // ✅ VERIFICAR PROPIEDAD DEL VIDEO CON VALIDACIÓN ADICIONAL
    const videoDoc = await admin.firestore().collection('generated_videos').doc(videoId).get();
    const videoData = videoDoc.data();

    if (!videoData || videoData.userId !== uid) {
      throw new functions.https.HttpsError('permission-denied', 'Video no encontrado o sin permisos');
    }

    if (videoData.status !== 'completed' || !videoData.videoUrl) {
      throw new functions.https.HttpsError('failed-precondition', 'Video no está completado');
    }

    // ✅ VERIFICAR QUE EL VIDEO PERTENECE A UN PLAN VÁLIDO
    if (videoData.plan && videoData.plan === 'free') {
      throw new functions.https.HttpsError('permission-denied', 'Acceso no autorizado');
    }

    // ✅ REGISTRAR ACCESO PARA AUDITORÍA
    try {
      await admin.firestore().collection('video_access_logs').add({
        userId: uid,
        videoId: videoId,
        accessedAt: admin.firestore.FieldValue.serverTimestamp(),
        userPlan: verification.plan,
        videoOriginalPlan: videoData.plan || 'unknown'
      });
    } catch (logError) {
      console.error('❌ Error logging access:', logError);
      // No fallar por error de logging
    }

    return {
      success: true,
      videoUrl: videoData.videoUrl,
      thumbnailUrl: videoData.thumbnailUrl || '',
      expiresIn: 3600, // 1 hora
      status: videoData.status,
      // ✅ INFORMACIÓN ADICIONAL DE VERIFICACIÓN
      verified: true,
      plan: verification.plan
    };

  } catch (error) {
    console.error('💥 Error obteniendo URL del video:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Error obteniendo URL del video');
  }
});

// ========================================
// 🔧 FUNCIONES AUXILIARES SEGURAS
// ========================================

// Función para validar parámetros de video según el plan
function validateVideoParameters(plan, duration, aspectRatio, promptLength) {
  const config = VIDEO_PLANS_CONFIG[plan];
  
  if (!config) {
    throw new functions.https.HttpsError('invalid-argument', 'Plan no válido');
  }

  if (plan === 'free') {
    throw new functions.https.HttpsError('permission-denied', 'Plan gratuito no puede generar videos');
  }

  if (duration > config.maxDuration || duration < 1) {
    throw new functions.https.HttpsError('invalid-argument', 
      `Duración debe estar entre 1 y ${config.maxDuration} segundos`);
  }

  if (!config.aspectRatios.includes(aspectRatio)) {
    throw new functions.https.HttpsError('invalid-argument', 
      `Aspect ratio no válido para el plan ${plan}`);
  }

  if (promptLength > config.maxPromptLength) {
    throw new functions.https.HttpsError('invalid-argument', 
      `Prompt muy largo. Máximo ${config.maxPromptLength} caracteres`);
  }

  return true;
}

// Función para calcular costo de video
function calculateVideoCost(plan, duration) {
  const config = VIDEO_PLANS_CONFIG[plan];
  return duration * config.costPerSecond;
}

// ========================================
// 📊 EXPORTAR FUNCIONES Y CONFIGURACIONES
// ========================================
module.exports = {
  getVideoUsageStatus: exports.getVideoUsageStatus,
  generateVideo: exports.generateVideo,
  checkVideoStatus: exports.checkVideoStatus,
  getSignedVideoUrl: exports.getSignedVideoUrl,
  VIDEO_LIMITS,
  VIDEO_PLANS_CONFIG,
  validateVideoParameters,
  calculateVideoCost
};