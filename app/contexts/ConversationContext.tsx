// contexts/ConversationContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Conversation, ChatMessage } from '../lib/types';
import { LocalConversationStorage } from '../lib/ConversationStorage';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface ConversationContextType {
  // Estado actual
  currentConversation: Conversation | null;
  conversations: Conversation[];
  isLoading: boolean;
  
  // Acciones de conversación
  startNewConversation: () => void;
  loadConversation: (conversationId: string) => void;
  addMessage: (message: ChatMessage) => void;
  updateConversationTitle: (conversationId: string, title: string) => void;
  deleteConversation: (conversationId: string) => void;
  
  // Búsqueda y filtros
  searchConversations: (query: string) => Conversation[];
  getRecentConversations: (limit?: number) => Conversation[];
  
  // Backup y export
  exportConversations: () => void;
  importConversations: (file: File) => Promise<boolean>;
  
  // Estadísticas
  getUsageStats: () => {
    totalConversations: number;
    totalMessages: number;
    avgMessagesPerConversation: number;
    oldestConversation: Date | null;
    newestConversation: Date | null;
  };
}

const ConversationContext = createContext<ConversationContextType>({} as ConversationContextType);

export function useConversations() {
  return useContext(ConversationContext);
}

interface ConversationProviderProps {
  children: ReactNode;
}

export function ConversationProvider({ children }: ConversationProviderProps) {
  const { user } = useAuth();
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar conversaciones al iniciar
  useEffect(() => {
    if (user) {
      loadAllConversations();
    } else {
      setConversations([]);
      setCurrentConversation(null);
    }
  }, [user]);

  const loadAllConversations = () => {
    try {
      setIsLoading(true);
      const stored = LocalConversationStorage.getConversations();
      // Filtrar solo conversaciones del usuario actual
      const userConversations = stored.filter(conv => conv.userId === user?.uid);
      setConversations(userConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Error cargando conversaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    if (!user) return;

    const newConversation: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.uid,
      title: 'Nueva conversación',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(), // ✅ AÑADIDO - Propiedad faltante
      messageCount: 0,          // ✅ AÑADIDO - Propiedad faltante  
      isArchived: false,
      tags: []
    };

    setCurrentConversation(newConversation);
    
    // Solo agregar a la lista cuando tenga al menos un mensaje
    // Se guardará automáticamente en addMessage
  };

  const loadConversation = (conversationId: string) => {
    try {
      const conversation = LocalConversationStorage.getConversation(conversationId);
      if (conversation && conversation.userId === user?.uid) {
        setCurrentConversation(conversation);
      } else {
        toast.error('Conversación no encontrada');
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Error cargando conversación');
    }
  };

  const addMessage = (message: ChatMessage) => {
    if (!currentConversation || !user) return;

    const updatedConversation: Conversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, message],
      updatedAt: new Date()
    };

    // Auto-generar título después del primer mensaje del usuario
    if (updatedConversation.messages.length === 1 && message.type === 'user') {
      updatedConversation.title = LocalConversationStorage.generateTitle(message.message);
    }

    // Guardar localmente
    LocalConversationStorage.saveConversation(updatedConversation);
    
    // Actualizar estado
    setCurrentConversation(updatedConversation);
    
    // Actualizar lista de conversaciones
    setConversations(prev => {
      const existingIndex = prev.findIndex(conv => conv.id === updatedConversation.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = updatedConversation;
        return updated;
      } else {
        return [updatedConversation, ...prev];
      }
    });
  };

  const updateConversationTitle = (conversationId: string, title: string) => {
    try {
      const conversation = LocalConversationStorage.getConversation(conversationId);
      if (!conversation || conversation.userId !== user?.uid) return;

      const updatedConversation: Conversation = {
        ...conversation,
        title: title.trim() || 'Sin título',
        updatedAt: new Date()
      };

      LocalConversationStorage.saveConversation(updatedConversation);
      
      // Actualizar estado
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(updatedConversation);
      }
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? updatedConversation : conv
        )
      );
      
      toast.success('Título actualizado');
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Error actualizando título');
    }
  };

  const deleteConversation = (conversationId: string) => {
    try {
      LocalConversationStorage.deleteConversation(conversationId);
      
      // Actualizar estado
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }
      
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      toast.success('Conversación eliminada');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Error eliminando conversación');
    }
  };

  const searchConversations = (query: string): Conversation[] => {
    if (!query.trim()) return conversations;
    
    return LocalConversationStorage.searchConversations(query)
      .filter(conv => conv.userId === user?.uid);
  };

  const getRecentConversations = (limit: number = 10): Conversation[] => {
    return conversations
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  };

  const exportConversations = () => {
    try {
      const backupData = LocalConversationStorage.exportAllConversations();
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `nora-conversations-${date}.json`;
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      
      URL.revokeObjectURL(url);
      toast.success('Backup creado y descargado');
    } catch (error) {
      console.error('Error exporting conversations:', error);
      toast.error('Error exportando conversaciones');
    }
  };

  const importConversations = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const result = LocalConversationStorage.importConversations(text);
      
      if (result.success) {
        if (result.imported > 0) {
          loadAllConversations(); // Recargar lista
          toast.success(`${result.imported} conversaciones importadas`);
        } else {
          toast(`No se encontraron conversaciones nuevas para importar`);
        }
        
        if (result.errors.length > 0) {
          console.warn('Import errors:', result.errors);
          toast(`Importado con ${result.errors.length} advertencias`);
        }
        
        return true;
      } else {
        toast.error(result.errors[0] || 'Error importando archivo');
        return false;
      }
    } catch (error) {
      console.error('Error importing conversations:', error);
      toast.error('Error procesando archivo de backup');
      return false;
    }
  };

  const getUsageStats = () => {
    return LocalConversationStorage.getUsageStats();
  };

  // Limpiar conversaciones antiguas (ejecutar ocasionalmente)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      try {
        const removed = LocalConversationStorage.cleanOldConversations(90); // 90 días
        if (removed > 0) {
          console.log(`Cleaned ${removed} old conversations`);
          loadAllConversations(); // Recargar si se eliminaron conversaciones
        }
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }, 24 * 60 * 60 * 1000); // Una vez al día

    return () => clearInterval(cleanupInterval);
  }, []);

  const value: ConversationContextType = {
    currentConversation,
    conversations,
    isLoading,
    startNewConversation,
    loadConversation,
    addMessage,
    updateConversationTitle,
    deleteConversation,
    searchConversations,
    getRecentConversations,
    exportConversations,
    importConversations,
    getUsageStats
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}