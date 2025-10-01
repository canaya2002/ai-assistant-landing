// app/lib/firebase.ts - COMPLETO 100%
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, onAuthStateChanged, User } from 'firebase/auth';
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
  SpecialistModeLimits,
  DeveloperModeChatInput,
  DeveloperModeChatOutput,
  SpecialistModeChatInput,
  SpecialistModeChatOutput,
  SearchWebInput,
  SearchWebOutput,
  WebSearchStatusOutput,
  AdvancedModeInput,
  AdvancedModeOutput
} from './types';

// ========================================
// ðŸ”’ CONFIGURACIÃ“N SEGURA DE FIREBASE
// ========================================
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// âœ… VALIDAR CONFIGURACIÃ“N ANTES DE INICIALIZAR
function validateFirebaseConfig(): boolean {
  const requiredFields = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];

  const missing = requiredFields.filter(field => !process.env[field]);
  
  if (missing.length > 0) {
    console.error('âŒ ConfiguraciÃ³n de Firebase incompleta. Faltan:', missing);
    console.log('ðŸ” Variables de entorno actuales:', {
      API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'âœ… Presente' : 'âŒ Faltante',
      AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'âœ… Presente' : 'âŒ Faltante',
      PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'âœ… Presente' : 'âŒ Faltante'
    });
    return false;
  }

  return true;
}

