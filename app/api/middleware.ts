// app/api/middleware.ts - MIDDLEWARE DE VERIFICACIÓN SEGURA
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import Stripe from 'stripe';

// ========================================
// 🔒 VALIDACIÓN DE VARIABLES DE ENTORNO
// ========================================
function validateEnvVars() {
  const requiredVars = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file and make sure all required variables are set.'
    );
  }

  return requiredVars as Record<string, string>;
}

// ========================================
// 🔒 CONFIGURACIÓN SEGURA DE FIREBASE ADMIN
// ========================================
function initializeFirebaseAdmin() {
  if (!getApps().length) {
    try {
      const envVars = validateEnvVars();
      
      const serviceAccount = {
        projectId: envVars.FIREBASE_PROJECT_ID,
        clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
        privateKey: envVars.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };

      initializeApp({
        credential: cert(serviceAccount),
        projectId: envVars.FIREBASE_PROJECT_ID,
      });

      console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin:', error);
      throw error;
    }
  }
}

// Variables globales inicializadas de forma lazy
let adminAuth: any = null;
let adminDb: any = null;
let stripe: Stripe | null = null;

// Funciones getter que inicializan solo cuando es necesario
function getAdminAuth() {
  if (!adminAuth) {
    initializeFirebaseAdmin();
    adminAuth = getAuth();
  }
  return adminAuth;
}

function getAdminDb() {
  if (!adminDb) {
    initializeFirebaseAdmin();
    adminDb = getFirestore();
  }
  return adminDb;
}

function getStripe() {
  if (!stripe) {
    const envVars = validateEnvVars();
    stripe = new Stripe(envVars.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
  }
  return stripe;
}

// ========================================
// 🛡️ TIPOS DE VERIFICACIÓN
// ========================================
export interface AuthResult {
  success: boolean;
  user?: {
    uid: string;
    email: string;
    plan: string;
    verified: boolean;
    subscriptionStatus?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  error?: string;
  errorCode?: string;
}

export interface SubscriptionVerification {
  isValid: boolean;
  plan: string;
  status: string;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  error?: string;
}

// ========================================
// 🔒 FUNCIONES DE VERIFICACIÓN PRINCIPALES
// ========================================

/**
 * Verifica el token de Firebase y obtiene datos del usuario
 */
async function verifyFirebaseTokenInternal(request: NextRequest): Promise<AuthResult> {
  try {
    // ✅ EXTRAER TOKEN DEL HEADER
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Token de autorización requerido',
        errorCode: 'MISSING_TOKEN'
      };
    }

    const token = authHeader.substring(7);
    
    // ✅ VERIFICAR TOKEN CON FIREBASE ADMIN
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(token, true);
    
    if (!decodedToken.uid) {
      return {
        success: false,
        error: 'Token inválido',
        errorCode: 'INVALID_TOKEN'
      };
    }

    // ✅ OBTENER DATOS DEL USUARIO DESDE FIRESTORE
    const adminDb = getAdminDb();
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return {
        success: false,
        error: 'Usuario no encontrado',
        errorCode: 'USER_NOT_FOUND'
      };
    }

    const userData = userDoc.data()!;

    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email || userData.email,
        plan: userData.plan || 'free',
        verified: decodedToken.email_verified || false,
        subscriptionStatus: userData.subscriptionStatus,
        stripeCustomerId: userData.stripeCustomerId,
        stripeSubscriptionId: userData.stripeSubscriptionId,
      }
    };

  } catch (error: any) {
    console.error('❌ Error verifying Firebase token:', error);

    // Errores específicos de Firebase
    if (error.code === 'auth/id-token-expired') {
      return {
        success: false,
        error: 'Token expirado',
        errorCode: 'TOKEN_EXPIRED'
      };
    }

    if (error.code === 'auth/id-token-revoked') {
      return {
        success: false,
        error: 'Token revocado',
        errorCode: 'TOKEN_REVOKED'
      };
    }

    return {
      success: false,
      error: 'Error verificando autenticación',
      errorCode: 'AUTH_ERROR'
    };
  }
}

/**
 * Función pública para verificar tokens
 */
export async function verifyFirebaseToken(request: NextRequest): Promise<AuthResult> {
  return await verifyFirebaseTokenInternal(request);
}

/**
 * Verifica la suscripción del usuario con Stripe
 */
