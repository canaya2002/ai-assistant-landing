// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { ChatMessage } from './types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');

// Connect to emulators in development (optional)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  console.log('Emulators not connected in development mode');
}

export default app;

// Auth functions
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
  async signUp(email: string, password: string, name: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (name) {
        await updateProfile(result.user, { displayName: name });
        // Force refresh to get updated displayName
        await result.user.reload();
      }
      
      return { user: result.user, error: null };
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      return { user: null, error: error as FirebaseError };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { user: result.user, error: null };
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      return { user: null, error: error as FirebaseError };
    }
  },

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Configuraciones adicionales para mejor compatibilidad
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result: UserCredential = await signInWithPopup(auth, provider);
      
      // Verificar que tenemos los datos del usuario
      if (!result.user.email) {
        throw new Error('No se pudo obtener el email del usuario');
      }
      
      // Si no tiene displayName, usar el nombre del email
      if (!result.user.displayName && result.user.email) {
        const emailName = result.user.email.split('@')[0];
        await updateProfile(result.user, { 
          displayName: emailName.charAt(0).toUpperCase() + emailName.slice(1)
        });
        await result.user.reload();
      }
      
      return { user: result.user, error: null };
    } catch (error: unknown) {
      console.error('Google sign in error:', error);
      
      // Manejo específico de errores de Google Auth
      if (error instanceof Error) {
        if (error.message.includes('popup-closed-by-user')) {
          return { user: null, error: { code: 'auth/popup-closed-by-user', message: 'Popup cerrado por el usuario' } as FirebaseError };
        }
        if (error.message.includes('popup-blocked')) {
          return { user: null, error: { code: 'auth/popup-blocked', message: 'Popup bloqueado por el navegador' } as FirebaseError };
        }
      }
      
      return { user: null, error: error as FirebaseError };
    }
  },

  async logout() {
    try {
      await signOut(auth);
      return { success: true, error: null };
    } catch (error: unknown) {
      console.error('Logout error:', error);
      return { success: false, error: error as FirebaseError };
    }
  },

  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, error: null };
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      return { success: false, error: error as FirebaseError };
    }
  }
};

// Define input and output types for cloud functions
interface ChatWithAIInput {
  message: string;
  fileContext: string;
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

// Función personalizada para guardar metadatos usando API route
const saveConversationMetadata = async (metadata: ConversationMetadataInput) => {
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
    throw new Error('Error guardando metadatos');
  }

  return await response.json();
};

export const cloudFunctions = {
  getUserProfile: httpsCallable(functions, 'getUserProfile'),
  chatWithAI: httpsCallable<ChatWithAIInput, ChatWithAIOutput>(functions, 'chatWithAI'),
  createStripeCheckout: httpsCallable<CreateStripeCheckoutInput, CreateStripeCheckoutOutput>(functions, 'createStripeCheckout'),
  manageSubscription: httpsCallable<{}, ManageSubscriptionOutput>(functions, 'manageSubscription'),
  saveConversationMetadata, // Función personalizada usando API route
};

// Helper functions
export const helpers = {
  getErrorMessage(errorCode: string): string {
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
    
    return errorMessages[errorCode] || 'Ocurrió un error inesperado';
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
      free: '#6B7280',
      pro: '#3B82F6',
      pro_max: '#F59E0B'
    };
    return planColors[plan] || '#6B7280';
  },

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

  // Nueva función para validar tokens
  hasTokensAvailable(userProfile: any): boolean {
    if (!userProfile || !userProfile.usage) return false;
    return userProfile.usage.daily.tokensRemaining > 0;
  },

  // Nueva función para calcular el próximo reset de tokens
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
    const nextReset = this.getNextTokenReset();
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