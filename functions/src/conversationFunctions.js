// functions/conversationFunctions.js - FUNCIONES PARA GESTIÓN DE CONVERSACIONES
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// ========================================
// 📊 LÍMITES DE CONVERSACIÓN POR PLAN
// ========================================
const MESSAGE_LIMITS = {
  'free': 50,
  'pro': 300,
  'pro_max': 300
};

const CONVERSATION_LIMITS = {
  'free': 100,
  'pro': 500,
  'pro_max': 1000
};

// ========================================
// ✅ FUNCIÓN: VALIDAR LÍMITES DE CONVERSACIÓN
// ========================================
exports.validateConversationLimits = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;

  try {
    // Obtener plan del usuario
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Usuario no encontrado');
    }

    const userPlan = userDoc.data().plan || 'free';

    // Contar conversaciones del usuario
    const conversationsSnapshot = await admin.firestore()
      .collection('conversations')
      .where('userId', '==', uid)
      .where('isArchived', '==', false)
      .get();

    const conversationCount = conversationsSnapshot.size;
    const conversationLimit = CONVERSATION_LIMITS[userPlan];
    const messageLimit = MESSAGE_LIMITS[userPlan];

    return {
      success: true,
      plan: userPlan,
      conversations: {
        current: conversationCount,
        limit: conversationLimit,
        remaining: Math.max(0, conversationLimit - conversationCount),
        canCreate: conversationCount < conversationLimit
      },
      messages: {
        limit: messageLimit
      }
    };
  } catch (error) {
    console.error('Error validando límites:', error);
    throw new functions.https.HttpsError('internal', 'Error validando límites');
  }
});

// ========================================
// 📈 FUNCIÓN: OBTENER ESTADÍSTICAS DE USUARIO
// ========================================
exports.getUserConversationStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;

  try {
    const conversationsSnapshot = await admin.firestore()
      .collection('conversations')
      .where('userId', '==', uid)
      .get();

    let totalMessages = 0;
    let totalConversations = 0;
    let activeConversations = 0;
    let archivedConversations = 0;

    conversationsSnapshot.forEach(doc => {
      const data = doc.data();
      totalConversations++;
      totalMessages += data.messageCount || 0;
      
      if (data.isArchived) {
        archivedConversations++;
      } else {
        activeConversations++;
      }
    });

    return {
      success: true,
      stats: {
        totalConversations,
        activeConversations,
        archivedConversations,
        totalMessages,
        avgMessagesPerConversation: totalConversations > 0 
          ? Math.round(totalMessages / totalConversations) 
          : 0
      }
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw new functions.https.HttpsError('internal', 'Error obteniendo estadísticas');
  }
});

// ========================================
// 🗑️ FUNCIÓN: LIMPIEZA AUTOMÁTICA (SCHEDULED)
// ========================================
exports.cleanOldConversations = functions.pubsub
  .schedule('0 2 * * 0') // Cada domingo a las 2 AM
  .timeZone('America/Mexico_City')
  .onRun(async (context) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 días

    try {
      const oldConversationsSnapshot = await admin.firestore()
        .collection('conversations')
        .where('updatedAt', '<', admin.firestore.Timestamp.fromDate(cutoffDate))
        .where('isArchived', '==', true)
        .get();

      const batch = admin.firestore().batch();
      let deletedCount = 0;

      oldConversationsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
        deletedCount++;
      });

      if (deletedCount > 0) {
        await batch.commit();
        console.log(`✅ ${deletedCount} conversaciones antiguas eliminadas`);
      }

      return { success: true, deleted: deletedCount };
    } catch (error) {
      console.error('❌ Error en limpieza automática:', error);
      return { success: false, error: error.message };
    }
  });

// ========================================
// 📝 FUNCIÓN: GUARDAR METADATOS (OPCIONAL)
// ========================================
exports.saveConversationMetadata = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const {
    userId,
    conversationId,
    title,
    messageCount,
    lastActivity,
    tags
  } = data;

  // Validar que el usuario solo guarde sus propios metadatos
  if (context.auth.uid !== userId) {
    throw new functions.https.HttpsError('permission-denied', 'No autorizado');
  }

  try {
    await admin.firestore()
      .collection('conversation_metadata')
      .doc(conversationId)
      .set({
        userId,
        conversationId,
        title,
        messageCount,
        lastActivity: admin.firestore.Timestamp.fromDate(new Date(lastActivity)),
        tags: tags || [],
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error guardando metadatos:', error);
    throw new functions.https.HttpsError('internal', 'Error guardando metadatos');
  }
});