// Inicializar Firebase
console.log('ðŸ”¥ Inicializando Firebase con configuraciÃ³n:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

const app = initializeApp(firebaseConfig);

// Servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// ========================================
// ðŸ”’ SISTEMA DE VERIFICACIÃ“N DE TOKENS MEJORADO
// ========================================
class TokenManager {
  private static tokenCache = new Map<string, { token: string; expiry: number }>();
  private static refreshPromises = new Map<string, Promise<string>>();

  static async getValidToken(user: User, forceRefresh = false): Promise<string> {
    if (!user) throw new Error('Usuario no autenticado');

    const uid = user.uid;
    const cached = this.tokenCache.get(uid);
    const now = Date.now();

    // âœ… VERIFICAR CACHE VÃLIDO
    if (!forceRefresh && cached && cached.expiry > now + 300000) { // 5 min buffer
      return cached.token;
    }

    // âœ… EVITAR MÃšLTIPLES REFRESH SIMULTÃNEOS
    if (this.refreshPromises.has(uid)) {
      return await this.refreshPromises.get(uid)!;
    }

    // âœ… REFRESH TOKEN CON MANEJO DE ERRORES
    const refreshPromise = this.refreshToken(user);
    this.refreshPromises.set(uid, refreshPromise);

    try {
      const token = await refreshPromise;
      return token;
    } finally {
      this.refreshPromises.delete(uid);
    }
  }

  private static async refreshToken(user: User): Promise<string> {
    try {
      const token = await user.getIdToken(true); // Force refresh
      
      // âœ… VERIFICAR VALIDEZ DEL TOKEN
      const tokenPayload = this.parseJWT(token);
      if (!tokenPayload || tokenPayload.exp * 1000 <= Date.now()) {
        throw new Error('Token invÃ¡lido o expirado');
      }

      // âœ… CACHEAR TOKEN CON EXPIRACIÃ“N
      this.tokenCache.set(user.uid, {
        token,
        expiry: tokenPayload.exp * 1000
      });

      return token;
    } catch (error) {
      console.error('âŒ Error refrescando token:', error);
      this.tokenCache.delete(user.uid);
      throw new Error('No se pudo obtener token vÃ¡lido');
    }
  }

  private static parseJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  static clearCache(uid?: string): void {
    if (uid) {
      this.tokenCache.delete(uid);
      this.refreshPromises.delete(uid);
    } else {
      this.tokenCache.clear();
      this.refreshPromises.clear();
    }
  }
}

// ========================================
// ðŸ”’ FUNCIONES DE AUTENTICACIÃ“N SEGURAS
// ========================================
export const authFunctions = {
  // âœ… REGISTRO CON VALIDACIONES MEJORADAS
  async signUp(email: string, password: string, name: string) {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    
    try {
      // âœ… VALIDACIONES PREVIAS
      if (!email || !password || !name) {
        throw new Error('Todos los campos son requeridos');
      }

      if (password.length < 8) {
        throw new Error('La contraseÃ±a debe tener al menos 8 caracteres');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Email invÃ¡lido');
      }

      if (name.trim().length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres');
      }

      // âœ… CREAR USUARIO
      const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      const user = userCredential.user;
      
      // âœ… ACTUALIZAR PERFIL
      await updateProfile(user, { displayName: name.trim() });
      
      // âœ… CREAR DOCUMENTO SEGURO EN FIRESTORE
      const { doc, setDoc, Timestamp } = await import('firebase/firestore');
      const userData = {
        uid: user.uid,
        email: user.email,
        name: name.trim(),
        plan: 'free' as PlanType,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        verified: false,
        lastLogin: Timestamp.now(),
        registrationIP: await this.getClientIP(),
        securityFlags: {
          emailVerified: user.emailVerified,
          hasStrongPassword: password.length >= 12,
          registrationMethod: 'email'
        }
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      
      // âœ… ENVIAR VERIFICACIÃ“N DE EMAIL
      if (!user.emailVerified) {
        const { sendEmailVerification } = await import('firebase/auth');
        await sendEmailVerification(user);
      }
      
      return userCredential;
    } catch (error: any) {
      console.error('âŒ Error en signUp:', error);
      throw this.enhanceError(error);
    }
  },

  // âœ… INICIO DE SESIÃ“N CON VERIFICACIONES ADICIONALES
  async signIn(email: string, password: string) {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    
    try {
      // âœ… VALIDACIONES PREVIAS
      if (!email || !password) {
        throw new Error('Email y contraseÃ±a son requeridos');
      }

      // âœ… INTENTAR INICIO DE SESIÃ“N
      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      const user = userCredential.user;

      // âœ… ACTUALIZAR ÃšLTIMO LOGIN
      await this.updateLastLogin(user);

      // âœ… VERIFICAR INTEGRIDAD DE LA CUENTA
      await this.verifyAccountIntegrity(user);

      return userCredential;
    } catch (error: any) {
      console.error('âŒ Error en signIn:', error);
      
      // âœ… REGISTRAR INTENTO FALLIDO
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        await this.logFailedAttempt(email);
      }

      throw this.enhanceError(error);
    }
  },

  // âœ… GOOGLE SIGN-IN CON VERIFICACIONES
  async signInWithGoogle() {
    const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // âœ… VERIFICAR EMAIL DE GOOGLE
      if (!user.email || !user.emailVerified) {
        throw new Error('Se requiere una cuenta de Google verificada');
      }

      // âœ… CREAR O ACTUALIZAR DOCUMENTO DE USUARIO
      const { doc, setDoc, getDoc, Timestamp } = await import('firebase/firestore');
      const userDoc = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userDoc);
      
      const baseUserData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || '',
        lastLogin: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (!userSnapshot.exists()) {
        await setDoc(userDoc, {
          ...baseUserData,
          plan: 'free' as PlanType,
          createdAt: Timestamp.now(),
          verified: true,
          registrationIP: await this.getClientIP(),
          securityFlags: {
            emailVerified: true,
            registrationMethod: 'google',
            googleVerified: true
          }
        });
      } else {
        const { updateDoc } = await import('firebase/firestore');
        await updateDoc(userDoc, {
          lastLogin: Timestamp.now(),
          updatedAt: Timestamp.now(),
          name: user.displayName || userSnapshot.data()?.name || '',
          'securityFlags.googleVerified': true
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('âŒ Error en signInWithGoogle:', error);
      throw this.enhanceError(error);
    }
  },

  // âœ… RESET PASSWORD CON VALIDACIONES
  async resetPassword(email: string) {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Email invÃ¡lido');
      }

      await sendPasswordResetEmail(auth, email.toLowerCase().trim(), {
        url: `${window.location.origin}/auth?mode=signin`,
        handleCodeInApp: false
      });
    } catch (error: any) {
      console.error('âŒ Error en resetPassword:', error);
      throw this.enhanceError(error);
    }
  },

  // âœ… SIGN OUT SEGURO
  async signOut() {
    const { signOut } = await import('firebase/auth');
    
    try {
      const user = auth.currentUser;
      if (user) {
        TokenManager.clearCache(user.uid);
        await this.logLogout(user);
      }
      
      await signOut(auth);
    } catch (error: any) {
      console.error('âŒ Error en signOut:', error);
      throw this.enhanceError(error);
    }
  },

  // ========================================
  // ðŸ”§ FUNCIONES AUXILIARES SEGURAS
  // ========================================

  async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  },

  async updateLastLogin(user: User) {
    try {
      const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: Timestamp.now(),
        'securityFlags.lastLoginIP': await this.getClientIP()
      });
    } catch (error) {
      console.warn('âš ï¸ No se pudo actualizar Ãºltimo login:', error);
    }
  },

  async verifyAccountIntegrity(user: User) {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Datos de usuario no encontrados');
      }

      const userData = userDoc.data();
      
      if (userData.email !== user.email) {
        console.warn('âš ï¸ Email discrepancy detected');
      }

      if (userData.plan && !['free', 'pro', 'pro_max'].includes(userData.plan)) {
        console.warn('âš ï¸ Invalid plan detected:', userData.plan);
      }

    } catch (error) {
      console.warn('âš ï¸ Error verificando integridad:', error);
    }
  },

  async logFailedAttempt(email: string) {
    try {
      const { collection, addDoc, Timestamp } = await import('firebase/firestore');
      await addDoc(collection(db, 'security_logs'), {
        type: 'failed_login',
        email,
        timestamp: Timestamp.now(),
        ip: await this.getClientIP(),
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.warn('âš ï¸ No se pudo registrar intento fallido:', error);
    }
  },

  async logLogout(user: User) {
    try {
      const { collection, addDoc, Timestamp } = await import('firebase/firestore');
      await addDoc(collection(db, 'security_logs'), {
        type: 'logout',
        userId: user.uid,
        timestamp: Timestamp.now(),
        ip: await this.getClientIP()
      });
    } catch (error) {
      console.warn('âš ï¸ No se pudo registrar logout:', error);
    }
  },

  enhanceError(error: any): Error {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'No existe una cuenta con este email',
      'auth/wrong-password': 'ContraseÃ±a incorrecta',
      'auth/email-already-in-use': 'Ya existe una cuenta con este email',
      'auth/weak-password': 'La contraseÃ±a debe tener al menos 8 caracteres',
      'auth/invalid-email': 'Email invÃ¡lido',
      'auth/too-many-requests': 'Demasiados intentos. Intenta en 15 minutos',
      'auth/network-request-failed': 'Error de conexiÃ³n. Verifica tu internet',
      'auth/popup-closed-by-user': 'Inicio de sesiÃ³n cancelado',
      'auth/cancelled-popup-request': 'OperaciÃ³n cancelada'
    };

    const message = errorMessages[error.code] || error.message || 'Error desconocido';
    return new Error(message);
  }
};

