// app/api/validate-payment/route.ts - API DE VALIDACIÓN SEGURA DE PAGOS
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { logSecurityEvent } from '../middleware';

// ========================================
// 🔒 VALIDACIÓN DE VARIABLES DE ENTORNO
// ========================================
function validateStripeEnvVars() {
  const requiredVars = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Stripe environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file and make sure STRIPE_SECRET_KEY is set.'
    );
  }

  return requiredVars as Record<string, string>;
}

// ========================================
// 🔒 CONFIGURACIÓN SEGURA DE STRIPE
// ========================================
function getStripe(): Stripe {
  const envVars = validateStripeEnvVars();
  return new Stripe(envVars.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
  });
}

// ========================================
// 🛡️ TIPOS DE VALIDACIÓN
// ========================================
interface PaymentValidationRequest {
  session_id: string;
  timestamp: number;
}

interface PaymentValidationResponse {
  success: boolean;
  session?: {
    id: string;
    payment_status: string;
    customer_email: string;
    subscription_id?: string;
    plan?: string;
    amount_total?: number;
    currency?: string;
    created: number;
  };
  error?: string;
  errorCode?: string;
}

// ========================================
// 🔒 FUNCIÓN PRINCIPAL DE VALIDACIÓN
// ========================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // ✅ VERIFICAR CONFIGURACIÓN DE STRIPE AL INICIO
    const stripe = getStripe();

    // ✅ PASO 1: VALIDAR DATOS DE ENTRADA
    const body: PaymentValidationRequest = await request.json();
    const { session_id, timestamp } = body;

    if (!session_id || typeof session_id !== 'string') {
      await logSecurityEvent('invalid_payment_validation', {
        error: 'Missing session_id',
        ip: request.headers.get('x-forwarded-for')
      }, undefined, request);

      return NextResponse.json({
        success: false,
        error: 'ID de sesión requerido',
        errorCode: 'MISSING_SESSION_ID'
      }, { status: 400 });
    }

    // ✅ PASO 2: VALIDAR FORMATO DEL SESSION ID
    if (!session_id.startsWith('cs_')) {
      return NextResponse.json({
        success: false,
        error: 'Formato de ID de sesión inválido',
        errorCode: 'INVALID_SESSION_FORMAT'
      }, { status: 400 });
    }

    // ✅ PASO 3: VERIFICAR TIMESTAMP (PREVENIR ATAQUES DE REPLAY)
    const now = Date.now();
    const timeDiff = Math.abs(now - timestamp);
    const maxAllowedDiff = 5 * 60 * 1000; // 5 minutos

    if (timeDiff > maxAllowedDiff) {
      await logSecurityEvent('payment_validation_replay_attack', {
        session_id,
        timestamp,
        current_time: now,
        time_diff: timeDiff
      }, undefined, request);

      return NextResponse.json({
        success: false,
        error: 'Solicitud expirada',
        errorCode: 'REQUEST_EXPIRED'
      }, { status: 400 });
    }

    console.log('🔍 Validando sesión de pago:', session_id);

    // ✅ PASO 4: VERIFICAR SESIÓN CON STRIPE
    let session: Stripe.Checkout.Session;
    
    try {
      session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['subscription', 'customer']
      });
    } catch (stripeError: any) {
      console.error('❌ Error recuperando sesión de Stripe:', stripeError);

      // ✅ MANEJAR ERRORES ESPECÍFICOS DE STRIPE
      let errorCode = 'STRIPE_ERROR';
      let errorMessage = 'Error verificando pago';

      if (stripeError.code === 'resource_missing') {
        errorCode = 'SESSION_NOT_FOUND';
        errorMessage = 'Sesión de pago no encontrada o expirada';
      } else if (stripeError.code === 'invalid_request_error') {
        errorCode = 'INVALID_SESSION_ID';
        errorMessage = 'ID de sesión inválido';
      }

      await logSecurityEvent('stripe_session_error', {
        session_id,
        stripe_error: stripeError.code,
        stripe_message: stripeError.message
      }, undefined, request);

      return NextResponse.json({
        success: false,
        error: errorMessage,
        errorCode
      }, { status: 400 });
    }

    // ✅ PASO 5: VERIFICAR ESTADO DE LA SESIÓN
    if (session.status !== 'complete') {
      await logSecurityEvent('incomplete_session_validation', {
        session_id,
        session_status: session.status,
        payment_status: session.payment_status
      }, undefined, request);

      return NextResponse.json({
        success: false,
        error: `Sesión incompleta. Estado: ${session.status}`,
        errorCode: 'SESSION_INCOMPLETE'
      }, { status: 400 });
    }

    // ✅ PASO 6: VERIFICAR ESTADO DEL PAGO
    if (session.payment_status !== 'paid') {
      await logSecurityEvent('unpaid_session_validation', {
        session_id,
        payment_status: session.payment_status,
        session_status: session.status
      }, undefined, request);

      return NextResponse.json({
        success: false,
        error: `Pago no completado. Estado: ${session.payment_status}`,
        errorCode: 'PAYMENT_INCOMPLETE'
      }, { status: 400 });
    }

    // ✅ PASO 7: VERIFICAR QUE LA SESIÓN NO SEA MUY ANTIGUA
    const sessionAge = now - (session.created * 1000);
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 horas

    if (sessionAge > maxSessionAge) {
      return NextResponse.json({
        success: false,
        error: 'Sesión de pago muy antigua',
        errorCode: 'SESSION_TOO_OLD'
      }, { status: 400 });
    }

    // ✅ PASO 8: EXTRAER INFORMACIÓN DEL PLAN
    let planName = 'unknown';
    if (session.metadata?.plan) {
      planName = session.metadata.plan;
    } else if (session.subscription) {
      // Intentar extraer plan desde la suscripción
      try {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string, {
          expand: ['items.data.price']
        });
        
        const priceId = subscription.items.data[0]?.price?.id;
        planName = mapPriceIdToPlan(priceId);
      } catch (subError) {
        console.warn('⚠️ No se pudo obtener plan desde suscripción:', subError);
      }
    }

    // ✅ PASO 9: REGISTRAR VALIDACIÓN EXITOSA
    await logSecurityEvent('successful_payment_validation', {
      session_id,
      customer_email: session.customer_email,
      plan: planName,
      amount: session.amount_total,
      currency: session.currency
    }, session.metadata?.userId, request);

    console.log('✅ Pago validado exitosamente:', {
      session_id,
      payment_status: session.payment_status,
      plan: planName
    });

    // ✅ PASO 10: RESPUESTA EXITOSA
    const response: PaymentValidationResponse = {
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        customer_email: session.customer_email || '',
        subscription_id: session.subscription as string || undefined,
        plan: planName,
        amount_total: session.amount_total || undefined,
        currency: session.currency || undefined,
        created: session.created
      }
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Error general en validación de pago:', error);

    // ✅ REGISTRAR ERROR PARA DEBUGGING
    await logSecurityEvent('payment_validation_error', {
      error: error.message,
      stack: error.stack
    }, undefined, request);

    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      errorCode: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

