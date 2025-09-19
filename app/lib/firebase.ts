// lib/firebase.ts - FIREBASE COMPLETO CORREGIDO
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';

// Importar todos los tipos necesarios
import type {
  ChatWithAIInput,
  ChatWithAIOutput,
  GenerateImageInput,
  GenerateImageOutput,
  GetImageUsageStatusOutput,
  GenerateVideoInput,
  GenerateVideoOutput,
  GetVideoUsageStatusOutput,
  CheckVideoStatusInput,
  CheckVideoStatusOutput,
  CreateStripeCheckoutInput,
  CreateStripeCheckoutOutput,
  ManageSubscriptionOutput,
  ConversationMetadataInput,
  UserProfile,
  PlanType,
  // NUEVOS TIPOS PARA MODOS ESPECIALIZADOS
  SpecialistModeLimits,
  DeveloperModeChatInput,
  DeveloperModeChatOutput,
  SpecialistModeChatInput,
  SpecialistModeChatOutput
} from './types';

// ConfiguraciÃ³n de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Conectar a emuladores SOLO si estÃ¡n especÃ­ficamente habilitados
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  const hostname = 'localhost';
  
  console.log('ðŸ”§ Connecting to Firebase Emulators...');
  
  try {
    if (!(auth as any)._config?.emulator) {
      connectAuthEmulator(auth, `http://${hostname}:9099`);
      console.log('âœ… Auth Emulator connected');
    }
  } catch (e) {
    console.warn('Auth Emulator connection failed:', e);
  }
  
  try {
    if (!(db as any)._delegate?._databaseId?.projectId.includes('demo-')) {
      connectFirestoreEmulator(db, hostname, 8080);
      console.log('âœ… Firestore Emulator connected');
    }
  } catch (e) {
    console.warn('Firestore Emulator connection failed:', e);
  }
  
  try {
    if (!storage.app.options.projectId?.includes('demo-')) {
      connectStorageEmulator(storage, hostname, 9199);
      console.log('âœ… Storage Emulator connected');
    }
  } catch (e) {
    console.warn('Storage Emulator connection failed:', e);
  }
  
  try {
    if (!(functions as any)._delegate?.region) {
      connectFunctionsEmulator(functions, hostname, 5001);
      console.log('âœ… Functions Emulator connected');
    }
  } catch (e) {
    console.warn('Functions Emulator connection failed:', e);
  }
} else {
  console.log('ðŸ”¥ Using Firebase Production Services');
}

// ========================================
// ðŸ” FUNCIONES DE AUTENTICACIÃ“N
// ========================================
export const authFunctions = {
  // Registro de usuario
  async signUp(email: string, password: string, name: string) {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Actualizar perfil con nombre
      await updateProfile(user, { displayName: name });
      
      // Crear documento de usuario en Firestore
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: name,
        plan: 'free',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return userCredential;
    } catch (error: unknown) {
      console.error('Error en signUp:', error);
      throw error;
    }
  },

  // Inicio de sesiÃ³n
  async signIn(email: string, password: string) {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: unknown) {
      console.error('Error en signIn:', error);
      throw error;
    }
  },

  // Inicio de sesiÃ³n con Google
  async signInWithGoogle() {
    const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Crear o actualizar documento de usuario
      const { doc, setDoc, getDoc } = await import('firebase/firestore');
      const userDoc = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userDoc);
      
      if (!userSnapshot.exists()) {
        await setDoc(userDoc, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email?.split('@')[0] || '',
          plan: 'free',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      return result;
    } catch (error: unknown) {
      console.error('Error en signInWithGoogle:', error);
      throw error;
    }
  },

  // Restablecer contraseÃ±a
  async resetPassword(email: string) {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      console.error('Error en resetPassword:', error);
      throw error;
    }
  },

  // Cerrar sesiÃ³n
  async signOut() {
    const { signOut } = await import('firebase/auth');
    
    try {
      await signOut(auth);
    } catch (error: unknown) {
      console.error('Error en signOut:', error);
      throw error;
    }
  }
};

