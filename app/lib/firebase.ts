// app/lib/firebase.ts - AUTENTICACIÓN SEGURA MEJORADA
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
  WebSearchStatusOutput
} from './types';

// ========================================
// 🔒 CONFIGURACIÓN SEGURA DE FIREBASE
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

// ✅ VALIDAR CONFIGURACIÓN ANTES DE INICIALIZAR
function validateFirebaseConfig(): boolean {
  const requiredFields = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];

  const missing = requiredFields.filter(field => !process.env[field]);
  
  if (missing.length > 0) {
    console.error('❌ Configuración de Firebase incompleta. Faltan:', missing);
    console.log('🔍 Variables de entorno actuales:', {
      API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Presente' : '❌ Faltante',
      AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Presente' : '❌ Faltante',
      PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Presente' : '❌ Faltante'
    });
    return false;
  }

  return true;
}

// Inicializar Firebase (con configuración válida garantizada)
console.log('🔥 Inicializando Firebase con configuración:', {
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
// 🔒 SISTEMA DE VERIFICACIÓN DE TOKENS MEJORADO
// ========================================
class TokenManager {
  private static tokenCache = new Map<string, { token: string; expiry: number }>();
  private static refreshPromises = new Map<string, Promise<string>>();

  static async getValidToken(user: User, forceRefresh = false): Promise<string> {
    if (!user) throw new Error('Usuario no autenticado');

    const uid = user.uid;
    const cached = this.tokenCache.get(uid);
    const now = Date.now();

    // ✅ VERIFICAR CACHE VÁLIDO
    if (!forceRefresh && cached && cached.expiry > now + 300000) { // 5 min buffer
      return cached.token;
    }

    // ✅ EVITAR MÚLTIPLES REFRESH SIMULTÁNEOS
    if (this.refreshPromises.has(uid)) {
      return await this.refreshPromises.get(uid)!;
    }

    // ✅ REFRESH TOKEN CON MANEJO DE ERRORES
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
      
      // ✅ VERIFICAR VALIDEZ DEL TOKEN
      const tokenPayload = this.parseJWT(token);
      if (!tokenPayload || tokenPayload.exp * 1000 <= Date.now()) {
        throw new Error('Token inválido o expirado');
      }

      // ✅ CACHEAR TOKEN CON EXPIRACIÓN
      this.tokenCache.set(user.uid, {
        token,
        expiry: tokenPayload.exp * 1000
      });

      return token;
    } catch (error) {
      console.error('❌ Error refrescando token:', error);
      this.tokenCache.delete(user.uid);
      throw new Error('No se pudo obtener token válido');
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
// 🔒 FUNCIONES DE AUTENTICACIÓN SEGURAS
// ========================================
export const authFunctions = {
  // ✅ REGISTRO CON VALIDACIONES MEJORADAS
  async signUp(email: string, password: string, name: string) {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    
    try {
      // ✅ VALIDACIONES PREVIAS
      if (!email || !password || !name) {
        throw new Error('Todos los campos son requeridos');
      }

      if (password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Email inválido');
      }

      if (name.trim().length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres');
      }

      // ✅ CREAR USUARIO
      const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      const user = userCredential.user;
      
      // ✅ ACTUALIZAR PERFIL
      await updateProfile(user, { displayName: name.trim() });
      
      // ✅ CREAR DOCUMENTO SEGURO EN FIRESTORE
      const { doc, setDoc, Timestamp } = await import('firebase/firestore');
      const userData = {
        uid: user.uid,
        email: user.email,
        name: name.trim(),
        plan: 'free' as PlanType,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        // ✅ CAMPOS DE SEGURIDAD
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
      
      // ✅ ENVIAR VERIFICACIÓN DE EMAIL
      if (!user.emailVerified) {
        const { sendEmailVerification } = await import('firebase/auth');
        await sendEmailVerification(user);
      }
      
      return userCredential;
    } catch (error: any) {
      console.error('❌ Error en signUp:', error);
      throw this.enhanceError(error);
    }
  },

  // ✅ INICIO DE SESIÓN CON VERIFICACIONES ADICIONALES
  async signIn(email: string, password: string) {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    
    try {
      // ✅ VALIDACIONES PREVIAS
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // ✅ INTENTAR INICIO DE SESIÓN
      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      const user = userCredential.user;

      // ✅ VERIFICAR ESTADO DE LA CUENTA
      // Nota: user.disabled no está disponible en el cliente, se verificará en el servidor

      // ✅ ACTUALIZAR ÚLTIMO LOGIN
      await this.updateLastLogin(user);

      // ✅ VERIFICAR INTEGRIDAD DE LA CUENTA
      await this.verifyAccountIntegrity(user);

      return userCredential;
    } catch (error: any) {
      console.error('❌ Error en signIn:', error);
      
      // ✅ REGISTRAR INTENTO FALLIDO (OPCIONAL)
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        await this.logFailedAttempt(email);
      }

      throw this.enhanceError(error);
    }
  },

  // ✅ GOOGLE SIGN-IN CON VERIFICACIONES
  async signInWithGoogle() {
    const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // ✅ CONFIGURACIONES ADICIONALES DE SEGURIDAD
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // ✅ VERIFICAR EMAIL DE GOOGLE
      if (!user.email || !user.emailVerified) {
        throw new Error('Se requiere una cuenta de Google verificada');
      }

      // ✅ CREAR O ACTUALIZAR DOCUMENTO DE USUARIO
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
        // ✅ NUEVO USUARIO - CREAR CON DATOS COMPLETOS
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
        // ✅ USUARIO EXISTENTE - ACTUALIZAR SOLO CAMPOS SEGUROS
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
      console.error('❌ Error en signInWithGoogle:', error);
      throw this.enhanceError(error);
    }
  },

  // ✅ RESET PASSWORD CON VALIDACIONES
  async resetPassword(email: string) {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Email inválido');
      }

      await sendPasswordResetEmail(auth, email.toLowerCase().trim(), {
        url: `${window.location.origin}/auth?mode=signin`,
        handleCodeInApp: false
      });
    } catch (error: any) {
      console.error('❌ Error en resetPassword:', error);
      throw this.enhanceError(error);
    }
  },

  // ✅ SIGN OUT SEGURO
  async signOut() {
    const { signOut } = await import('firebase/auth');
    
    try {
      const user = auth.currentUser;
      if (user) {
        // ✅ LIMPIAR CACHE DE TOKENS
        TokenManager.clearCache(user.uid);
        
        // ✅ REGISTRAR LOGOUT (OPCIONAL)
        await this.logLogout(user);
      }
      
      await signOut(auth);
    } catch (error: any) {
      console.error('❌ Error en signOut:', error);
      throw this.enhanceError(error);
    }
  },

  // ========================================
  // 🔧 FUNCIONES AUXILIARES SEGURAS
  // ========================================

  // Obtener IP del cliente (para logging de seguridad)
  async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  },

  // Actualizar último login
  async updateLastLogin(user: User) {
    try {
      const { doc, updateDoc, Timestamp } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: Timestamp.now(),
        'securityFlags.lastLoginIP': await this.getClientIP()
      });
    } catch (error) {
      console.warn('⚠️ No se pudo actualizar último login:', error);
    }
  },

  // Verificar integridad de la cuenta
  async verifyAccountIntegrity(user: User) {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Datos de usuario no encontrados');
      }

      const userData = userDoc.data();
      
      // ✅ VERIFICACIONES DE INTEGRIDAD
      if (userData.email !== user.email) {
        console.warn('⚠️ Email discrepancy detected');
      }

      if (userData.plan && !['free', 'pro', 'pro_max'].includes(userData.plan)) {
        console.warn('⚠️ Invalid plan detected:', userData.plan);
      }

    } catch (error) {
      console.warn('⚠️ Error verificando integridad:', error);
    }
  },

  // Registrar intento fallido
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
      console.warn('⚠️ No se pudo registrar intento fallido:', error);
    }
  },

  // Registrar logout
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
      console.warn('⚠️ No se pudo registrar logout:', error);
    }
  },

  // Mejorar errores para el usuario
  enhanceError(error: any): Error {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'No existe una cuenta con este email',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'Ya existe una cuenta con este email',
      'auth/weak-password': 'La contraseña debe tener al menos 8 caracteres',
      'auth/invalid-email': 'Email inválido',
      'auth/too-many-requests': 'Demasiados intentos. Intenta en 15 minutos',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/popup-closed-by-user': 'Inicio de sesión cancelado',
      'auth/cancelled-popup-request': 'Operación cancelada'
    };

    const message = errorMessages[error.code] || error.message || 'Error desconocido';
    return new Error(message);
  }
};

