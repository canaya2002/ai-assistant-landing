// contexts/ConversationContext.tsx - CONTEXT LIMPIO CORREGIDO
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
      lastActivity: new Date(),
      messageCount: 0,
      isArchived: false,
      tags: []
    };

    setCurrentConversation(newConversation);
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

  // ✅ FUNCIÓN ADDMESSAGE ARREGLADA CON TUS TIPOS ORIGINALES
  const addMessage = (message: ChatMessage) => {
    if (!currentConversation || !user) return;

    try {
      const updatedConversation: Conversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, message],
        updatedAt: new Date(),
        lastActivity: new Date(),
        messageCount: currentConversation.messages.length + 1
      };

      // ✅ CORREGIDO: Generar título automático solo para el primer mensaje del usuario
      // Y usando TU propiedad 'message' no 'content'
      if (updatedConversation.messages.length === 1 && message.type === 'user' && message.message) {
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
    } catch (error) {
      console.error('Error adding message:', error);
      toast.error('Error al agregar mensaje');
    }
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
    } catch (error) {
      console.error('Error updating conversation title:', error);
      toast.error('Error actualizando título');
    }
  };

  const deleteConversation = (conversationId: string) => {
    try {
      LocalConversationStorage.deleteConversation(conversationId);
      
      // Actualizar estado local
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // Si es la conversación actual, limpiarla
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }
      
      toast.success('Conversación eliminada');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Error eliminando conversación');
    }
  };

  const searchConversations = (query: string) => {
    if (!query.trim()) return conversations;
    
    const lowerQuery = query.toLowerCase();
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(lowerQuery) ||
      conv.messages.some(msg => 
        msg.message.toLowerCase().includes(lowerQuery) // ✅ CORREGIDO: usar TU 'message' no 'content'
      )
    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  };

  const getRecentConversations = (limit: number = 10) => {
    return conversations
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  };

  const exportConversations = () => {
    try {
      const dataStr = JSON.stringify(conversations, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `nora_conversations_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Conversaciones exportadas');
    } catch (error) {
      console.error('Error exporting conversations:', error);
      toast.error('Error exportando conversaciones');
    }
  };

  const importConversations = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const importedConversations = JSON.parse(text) as Conversation[];
      
      // Validar formato
      if (!Array.isArray(importedConversations)) {
        throw new Error('Formato de archivo inválido');
      }
      
      // Filtrar conversaciones del usuario actual y convertir fechas
      const validConversations = importedConversations
        .filter(conv => conv.userId === user?.uid)
        .map(conv => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          lastActivity: new Date(conv.lastActivity || conv.updatedAt),
          messages: conv.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      
      if (validConversations.length === 0) {
        toast.error('No se encontraron conversaciones válidas para importar');
        return false;
      }
      
      // Guardar cada conversación
      validConversations.forEach(conv => {
        LocalConversationStorage.saveConversation(conv);
      });
      
      // Recargar conversaciones
      loadAllConversations();
      
      toast.success(`${validConversations.length} conversaciones importadas`);
      return true;
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