export async function verifySubscription(
  stripeSubscriptionId: string
): Promise<SubscriptionVerification> {
  try {
    if (!stripeSubscriptionId) {
      return {
        isValid: false,
        plan: 'free',
        status: 'inactive',
        error: 'No subscription ID'
      };
    }

    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

    const isActive = ['active', 'trialing'].includes(subscription.status);
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    // Mapear price ID a plan
    const priceId = subscription.items.data[0]?.price?.id;
    const planMapping: { [key: string]: string } = {
      'price_1S8id6Pa2fV72c7wyqjkxdpw': 'pro',
      'price_1S12wKPa2fV72c7wX2NRAwQF': 'pro_max',
    };
    const plan = planMapping[priceId || ''] || 'free';

    return {
      isValid: isActive,
      plan: isActive ? plan : 'free',
      status: subscription.status,
      currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };

  } catch (error: any) {
    console.error('❌ Error verifying subscription:', error);
    return {
      isValid: false,
      plan: 'free',
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Registra eventos de seguridad
 */
export async function logSecurityEvent(
  eventType: string,
  eventData: any,
  userId?: string,
  request?: NextRequest
) {
  try {
    const adminDb = getAdminDb();
    
    const securityEvent = {
      type: eventType,
      data: eventData,
      userId: userId || 'anonymous',
      timestamp: new Date(),
      ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown',
      userAgent: request?.headers.get('user-agent') || 'unknown',
      referer: request?.headers.get('referer') || 'unknown',
    };

    await adminDb.collection('security_events').add(securityEvent);
    console.log('🔒 Security event logged:', eventType);

  } catch (error) {
    console.error('❌ Error logging security event:', error);
    // No re-throw, los logs de seguridad no deben bloquear la operación principal
  }
}

/**
 * Middleware factory para proteger rutas
 */
export function withAuth(options: {
  requireAuth?: boolean;
  requiredPlan?: string;
  feature?: string;
  strictSubscriptionCheck?: boolean;
  checkUsageLimits?: boolean;
} = {}) {
  
  return async function middleware(request: NextRequest): Promise<NextResponse | { user: AuthResult['user']; verified: boolean }> {
    
    // ✅ VERIFICAR AUTENTICACIÓN SI ES REQUERIDA
    if (options.requireAuth !== false) {
      const authResult = await verifyFirebaseTokenInternal(request);
      
      if (!authResult.success) {
        return NextResponse.json(
          { 
            error: authResult.error, 
            code: authResult.errorCode 
          },
          { status: 401 }
        );
      }

      const user = authResult.user!;

      // ✅ VERIFICAR PLAN REQUERIDO
      if (options.requiredPlan && user.plan !== options.requiredPlan) {
        // Verificar si el plan actual es superior
        const planHierarchy = ['free', 'pro', 'pro_max'];
        const requiredIndex = planHierarchy.indexOf(options.requiredPlan);
        const userIndex = planHierarchy.indexOf(user.plan);

        if (requiredIndex === -1 || userIndex < requiredIndex) {
          await logSecurityEvent('insufficient_plan_access', {
            required_plan: options.requiredPlan,
            user_plan: user.plan,
            feature: options.feature
          }, user.uid, request);

          return NextResponse.json(
            {
              error: `Plan ${options.requiredPlan} requerido`,
              code: 'INSUFFICIENT_PLAN',
              requiredPlan: options.requiredPlan,
              currentPlan: user.plan
            },
            { status: 403 }
          );
        }
      }

      // ✅ VERIFICACIÓN ESTRICTA DE SUSCRIPCIÓN
      if (options.strictSubscriptionCheck && user.stripeSubscriptionId) {
        const subscriptionVerification = await verifySubscription(user.stripeSubscriptionId);
        
        if (!subscriptionVerification.isValid) {
          await logSecurityEvent('invalid_subscription_access', {
            subscription_id: user.stripeSubscriptionId,
            subscription_status: subscriptionVerification.status,
            feature: options.feature
          }, user.uid, request);

          // Actualizar plan del usuario a free si la suscripción no es válida
          try {
            const adminDb = getAdminDb();
            await adminDb.collection('users').doc(user.uid).update({
              plan: 'free',
              subscriptionStatus: subscriptionVerification.status,
              lastSubscriptionCheck: new Date()
            });
          } catch (updateError) {
            console.error('❌ Error updating user plan:', updateError);
          }

          return NextResponse.json(
            {
              error: 'Suscripción inválida o expirada',
              code: 'INVALID_SUBSCRIPTION',
              subscriptionStatus: subscriptionVerification.status
            },
            { status: 403 }
          );
        }
      }

      // Retornar usuario verificado para uso en la ruta
      return { user, verified: true };
    }

    // Si no se requiere autenticación, continuar
    return { user: undefined, verified: false };
  };
}

/**
 * Funciones auxiliares exportadas
 */
export { getAdminAuth, getAdminDb, getStripe };

// ========================================
// 🔧 FUNCIONES AUXILIARES ADICIONALES
// ========================================

/**
 * Verifica límites de uso por plan
 */
export async function checkUsageLimits(
  userId: string,
  feature: string,
  plan: string
): Promise<{ allowed: boolean; remaining: number; resetDate?: Date }> {
  try {
    const adminDb = getAdminDb();
    const usageDoc = await adminDb
      .collection('usage_tracking')
      .doc(`${userId}_${feature}`)
      .get();

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const usageData = usageDoc.exists ? usageDoc.data() : {};
    const monthlyUsage = usageData[currentMonth] || 0;

    // Límites por plan
    const limits: { [key: string]: { [key: string]: number } } = {
      free: { chat: 20, image: 5, video: 0 },
      pro: { chat: 500, image: 100, video: 10 },
      pro_max: { chat: -1, image: -1, video: 50 } // -1 = ilimitado
    };

    const limit = limits[plan]?.[feature] || 0;
    const allowed = limit === -1 || monthlyUsage < limit;
    const remaining = limit === -1 ? -1 : Math.max(0, limit - monthlyUsage);

    // Fecha de reset (primer día del próximo mes)
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return { allowed, remaining, resetDate };

  } catch (error) {
    console.error('❌ Error checking usage limits:', error);
    // En caso de error, permitir el uso (fail-open)
    return { allowed: true, remaining: 999 };
  }
}

/**
 * Incrementa el contador de uso
 */
export async function incrementUsage(
  userId: string,
  feature: string,
  amount: number = 1
): Promise<void> {
  try {
    const adminDb = getAdminDb();
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    await adminDb
      .collection('usage_tracking')
      .doc(`${userId}_${feature}`)
      .set({
        [currentMonth]: FieldValue.increment(amount),
        lastUpdated: now,
        userId,
        feature
      }, { merge: true });

  } catch (error) {
    console.error('❌ Error incrementing usage:', error);
    // No re-throw, el tracking de uso no debe bloquear la operación principal
  }
}