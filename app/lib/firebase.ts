// lib/firebase.ts - VERSIÓN COMPLETA CORREGIDA
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { ChatMessage } from './types';

// ✅ VALIDACIÓN DE VARIABLES DE ENTORNO
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// ✅ VERIFICAR QUE TODAS LAS VARIABLES EXISTEN
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key, _]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Firebase environment variables: ${missingVars.join(', ')}\n` +
    'Please check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set.'
  );
}

// ✅ CONFIGURACIÓN VALIDADA
const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey!,
  authDomain: requiredEnvVars.authDomain!,
  projectId: requiredEnvVars.projectId!,
  storageBucket: requiredEnvVars.storageBucket!,
  messagingSenderId: requiredEnvVars.messagingSenderId!,
  appId: requiredEnvVars.appId!,
  measurementId: requiredEnvVars.measurementId!
};

// ✅ INICIALIZACIÓN SEGURA
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw new Error('Failed to initialize Firebase. Please check your configuration.');
}

// ✅ SERVICIOS FIREBASE
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');

// ✅ EMULADORES SOLO EN DESARROLLO
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Conectar emuladores si están disponibles
  try {
    // Descomenta estas líneas si usas emulators
    // connectAuthEmulator(auth, 'http://localhost:9099');
    // connectFirestoreEmulator(db, 'localhost', 8080);
    // connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch (error) {
    console.log('Emulators not available or already connected');
  }
}

export default app;

// ✅ AUTH FUNCTIONS CON MANEJO DE ERRORES MEJORADO
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential
} from 'firebase/auth';

import { FirebaseError } from './types';

export const authFunctions = {
  async signUp(email: string, password: string, name: string): Promise<UserCredential> {
    try {
      // Validar inputs
      if (!email || !password || !name) {
        throw new Error('Todos los campos son requeridos');
      }
      
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar perfil con nombre
      if (result.user) {
        await updateProfile(result.user, { displayName: name });
      }
      
      return result;
    } catch (error: any) {
      console.error('Error in signUp:', error.message);
      throw error;
    }
  },

  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error in signIn:', error.message);
      throw error;
    }
  },

  async signInWithGoogle(): Promise<UserCredential> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      return await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Error in signInWithGoogle:', error.message);
      throw error;
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      if (!email) {
        throw new Error('Email es requerido');
      }

      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Error in resetPassword:', error.message);
      throw error;
    }
  },

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Error in signOut:', error.message);
      throw error;
    }
  }
};

// ✅ CLOUD FUNCTIONS CON VALIDACIÓN
interface ChatWithAIInput {
  message: string;
  fileContext?: string;
  chatHistory: ChatMessage[];
  maxTokens?: number;
}

interface ChatWithAIOutput {
  response: string;
  tokensUsed: number;
}

interface CreateStripeCheckoutInput {
  plan: string;
  priceId: string;
}

interface CreateStripeCheckoutOutput {
  url: string;
}

interface ManageSubscriptionOutput {
  url: string;
}

interface ConversationMetadataInput {
  userId: string;
  conversationId: string;
  title: string;
  messageCount: number;
  lastActivity: string; // ISO string
  tags?: string[];
}

// Validar que las claves de API estén configuradas
const validateAPIKeys = () => {
  const geminiKeys = [
    process.env.GEMINI_API_KEY_PRO,
    process.env.GEMINI_API_KEY_BASIC,
    process.env.GEMINI_API_KEY_FREE
  ];

  const hasValidGeminiKey = geminiKeys.some(key => key && key.length > 0);
  
  if (!hasValidGeminiKey) {
    console.warn('Warning: No Gemini API keys configured. Chat functionality may not work.');
  }
};

// Validar en inicialización
if (typeof window === 'undefined') { // Solo en servidor
  validateAPIKeys();
}

export const cloudFunctions = {
  getUserProfile: httpsCallable(functions, 'getUserProfile'),
  chatWithAI: httpsCallable<ChatWithAIInput, ChatWithAIOutput>(functions, 'chatWithAI'),
  createStripeCheckout: httpsCallable<CreateStripeCheckoutInput, CreateStripeCheckoutOutput>(functions, 'createStripeCheckout'),
  manageSubscription: httpsCallable<{}, ManageSubscriptionOutput>(functions, 'manageSubscription'),

  // ✅ FUNCIÓN PERSONALIZADA PARA METADATOS
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

// ✅ HELPER FUNCTIONS COMPLETAS - TODAS LAS FUNCIONES FALTANTES AGREGADAS
export const helpers = {
  getErrorMessage(error: any): string {
    if (error?.code) {
      const errorMessages: { [key: string]: string } = {
        'auth/user-not-found': 'No se encontró ningún usuario con este email',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/email-already-in-use': 'Este email ya está registrado',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
        'auth/invalid-email': 'Email inválido',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
        'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
        'auth/requires-recent-login': 'Debes volver a iniciar sesión para esta acción',
        'auth/popup-closed-by-user': 'Inicio de sesión cancelado',
        'auth/popup-blocked': 'Popup bloqueado. Permite popups para este sitio',
        'auth/cancelled-popup-request': 'Múltiples popups detectados. Intenta nuevamente',
        'auth/operation-not-allowed': 'Método de autenticación no permitido',
        'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este email usando un método diferente'
      };
      
      return errorMessages[error.code] || error.message || 'Ocurrió un error inesperado';
    }
    
    return error?.message || 'Ocurrió un error inesperado';
  },

  validateEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePasswordStrength(password: string): { isValid: boolean; message: string } {
    if (password.length < 6) {
      return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }
    
    if (password.length < 8) {
      return { isValid: true, message: 'Contraseña débil. Recomendamos al menos 8 caracteres' };
    }
    
    const hasNumber = /\d/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    
    if (hasNumber && hasUpper && hasLower) {
      return { isValid: true, message: 'Contraseña fuerte' };
    }
    
    return { isValid: true, message: 'Contraseña moderada' };
  },

  // ✅ FUNCIONES FALTANTES QUE CAUSABAN ERRORES:
  
  formatTokens(tokens: number): string {
    if (tokens === -1) return 'Ilimitado';
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  },

  getUsagePercentage(used: number, limit: number): number {
    if (limit === -1) return 0;
    if (limit === 0) return 100;
    return Math.min(Math.round((used / limit) * 100), 100);
  },

  getPlanDisplayName(plan: string): string {
    const planNames: { [key: string]: string } = {
      free: 'Gratis',
      pro: 'Pro', 
      pro_max: 'Pro Max'
    };
    return planNames[plan] || 'Gratis';
  },

  getPlanColor(plan: string): string {
    const planColors: { [key: string]: string } = {
      free: 'text-gray-400',
      pro: 'text-blue-400',
      pro_max: 'text-yellow-400'
    };
    return planColors[plan] || 'text-gray-400';
  },

  // Función para validar tokens
  hasTokensAvailable(userProfile: any): boolean {
    if (!userProfile || !userProfile.usage) return false;
    return userProfile.usage.daily.tokensRemaining > 0;
  },

  // Función para calcular el próximo reset de tokens
  getNextTokenReset(): Date {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);
    return nextMidnight;
  },

  // Función para formatear tiempo restante hasta el reset
  formatTimeUntilReset(): string {
    const now = new Date();
    const nextReset = helpers.getNextTokenReset();
    const diff = nextReset.getTime() - now.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
};

// Constants actualizados con los nuevos precios
export const PLANS = {
  FREE: 'free',
  PRO: 'pro', 
  PRO_MAX: 'pro_max'
} as const;

export const STRIPE_PRICES = {
  pro: 'price_1S08CYPa2fV72c7wm3DC8M3y',
  pro_max: 'price_1S12wKPa2fV72c7wX2NRAwQF'
} as const;

// Configuración de tokens optimizada por plan
export const TOKEN_LIMITS = {
  free: {
    daily: 6600,
    maxResponseTokens: 150
  },
  pro: {
    daily: 333000,
    maxResponseTokens: 500
  },
  pro_max: {
    daily: 466000,
    maxResponseTokens: 1000
  }
} as const;