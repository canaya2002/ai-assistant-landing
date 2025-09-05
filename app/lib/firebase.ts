// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

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

// Connect to emulators in development (opcional)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    // Descomenta si usas emuladores locales
    // connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    // connectFirestoreEmulator(db, 'localhost', 8080);
    // connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch (error) {
    console.log('Emulators not available or already connected');
  }
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
  User as FirebaseUser
} from 'firebase/auth';

import { FirebaseError } from './types';

export const authFunctions = {
  async signUp(email: string, password: string, name: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (name) {
        await updateProfile(result.user, { displayName: name });
      }
      
      return { user: result.user, error: null };
    } catch (error: any) {
      return { user: null, error: error as FirebaseError };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { user: result.user, error: null };
    } catch (error: any) {
      return { user: null, error: error as FirebaseError };
    }
  },

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      return { user: result.user, error: null };
    } catch (error: any) {
      return { user: null, error: error as FirebaseError };
    }
  },

  async logout() {
    try {
      await signOut(auth);
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error as FirebaseError };
    }
  },

  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error as FirebaseError };
    }
  }
};

// Cloud Functions
import { httpsCallable } from 'firebase/functions';

export const cloudFunctions = {
  getUserProfile: httpsCallable(functions, 'getUserProfile'),
  chatWithAI: httpsCallable(functions, 'chatWithAI'),
  createStripeCheckout: httpsCallable(functions, 'createStripeCheckout'),
  manageSubscription: httpsCallable(functions, 'manageSubscription'),
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
      'auth/requires-recent-login': 'Debes volver a iniciar sesión para esta acción'
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
      pro: '#737373',
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
  }
};

// Constants
export const PLANS = {
  FREE: 'free',
  PRO: 'pro', 
  PRO_MAX: 'pro_max'
} as const;

export const STRIPE_PRICES = {
  pro: 'price_1S08CYPa2fV72c7wm3DC8M3y',
  pro_max: 'price_1S12wKPa2fV72c7wX2NRAwQF'
} as const;
