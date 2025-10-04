// app/hooks/useConversations.ts - HOOK PARA GESTIONAR CONVERSACIONES EN TIEMPO REAL
import { useState, useEffect, useCallback } from 'react';
import { FirestoreConversationStorage } from '../lib/ConversationStorage';
import { Conversation, ChatMessage, PlanType } from '../lib/types';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ CARGAR CONVERSACIONES Y SINCRONIZAR EN TIEMPO REAL
  useEffect(() => {
    const user = auth.currentUser;
    
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Suscribirse a cambios en tiempo real
    const unsubscribe = FirestoreConversationStorage.subscribeToUserConversations(
      user.uid,
      (updatedConversations: Conversation[]) => {
        setConversations(updatedConversations);
        setLoading(false);
        
        // Si hay una conversación actual, actualizarla
        if (currentConversation) {
          const updated = updatedConversations.find((c: Conversation) => c.id === currentConversation.id);
          if (updated) {
            setCurrentConversation(updated);
          }
        }
      }
    );

    // Cleanup al desmontar
    return () => {
      unsubscribe();
      FirestoreConversationStorage.unsubscribeFromConversations();
    };
  }, [currentConversation?.id]);

  // ✅ CREAR NUEVA CONVERSACIÓN
  const createConversation = useCallback(async (
    title: string, 
    mode?: string,
    userPlan: PlanType = 'free'
  ): Promise<Conversation | null> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('Debes iniciar sesión');
        return null;
      }

      // Validar límite de conversaciones
      const canCreate = await FirestoreConversationStorage.canCreateNewConversation(user.uid, userPlan);
      
      if (!canCreate) {
        toast.error('Has alcanzado el límite de conversaciones para tu plan');
        return null;
      }

      const newConversation = await FirestoreConversationStorage.createConversation(
        user.uid,
        title,
        mode
      );

      setCurrentConversation(newConversation);
      toast.success('Nueva conversación creada');
      
      return newConversation;
    } catch (err: any) {
      const errorMessage = err.message || 'Error creando conversación';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, []);

  // ✅ AGREGAR MENSAJE A CONVERSACIÓN
  const addMessage = useCallback(async (
    conversationId: string,
    message: ChatMessage,
    userPlan: PlanType = 'free'
  ): Promise<boolean> => {
    try {
      await FirestoreConversationStorage.addMessage(conversationId, message, userPlan);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error agregando mensaje';
      setError(errorMessage);
      
      // Si es límite de mensajes, mostrar error específico
      if (errorMessage.includes('Límite de')) {
        toast.error(errorMessage, { duration: 5000 });
      } else {
        toast.error(errorMessage);
      }
      
      return false;
    }
  }, []);

  // ✅ CARGAR UNA CONVERSACIÓN ESPECÍFICA
  const loadConversation = useCallback(async (conversationId: string): Promise<void> => {
    try {
      setLoading(true);
      const conversation = await FirestoreConversationStorage.getConversation(conversationId);
      
      if (conversation) {
        setCurrentConversation(conversation);
      } else {
        toast.error('Conversación no encontrada');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error cargando conversación';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ ACTUALIZAR TÍTULO
  const updateTitle = useCallback(async (conversationId: string, newTitle: string): Promise<void> => {
    try {
      await FirestoreConversationStorage.updateConversationTitle(conversationId, newTitle);
      toast.success('Título actualizado');
    } catch (err: any) {
      toast.error('Error actualizando título');
    }
  }, []);

  // ✅ ARCHIVAR CONVERSACIÓN
  const archiveConversation = useCallback(async (conversationId: string): Promise<void> => {
    try {
      await FirestoreConversationStorage.archiveConversation(conversationId);
      toast.success('Conversación archivada');
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }
    } catch (err: any) {
      toast.error('Error archivando conversación');
    }
  }, [currentConversation]);

  // ✅ ELIMINAR CONVERSACIÓN
  const deleteConversation = useCallback(async (conversationId: string): Promise<void> => {
    try {
      await FirestoreConversationStorage.deleteConversation(conversationId);
      toast.success('Conversación eliminada');
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }
    } catch (err: any) {
      toast.error('Error eliminando conversación');
    }
  }, [currentConversation]);

  // ✅ OBTENER ESTADÍSTICAS
  const getStats = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      return await FirestoreConversationStorage.getUserStats(user.uid);
    } catch (err: any) {
      console.error('Error obteniendo estadísticas:', err);
      return null;
    }
  }, []);

  // ✅ EXPORTAR CONVERSACIONES
  const exportConversations = useCallback(async (): Promise<string | null> => {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const json = await FirestoreConversationStorage.exportConversations(user.uid);
      
      // Descargar como archivo
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversaciones_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Conversaciones exportadas');
      return json;
    } catch (err: any) {
      toast.error('Error exportando conversaciones');
      return null;
    }
  }, []);

  // ✅ LIMPIAR CONVERSACIONES ANTIGUAS
  const cleanOldConversations = useCallback(async (daysOld: number = 90): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const deletedCount = await FirestoreConversationStorage.cleanOldConversations(user.uid, daysOld);
      
      if (deletedCount > 0) {
        toast.success(`${deletedCount} conversaciones antiguas eliminadas`);
      } else {
        toast.success('No hay conversaciones antiguas para eliminar');
      }
    } catch (err: any) {
      toast.error('Error limpiando conversaciones');
    }
  }, []);

  return {
    // Estado
    conversations,
    currentConversation,
    loading,
    error,
    
    // Métodos
    createConversation,
    addMessage,
    loadConversation,
    updateTitle,
    archiveConversation,
    deleteConversation,
    getStats,
    exportConversations,
    cleanOldConversations,
    setCurrentConversation // ✅ EXPORTAR PARA LIMPIAR CONVERSACIÓN
  };
}