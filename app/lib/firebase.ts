// app/lib/firebase.ts - COMPLETO CON BÚSQUEDA WEB
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
  // TIPOS EXISTENTES PARA MODOS ESPECIALIZADOS
  SpecialistModeLimits,
  DeveloperModeChatInput,
  DeveloperModeChatOutput,
  SpecialistModeChatInput,
  SpecialistModeChatOutput,
  // ✅ NUEVOS TIPOS PARA BÚSQUEDA WEB
  SearchWebInput,
  SearchWebOutput,
  WebSearchStatusOutput
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
  // 🔧 FUNCIONES EXISTENTES - MODOS ESPECIALIZADOS
  // ========================================
  
  // Obtener límites de modos especializados
  getSpecialistModeLimits: httpsCallable<{}, SpecialistModeLimits>(functions, 'getSpecialistModeLimits'),
  
  // Chat en Modo Desarrollador
  developerModeChat: httpsCallable<DeveloperModeChatInput, DeveloperModeChatOutput>(functions, 'developerModeChat'),
  
  // Chat en Modo Especialista
  specialistModeChat: httpsCallable<SpecialistModeChatInput, SpecialistModeChatOutput>(functions, 'specialistModeChat'),

  // ========================================
  // 🔍 NUEVAS FUNCIONES - BÚSQUEDA WEB
  // ========================================
  
  // Búsqueda web directa
  searchWeb: httpsCallable<SearchWebInput, SearchWebOutput>(functions, 'searchWeb'),
  
  // Obtener estado de búsquedas web
  getWebSearchStatus: httpsCallable<{}, WebSearchStatusOutput>(functions, 'getWebSearchStatus'),
  
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
  // FUNCIONES EXISTENTES QUE USAN TUS COMPONENTES
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
  // ✅ NUEVAS FUNCIONES PARA BÚSQUEDA WEB
  // ========================================
  
  /**
   * Obtiene el color del indicador de búsquedas web según el uso
   */
  getSearchUsageColor(used: number, limit: number): string {
    const percentage = this.getUsagePercentage(used, limit);
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  },

  /**
   * Formatea el límite de búsquedas web para mostrar
   */
  formatSearchLimit(used: number, limit: number): string {
    return `${used.toLocaleString()}/${limit.toLocaleString()}`;
  },

  /**
   * Determina si se debe mostrar advertencia de límite de búsquedas
   */
  shouldShowSearchWarning(used: number, limit: number): boolean {
    return this.getUsagePercentage(used, limit) >= 80;
  },

  /**
   * Obtiene el mensaje de estado de búsquedas web
   */
  getSearchStatusMessage(used: number, limit: number, plan: string): string {
    const remaining = limit - used;
    const percentage = this.getUsagePercentage(used, limit);
    
    if (remaining === 0) {
      return `Límite de búsquedas web agotado para el plan ${this.getPlanDisplayName(plan)}`;
    }
    
    if (percentage >= 90) {
      return `¡Atención! Solo te quedan ${remaining} búsquedas web este mes`;
    }
    
    if (percentage >= 70) {
      return `Te quedan ${remaining} búsquedas web de ${limit} este mes`;
    }
    
    return `${remaining} búsquedas web disponibles este mes`;
  },

  /**
   * Valida si una respuesta incluye búsqueda web
   */
  hasWebSearchData(response: ChatWithAIOutput): boolean {
    return Boolean(response.searchUsed && response.searchResults?.results?.length);
  },

  /**
   * Extrae las fuentes de una respuesta con búsqueda web
   */
  extractSearchSources(response: ChatWithAIOutput): string[] {
    if (!this.hasWebSearchData(response)) return [];
    return response.searchResults?.results?.map(r => r.displayLink) || [];
  },

  /**
   * Genera un resumen de la búsqueda web realizada
   */
  getSearchSummary(response: ChatWithAIOutput): string {
    if (!this.hasWebSearchData(response)) return '';
    
    const results = response.searchResults!;
    const sources = results.results.length;
    const time = results.searchTime;
    
    return `Búsqueda: "${results.query}" (${sources} fuentes en ${time}s)`;
  },

  /**
   * Obtiene el nombre mostrable del plan
   */
  getPlanDisplayName(plan: string): string {
    const planNames: { [key: string]: string } = {
      'free': 'Gratis',
      'pro': 'Pro',
      'pro_max': 'Pro Max'
    };
    return planNames[plan] || 'Desconocido';
  },

  /**
   * Formatea números grandes con sufijos
   */
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  /**
   * Calcula el porcentaje de uso
   */
  calculateUsagePercentage(used: number, limit: number): number {
    if (limit === -1 || limit === 0) return 0;
    return Math.min(Math.round((used / limit) * 100), 100);
  },

  /**
   * Verifica si está cerca del límite (>80%)
   */
  isNearLimit(used: number, limit: number): boolean {
    if (limit === -1) return false;
    return (used / limit) >= 0.8;
  },

  // ========================================
  // FUNCIONES DE VALIDACIÓN EXISTENTES
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
  // FUNCIONES DE DESCARGA Y COMPARTIR EXISTENTES
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
  },

  /**
   * Convierte Date a string ISO para Firebase
   */
  dateToISOString(date: Date): string {
    return date.toISOString();
  },

  /**
   * Convierte string ISO a Date desde Firebase
   */
  isoStringToDate(isoString: string): Date {
    return new Date(isoString);
  },

  /**
   * Valida configuración de Firebase
   */
  validateFirebaseConfig(): boolean {
    const requiredFields = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
    ];

    return requiredFields.every(field => {
      const value = process.env[field];
      return value && value.length > 0;
    });
  },

  /**
   * Maneja errores de red de manera inteligente
   */
  isNetworkError(error: any): boolean {
    return error?.code === 'auth/network-request-failed' ||
           error?.message?.includes('network') ||
           error?.message?.includes('fetch');
  },

  /**
   * Reintenta una operación con backoff exponencial
   */
  async retryOperation<T>(
    operation: () => Promise<T>, 
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries || !this.isNetworkError(error)) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  },

  /**
   * Genera ID único para mensajes
   */
  generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Genera ID único para conversaciones
   */
  generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

