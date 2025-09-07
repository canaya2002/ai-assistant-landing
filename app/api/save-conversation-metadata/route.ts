// app/api/save-conversation-metadata/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Inicializar Firebase Admin (solo una vez)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export async function POST(request: NextRequest) {
  try {
    // Obtener token de autorización
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verificar token de Firebase Auth
    const decodedToken = await auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Obtener datos del body
    const body = await request.json();
    const { conversationId, title, messageCount, lastActivity, tags } = body;

    // Validar que es el usuario correcto
    if (body.userId !== userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Guardar solo metadatos mínimos en Firestore
    const metadataRef = db.collection('conversationMetadata').doc(conversationId);

    await metadataRef.set({
      userId,
      title: title.substring(0, 100), // Límite de título
      messageCount: Math.min(messageCount, 9999), // Límite sensible
      lastActivity: new Date(lastActivity),
      tags: tags ? tags.slice(0, 5) : [], // Máximo 5 tags
      updatedAt: new Date()
    }, { merge: true });

    // También actualizar estadísticas de usuario (opcional)
    const userStatsRef = db.collection('userStats').doc(userId);
    
    await userStatsRef.set({
      totalConversations: 1, // Se puede mejorar con increment
      lastActivity: new Date()
    }, { merge: true });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving conversation metadata:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}