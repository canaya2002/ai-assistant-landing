// app/lib/ConversationStorage.ts - 100% FIRESTORE CON SINCRONIZACIÓN EN TIEMPO REAL
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Conversation, ChatMessage } from './types';

// ========================================
// 🔥 LÍMITES POR PLAN
// ========================================
const MESSAGE_LIMITS = {
  'free': 50,
  'pro': 300,
  'pro_max': 300
};

const CONVERSATION_LIMITS = {
  'free': 100,
  'pro': 500,
  'pro_max': 1000
};

// ========================================
// 📊 CLASE PRINCIPAL DE GESTIÓN
// ========================================
export class FirestoreConversationStorage {
  private static unsubscribe: (() => void) | null = null;

  // ✅ CREAR NUEVA CONVERSACIÓN
  static async createConversation(userId: string, title: string, mode?: string): Promise<Conversation> {
    try {
      const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const newConversation: Conversation = {
        id: conversationId,
        userId: userId,
        title: title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActivity: new Date(),
        messageCount: 0,
        isArchived: false,
        tags: [],
        mode: mode as any || 'normal'
      };

      const conversationRef = doc(db, 'conversations', conversationId);
      
      // Convertir fechas a Timestamp para Firestore
      await setDoc(conversationRef, {
        ...newConversation,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      });

      console.log('✅ Conversación creada en Firestore:', conversationId);
      return newConversation;
    } catch (error) {
      console.error('❌ Error creando conversación:', error);
      throw error;
    }
  }

