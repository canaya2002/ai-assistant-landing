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

// Configuración de Firebase
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

// Conectar a emuladores SOLO si están específicamente habilitados
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  const hostname = 'localhost';
  
  console.log('🔧 Connecting to Firebase Emulators...');
  
  try {
    if (!(auth as any)._config?.emulator) {
      connectAuthEmulator(auth, `http://${hostname}:9099`);
      console.log('✅ Auth Emulator connected');
    }
  } catch (e) {
    console.warn('Auth Emulator connection failed:', e);
  }
  
  try {
    if (!(db as any)._delegate?._databaseId?.projectId.includes('demo-')) {
      connectFirestoreEmulator(db, hostname, 8080);
      console.log('✅ Firestore Emulator connected');
    }
  } catch (e) {
    console.warn('Firestore Emulator connection failed:', e);
  }
  
  try {
    if (!storage.app.options.projectId?.includes('demo-')) {
      connectStorageEmulator(storage, hostname, 9199);
      console.log('✅ Storage Emulator connected');
    }
  } catch (e) {
    console.warn('Storage Emulator connection failed:', e);
  }
  
  try {
    if (!(functions as any)._delegate?.region) {
      connectFunctionsEmulator(functions, hostname, 5001);
      console.log('✅ Functions Emulator connected');
    }
  } catch (e) {
    console.warn('Functions Emulator connection failed:', e);
  }
} else {
  console.log('🔥 Using Firebase Production Services');
}