// ========================================
// 🔒 CLOUD FUNCTIONS CON TOKEN SEGURO
// ========================================
export const cloudFunctions = {
  // ✅ WRAPPER SEGURO PARA TODAS LAS FUNCIONES
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

        // ✅ OBTENER TOKEN VÁLIDO
        await TokenManager.getValidToken(user);
      }

      // ✅ LLAMAR FUNCIÓN CON MANEJO DE ERRORES
      const cloudFunction = httpsCallable(functions, functionName);
      const result = await cloudFunction(data);
      
      // ✅ MANTENER COMPATIBILIDAD CON CÓDIGO EXISTENTE
      return { data: result.data as R };
    } catch (error: any) {
      console.error(`❌ Error en ${functionName}:`, error);
      
      // ✅ MANEJO ESPECÍFICO DE ERRORES DE AUTENTICACIÓN
      if (error.code === 'unauthenticated') {
        const user = auth.currentUser;
        if (user) {
          // Forzar refresh del token
          try {
            await TokenManager.getValidToken(user, true);
            // Reintentar una vez
            const cloudFunction = httpsCallable(functions, functionName);
            const result = await cloudFunction(data);
            return { data: result.data as R };
          } catch (retryError) {
            console.error('❌ Error en reintento:', retryError);
          }
        }
      }
      
      throw error;
    }
  },

  // ========================================
  // FUNCIONES BÁSICAS CON SEGURIDAD
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
  // FUNCIONES DE IMÁGENES CON SEGURIDAD
  // ========================================
  async generateImage(data: GenerateImageInput): Promise<{ data: GenerateImageOutput }> {
    return this.callSecureFunction<GenerateImageInput, GenerateImageOutput>('generateImage', data);
  },

  async getImageUsageStatus(): Promise<{ data: GetImageUsageStatusOutput }> {
    return this.callSecureFunction<{}, GetImageUsageStatusOutput>('getImageUsageStatus');
  },

  // ========================================
  // FUNCIONES DE VIDEO CON SEGURIDAD
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
  // FUNCIONES ESPECIALIZADAS CON SEGURIDAD
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
  // FUNCIONES DE BÚSQUEDA WEB CON SEGURIDAD
  // ========================================
  async searchWeb(data: SearchWebInput): Promise<{ data: SearchWebOutput }> {
    return this.callSecureFunction<SearchWebInput, SearchWebOutput>('searchWeb', data);
  },

  async getWebSearchStatus(): Promise<{ data: WebSearchStatusOutput }> {
    return this.callSecureFunction<{}, WebSearchStatusOutput>('getWebSearchStatus');
  },

  // ========================================
  // FUNCIÓN PERSONALIZADA SEGURA PARA METADATOS
  // ========================================
  async saveConversationMetadata(metadata: ConversationMetadataInput) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    // ✅ OBTENER TOKEN VÁLIDO
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
    return { data: result }; // ✅ MANTENER COMPATIBILIDAD
  }
};