  // ✅ AGREGAR MENSAJE A CONVERSACIÓN
  static async addMessage(
    conversationId: string, 
    message: ChatMessage, 
    userPlan: 'free' | 'pro' | 'pro_max' = 'free'
  ): Promise<void> {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationSnap = await getDoc(conversationRef);

      if (!conversationSnap.exists()) {
        throw new Error('Conversación no encontrada');
      }

      const conversation = conversationSnap.data() as Conversation;
      const messageLimit = MESSAGE_LIMITS[userPlan];

      // ✅ VALIDAR LÍMITE DE MENSAJES
      if (conversation.messages.length >= messageLimit) {
        throw new Error(`Límite de ${messageLimit} mensajes alcanzado. Inicia una nueva conversación.`);
      }

      // Agregar mensaje al array
      const updatedMessages = [...conversation.messages, message];

      await updateDoc(conversationRef, {
        messages: updatedMessages,
        messageCount: updatedMessages.length,
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      });

      console.log('✅ Mensaje agregado a Firestore');
    } catch (error) {
      console.error('❌ Error agregando mensaje:', error);
      throw error;
    }
  }

  // ✅ OBTENER UNA CONVERSACIÓN
  static async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationSnap = await getDoc(conversationRef);

      if (!conversationSnap.exists()) {
        return null;
      }

      const data = conversationSnap.data();
      return this.convertFirestoreToConversation(data);
    } catch (error) {
      console.error('❌ Error obteniendo conversación:', error);
      return null;
    }
  }

  // ✅ OBTENER TODAS LAS CONVERSACIONES DEL USUARIO
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('userId', '==', userId),
        where('isArchived', '==', false),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const conversations: Conversation[] = [];

      querySnapshot.forEach((doc) => {
        const conversation = this.convertFirestoreToConversation(doc.data());
        conversations.push(conversation);
      });

      console.log(`✅ ${conversations.length} conversaciones cargadas desde Firestore`);
      return conversations;
    } catch (error) {
      console.error('❌ Error obteniendo conversaciones:', error);
      return [];
    }
  }

  // ✅ SINCRONIZACIÓN EN TIEMPO REAL
  static subscribeToUserConversations(
    userId: string,
    onUpdate: (conversations: Conversation[]) => void
  ): () => void {
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('userId', '==', userId),
        where('isArchived', '==', false),
        orderBy('updatedAt', 'desc')
      );

      // Listener en tiempo real
      this.unsubscribe = onSnapshot(q, (snapshot) => {
        const conversations: Conversation[] = [];
        
        snapshot.forEach((doc) => {
          const conversation = this.convertFirestoreToConversation(doc.data());
          conversations.push(conversation);
        });

        console.log('🔄 Conversaciones actualizadas en tiempo real:', conversations.length);
        onUpdate(conversations);
      }, (error) => {
        console.error('❌ Error en sincronización tiempo real:', error);
      });

      return this.unsubscribe;
    } catch (error) {
      console.error('❌ Error suscribiendo a conversaciones:', error);
      return () => {};
    }
  }

  // ✅ ACTUALIZAR TÍTULO DE CONVERSACIÓN
  static async updateConversationTitle(conversationId: string, newTitle: string): Promise<void> {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        title: newTitle,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Título actualizado');
    } catch (error) {
      console.error('❌ Error actualizando título:', error);
      throw error;
    }
  }

  // ✅ ARCHIVAR CONVERSACIÓN
  static async archiveConversation(conversationId: string): Promise<void> {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        isArchived: true,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Conversación archivada');
    } catch (error) {
      console.error('❌ Error archivando conversación:', error);
      throw error;
    }
  }

  // ✅ ELIMINAR CONVERSACIÓN
  static async deleteConversation(conversationId: string): Promise<void> {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      await deleteDoc(conversationRef);

      console.log('✅ Conversación eliminada de Firestore');
    } catch (error) {
      console.error('❌ Error eliminando conversación:', error);
      throw error;
    }
  }

  // ✅ VALIDAR LÍMITE DE CONVERSACIONES
  static async canCreateNewConversation(userId: string, userPlan: 'free' | 'pro' | 'pro_max'): Promise<boolean> {
    try {
      const conversations = await this.getUserConversations(userId);
      const limit = CONVERSATION_LIMITS[userPlan];
      
      return conversations.length < limit;
    } catch (error) {
      console.error('❌ Error validando límite:', error);
      return false;
    }
  }

  // ✅ OBTENER ESTADÍSTICAS
  static async getUserStats(userId: string) {
    try {
      const conversations = await this.getUserConversations(userId);
      const totalMessages = conversations.reduce((sum, conv) => sum + conv.messageCount, 0);

      return {
        totalConversations: conversations.length,
        totalMessages: totalMessages,
        avgMessagesPerConversation: conversations.length > 0 
          ? Math.round(totalMessages / conversations.length) 
          : 0,
        oldestConversation: conversations.length > 0
          ? conversations[conversations.length - 1].createdAt
          : null,
        newestConversation: conversations.length > 0
          ? conversations[0].createdAt
          : null
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        totalConversations: 0,
        totalMessages: 0,
        avgMessagesPerConversation: 0,
        oldestConversation: null,
        newestConversation: null
      };
    }
  }

  // ✅ LIMPIAR CONVERSACIONES ANTIGUAS (opcional)
  static async cleanOldConversations(userId: string, daysOld: number = 90): Promise<number> {
    try {
      const conversations = await this.getUserConversations(userId);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const batch = writeBatch(db);
      let deletedCount = 0;

      for (const conv of conversations) {
        if (new Date(conv.updatedAt) < cutoffDate) {
          const conversationRef = doc(db, 'conversations', conv.id);
          batch.delete(conversationRef);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        await batch.commit();
        console.log(`✅ ${deletedCount} conversaciones antiguas eliminadas`);
      }

      return deletedCount;
    } catch (error) {
      console.error('❌ Error limpiando conversaciones:', error);
      return 0;
    }
  }

  // ✅ EXPORTAR CONVERSACIONES
  static async exportConversations(userId: string): Promise<string> {
    try {
      const conversations = await this.getUserConversations(userId);
      return JSON.stringify(conversations, null, 2);
    } catch (error) {
      console.error('❌ Error exportando conversaciones:', error);
      return '[]';
    }
  }

  // ✅ DETENER SINCRONIZACIÓN
  static unsubscribeFromConversations(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      console.log('✅ Sincronización detenida');
    }
  }

  // 🔧 HELPER: Convertir datos de Firestore a Conversation
  private static convertFirestoreToConversation(data: any): Conversation {
    return {
      id: data.id,
      userId: data.userId,
      title: data.title,
      messages: data.messages || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastActivity: data.lastActivity?.toDate() || new Date(),
      messageCount: data.messageCount || 0,
      isArchived: data.isArchived || false,
      tags: data.tags || [],
      summary: data.summary,
      mode: data.mode || 'normal',
      specialty: data.specialty
    };
  }
}

// ========================================
// 📤 EXPORTAR TAMBIÉN COMO DEFAULT
// ========================================
export default FirestoreConversationStorage;