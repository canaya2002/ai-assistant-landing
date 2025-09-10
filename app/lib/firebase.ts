// lib/firebase.ts - VERSIÓN COMPLETAMENTE CORREGIDA
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';

// Importar tipos
import type {
  ChatWithAIInput,
  ChatWithAIOutput,
  GenerateImageInput,
  GenerateImageOutput,
  GetImageUsageStatusOutput,
  CreateStripeCheckoutInput,
  CreateStripeCheckoutOutput,
  ManageSubscriptionOutput,
  ConversationMetadataInput,
  UserProfile,
  PlanType
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

// 🔐 FUNCIONES DE AUTENTICACIÓN
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

// 📞 CLOUD FUNCTIONS
export const cloudFunctions = {
  // Funciones existentes
  getUserProfile: httpsCallable<{}, UserProfile>(functions, 'getUserProfile'),
  chatWithAI: httpsCallable<ChatWithAIInput, ChatWithAIOutput>(functions, 'chatWithAI'),
  createStripeCheckout: httpsCallable<CreateStripeCheckoutInput, CreateStripeCheckoutOutput>(functions, 'createStripeCheckout'),
  manageSubscription: httpsCallable<{}, ManageSubscriptionOutput>(functions, 'manageSubscription'),

  // 🎨 NUEVAS FUNCIONES PARA GENERACIÓN DE IMÁGENES
  generateImage: httpsCallable<GenerateImageInput, GenerateImageOutput>(functions, 'generateImage'),
  getImageUsageStatus: httpsCallable<{}, GetImageUsageStatusOutput>(functions, 'getImageUsageStatus'),
  
  // Función personalizada para metadatos de conversación
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

// 🛠️ FUNCIONES DE UTILIDAD
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
        
        // 🎨 Errores de generación de imágenes
        'resource-exhausted': 'Has alcanzado tu límite de imágenes',
        'invalid-argument': 'Parámetros inválidos para generar imagen',
        'permission-denied': 'No tienes permisos para esta acción',
        'unauthenticated': 'Debes iniciar sesión',
        
        // Errores de Firestore
        'firestore/permission-denied': 'Sin permisos para acceder a este documento',
        'firestore/not-found': 'Documento no encontrado',
        'firestore/cancelled': 'Operación cancelada',
        'firestore/unknown': 'Error desconocido',
        'firestore/invalid-argument': 'Argumentos inválidos',
        'firestore/deadline-exceeded': 'Tiempo de espera agotado',
        'firestore/failed-precondition': 'Falló la precondición',
        'firestore/aborted': 'Operación abortada',
        'firestore/out-of-range': 'Fuera de rango',
        'firestore/unimplemented': 'Función no implementada',
        'firestore/internal': 'Error interno',
        'firestore/unavailable': 'Servicio no disponible',
        'firestore/data-loss': 'Pérdida de datos',
        
        // Errores de Storage
        'storage/object-not-found': 'Archivo no encontrado',
        'storage/bucket-not-found': 'Bucket de almacenamiento no encontrado',
        'storage/quota-exceeded': 'Cuota de almacenamiento excedida',
        'storage/unauthenticated': 'Usuario no autenticado para Storage',
        'storage/unauthorized': 'Sin autorización para esta operación',
        'storage/retry-limit-exceeded': 'Límite de reintentos excedido',
        'storage/invalid-checksum': 'Checksum inválido del archivo',
        'storage/canceled': 'Operación cancelada',
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
    
    return 'Ha ocurrido un error inesperado';
  },

  // Formatear tokens para mostrar en UI
  formatTokens(tokens: number): string {
    if (tokens < 0) return 'Ilimitado';
    if (tokens < 1000) return `${tokens}`;
    if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
    return `${(tokens / 1000000).toFixed(1)}M`;
  },

  // Calcular porcentaje de uso
  getUsagePercentage(used: number, limit: number): number {
    if (limit <= 0) return 0;
    if (limit === -1) return 0; // Ilimitado
    return Math.min(100, (used / limit) * 100);
  },

  // Obtener nombre del plan para mostrar
  getPlanDisplayName(plan: PlanType): string {
    const names = {
      free: 'Gratis',
      pro: 'Pro',
      pro_max: 'Pro Max'
    };
    return names[plan] || 'Desconocido';
  },

  // 🎨 NUEVAS FUNCIONES PARA IMÁGENES

  // Formatear tamaño de archivo
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validar formato de imagen
  isValidImageFormat(file: File): boolean {
    const validFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    return validFormats.includes(file.type);
  },

  // Comprimir imagen base64
  compressImage(base64: string, quality: number = 0.8): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(1920 / img.width, 1080 / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.src = base64;
    });
  },

  // Generar thumbnail
  generateThumbnail(imageUrl: string, size: number = 200): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = size;
        canvas.height = size;
        
        const ratio = Math.min(size / img.width, size / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;
        const x = (size - width) / 2;
        const y = (size - height) / 2;
        
        ctx?.drawImage(img, x, y, width, height);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnail);
      };
      
      img.onerror = reject;
      img.src = imageUrl;
    });
  },

  // Descargar imagen
  async downloadImage(imageUrl: string, filename?: string): Promise<void> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `nora-generated-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error('Error descargando imagen');
    }
  },

  // Compartir imagen
  async shareImage(imageUrl: string, title?: string, text?: string): Promise<void> {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title || 'Imagen generada con NORA AI',
          text: text || 'Mira esta imagen que generé con NORA AI',
          url: imageUrl
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        throw new Error('URL copiada al portapapeles');
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error && 
          String(error.message) === 'URL copiada al portapapeles') {
        throw error; // Re-lanzar para mostrar mensaje correcto
      }
      throw new Error('Error compartiendo imagen');
    }
  },

  // Validar prompt de imagen
  validateImagePrompt(prompt: string, maxLength: number): { valid: boolean; error?: string } {
    if (!prompt || prompt.trim().length === 0) {
      return { valid: false, error: 'El prompt es requerido' };
    }

    if (prompt.length > maxLength) {
      return { valid: false, error: `Prompt muy largo. Máximo ${maxLength} caracteres` };
    }

    // Palabras prohibidas (ejemplo básico)
    const prohibitedWords = ['nsfw', 'nude', 'explicit', 'sexual'];
    const lowerPrompt = prompt.toLowerCase();
    
    for (const word of prohibitedWords) {
      if (lowerPrompt.includes(word)) {
        return { valid: false, error: 'El prompt contiene contenido no permitido' };
      }
    }

    return { valid: true };
  },

  // Formatear tiempo de generación
  formatGenerationTime(milliseconds: number): string {
    if (milliseconds < 1000) return `${milliseconds}ms`;
    return `${(milliseconds / 1000).toFixed(1)}s`;
  },

  // Obtener color del plan
  getPlanColor(plan: PlanType): string {
    const colors = {
      free: '#6B7280',     // Gris
      pro: '#3B82F6',      // Azul
      pro_max: '#F59E0B'   // Amarillo/Dorado
    };
    return colors[plan] || colors.free;
  },

  // Obtener icono del plan
  getPlanIcon(plan: PlanType): string {
    const icons = {
      free: '📷',
      pro: '⚡',
      pro_max: '👑'
    };
    return icons[plan] || icons.free;
  }
};

// Validar configuración al importar (solo en servidor)
if (typeof window === 'undefined') {
  const requiredKeys = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ] as const;

  let configValid = true;
  for (const key of requiredKeys) {
    if (!process.env[key]) {
      console.error(`❌ Missing required environment variable: ${key}`);
      configValid = false;
    }
  }

  if (configValid) {
    console.log('✅ Firebase configuration is valid');
  }

  // Validar Gemini API keys
  const geminiKeys = [
    process.env.GEMINI_API_KEY_PRO,
    process.env.GEMINI_API_KEY_BASIC,
    process.env.GEMINI_API_KEY_FREE
  ];

  const hasValidGeminiKey = geminiKeys.some(key => key && key.length > 0);
  
  if (!hasValidGeminiKey) {
    console.warn('⚠️ Warning: No Gemini API keys configured. Image generation may not work.');
  } else {
    console.log('✅ Gemini API keys configured');
  }
}

export default app;