// ========================================
// 🎯 CONSTANTES Y CONFIGURACIONES EXISTENTES + NUEVAS
// ========================================
export const PLAN_LIMITS = {
  free: {
    tokensPerDay: 66666,
    tokensPerMonth: 2000000,
    imagesPerMonth: 15,
    videosPerMonth: 0,
    webSearchesPerMonth: 50, // ✅ NUEVO LÍMITE
    maxFileSize: 10, // MB
    maxResponseTokens: 2000
  },
  pro: {
    tokensPerDay: 333333,
    tokensPerMonth: 10000000,
    imagesPerMonth: 50,
    videosPerMonth: 50,
    webSearchesPerMonth: 500, // ✅ NUEVO LÍMITE
    maxFileSize: 50, // MB
    maxResponseTokens: 4000
  },
  pro_max: {
    tokensPerDay: 666666,
    tokensPerMonth: 20000000,
    imagesPerMonth: 200,
    videosPerMonth: 150,
    webSearchesPerMonth: 2000, // ✅ NUEVO LÍMITE
    maxFileSize: 100, // MB
    maxResponseTokens: 10000
  }
};

export const SUPPORTED_FILE_TYPES = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  documents: ['.pdf', '.doc', '.docx', '.txt', '.md'],
  spreadsheets: ['.csv', '.xlsx', '.xls'],
  presentations: ['.ppt', '.pptx'],
  code: ['.js', '.ts', '.py', '.java', '.cpp', '.html', '.css'],
  videos: ['.mp4', '.avi', '.mov', '.wmv'],
  audio: ['.mp3', '.wav', '.ogg', '.m4a']
};

export const PLAN_FEATURES = {
  free: [
    'Chat básico con IA',
    '50 búsquedas web por mes', // ✅ NUEVO
    'Análisis de archivos básico',
    'Historial limitado',
    'Soporte por email'
  ],
  pro: [
    'Chat avanzado con IA',
    '500 búsquedas web por mes', // ✅ NUEVO
    'Generación de imágenes',
    'Análisis multimedia completo',
    'Historial completo',
    'Modos especializados',
    'Soporte prioritario'
  ],
  pro_max: [
    'Chat premium con IA',
    '2000 búsquedas web por mes', // ✅ NUEVO
    'Generación de videos',
    'Procesamiento con GPU',
    'Análisis en tiempo real',
    'Integraciones avanzadas',
    'Soporte 24/7',
    'Acceso anticipado a funciones'
  ]
};

// Exportar configuración por defecto
export default app;