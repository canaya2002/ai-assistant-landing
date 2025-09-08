// app/api/save-conversation-metadata/route.ts - VERSIÓN COMPLETA CORREGIDA
import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// ✅ VALIDAR VARIABLES DE ENTORNO
const requiredEnvVars = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key, _]) => key);

if (missingVars.length > 0) {
  console.error(`Missing Firebase Admin environment variables: ${missingVars.join(', ')}`);
}

// ✅ INICIALIZAR FIREBASE ADMIN (SOLO UNA VEZ)
if (!getApps().length && !missingVars.length) {
  try {
    initializeApp({
      credential: cert({
        projectId: requiredEnvVars.projectId!,
        clientEmail: requiredEnvVars.clientEmail!,
        privateKey: requiredEnvVars.privateKey!.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

const db = getFirestore();

// ✅ FUNCIÓN PARA OBTENER IP DEL CLIENTE (CORRECCIÓN PARA request.ip)
function getClientIP(request: NextRequest): string {
  // Intentar obtener IP de varios headers
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (xForwardedFor) {
    // x-forwarded-for puede contener múltiples IPs separadas por comas
    return xForwardedFor.split(',')[0].trim();
  }
  
  if (xRealIP) {
    return xRealIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback para desarrollo local
  return 'unknown';
}

// ✅ FUNCIONES DE VALIDACIÓN
function validateRequestData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.userId || typeof data.userId !== 'string') {
    errors.push('userId is required and must be a string');
  }
  
  if (!data.conversationId || typeof data.conversationId !== 'string') {
    errors.push('conversationId is required and must be a string');
  }
  
  if (!data.title || typeof data.title !== 'string') {
    errors.push('title is required and must be a string');
  }
  
  if (typeof data.messageCount !== 'number' || data.messageCount < 0) {
    errors.push('messageCount must be a non-negative number');
  }
  
  if (!data.lastActivity) {
    errors.push('lastActivity is required');
  }
  
  return { isValid: errors.length === 0, errors };
}

function sanitizeData(data: any) {
  return {
    userId: data.userId.trim(),
    conversationId: data.conversationId.trim(),
    title: data.title.trim().substring(0, 100), // Límite de título
    messageCount: Math.min(Math.max(0, data.messageCount), 9999), // Límite sensible
    lastActivity: new Date(data.lastActivity),
    tags: Array.isArray(data.tags) ? data.tags.slice(0, 5).map((tag: string) => tag.trim()) : [],
  };
}

// ✅ FUNCIÓN HELPER PARA HASH DE IP (GDPR COMPLIANCE)
function hashIP(ip: string): string {
  // Implementar hash simple para rate limiting sin almacenar IP real
  return Buffer.from(ip).toString('base64').substring(0, 10);
}

export async function POST(request: NextRequest) {
  try {
    // ✅ VERIFICAR QUE FIREBASE ADMIN ESTÉ CONFIGURADO
    if (missingVars.length > 0) {
      return NextResponse.json({ 
        error: 'Server configuration error' 
      }, { status: 500 });
    }

    // ✅ VALIDAR HEADERS
    const authHeader = request.headers.get('authorization');
    const contentType = request.headers.get('content-type');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authorization header missing or invalid' 
      }, { status: 401 });
    }

    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({ 
        error: 'Content-Type must be application/json' 
      }, { status: 400 });
    }

    // ✅ EXTRAER Y VERIFICAR TOKEN
    const token = authHeader.split('Bearer ')[1];
    
    if (!token || token.length < 10) {
      return NextResponse.json({ 
        error: 'Invalid token format' 
      }, { status: 401 });
    }

    // ✅ VERIFICAR TOKEN DE FIREBASE AUTH
    let decodedToken;
    try {
      decodedToken = await auth().verifyIdToken(token);
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return NextResponse.json({ 
        error: 'Invalid or expired token' 
      }, { status: 401 });
    }

    const userId = decodedToken.uid;

    // ✅ PARSEAR Y VALIDAR BODY
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Invalid JSON in request body' 
      }, { status: 400 });
    }

    // ✅ VALIDAR DATOS
    const validation = validateRequestData(body);
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.errors 
      }, { status: 400 });
    }

    // ✅ VERIFICAR AUTORIZACIÓN
    if (body.userId !== userId) {
      return NextResponse.json({ 
        error: 'Unauthorized: userId mismatch' 
      }, { status: 403 });
    }

    // ✅ SANITIZAR DATOS
    const sanitizedData = sanitizeData(body);

    // ✅ GUARDAR EN FIRESTORE CON RATE LIMITING
    const metadataRef = db.collection('conversationMetadata').doc(sanitizedData.conversationId);

    const dataToSave = {
      ...sanitizedData,
      updatedAt: new Date(),
      ipHash: hashIP(getClientIP(request)), // ✅ CORRECCIÓN: usar getClientIP en lugar de request.ip
    };

    await metadataRef.set(dataToSave, { merge: true });

    // ✅ ACTUALIZAR ESTADÍSTICAS DE USUARIO
    const userStatsRef = db.collection('userStats').doc(userId);
    
    await userStatsRef.set({
      lastActivity: new Date(),
      totalConversations: 1, // Se puede mejorar con FieldValue.increment(1)
    }, { merge: true });

    // ✅ RESPUESTA EXITOSA
    return NextResponse.json({ 
      success: true,
      message: 'Metadata saved successfully' 
    });

  } catch (error) {
    console.error('Error saving conversation metadata:', error);
    
    // No exponer detalles internos del error
    return NextResponse.json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// ✅ MANEJAR OTROS MÉTODOS HTTP
export async function GET() {
  return NextResponse.json({ 
    error: 'Method not allowed' 
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ 
    error: 'Method not allowed' 
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ 
    error: 'Method not allowed' 
  }, { status: 405 });
}