// ========================================
// ðŸ”’ CLOUD FUNCTIONS CON TOKEN SEGURO
// ========================================
export const cloudFunctions = {
  // âœ… WRAPPER SEGURO PARA TODAS LAS FUNCIONES
  async callSecureFunction<T, R>(
    functionName: string, 
    data?: T, 
    requireAuth = true
  ): Promise<{ data: R }> {
    try {
      if (requireAuth) {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('Usuario no autenticado');
        }

        await TokenManager.getValidToken(user);
      }

      const cloudFunction = httpsCallable(functions, functionName);
      const result = await cloudFunction(data);
      
      return { data: result.data as R };
    } catch (error: any) {
      console.error(`âŒ Error en ${functionName}:`, error);
      
      if (error.code === 'unauthenticated') {
        const user = auth.currentUser;
        if (user) {
          try {
            await TokenManager.getValidToken(user, true);
            const cloudFunction = httpsCallable(functions, functionName);
            const result = await cloudFunction(data);
            return { data: result.data as R };
          } catch (retryError) {
            console.error('âŒ Error en reintento:', retryError);
          }
        }
      }
      
      throw error;
    }
  },

  // ========================================
  // FUNCIONES BÃSICAS
  // ========================================
  async getUserProfile(): Promise<{ data: UserProfile }> {
    return this.callSecureFunction<{}, UserProfile>('getUserProfile');
  },

  async chatWithAI(data: ChatWithAIInput): Promise<{ data: ChatWithAIOutput }> {
    return this.callSecureFunction<ChatWithAIInput, ChatWithAIOutput>('chatWithAI', data);
  },

  async createStripeCheckout(data: CreateStripeCheckoutInput): Promise<{ data: CreateStripeCheckoutOutput }> {
    return this.callSecureFunction<CreateStripeCheckoutInput, CreateStripeCheckoutOutput>('createStripeCheckout', data);
  },

  async manageSubscription(): Promise<{ data: ManageSubscriptionOutput }> {
    return this.callSecureFunction<{}, ManageSubscriptionOutput>('manageSubscription');
  },

  // ========================================
  // FUNCIONES DE IMÃGENES
  // ========================================
  async generateImage(data: GenerateImageInput): Promise<{ data: GenerateImageOutput }> {
    return this.callSecureFunction<GenerateImageInput, GenerateImageOutput>('generateImage', data);
  },

  async getImageUsageStatus(): Promise<{ data: GetImageUsageStatusOutput }> {
    return this.callSecureFunction<{}, GetImageUsageStatusOutput>('getImageUsageStatus');
  },

  // ========================================
  // FUNCIONES DE VIDEO
  // ========================================
  async generateVideo(data: GenerateVideoInput): Promise<{ data: GenerateVideoOutput }> {
    return this.callSecureFunction<GenerateVideoInput, GenerateVideoOutput>('generateVideo', data);
  },

  async getVideoUsageStatus(): Promise<{ data: GetVideoUsageStatusOutput }> {
    return this.callSecureFunction<{}, GetVideoUsageStatusOutput>('getVideoUsageStatus');
  },

  async checkVideoStatus(data: CheckVideoStatusInput): Promise<{ data: CheckVideoStatusOutput }> {
    return this.callSecureFunction<CheckVideoStatusInput, CheckVideoStatusOutput>('checkVideoStatus', data);
  },

  async getSignedVideoUrl(data: { videoId: string }): Promise<{ data: { success: boolean; videoUrl: string; thumbnailUrl: string; expiresIn: number; status: string } }> {
    return this.callSecureFunction('getSignedVideoUrl', data);
  },

  // ========================================
  // FUNCIONES ESPECIALIZADAS
  // ========================================
  async getSpecialistModeLimits(): Promise<{ data: SpecialistModeLimits }> {
    return this.callSecureFunction<{}, SpecialistModeLimits>('getSpecialistModeLimits');
  },

  async developerModeChat(data: DeveloperModeChatInput): Promise<{ data: DeveloperModeChatOutput }> {
    return this.callSecureFunction<DeveloperModeChatInput, DeveloperModeChatOutput>('developerModeChat', data);
  },

  async specialistModeChat(data: SpecialistModeChatInput): Promise<{ data: SpecialistModeChatOutput }> {
    return this.callSecureFunction<SpecialistModeChatInput, SpecialistModeChatOutput>('specialistModeChat', data);
  },

  // ========================================
  // FUNCIONES DE BÃšSQUEDA WEB
  // ========================================
  async searchWeb(data: SearchWebInput): Promise<{ data: SearchWebOutput }> {
    return this.callSecureFunction<SearchWebInput, SearchWebOutput>('searchWeb', data);
  },

  async getWebSearchStatus(): Promise<{ data: WebSearchStatusOutput }> {
    return this.callSecureFunction<{}, WebSearchStatusOutput>('getWebSearchStatus');
  },

  // ========================================
  // FUNCIONES DE MODOS AVANZADOS
  // ========================================
  async travelPlanner(data: AdvancedModeInput): Promise<{ data: AdvancedModeOutput }> {
    return this.callSecureFunction<AdvancedModeInput, AdvancedModeOutput>('travelPlanner', data);
  },

  async aiDetector(data: AdvancedModeInput): Promise<{ data: AdvancedModeOutput }> {
    return this.callSecureFunction<AdvancedModeInput, AdvancedModeOutput>('aiDetector', data);
  },

  async textHumanizer(data: AdvancedModeInput): Promise<{ data: AdvancedModeOutput }> {
    return this.callSecureFunction<AdvancedModeInput, AdvancedModeOutput>('textHumanizer', data);
  },

  async brandAnalyzer(data: AdvancedModeInput): Promise<{ data: AdvancedModeOutput }> {
    return this.callSecureFunction<AdvancedModeInput, AdvancedModeOutput>('brandAnalyzer', data);
  },

  async documentDetective(data: AdvancedModeInput): Promise<{ data: AdvancedModeOutput }> {
    return this.callSecureFunction<AdvancedModeInput, AdvancedModeOutput>('documentDetective', data);
  },

  async plantDoctor(data: AdvancedModeInput): Promise<{ data: AdvancedModeOutput }> {
    return this.callSecureFunction<AdvancedModeInput, AdvancedModeOutput>('plantDoctor', data);
  },

  // ========================================
  // FUNCIÃ“N PERSONALIZADA PARA METADATOS
  // ========================================
  async saveConversationMetadata(metadata: ConversationMetadataInput) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const token = await TokenManager.getValidToken(user);
    
    const response = await fetch('/api/save-conversation-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Request-Source': 'nora-client'
      },
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      throw new Error(`Error guardando metadatos: ${response.status}`);
    }

    const result = await response.json();
    return { data: result };
  }
};

