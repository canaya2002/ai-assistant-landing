// functions/userPreferences.js - SISTEMA DE PREFERENCIAS (VERSIÓN CORREGIDA)
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// ========================================
// 💾 GUARDAR PREFERENCIAS DEL USUARIO
// ========================================
exports.saveUserPreferences = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  try {
    const uid = context.auth.uid;
    const { preferences } = data;

    if (!preferences) {
      throw new functions.https.HttpsError('invalid-argument', 'Preferencias requeridas');
    }

    const userPrefsRef = admin.firestore().collection('user_preferences').doc(uid);
    
    await userPrefsRef.set({
      ...preferences,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      uid
    }, { merge: true });

    return { 
      success: true, 
      message: 'Preferencias guardadas correctamente' 
    };
  } catch (error) {
    console.error('Error guardando preferencias:', error);
    throw new functions.https.HttpsError('internal', 'Error guardando preferencias');
  }
});

// ========================================
// 📖 OBTENER PREFERENCIAS DEL USUARIO
// ========================================
exports.getUserPreferences = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  try {
    const uid = context.auth.uid;
    const userPrefsRef = admin.firestore().collection('user_preferences').doc(uid);
    const doc = await userPrefsRef.get();

    if (!doc.exists) {
      const defaultPrefs = {
        uid,
        preferences: {
          responseStyle: 'balanced',
          detailLevel: 'medium',
          codeLanguagePreferences: [],
          theme: 'dark',
          language: 'es',
          enableWebSearch: true,
          enableDeepThinking: false,
          notificationPreferences: {
            newFeatures: true,
            updates: true,
            tips: true
          }
        },
        activeProjects: [],
        frequentCommands: [],
        lastSession: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await userPrefsRef.set(defaultPrefs);
      return defaultPrefs;
    }

    return doc.data();
  } catch (error) {
    console.error('Error obteniendo preferencias:', error);
    throw new functions.https.HttpsError('internal', 'Error obteniendo preferencias');
  }
});

