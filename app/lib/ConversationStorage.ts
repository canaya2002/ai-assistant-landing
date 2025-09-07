// lib/ConversationStorage.ts
import { Conversation, ChatMessage } from './types';
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
        msg.message.toLowerCase().includes(lowerQuery)
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

  // Generar título automático para conversación
  static generateTitle(firstMessage: string): string {
    const title = firstMessage.trim();
    if (title.length <= 50) return title;
    
    // Buscar punto de corte natural
    const cutPoint = title.lastIndexOf(' ', 47);
    return title.substring(0, cutPoint > 20 ? cutPoint : 47) + '...';
  }

  // Exportar todas las conversaciones
  static exportAllConversations(): string {
    const conversations = this.getConversations();
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      totalConversations: conversations.length,
      data: conversations
    };
    return JSON.stringify(backup, null, 2);
  }

  // Importar conversaciones desde backup
  static importConversations(backupData: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const backup = JSON.parse(backupData);
      const errors: string[] = [];
      let imported = 0;
      
      if (!backup.version || !backup.data) {
        return { success: false, imported: 0, errors: ['Formato de backup inválido'] };
      }
      
      const existing = this.getConversations();
      const existingIds = new Set(existing.map(c => c.id));
      
      const validConversations = backup.data.filter((conv: any) => {
        if (!conv.id || !conv.messages || !Array.isArray(conv.messages)) {
          errors.push(`Conversación inválida: ${conv.title || 'Sin título'}`);
          return false;
        }
        return true;
      });
      
      const newConversations = validConversations.filter((conv: Conversation) => 
        !existingIds.has(conv.id)
      );
      
      if (newConversations.length > 0) {
        const merged = [...existing, ...newConversations];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(merged));
        imported = newConversations.length;
      }
      
      return { success: true, imported, errors };
    } catch (error) {
      return { 
        success: false, 
        imported: 0, 
        errors: [`Error procesando backup: ${error instanceof Error ? error.message : 'Error desconocido'}`] 
      };
    }
  }

  // Limpiar conversaciones antiguas
  static cleanOldConversations(daysOld: number = 90): number {
    try {
      const conversations = this.getConversations();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const filtered = conversations.filter(conv => 
        new Date(conv.updatedAt) > cutoffDate
      );
      
      const removed = conversations.length - filtered.length;
      
      if (removed > 0) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      }
      
      return removed;
    } catch (error) {
      console.error('Error cleaning old conversations:', error);
      return 0;
    }
  }

  // Obtener estadísticas de uso
  static getUsageStats(): {
    totalConversations: number;
    totalMessages: number;
    avgMessagesPerConversation: number;
    oldestConversation: Date | null;
    newestConversation: Date | null;
  } {
    const conversations = this.getConversations();
    
    if (conversations.length === 0) {
      return {
        totalConversations: 0,
        totalMessages: 0,
        avgMessagesPerConversation: 0,
        oldestConversation: null,
        newestConversation: null
      };
    }
    
    const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
    const dates = conversations.map(conv => new Date(conv.createdAt));
    
    return {
      totalConversations: conversations.length,
      totalMessages,
      avgMessagesPerConversation: Math.round(totalMessages / conversations.length),
      oldestConversation: new Date(Math.min(...dates.map(d => d.getTime()))),
      newestConversation: new Date(Math.max(...dates.map(d => d.getTime())))
    };
  }

  // Guardar metadatos en Firebase (async, no crítico)
  private static async saveMetadataToFirebase(conversation: Conversation): Promise<void> {
    try {
      // Solo metadatos mínimos para Firebase
      const metadata = {
        userId: conversation.userId,
        conversationId: conversation.id,
        title: conversation.title,
        messageCount: conversation.messages.length,
        lastActivity: conversation.updatedAt.toISOString(), // Convertir Date a string
        tags: conversation.tags
      };
      
      // Enviar a Firebase (no crítico si falla)
      await cloudFunctions.saveConversationMetadata(metadata);
    } catch (error) {
      // No mostrar error al usuario, es solo para analytics
      console.debug('Metadata save failed (non-critical):', error);
    }
  }
}

// Utilidades para backup
export class BackupManager {
  private static readonly BACKUP_SETTINGS_KEY = 'nora_backup_settings';

  // Configuración de backup automático
  static getBackupSettings(): {
    autoBackup: boolean;
    backupInterval: number; // días
    lastBackup: Date | null;
    googleDriveEnabled: boolean;
  } {
    try {
      const stored = localStorage.getItem(this.BACKUP_SETTINGS_KEY);
      if (!stored) {
        return {
          autoBackup: false,
          backupInterval: 7,
          lastBackup: null,
          googleDriveEnabled: false
        };
      }
      
      const settings = JSON.parse(stored);
      return {
        ...settings,
        lastBackup: settings.lastBackup ? new Date(settings.lastBackup) : null
      };
    } catch (error) {
      console.error('Error loading backup settings:', error);
      return {
        autoBackup: false,
        backupInterval: 7,
        lastBackup: null,
        googleDriveEnabled: false
      };
    }
  }

  // Guardar configuración de backup
  static saveBackupSettings(settings: {
    autoBackup: boolean;
    backupInterval: number;
    lastBackup: Date | null;
    googleDriveEnabled: boolean;
  }): void {
    try {
      localStorage.setItem(this.BACKUP_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving backup settings:', error);
    }
  }

  // Verificar si necesita backup
  static needsBackup(): boolean {
    const settings = this.getBackupSettings();
    if (!settings.autoBackup || !settings.lastBackup) return settings.autoBackup;
    
    const daysSinceBackup = Math.floor(
      (Date.now() - settings.lastBackup.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceBackup >= settings.backupInterval;
  }

  // Crear archivo de backup para descarga
  static createBackupFile(): { filename: string; content: string } {
    const content = LocalConversationStorage.exportAllConversations();
    const date = new Date().toISOString().split('T')[0];
    const filename = `nora-backup-${date}.json`;
    
    return { filename, content };
  }

  // Descargar backup
  static downloadBackup(): void {
    const { filename, content } = this.createBackupFile();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
    
    // Actualizar fecha de último backup
    const settings = this.getBackupSettings();
    this.saveBackupSettings({
      ...settings,
      lastBackup: new Date()
    });
  }
}