// app/api/webhooks/stripe/route.ts - WEBHOOK SEGURO DE STRIPE
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// ========================================
// 🔒 CONFIGURACIÓN SEGURA DE FIREBASE ADMIN
// ========================================
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  };

  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

// ========================================
// 🔒 CONFIGURACIÓN SEGURA DE STRIPE
// ========================================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// ========================================
// 🎯 MAPEO DE PRECIOS A PLANES
// ========================================
// ✅ REEMPLAZAR CON ESTO
const PRICE_TO_PLAN_MAP: { [key: string]: string } = {
  'price_1S8id6Pa2fV72c7wyqjkxdpw': 'pro',
  'price_1S12wKPa2fV72c7wX2NRAwQF': 'pro_max',
};

// ========================================
// 🔒 FUNCIÓN PRINCIPAL DEL WEBHOOK
// ========================================
export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('❌ Missing Stripe signature');
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // ✅ VERIFICAR FIRMA DE STRIPE (CRÍTICO PARA SEGURIDAD)
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`✅ Webhook signature verified: ${event.type}`);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed:`, err.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    // ========================================
    // 🎯 PROCESAR EVENTOS DE STRIPE
    // ========================================
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`📝 Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`❌ Error processing webhook:`, error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// ========================================
// 🔒 MANEJADORES DE EVENTOS SEGUROS
// ========================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`🛒 Processing checkout completed: ${session.id}`);

  try {
    const { customer, metadata, subscription } = session;

    if (!metadata?.userId) {
      console.error('❌ No userId in session metadata');
      return;
    }

    const userId = metadata.userId;
    const planId = metadata.plan;

    // ✅ VERIFICAR QUE EL PLAN SEA VÁLIDO
    if (!planId || !['pro', 'pro_max'].includes(planId)) {
      console.error(`❌ Invalid plan in metadata: ${planId}`);
      return;
    }

    // ✅ VERIFICAR QUE LA SUSCRIPCIÓN EXISTE
    if (!subscription) {
      console.error('❌ No subscription in completed checkout');
      return;
    }

    // ✅ OBTENER DETALLES COMPLETOS DE LA SUSCRIPCIÓN
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription as string, {
      expand: ['items.data.price']
    });

    if (stripeSubscription.status !== 'active') {
      console.error(`❌ Subscription not active: ${stripeSubscription.status}`);
      return;
    }

    // ✅ VERIFICAR QUE EL PRECIO COINCIDA CON EL PLAN
    const price = stripeSubscription.items.data[0]?.price;
    if (!price || PRICE_TO_PLAN_MAP[price.id] !== planId) {
      console.error(`❌ Price mismatch. Expected plan: ${planId}, Price: ${price?.id}`);
      return;
    }

    // ✅ ACTUALIZAR USUARIO EN FIRESTORE DE MANERA SEGURA
    await updateUserPlan(userId, planId, {
      stripeCustomerId: customer as string,
      stripeSubscriptionId: subscription as string,
      stripePriceId: price.id,
      subscriptionStatus: stripeSubscription.status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      updatedAt: new Date(),
      updatedBy: 'stripe_webhook',
      paymentMethod: 'stripe',
      verified: true
    });

    console.log(`✅ Successfully upgraded user ${userId} to ${planId}`);

  } catch (error: any) {
    console.error('❌ Error in handleCheckoutCompleted:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`🆕 Processing subscription created: ${subscription.id}`);
  
  try {
    const userId = await getUserIdFromStripeCustomer(subscription.customer as string);
    if (!userId) {
      console.error('❌ Could not find user for customer:', subscription.customer);
      return;
    }

    const price = subscription.items.data[0]?.price;
    const plan = price ? PRICE_TO_PLAN_MAP[price.id] : null;

    if (!plan) {
      console.error(`❌ Unknown price ID: ${price?.id}`);
      return;
    }

    await updateUserPlan(userId, plan, {
      stripeSubscriptionId: subscription.id,
      stripePriceId: price.id,
      subscriptionStatus: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      updatedAt: new Date(),
      updatedBy: 'stripe_webhook'
    });

    console.log(`✅ Created subscription for user ${userId}: ${plan}`);
  } catch (error: any) {
    console.error('❌ Error in handleSubscriptionCreated:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`🔄 Processing subscription updated: ${subscription.id}`);
  
  try {
    const userId = await getUserIdFromStripeSubscription(subscription.id);
    if (!userId) {
      console.error('❌ Could not find user for subscription:', subscription.id);
      return;
    }

    const price = subscription.items.data[0]?.price;
    const plan = price ? PRICE_TO_PLAN_MAP[price.id] : null;

    if (!plan) {
      console.error(`❌ Unknown price ID: ${price?.id}`);
      return;
    }

    // ✅ MANEJAR DIFERENTES ESTADOS DE SUSCRIPCIÓN
    const updateData: any = {
      subscriptionStatus: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      updatedAt: new Date(),
      updatedBy: 'stripe_webhook'
    };

    // Si la suscripción está activa, actualizar el plan
    if (subscription.status === 'active') {
      updateData.plan = plan;
      updateData.stripePriceId = price.id;
    }
    // Si está cancelada o vencida, downgrade a free
    else if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
      updateData.plan = 'free';
    }

    await updateUserSubscriptionData(userId, updateData);
    console.log(`✅ Updated subscription for user ${userId}: ${subscription.status}`);
  } catch (error: any) {
    console.error('❌ Error in handleSubscriptionUpdated:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`🗑️ Processing subscription deleted: ${subscription.id}`);
  
  try {
    const userId = await getUserIdFromStripeSubscription(subscription.id);
    if (!userId) {
      console.error('❌ Could not find user for subscription:', subscription.id);
      return;
    }

    // ✅ DOWNGRADE A PLAN GRATUITO
    await updateUserPlan(userId, 'free', {
      subscriptionStatus: 'canceled',
      canceledAt: new Date(),
      updatedAt: new Date(),
      updatedBy: 'stripe_webhook'
    });

    console.log(`✅ Downgraded user ${userId} to free plan`);
  } catch (error: any) {
    console.error('❌ Error in handleSubscriptionDeleted:', error);
    throw error;
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`💰 Processing payment succeeded: ${invoice.id}`);
  
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    await handleSubscriptionUpdated(subscription);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`❌ Processing payment failed: ${invoice.id}`);
  
  try {
    const userId = await getUserIdFromStripeCustomer(invoice.customer as string);
    if (!userId) return;

    // Registrar fallo de pago pero no cambiar plan inmediatamente
    await db.collection('users').doc(userId).update({
      lastPaymentFailed: new Date(),
      paymentFailures: FieldValue.increment(1),
      updatedAt: new Date()
    });

    console.log(`⚠️ Recorded payment failure for user ${userId}`);
  } catch (error: any) {
    console.error('❌ Error in handlePaymentFailed:', error);
  }
}

// ========================================
// 🔧 FUNCIONES AUXILIARES SEGURAS
// ========================================

async function updateUserPlan(userId: string, plan: string, additionalData: any = {}) {
  try {
    const userRef = db.collection('users').doc(userId);
    
    // ✅ VERIFICAR QUE EL USUARIO EXISTE
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error(`User ${userId} not found`);
    }

    // ✅ ACTUALIZACIÓN ATÓMICA
    await userRef.update({
      plan,
      ...additionalData,
      lastStripeWebhook: new Date()
    });

    console.log(`✅ Updated user ${userId} plan to ${plan}`);
  } catch (error: any) {
    console.error(`❌ Error updating user plan:`, error);
    throw error;
  }
}

async function updateUserSubscriptionData(userId: string, data: any) {
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      ...data,
      lastStripeWebhook: new Date()
    });
  } catch (error: any) {
    console.error(`❌ Error updating subscription data:`, error);
    throw error;
  }
}

async function getUserIdFromStripeCustomer(customerId: string): Promise<string | null> {
  try {
    const usersSnapshot = await db.collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return null;
    }

    return usersSnapshot.docs[0].id;
  } catch (error: any) {
    console.error('❌ Error finding user by customer:', error);
    return null;
  }
}

async function getUserIdFromStripeSubscription(subscriptionId: string): Promise<string | null> {
  try {
    const usersSnapshot = await db.collection('users')
      .where('stripeSubscriptionId', '==', subscriptionId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return null;
    }

    return usersSnapshot.docs[0].id;
  } catch (error: any) {
    console.error('❌ Error finding user by subscription:', error);
    return null;
  }
}

// ========================================
// 🚫 BLOQUEAR OTROS MÉTODOS HTTP
// ========================================
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}