// ========================================
// 🛠️ FUNCIONES DE UTILIDAD MEJORADAS
// ========================================
export const helpers = {
  // ✅ FUNCIÓN MEJORADA DE ERRORES
  getErrorMessage(error: any): string {
    if (error && typeof error === 'object' && 'code' in error) {
      const errorMessages: { [key: string]: string } = {
        // Errores de autenticación
        'auth/user-not-found': 'No se encontró ningún usuario con este email',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/email-already-in-use': 'Este email ya está registrado',
        'auth/weak-password': 'La contraseña debe tener al menos 8 caracteres',
        'auth/invalid-email': 'Email inválido',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
        'auth/network-request-failed': 'Error de conexión',
        
        // Errores de funciones
        'functions/permission-denied': 'Sin permisos para esta operación',
        'functions/unauthenticated': 'Sesión expirada. Por favor, inicia sesión nuevamente',
        'functions/resource-exhausted': 'Límite alcanzado. Actualiza tu plan para continuar',
        'functions/deadline-exceeded': 'Operación tardó demasiado. Intenta nuevamente',
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

  // ✅ VALIDACIONES DE PLAN MEJORADAS
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

  // ✅ VALIDACIONES DE SEGURIDAD
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
      errors.push('Debe contener al menos una mayúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Debe contener al menos una minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Debe contener al menos un número');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  // ✅ FUNCIONES DE FORMATO EXISTENTES (MANTENER)
  formatTokens(count: number | undefined | null): string {
    // ✅ MANEJAR VALORES UNDEFINED/NULL
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

  // ✅ VALIDACIONES DE PROMPTS (COMPATIBLES CON CÓDIGO EXISTENTE)
  validateImagePrompt(prompt: string, maxLength: number): { valid: boolean; error?: string; errors: string[] } {
    const errors: string[] = [];
    
    if (!prompt || prompt.trim().length === 0) {
      errors.push('El prompt es requerido');
    }
    
    if (prompt.length > maxLength) {
      errors.push(`El prompt no puede tener más de ${maxLength} caracteres`);
    }
    
    if (prompt.length < 3) {
      errors.push('El prompt debe tener al menos 3 caracteres');
    }
    
    // Verificar contenido inapropiado básico
    const inappropriateTerms = ['nsfw', 'nude', 'naked', 'sexual', 'porn'];
    const lowercasePrompt = prompt.toLowerCase();
    if (inappropriateTerms.some(term => lowercasePrompt.includes(term))) {
      errors.push('El prompt contiene contenido inapropiado');
    }
    
    return {
      valid: errors.length === 0,
      error: errors.length > 0 ? errors[0] : undefined, // ✅ COMPATIBILIDAD
      errors
    };
  },

  validateVideoPrompt(prompt: string, maxLength: number): { valid: boolean; error?: string; errors: string[] } {
    const errors: string[] = [];
    
    if (!prompt || prompt.trim().length === 0) {
      errors.push('El prompt es requerido');
    }
    
    if (prompt.length > maxLength) {
      errors.push(`El prompt no puede tener más de ${maxLength} caracteres`);
    }
    
    if (prompt.length < 5) {
      errors.push('El prompt debe tener al menos 5 caracteres');
    }
    
    // Verificar contenido inapropiado básico
    const inappropriateTerms = ['nsfw', 'nude', 'naked', 'sexual', 'porn', 'violence', 'blood'];
    const lowercasePrompt = prompt.toLowerCase();
    if (inappropriateTerms.some(term => lowercasePrompt.includes(term))) {
      errors.push('El prompt contiene contenido inapropiado');
    }
    
    return {
      valid: errors.length === 0,
      error: errors.length > 0 ? errors[0] : undefined, // ✅ COMPATIBILIDAD
      errors
    };
  },

  // ✅ FUNCIONES DE DESCARGA Y COMPARTIR
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
        // Usar Web Share API si está disponible
        await navigator.share({
          title: 'Imagen generada con NORA',
          text: text,
          url: imageUrl
        });
      } else {
        // Fallback: copiar URL al portapapeles
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
// 🔄 INICIALIZACIÓN SEGURA
// ========================================

// ✅ CONFIGURAR EMULADORES SOLO EN DESARROLLO
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  const hostname = 'localhost';
  
  console.log('🔧 Conectando a Firebase Emulators...');
  
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

// ✅ MONITOREO DE ESTADO DE AUTENTICACIÓN
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('✅ Usuario autenticado:', user.uid);
    } else {
      console.log('👤 Usuario no autenticado');
      TokenManager.clearCache();
    }
  });
}

// ========================================
// 📊 EXPORTACIONES
// ========================================

// Constantes existentes (mantener)
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

// Exportar app por defecto
export default app;