// ========================================
// ðŸ› ï¸ FUNCIONES DE UTILIDAD
// ========================================
export const helpers = {
  getErrorMessage(error: any): string {
    if (error && typeof error === 'object' && 'code' in error) {
      const errorMessages: { [key: string]: string } = {
        'auth/user-not-found': 'No se encontrÃ³ ningÃºn usuario con este email',
        'auth/wrong-password': 'ContraseÃ±a incorrecta',
        'auth/email-already-in-use': 'Este email ya estÃ¡ registrado',
        'auth/weak-password': 'La contraseÃ±a debe tener al menos 8 caracteres',
        'auth/invalid-email': 'Email invÃ¡lido',
        'auth/too-many-requests': 'Demasiados intentos. Intenta mÃ¡s tarde',
        'auth/network-request-failed': 'Error de conexiÃ³n',
        'functions/permission-denied': 'Sin permisos para esta operaciÃ³n',
        'functions/unauthenticated': 'SesiÃ³n expirada. Por favor, inicia sesiÃ³n nuevamente',
        'functions/resource-exhausted': 'LÃ­mite alcanzado. Actualiza tu plan para continuar',
        'functions/deadline-exceeded': 'OperaciÃ³n tardÃ³ demasiado. Intenta nuevamente',
        'functions/internal': 'Error interno del servidor',
        'functions/unavailable': 'Servicio temporalmente no disponible'
      };
      
      return errorMessages[error.code] || `Error: ${error.code}`;
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    
    return 'Error desconocido';
  },

  isValidPlan(plan: any): plan is PlanType {
    return plan === 'free' || plan === 'pro' || plan === 'pro_max';
  },

  isPremiumPlan(plan: PlanType): boolean {
    return plan === 'pro' || plan === 'pro_max';
  },

  canAccessFeature(plan: PlanType, feature: string): boolean {
    const features: { [key in PlanType]: string[] } = {
      free: ['chat', 'basic_analysis'],
      pro: ['chat', 'basic_analysis', 'image_generation', 'specialist_mode'],
      pro_max: ['chat', 'basic_analysis', 'image_generation', 'video_generation', 'specialist_mode', 'developer_mode']
    };

    return features[plan]?.includes(feature) || false;
  },

  isSecureEnvironment(): boolean {
    return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  },

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Debe tener al menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe contener al menos una mayÃºscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una minÃºscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Debe contener al menos un nÃºmero');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  formatTokens(count: number | undefined | null): string {
    if (count === undefined || count === null || isNaN(count)) {
      return '0';
    }
    if (count === -1) return 'Ilimitado';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  },

  formatTokenUsage(used: number, limit: number): string {
    if (limit === -1) return `${used.toLocaleString()} (Ilimitado)`;
    return `${used.toLocaleString()} / ${limit.toLocaleString()}`;
  },

  getUsagePercentage(used: number, limit: number): number {
    if (limit === -1) return 0;
    if (limit === 0) return 100;
    return Math.min((used / limit) * 100, 100);
  },

  validateImagePrompt(prompt: string, maxLength: number): { valid: boolean; error?: string; errors: string[] } {
    const errors: string[] = [];
    
    if (!prompt || prompt.trim().length === 0) {
      errors.push('El prompt es requerido');
    }
    
    if (prompt.length > maxLength) {
      errors.push(`El prompt no puede tener mÃ¡s de ${maxLength} caracteres`);
    }
    
    if (prompt.length < 3) {
      errors.push('El prompt debe tener al menos 3 caracteres');
    }
    
    const inappropriateTerms = ['nsfw', 'nude', 'naked', 'sexual', 'porn'];
    const lowercasePrompt = prompt.toLowerCase();
    if (inappropriateTerms.some(term => lowercasePrompt.includes(term))) {
      errors.push('El prompt contiene contenido inapropiado');
    }
    
    return {
      valid: errors.length === 0,
      error: errors.length > 0 ? errors[0] : undefined,
      errors
    };
  },

  validateVideoPrompt(prompt: string, maxLength: number): { valid: boolean; error?: string; errors: string[] } {
    const errors: string[] = [];
    
    if (!prompt || prompt.trim().length === 0) {
      errors.push('El prompt es requerido');
    }
    
    if (prompt.length > maxLength) {
      errors.push(`El prompt no puede tener mÃ¡s de ${maxLength} caracteres`);
    }
    
    if (prompt.length < 5) {
      errors.push('El prompt debe tener al menos 5 caracteres');
    }
    
    const inappropriateTerms = ['nsfw', 'nude', 'naked', 'sexual', 'porn', 'violence', 'blood'];
    const lowercasePrompt = prompt.toLowerCase();
    if (inappropriateTerms.some(term => lowercasePrompt.includes(term))) {
      errors.push('El prompt contiene contenido inapropiado');
    }
    
    return {
      valid: errors.length === 0,
      error: errors.length > 0 ? errors[0] : undefined,
      errors
    };
  },

  async downloadImage(imageUrl: string, filename: string): Promise<void> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando imagen:', error);
      throw new Error('No se pudo descargar la imagen');
    }
  },

  async shareImage(imageUrl: string, text: string): Promise<void> {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Imagen generada con NORA',
          text: text,
          url: imageUrl
        });
      } else {
        await navigator.clipboard.writeText(`${text}\n${imageUrl}`);
        console.log('URL copiada al portapapeles.');
      }
    } catch (error) {
      console.error('Error compartiendo imagen:', error);
      throw error;
    }
  },
};