// ========================================
// 🔍 FUNCIÓN: BUSCAR CONVERSACIONES
// ========================================
exports.searchConversations = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { query, limit = 10 } = data;
  const uid = context.auth.uid;

  try {
    // Búsqueda simple por título (para búsqueda avanzada usar Algolia o Elasticsearch)
    const conversationsSnapshot = await admin.firestore()
      .collection('conversations')
      .where('userId', '==', uid)
      .orderBy('updatedAt', 'desc')
      .limit(limit)
      .get();

    const results = [];
    conversationsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Filtrar por query en el título
      if (!query || data.title.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          id: doc.id,
          title: data.title,
          messageCount: data.messageCount,
          updatedAt: data.updatedAt?.toDate().toISOString(),
          preview: data.messages[data.messages.length - 1]?.message?.substring(0, 100)
        });
      }
    });

    return {
      success: true,
      results,
      count: results.length
    };
  } catch (error) {
    console.error('Error buscando conversaciones:', error);
    throw new functions.https.HttpsError('internal', 'Error en búsqueda');
  }
});

// ========================================
// 📤 FUNCIÓN: EXPORTAR CONVERSACIONES
// ========================================
exports.exportUserConversations = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const uid = context.auth.uid;
  const { includeArchived = false } = data;

  try {
    let query = admin.firestore()
      .collection('conversations')
      .where('userId', '==', uid);

    if (!includeArchived) {
      query = query.where('isArchived', '==', false);
    }

    const conversationsSnapshot = await query.get();
    const conversations = [];

    conversationsSnapshot.forEach(doc => {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        title: data.title,
        messages: data.messages,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
        messageCount: data.messageCount,
        tags: data.tags
      });
    });

    return {
      success: true,
      conversations,
      count: conversations.length,
      exportedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error exportando conversaciones:', error);
    throw new functions.https.HttpsError('internal', 'Error exportando');
  }
});

// ========================================
// 🔄 FUNCIÓN: MIGRAR DE LOCALSTORAGE
// ========================================
exports.migrateFromLocalStorage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { conversations } = data;
  const uid = context.auth.uid;

  if (!Array.isArray(conversations)) {
    throw new functions.https.HttpsError('invalid-argument', 'Datos inválidos');
  }

  try {
    const batch = admin.firestore().batch();
    let migratedCount = 0;

    for (const conv of conversations) {
      // Validar que pertenezca al usuario
      if (conv.userId !== uid) {
        continue;
      }

      const conversationRef = admin.firestore()
        .collection('conversations')
        .doc(conv.id);

      batch.set(conversationRef, {
        ...conv,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(conv.createdAt)),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date(conv.updatedAt)),
        lastActivity: admin.firestore.Timestamp.fromDate(new Date(conv.lastActivity || conv.updatedAt)),
        migratedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      migratedCount++;
    }

    if (migratedCount > 0) {
      await batch.commit();
    }

    return {
      success: true,
      migrated: migratedCount,
      message: `${migratedCount} conversaciones migradas exitosamente`
    };
  } catch (error) {
    console.error('Error en migración:', error);
    throw new functions.https.HttpsError('internal', 'Error migrando datos');
  }
});

// ========================================
// 🔒 FUNCIÓN: ARCHIVAR MÚLTIPLES CONVERSACIONES
// ========================================
exports.bulkArchiveConversations = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { conversationIds } = data;
  const uid = context.auth.uid;

  if (!Array.isArray(conversationIds) || conversationIds.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'IDs inválidos');
  }

  try {
    const batch = admin.firestore().batch();

    for (const conversationId of conversationIds) {
      const conversationRef = admin.firestore()
        .collection('conversations')
        .doc(conversationId);

      const conversationDoc = await conversationRef.get();
      
      // Verificar que pertenezca al usuario
      if (conversationDoc.exists && conversationDoc.data().userId === uid) {
        batch.update(conversationRef, {
          isArchived: true,
          archivedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    await batch.commit();

    return {
      success: true,
      archived: conversationIds.length
    };
  } catch (error) {
    console.error('Error archivando conversaciones:', error);
    throw new functions.https.HttpsError('internal', 'Error archivando');
  }
});

module.exports = {
  validateConversationLimits: exports.validateConversationLimits,
  getUserConversationStats: exports.getUserConversationStats,
  cleanOldConversations: exports.cleanOldConversations,
  saveConversationMetadata: exports.saveConversationMetadata,
  searchConversations: exports.searchConversations,
  exportUserConversations: exports.exportUserConversations,
  migrateFromLocalStorage: exports.migrateFromLocalStorage,
  bulkArchiveConversations: exports.bulkArchiveConversations
};