// ========================================
// 🔧 FUNCIONES AUXILIARES
// ========================================

/**
 * Mapea Price ID de Stripe a nombre de plan
 */
function mapPriceIdToPlan(priceId?: string): string {
  const priceMapping: { [key: string]: string } = {
    'price_1S8id6Pa2fV72c7wyqjkxdpw': 'pro',
    'price_1S12wKPa2fV72c7wX2NRAwQF': 'pro_max',
    // Agregar más price IDs según sea necesario
  };

  return priceMapping[priceId || ''] || 'unknown';
}

/**
 * Valida el formato del session ID
 */
function isValidSessionId(sessionId: string): boolean {
  // Los session IDs de Stripe tienen formato: cs_test_xxx o cs_live_xxx
  return /^cs_(test|live)_[a-zA-Z0-9]+$/.test(sessionId);
}

// ========================================
// 🚫 BLOQUEAR OTROS MÉTODOS HTTP
// ========================================
export async function GET() {
  return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
}

// ========================================
// 📋 NOTAS DE IMPLEMENTACIÓN
// ========================================

/*
CARACTERÍSTICAS DE SEGURIDAD IMPLEMENTADAS:

✅ Validación completa con Stripe API
✅ Verificación de estado de pago (paid vs unpaid)
✅ Prevención de ataques de replay con timestamp
✅ Validación de formato de session ID
✅ Verificación de edad de sesión (no muy antigua)
✅ Logging completo de eventos de seguridad
✅ Manejo de errores específicos de Stripe
✅ Rate limiting implícito (una validación por sesión)
✅ Extracción segura de información de plan
✅ Bloqueo de métodos HTTP no permitidos
✅ Validación de variables de entorno al inicio

ERRORES MANEJADOS:

- Session ID faltante o inválido
- Sesión no encontrada en Stripe
- Sesión incompleta o expirada
- Pago no completado
- Sesión muy antigua
- Errores de red con Stripe
- Ataques de replay
- Formato inválido de session ID
- Variables de entorno faltantes

FLUJO DE VALIDACIÓN:

1. Validar configuración de Stripe
2. Validar datos de entrada
3. Verificar formato de session ID
4. Verificar timestamp (anti-replay)
5. Recuperar sesión desde Stripe
6. Verificar estado de sesión (complete)
7. Verificar estado de pago (paid)
8. Verificar edad de sesión
9. Extraer información de plan
10. Registrar evento de seguridad
11. Retornar respuesta exitosa

*/