// ========================================
// ðŸ“ž CLOUD FUNCTIONS - TODAS LAS FUNCIONES
// ========================================
export const cloudFunctions = {
  // ========================================
  // FUNCIONES BÃSICAS (EXISTENTES)
  // ========================================
  getUserProfile: httpsCallable<{}, UserProfile>(functions, 'getUserProfile'),
  chatWithAI: httpsCallable<ChatWithAIInput, ChatWithAIOutput>(functions, 'chatWithAI'),
  createStripeCheckout: httpsCallable<CreateStripeCheckoutInput, CreateStripeCheckoutOutput>(functions, 'createStripeCheckout'),
  manageSubscription: httpsCallable<{}, ManageSubscriptionOutput>(functions, 'manageSubscription'),

  // ========================================
  // ðŸŽ¨ FUNCIONES PARA GENERACIÃ“N DE IMÃGENES
  // ========================================
  generateImage: httpsCallable<GenerateImageInput, GenerateImageOutput>(functions, 'generateImage'),
  getImageUsageStatus: httpsCallable<{}, GetImageUsageStatusOutput>(functions, 'getImageUsageStatus'),
  
  // ========================================
  // ðŸŽ¥ FUNCIONES PARA GENERACIÃ“N DE VIDEOS
  // ========================================
  generateVideo: httpsCallable<GenerateVideoInput, GenerateVideoOutput>(functions, 'generateVideo'),
  getVideoUsageStatus: httpsCallable<{}, GetVideoUsageStatusOutput>(functions, 'getVideoUsageStatus'),
  checkVideoStatus: httpsCallable<CheckVideoStatusInput, CheckVideoStatusOutput>(functions, 'checkVideoStatus'),
  getSignedVideoUrl: httpsCallable<{videoId: string}, {success: boolean, videoUrl: string, thumbnailUrl: string, expiresIn: number, status: string}>(functions, 'getSignedVideoUrl'),

  // ========================================
  // ðŸ”§ NUEVAS FUNCIONES - MODOS ESPECIALIZADOS
  // ========================================
  
  // Obtener lÃ­mites de modos especializados
  getSpecialistModeLimits: httpsCallable<{}, SpecialistModeLimits>(functions, 'getSpecialistModeLimits'),
  
  // Chat en Modo Desarrollador
  developerModeChat: httpsCallable<DeveloperModeChatInput, DeveloperModeChatOutput>(functions, 'developerModeChat'),
  
  // Chat en Modo Especialista
  specialistModeChat: httpsCallable<SpecialistModeChatInput, SpecialistModeChatOutput>(functions, 'specialistModeChat'),
  
  // ========================================
  // FUNCIÃ“N PERSONALIZADA PARA METADATOS
  // ========================================
  async saveConversationMetadata(metadata: ConversationMetadataInput) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const token = await user.getIdToken();
    
    const response = await fetch('/api/save-conversation-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      throw new Error(`Error guardando metadatos: ${response.status}`);
    }

    return await response.json();
  }
};