// ========================================
// ðŸ”„ INICIALIZACIÃ“N SEGURA
// ========================================

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  const hostname = 'localhost';
  
  console.log('ðŸ”§ Conectando a Firebase Emulators...');
  
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

if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('âœ… Usuario autenticado:', user.uid);
    } else {
      console.log('ðŸ‘¤ Usuario no autenticado');
      TokenManager.clearCache();
    }
  });
}

// ========================================
// ðŸ“Š EXPORTACIONES
// ========================================

export const PLAN_LIMITS = {
  free: {
    tokensPerDay: 66666,
    tokensPerMonth: 2000000,
    imagesPerMonth: 15,
    videosPerMonth: 0,
    webSearchesPerMonth: 50,
    maxFileSize: 10,
    maxResponseTokens: 2000
  },
  pro: {
    tokensPerDay: 333333,
    tokensPerMonth: 10000000,
    imagesPerMonth: 50,
    videosPerMonth: 50,
    webSearchesPerMonth: 500,
    maxFileSize: 50,
    maxResponseTokens: 4000
  },
  pro_max: {
    tokensPerDay: 666666,
    tokensPerMonth: 20000000,
    imagesPerMonth: 200,
    videosPerMonth: 150,
    webSearchesPerMonth: 2000,
    maxFileSize: 100,
    maxResponseTokens: 10000
  }
};

export default app;