// ========================================
// 📄 ACTUALIZAR SESIÓN
// ========================================
exports.updateLastSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  try {
    const uid = context.auth.uid;
    const { conversationId, lastMessage, context: sessionContext } = data;

    if (!conversationId) {
      throw new functions.https.HttpsError('invalid-argument', 'ID de conversación requerido');
    }

    const userPrefsRef = admin.firestore().collection('user_preferences').doc(uid);
    
    // ✅ SOLUCIÓN: Usar Date.now() para timestamps que retornamos
    const now = Date.now();
    
    const lastSession = {
      conversationId,
      lastMessage: lastMessage || '',
      context: sessionContext || '',
      updatedAt: now // ✅ Timestamp serializable
    };

    // Guardar en Firestore con serverTimestamp para el campo principal
    await userPrefsRef.set({
      uid,
      lastSession: {
        ...lastSession,
        updatedAt: admin.firestore.FieldValue.serverTimestamp() // Para Firestore
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // ✅ Retornar objeto con timestamp serializable
    return { 
      success: true,
      lastSession: lastSession // Sin FieldValue.serverTimestamp()
    };
  } catch (error) {
    console.error('Error actualizando última sesión:', error);
    throw new functions.https.HttpsError('internal', 'Error actualizando sesión');
  }
});

// ========================================
// 📦 GUARDAR PROYECTO ACTIVO
// ========================================
exports.saveActiveProject = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  try {
    const uid = context.auth.uid;
    const { projectName, projectType, description, tags } = data;

    if (!projectName) {
      throw new functions.https.HttpsError('invalid-argument', 'Nombre de proyecto requerido');
    }

    const userPrefsRef = admin.firestore().collection('user_preferences').doc(uid);
    const doc = await userPrefsRef.get();
    
    const existingProjects = doc.exists ? (doc.data().activeProjects || []) : [];
    const projectIndex = existingProjects.findIndex(p => p.name === projectName);
    
    // ✅ SOLUCIÓN: Usar Date.now() para timestamps serializables
    const now = Date.now();
    
    const project = {
      name: projectName,
      type: projectType || 'general',
      description: description || '',
      tags: tags || [],
      createdAt: projectIndex === -1 ? now : existingProjects[projectIndex].createdAt,
      lastAccessed: now
    };

    if (projectIndex !== -1) {
      existingProjects[projectIndex] = project;
    } else {
      existingProjects.push(project);
    }

    // Guardar en Firestore (aquí SÍ podemos usar serverTimestamp para updatedAt general)
    await userPrefsRef.set({
      uid,
      activeProjects: existingProjects,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // ✅ Retornar proyectos con timestamps serializables
    return { 
      success: true, 
      projects: existingProjects
    };
  } catch (error) {
    console.error('Error guardando proyecto:', error);
    throw new functions.https.HttpsError('internal', 'Error guardando proyecto');
  }
});

// ========================================
// 🗑️ ELIMINAR PROYECTO ACTIVO
// ========================================
exports.removeActiveProject = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  try {
    const uid = context.auth.uid;
    const { projectName } = data;

    if (!projectName) {
      throw new functions.https.HttpsError('invalid-argument', 'Nombre de proyecto requerido');
    }

    const userPrefsRef = admin.firestore().collection('user_preferences').doc(uid);
    const doc = await userPrefsRef.get();
    
    if (!doc.exists) {
      return { success: true, projects: [] };
    }

    const existingProjects = doc.data().activeProjects || [];
    const updatedProjects = existingProjects.filter(p => p.name !== projectName);

    await userPrefsRef.set({
      uid,
      activeProjects: updatedProjects,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { 
      success: true, 
      projects: updatedProjects 
    };
  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    throw new functions.https.HttpsError('internal', 'Error eliminando proyecto');
  }
});

// ========================================
// 🔍 REGISTRAR COMANDO FRECUENTE (CLAVE - CORREGIDO)
// ========================================
exports.recordFrequentCommand = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  try {
    const uid = context.auth.uid;
    const { command, category } = data;

    if (!command) {
      throw new functions.https.HttpsError('invalid-argument', 'Comando requerido');
    }

    const userPrefsRef = admin.firestore().collection('user_preferences').doc(uid);
    const doc = await userPrefsRef.get();
    
    const existingCommands = doc.exists ? (doc.data().frequentCommands || []) : [];
    const commandIndex = existingCommands.findIndex(c => c.command === command);
    
    // ✅ SOLUCIÓN: Usar Date.now() para timestamps serializables
    const now = Date.now();
    
    if (commandIndex !== -1) {
      // Actualizar comando existente
      existingCommands[commandIndex].count += 1;
      existingCommands[commandIndex].lastUsed = now; // ✅ Serializable
    } else {
      // Agregar nuevo comando
      existingCommands.push({
        command,
        category: category || 'general',
        count: 1,
        firstUsed: now, // ✅ Serializable
        lastUsed: now   // ✅ Serializable
      });
    }

    // Ordenar por count (ahora no hay problema porque no hay FieldValue)
    existingCommands.sort((a, b) => b.count - a.count);
    const topCommands = existingCommands.slice(0, 50);

    // Guardar en Firestore
    await userPrefsRef.set({
      uid,
      frequentCommands: topCommands,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`✅ Comando registrado para ${uid}: ${command}`);

    // ✅ SOLUCIÓN: Retornar array sin FieldValue
    return { 
      success: true, 
      commands: topCommands
    };
  } catch (error) {
    console.error('❌ Error registrando comando:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw new functions.https.HttpsError('internal', `Error registrando comando: ${error.message}`);
  }
});

// ========================================
// 📜 OBTENER COMANDOS FRECUENTES
// ========================================
exports.getFrequentCommands = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  try {
    const uid = context.auth.uid;
    const { limit = 20 } = data;

    const userPrefsRef = admin.firestore().collection('user_preferences').doc(uid);
    const doc = await userPrefsRef.get();
    
    if (!doc.exists) {
      return { commands: [] };
    }

    const frequentCommands = doc.data().frequentCommands || [];
    
    return { 
      commands: frequentCommands.slice(0, limit) 
    };
  } catch (error) {
    console.error('Error obteniendo comandos frecuentes:', error);
    throw new functions.https.HttpsError('internal', 'Error obteniendo comandos frecuentes');
  }
});