// ========================================
// 🔐 FUNCIONES DE AUTENTICACIÓN
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

  // Inicio de sesión
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

  // Inicio de sesión con Google
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

  // Restablecer contraseña
  async resetPassword(email: string) {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      console.error('Error en resetPassword:', error);
      throw error;
    }
  },

  // Cerrar sesión
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
// 📞 CLOUD FUNCTIONS - TODAS LAS FUNCIONES
// ========================================
export const cloudFunctions = {
  // ========================================
  // FUNCIONES BÁSICAS (EXISTENTES)
  // ========================================
  getUserProfile: httpsCallable<{}, UserProfile>(functions, 'getUserProfile'),
  chatWithAI: httpsCallable<ChatWithAIInput, ChatWithAIOutput>(functions, 'chatWithAI'),
  createStripeCheckout: httpsCallable<CreateStripeCheckoutInput, CreateStripeCheckoutOutput>(functions, 'createStripeCheckout'),
  manageSubscription: httpsCallable<{}, ManageSubscriptionOutput>(functions, 'manageSubscription'),

  // ========================================
  // 🎨 FUNCIONES PARA GENERACIÓN DE IMÁGENES
  // ========================================
  generateImage: httpsCallable<GenerateImageInput, GenerateImageOutput>(functions, 'generateImage'),
  getImageUsageStatus: httpsCallable<{}, GetImageUsageStatusOutput>(functions, 'getImageUsageStatus'),
  
  // ========================================
  // 🎥 FUNCIONES PARA GENERACIÓN DE VIDEOS
  // ========================================
  generateVideo: httpsCallable<GenerateVideoInput, GenerateVideoOutput>(functions, 'generateVideo'),
  getVideoUsageStatus: httpsCallable<{}, GetVideoUsageStatusOutput>(functions, 'getVideoUsageStatus'),
  checkVideoStatus: httpsCallable<CheckVideoStatusInput, CheckVideoStatusOutput>(functions, 'checkVideoStatus'),
  getSignedVideoUrl: httpsCallable<{videoId: string}, {success: boolean, videoUrl: string, thumbnailUrl: string, expiresIn: number, status: string}>(functions, 'getSignedVideoUrl'),

  // ========================================
  // 🔧 NUEVAS FUNCIONES - MODOS ESPECIALIZADOS
  // ========================================
  
  // Obtener límites de modos especializados
  getSpecialistModeLimits: httpsCallable<{}, SpecialistModeLimits>(functions, 'getSpecialistModeLimits'),
  
  // Chat en Modo Desarrollador
  developerModeChat: httpsCallable<DeveloperModeChatInput, DeveloperModeChatOutput>(functions, 'developerModeChat'),
  
  // Chat en Modo Especialista
  specialistModeChat: httpsCallable<SpecialistModeChatInput, SpecialistModeChatOutput>(functions, 'specialistModeChat'),
  
  // ========================================
  // FUNCIÓN PERSONALIZADA PARA METADATOS
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
// 🛠️ FUNCIONES DE UTILIDAD - COMPLETAS
// ========================================
export const helpers = {
  getErrorMessage(error: any): string {
    if (error && typeof error === 'object' && 'code' in error) {
      const errorMessages: { [key: string]: string } = {
        // Errores de autenticación
        'auth/user-not-found': 'No se encontró ningún usuario con este email',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/email-already-in-use': 'Este email ya está registrado',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
        'auth/invalid-email': 'Email inválido',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
        'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
        'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
        'auth/operation-not-allowed': 'Operación no permitida',
        'auth/requires-recent-login': 'Por seguridad, inicia sesión nuevamente',
        
        // Errores de Firestore
        'firestore/permission-denied': 'Sin permisos para acceder a este recurso',
        'firestore/not-found': 'Documento no encontrado',
        'firestore/already-exists': 'El documento ya existe',
        'firestore/resource-exhausted': 'Límite de recursos excedido',
        'firestore/failed-precondition': 'La condición previa falló',
        'firestore/aborted': 'Operación cancelada debido a conflicto',
        'firestore/out-of-range': 'Valor fuera de rango válido',
        'firestore/unimplemented': 'Operación no implementada',
        'firestore/internal': 'Error interno del servidor',
        'firestore/unavailable': 'Servicio no disponible temporalmente',
        'firestore/data-loss': 'Pérdida de datos irrecuperable',
        
        // Errores de Cloud Functions
        'functions/cancelled': 'Operación cancelada',
        'functions/unknown': 'Error desconocido en el servidor',
        'functions/invalid-argument': 'Argumento inválido',
        'functions/deadline-exceeded': 'Tiempo de espera agotado',
        'functions/not-found': 'Función no encontrada',
        'functions/already-exists': 'El recurso ya existe',
        'functions/permission-denied': 'Sin permisos para esta operación',
        'functions/resource-exhausted': 'Límite de recursos excedido',
        'functions/failed-precondition': 'Condición previa no cumplida',
        'functions/aborted': 'Operación cancelada',
        'functions/out-of-range': 'Valor fuera de rango',
        'functions/unimplemented': 'Función no implementada',
        'functions/internal': 'Error interno del servidor',
        'functions/unavailable': 'Servicio no disponible',
        'functions/data-loss': 'Pérdida de datos',
        'functions/unauthenticated': 'Usuario no autenticado',
        
        // Errores de Storage
        'storage/unknown': 'Error desconocido de almacenamiento',
        'storage/object-not-found': 'Archivo no encontrado',
        'storage/bucket-not-found': 'Bucket no encontrado',
        'storage/project-not-found': 'Proyecto no encontrado',
        'storage/quota-exceeded': 'Cuota de almacenamiento excedida',
        'storage/unauthenticated': 'Usuario no autenticado para storage',
        'storage/unauthorized': 'Sin autorización para acceder al archivo',
        'storage/retry-limit-exceeded': 'Límite de reintentos excedido',
        'storage/invalid-checksum': 'Checksum inválida',
        'storage/canceled': 'Operación cancelada por el usuario',
        'storage/invalid-event-name': 'Nombre de evento inválido',
        'storage/invalid-url': 'URL inválida',
        'storage/invalid-argument': 'Argumento inválido para Storage',
        'storage/no-default-bucket': 'No hay bucket por defecto configurado',
        'storage/cannot-slice-blob': 'No se puede procesar el archivo',
        'storage/server-file-wrong-size': 'Tamaño de archivo incorrecto'
      };
      
      return errorMessages[error.code] || `Error: ${error.code}`;
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    
    return 'Error desconocido';
  },

  // Función para validar plan de usuario
  isValidPlan(plan: any): plan is PlanType {
    return plan === 'free' || plan === 'pro' || plan === 'pro_max';
  },

  // ========================================
  // 🆕 FUNCIONES QUE FALTABAN
  // ========================================

  // Función para formatear tokens (la que usan los componentes existentes)
  formatTokens(count: number): string {
    if (count === -1) return 'Ilimitado';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  },

  // Función para formatear uso de tokens
  formatTokenUsage(used: number, limit: number): string {
    if (limit === -1) return `${used.toLocaleString()} (Ilimitado)`;
    return `${used.toLocaleString()} / ${limit.toLocaleString()}`;
  },

  // Función para calcular porcentaje de uso
  getUsagePercentage(used: number, limit: number): number {
    if (limit === -1) return 0;
    if (limit === 0) return 100;
    return Math.min((used / limit) * 100, 100);
  },

  // Función para determinar si un modo está disponible
  isModeAvailable(mode: 'developer' | 'specialist', plan: PlanType, dailyUsed: number, dailyLimit: number): boolean {
    if (dailyLimit === -1) return true; // Ilimitado
    return dailyUsed < dailyLimit;
  },

  // Función para obtener mensaje de límite alcanzado
  getLimitMessage(mode: 'developer' | 'specialist', plan: PlanType): string {
    const modeNames = {
      developer: 'Modo Desarrollador',
      specialist: 'Modo Especialista'
    };

    if (plan === 'free') {
      return `Has alcanzado el límite diario del ${modeNames[mode]} en el plan gratuito. Actualiza a Pro para mayor acceso.`;
    } else if (plan === 'pro') {
      return `Has alcanzado el límite diario del ${modeNames[mode]}. Se restablecerá mañana o actualiza a Pro Max para acceso ilimitado.`;
    } else {
      return `Límite técnico alcanzado. Por favor intenta más tarde.`;
    }
  },

  // ========================================
  // 🆕 FUNCIONES DE VALIDACIÓN
  // ========================================

  // Validar prompt de imagen
  validateImagePrompt(prompt: string, maxLength: number = 500): { valid: boolean; error?: string } {
    if (!prompt || prompt.trim().length === 0) {
      return { valid: false, error: 'Por favor, describe la imagen que quieres generar' };
    }

    if (prompt.length > maxLength) {
      return { valid: false, error: `El prompt es muy largo. Máximo ${maxLength} caracteres.` };
    }

    // Verificar contenido inapropiado básico
    const inappropriateWords = ['nsfw', 'nude', 'explicit', 'sexual', 'pornographic'];
    const lowerPrompt = prompt.toLowerCase();
    
    for (const word of inappropriateWords) {
      if (lowerPrompt.includes(word)) {
        return { valid: false, error: 'El contenido no es apropiado para generación de imágenes' };
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
      return { valid: false, error: `El prompt es muy largo. Máximo ${maxLength} caracteres.` };
    }

    // Verificar contenido inapropiado básico
    const inappropriateWords = ['nsfw', 'nude', 'explicit', 'sexual', 'pornographic', 'violence', 'violent'];
    const lowerPrompt = prompt.toLowerCase();
    
    for (const word of inappropriateWords) {
      if (lowerPrompt.includes(word)) {
        return { valid: false, error: 'El contenido no es apropiado para generación de videos' };
      }
    }

    return { valid: true };
  },

  // ========================================
  // 🆕 FUNCIONES DE DESCARGA Y COMPARTIR
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

  // Compartir imagen (usando Web Share API si está disponible)
  async shareImage(imageUrl: string, prompt: string): Promise<void> {
    try {
      // Verificar si Web Share API está disponible
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
        throw new Error('Función de compartir no disponible. URL copiada al portapapeles.');
      }
    } catch (error) {
      console.error('Error compartiendo imagen:', error);
      throw error;
    }
  }
};