// ========================================
// ðŸ› ï¸ FUNCIONES DE UTILIDAD - COMPLETAS
// ========================================
export const helpers = {
  getErrorMessage(error: any): string {
    if (error && typeof error === 'object' && 'code' in error) {
      const errorMessages: { [key: string]: string } = {
        // Errores de autenticaciÃ³n
        'auth/user-not-found': 'No se encontrÃ³ ningÃºn usuario con este email',
        'auth/wrong-password': 'ContraseÃ±a incorrecta',
        'auth/email-already-in-use': 'Este email ya estÃ¡ registrado',
        'auth/weak-password': 'La contraseÃ±a debe tener al menos 6 caracteres',
        'auth/invalid-email': 'Email invÃ¡lido',
        'auth/too-many-requests': 'Demasiados intentos. Intenta mÃ¡s tarde',
        'auth/network-request-failed': 'Error de conexiÃ³n. Verifica tu internet',
        'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
        'auth/operation-not-allowed': 'OperaciÃ³n no permitida',
        'auth/requires-recent-login': 'Por seguridad, inicia sesiÃ³n nuevamente',
        
        // Errores de Firestore
        'firestore/permission-denied': 'Sin permisos para acceder a este recurso',
        'firestore/not-found': 'Documento no encontrado',
        'firestore/already-exists': 'El documento ya existe',
        'firestore/resource-exhausted': 'LÃ­mite de recursos excedido',
        'firestore/failed-precondition': 'La condiciÃ³n previa fallÃ³',
        'firestore/aborted': 'OperaciÃ³n cancelada debido a conflicto',
        'firestore/out-of-range': 'Valor fuera de rango vÃ¡lido',
        'firestore/unimplemented': 'OperaciÃ³n no implementada',
        'firestore/internal': 'Error interno del servidor',
        'firestore/unavailable': 'Servicio no disponible temporalmente',
        'firestore/data-loss': 'PÃ©rdida de datos irrecuperable',
        
        // Errores de Cloud Functions
        'functions/cancelled': 'OperaciÃ³n cancelada',
        'functions/unknown': 'Error desconocido en el servidor',
        'functions/invalid-argument': 'Argumento invÃ¡lido',
        'functions/deadline-exceeded': 'Tiempo de espera agotado',
        'functions/not-found': 'FunciÃ³n no encontrada',
        'functions/already-exists': 'El recurso ya existe',
        'functions/permission-denied': 'Sin permisos para esta operaciÃ³n',
        'functions/resource-exhausted': 'LÃ­mite de recursos excedido',
        'functions/failed-precondition': 'CondiciÃ³n previa no cumplida',
        'functions/aborted': 'OperaciÃ³n cancelada',
        'functions/out-of-range': 'Valor fuera de rango',
        'functions/unimplemented': 'FunciÃ³n no implementada',
        'functions/internal': 'Error interno del servidor',
        'functions/unavailable': 'Servicio no disponible',
        'functions/data-loss': 'PÃ©rdida de datos',
        'functions/unauthenticated': 'Usuario no autenticado',
        
        // Errores de Storage
        'storage/unknown': 'Error desconocido de almacenamiento',
        'storage/object-not-found': 'Archivo no encontrado',
        'storage/bucket-not-found': 'Bucket no encontrado',
        'storage/project-not-found': 'Proyecto no encontrado',
        'storage/quota-exceeded': 'Cuota de almacenamiento excedida',
        'storage/unauthenticated': 'Usuario no autenticado para storage',
        'storage/unauthorized': 'Sin autorizaciÃ³n para acceder al archivo',
        'storage/retry-limit-exceeded': 'LÃ­mite de reintentos excedido',
        'storage/invalid-checksum': 'Checksum invÃ¡lida',
        'storage/canceled': 'OperaciÃ³n cancelada por el usuario',
        'storage/invalid-event-name': 'Nombre de evento invÃ¡lido',
        'storage/invalid-url': 'URL invÃ¡lida',
        'storage/invalid-argument': 'Argumento invÃ¡lido para Storage',
        'storage/no-default-bucket': 'No hay bucket por defecto configurado',
        'storage/cannot-slice-blob': 'No se puede procesar el archivo',
        'storage/server-file-wrong-size': 'TamaÃ±o de archivo incorrecto'
      };
      
      return errorMessages[error.code] || `Error: ${error.code}`;
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    
    return 'Error desconocido';
  },

  // FunciÃ³n para validar plan de usuario
  isValidPlan(plan: any): plan is PlanType {
    return plan === 'free' || plan === 'pro' || plan === 'pro_max';
  },

  // ========================================
  // ðŸ†• FUNCIONES QUE FALTABAN
  // ========================================

  // FunciÃ³n para formatear tokens (la que usan los componentes existentes)
  formatTokens(count: number): string {
    if (count === -1) return 'Ilimitado';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  },

  // FunciÃ³n para formatear uso de tokens
  formatTokenUsage(used: number, limit: number): string {
    if (limit === -1) return `${used.toLocaleString()} (Ilimitado)`;
    return `${used.toLocaleString()} / ${limit.toLocaleString()}`;
  },

  // FunciÃ³n para calcular porcentaje de uso
  getUsagePercentage(used: number, limit: number): number {
    if (limit === -1) return 0;
    if (limit === 0) return 100;
    return Math.min((used / limit) * 100, 100);
  },

  // FunciÃ³n para determinar si un modo estÃ¡ disponible
  isModeAvailable(mode: 'developer' | 'specialist', plan: PlanType, dailyUsed: number, dailyLimit: number): boolean {
    if (dailyLimit === -1) return true; // Ilimitado
    return dailyUsed < dailyLimit;
  },

  // FunciÃ³n para obtener mensaje de lÃ­mite alcanzado
  getLimitMessage(mode: 'developer' | 'specialist', plan: PlanType): string {
    const modeNames = {
      developer: 'Modo Desarrollador',
      specialist: 'Modo Especialista'
    };

    if (plan === 'free') {
      return `Has alcanzado el lÃ­mite diario del ${modeNames[mode]} en el plan gratuito. Actualiza a Pro para mayor acceso.`;
    } else if (plan === 'pro') {
      return `Has alcanzado el lÃ­mite diario del ${modeNames[mode]}. Se restablecerÃ¡ maÃ±ana o actualiza a Pro Max para acceso ilimitado.`;
    } else {
      return `LÃ­mite tÃ©cnico alcanzado. Por favor intenta mÃ¡s tarde.`;
    }
  },

  // ========================================
  // ðŸ†• FUNCIONES DE VALIDACIÃ“N
  // ========================================

  // Validar prompt de imagen
  validateImagePrompt(prompt: string, maxLength: number = 500): { valid: boolean; error?: string } {
    if (!prompt || prompt.trim().length === 0) {
      return { valid: false, error: 'Por favor, describe la imagen que quieres generar' };
    }

    if (prompt.length > maxLength) {
      return { valid: false, error: `El prompt es muy largo. MÃ¡ximo ${maxLength} caracteres.` };
    }

    // Verificar contenido inapropiado bÃ¡sico
    const inappropriateWords = ['nsfw', 'nude', 'explicit', 'sexual', 'pornographic'];
    const lowerPrompt = prompt.toLowerCase();
    
    for (const word of inappropriateWords) {
      if (lowerPrompt.includes(word)) {
        return { valid: false, error: 'El contenido no es apropiado para generaciÃ³n de imÃ¡genes' };
      }
    }

    return { valid: true };
  },

  // Validar prompt de video
  validateVideoPrompt(prompt: string, maxLength: number = 500): { valid: boolean; error?: string } {
    if (!prompt || prompt.trim().length === 0) {
      return { valid: false, error: 'Por favor, describe el video que quieres generar' };
    }

    if (prompt.length > maxLength) {
      return { valid: false, error: `El prompt es muy largo. MÃ¡ximo ${maxLength} caracteres.` };
    }

    // Verificar contenido inapropiado bÃ¡sico
    const inappropriateWords = ['nsfw', 'nude', 'explicit', 'sexual', 'pornographic', 'violence', 'violent'];
    const lowerPrompt = prompt.toLowerCase();
    
    for (const word of inappropriateWords) {
      if (lowerPrompt.includes(word)) {
        return { valid: false, error: 'El contenido no es apropiado para generaciÃ³n de videos' };
      }
    }

    return { valid: true };
  },

  // ========================================
  // ðŸ†• FUNCIONES DE DESCARGA Y COMPARTIR
  // ========================================

  // Descargar imagen
  async downloadImage(imageUrl: string, filename: string = 'image.png'): Promise<void> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Simular clic para iniciar descarga
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando imagen:', error);
      throw new Error('Error al descargar la imagen');
    }
  },

  // Compartir imagen (usando Web Share API si estÃ¡ disponible)
  async shareImage(imageUrl: string, prompt: string): Promise<void> {
    try {
      // Verificar si Web Share API estÃ¡ disponible
      if (navigator.share) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'nora-generated-image.png', { type: blob.type });

        await navigator.share({
          title: 'Imagen generada con NORA AI',
          text: `Creada con el prompt: "${prompt}"`,
          files: [file]
        });
      } else {
        // Fallback: copiar URL al portapapeles
        await navigator.clipboard.writeText(imageUrl);
        throw new Error('FunciÃ³n de compartir no disponible. URL copiada al portapapeles.');
      }
    } catch (error) {
      console.error('Error compartiendo imagen:', error);
      throw error;
    }
  }
};