// contexts/ConversationContext.tsx - âœ… VERSIÃ“N CORREGIDA
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Conversation, ChatMessage } from '../lib/types';
import { LocalConversationStorage } from '../lib/ConversationStorage';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface ConversationContextType {
  currentConversation: Conversation | null;
  conversations: Conversation[];
  isLoading: boolean;
  startNewConversation: () => void;
  loadConversation: (conversationId: string) => void;
  addMessage: (message: ChatMessage) => void;
  updateConversationTitle: (conversationId: string, title: string) => void;
  deleteConversation: (conversationId: string) => void;
  searchConversations: (query: string) => Conversation[];
  getRecentConversations: (limit?: number) => Conversation[];
  exportConversations: () => void;
  importConversations: (file: File) => Promise<boolean>;
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
      const userConversations = stored.filter(conv => conv.userId === user?.uid);
      setConversations(userConversations);
      console.log('ðŸ“š Conversaciones cargadas:', userConversations.length);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Error cargando conversaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    if (!user) {
      console.error('âŒ No user para crear conversaciÃ³n');
      return;
    }

    const newConversation: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.uid,
      title: 'Nueva conversaciÃ³n',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      isArchived: false,
      tags: []
    };

    console.log('ðŸ†• Nueva conversaciÃ³n creada:', newConversation.id);
    setCurrentConversation(newConversation);
  };

  const loadConversation = (conversationId: string) => {
    try {
      const conversation = LocalConversationStorage.getConversation(conversationId);
      if (conversation && conversation.userId === user?.uid) {
        console.log('ðŸ“– ConversaciÃ³n cargada:', conversationId, 'con', conversation.messages.length, 'mensajes');
        setCurrentConversation(conversation);
      } else {
        toast.error('ConversaciÃ³n no encontrada');
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Error cargando conversaciÃ³n');
    }
  };

  // âœ… FUNCIÃ“N ADDMESSAGE CORREGIDA - LEE DE LOCALSTORAGE PRIMERO
  const addMessage = (message: ChatMessage) => {
    console.log('ðŸ“¥ ADDMESSAGE LLAMADO:', {
      messageId: message.id,
      type: message.type,
      hasCurrentConv: !!currentConversation,
      hasUser: !!user
    });

    if (!currentConversation) {
      console.error('âŒ No hay currentConversation');
      return;
    }

    if (!user) {
      console.error('âŒ No hay user');
      return;
    }

    try {
      // âœ… SOLUCIÃ“N: Leer la conversaciÃ³n MÃS RECIENTE de LocalStorage
      // En lugar de usar currentConversation del estado (que puede estar desactualizado)
      const freshConversation = LocalConversationStorage.getConversation(currentConversation.id);
      
      // Si no existe en storage, usar la del estado
      const baseConversation = freshConversation || currentConversation;
      
      console.log('ðŸ“ Mensajes ANTES:', baseConversation.messages.length);
      
      const updatedConversation: Conversation = {
        ...baseConversation,
        messages: [...baseConversation.messages, message],
        updatedAt: new Date(),
        lastActivity: new Date(),
        messageCount: baseConversation.messages.length + 1
      };

      console.log('ðŸ“ Mensajes DESPUÃ‰S:', updatedConversation.messages.length);

      // Generar tÃ­tulo si es primer mensaje de usuario
      if (updatedConversation.messages.length === 1 && message.type === 'user' && message.message) {
        updatedConversation.title = LocalConversationStorage.generateTitle(message.message);
        console.log('ðŸ“Œ TÃ­tulo generado:', updatedConversation.title);
      }

      // âœ… GUARDAR INMEDIATAMENTE EN LOCALSTORAGE
      console.log('ðŸ’¾ Guardando en LocalStorage...');
      LocalConversationStorage.saveConversation(updatedConversation);
      
      // Actualizar estado
      setCurrentConversation(updatedConversation);
      
      // Actualizar lista de conversaciones
      setConversations(prev => {
        const existingIndex = prev.findIndex(c => c.id === updatedConversation.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = updatedConversation;
          return updated;
        }
        return [updatedConversation, ...prev];
      });
      
      console.log('âœ… addMessage completado exitosamente');
    } catch (error) {
      console.error('âŒ Error en addMessage:', error);
      toast.error('Error guardando mensaje');
    }
  };

  const updateConversationTitle = (conversationId: string, title: string) => {
    try {
      const conversation = LocalConversationStorage.getConversation(conversationId);
      if (!conversation) {
        toast.error('ConversaciÃ³n no encontrada');
        return;
      }

      const updatedConversation = {
        ...conversation,
        title: title.trim() || 'Nueva conversaciÃ³n',
        updatedAt: new Date()
      };

      LocalConversationStorage.saveConversation(updatedConversation);
      
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
      toast.error('Error actualizando tÃ­tulo');
    }
  };

  const deleteConversation = (conversationId: string) => {
    try {
      LocalConversationStorage.deleteConversation(conversationId);
      
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }
      
      toast.success('ConversaciÃ³n eliminada');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Error eliminando conversaciÃ³n');
    }
  };

  const searchConversations = (query: string) => {
    if (!query.trim()) return conversations;
    
    const lowerQuery = query.toLowerCase();
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(lowerQuery) ||
      conv.messages.some(msg => 
        msg.message.toLowerCase().includes(lowerQuery)
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
      
      if (!Array.isArray(importedConversations)) {
        throw new Error('Formato de archivo invÃ¡lido');
      }
      
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
        toast.error('No se encontraron conversaciones vÃ¡lidas para importar');
        return false;
      }
      
      validConversations.forEach(conv => {
        LocalConversationStorage.saveConversation(conv);
      });
      
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

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      try {
        const removed = LocalConversationStorage.cleanOldConversations(90);
        if (removed > 0) {
          console.log(`Cleaned ${removed} old conversations`);
          loadAllConversations();
        }
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }, 24 * 60 * 60 * 1000);

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