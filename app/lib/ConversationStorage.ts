// lib/ConversationStorage.ts - ARREGLADO CON TUS TIPOS ORIGINALES
import { Conversation, ChatMessage, ConversationMetadataInput } from './types';
import { cloudFunctions } from './firebase';

export interface ConversationMetadata {
  userId: string;
  conversationId: string;
  title: string;
  messageCount: number;
  lastActivity: Date;
  tags?: string[];
}

export class LocalConversationStorage {
  private static readonly STORAGE_KEY = 'nora_conversations';
  private static readonly MAX_LOCAL_CONVERSATIONS = 100;
  private static readonly BACKUP_KEY = 'nora_backup_settings';

  // Guardar conversación completa localmente
  static saveConversation(conversation: Conversation): void {
    try {
      const conversations = this.getConversations();
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      
      if (existingIndex >= 0) {
        // Actualizar conversación existente
        conversations[existingIndex] = conversation;
      } else {
        // Nueva conversación
        conversations.push(conversation);
      }
      
      // Mantener solo las más recientes
      if (conversations.length > this.MAX_LOCAL_CONVERSATIONS) {
        conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        conversations.splice(this.MAX_LOCAL_CONVERSATIONS);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversations));
      
      // Guardar metadatos en Firebase (async, no crítico)
      this.saveMetadataToFirebase(conversation);
      
    } catch (error) {
      console.error('Error saving conversation locally:', error);
    }
  }

  // Obtener todas las conversaciones locales
  static getConversations(): Conversation[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const conversations = JSON.parse(stored) as Conversation[];
      // Convertir strings de fecha a objetos Date
      return conversations.map(conv => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        lastActivity: new Date(conv.lastActivity || conv.updatedAt),
        messages: conv.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  // Obtener conversación específica
  static getConversation(conversationId: string): Conversation | null {
    const conversations = this.getConversations();
    return conversations.find(conv => conv.id === conversationId) || null;
  }

  // Buscar en conversaciones
  static searchConversations(query: string): Conversation[] {
    const conversations = this.getConversations();
    const lowerQuery = query.toLowerCase();
    
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(lowerQuery) ||
      conv.messages.some(msg => 
        msg.message.toLowerCase().includes(lowerQuery) // ✅ CORREGIDO: usar TU 'message' no 'content'
      )
    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  // Eliminar conversación
  static deleteConversation(conversationId: string): void {
    try {
      const conversations = this.getConversations().filter(conv => conv.id !== conversationId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }

  // Obtener conversaciones recientes
  static getRecentConversations(limit: number = 10): Conversation[] {
    const conversations = this.getConversations();
    return conversations
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }

  // ✅ FUNCIÓN GENERATETITLE COMPLETAMENTE ARREGLADA
  static generateTitle(firstMessage: string): string {
    // ✅ VALIDACIÓN AGREGADA para evitar el error undefined
    if (!firstMessage || typeof firstMessage !== 'string') {
      return 'Nueva conversación';
    }
    
    const title = firstMessage.trim();
    if (!title) {
      return 'Nueva conversación';
    }
    
    if (title.length <= 50) return title;
    
    // Buscar punto de corte natural
    const cutPoint = title.lastIndexOf(' ', 47);
    return title.substring(0, cutPoint > 20 ? cutPoint : 47) + '...';
  }

  // Limpiar conversaciones antiguas
  static cleanOldConversations(daysOld: number = 90): number {
    try {
      const conversations = this.getConversations();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const oldConversations = conversations.filter(conv => 
        new Date(conv.updatedAt) < cutoffDate
      );
      
      if (oldConversations.length === 0) return 0;
      
      const remainingConversations = conversations.filter(conv => 
        new Date(conv.updatedAt) >= cutoffDate
      );
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(remainingConversations));
      return oldConversations.length;
    } catch (error) {
      console.error('Error cleaning old conversations:', error);
      return 0;
    }
  }

  // Obtener estadísticas de uso
  static getUsageStats() {
    try {
      const conversations = this.getConversations();
      const totalMessages = conversations.reduce((total, conv) => total + conv.messages.length, 0);
      
      return {
        totalConversations: conversations.length,
        totalMessages,
        avgMessagesPerConversation: conversations.length > 0 ? Math.round(totalMessages / conversations.length) : 0,
        oldestConversation: conversations.length > 0 ? 
          new Date(Math.min(...conversations.map(c => new Date(c.createdAt).getTime()))) : null,
        newestConversation: conversations.length > 0 ? 
          new Date(Math.max(...conversations.map(c => new Date(c.updatedAt).getTime()))) : null
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        totalConversations: 0,
        totalMessages: 0,
        avgMessagesPerConversation: 0,
        oldestConversation: null,
        newestConversation: null
      };
    }
  }

  // ✅ CORREGIDO: Guardar metadatos en Firebase (no crítico)
  private static async saveMetadataToFirebase(conversation: Conversation): Promise<void> {
    try {
      const metadata: ConversationMetadataInput = { // ✅ Usar ConversationMetadataInput
        userId: conversation.userId,
        conversationId: conversation.id,
        title: conversation.title,
        messageCount: conversation.messages.length,
        lastActivity: (conversation.lastActivity || conversation.updatedAt).toISOString(), // ✅ Convertir Date a string
        tags: conversation.tags
      };

      // Llamada async no crítica
      if (cloudFunctions.saveConversationMetadata) {
        await cloudFunctions.saveConversationMetadata(metadata).catch((error: any) => {
          console.warn('Failed to save metadata to Firebase:', error);
        });
      }
    } catch (error) {
      console.warn('Error preparing metadata for Firebase:', error);
    }
  }

  // Exportar conversaciones
  static exportToJSON(): string {
    const conversations = this.getConversations();
    return JSON.stringify(conversations, null, 2);
  }

  // Importar conversaciones desde JSON
  static importFromJSON(jsonData: string): boolean {
    try {
      const importedConversations = JSON.parse(jsonData) as Conversation[];
      
      if (!Array.isArray(importedConversations)) {
        throw new Error('Invalid format');
      }

      // Validar estructura básica
      const validConversations = importedConversations.filter(conv => 
        conv.id && conv.userId && conv.messages && Array.isArray(conv.messages)
      );

      if (validConversations.length === 0) {
        return false;
      }

      // Obtener conversaciones existentes
      const existingConversations = this.getConversations();
      const existingIds = new Set(existingConversations.map(c => c.id));

      // Agregar solo las nuevas
      const newConversations = validConversations.filter(conv => !existingIds.has(conv.id));
      
      if (newConversations.length > 0) {
        const allConversations = [...existingConversations, ...newConversations];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allConversations));
      }

      return true;
    } catch (error) {
      console.error('Error importing conversations:', error);
      return false;
    }
  }

  // ✅ FUNCIÓN HELPER PARA VALIDAR MENSAJES USANDO TUS TIPOS
  static validateMessage(message: any): message is ChatMessage {
    return message && 
           typeof message.id === 'string' &&
           typeof message.message === 'string' && // ✅ TU PROPIEDAD 'message'
           typeof message.type === 'string' &&
           message.timestamp instanceof Date;
  }

  // ✅ FUNCIÓN HELPER PARA VALIDAR CONVERSACIONES
  static validateConversation(conversation: any): conversation is Conversation {
    return conversation &&
           typeof conversation.id === 'string' &&
           typeof conversation.userId === 'string' &&
           typeof conversation.title === 'string' &&
           Array.isArray(conversation.messages) &&
           conversation.messages.every((msg: any) => this.validateMessage(msg));
  }
}