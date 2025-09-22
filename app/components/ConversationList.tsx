'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  Clock
} from 'lucide-react';
import { useConversations } from '../contexts/ConversationContext';
import { Conversation } from '../lib/types';
import toast from 'react-hot-toast';

interface ConversationListProps {
  isOpen: boolean;
  onClose: () => void;
  onNewConversation: () => void;
}

export default function ConversationList({ isOpen, onClose, onNewConversation }: ConversationListProps) {
  const {
    conversations,
    currentConversation,
    startNewConversation,
    updateConversationTitle,
    deleteConversation: removeConversation
  } = useConversations();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus en el input cuando empieza la edición
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  // Filtrar conversaciones según búsqueda
  const filteredConversations = searchQuery 
    ? conversations.filter(conv => 
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.messages.some(msg => 
          msg.message.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    : conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Crear nueva conversación
  const handleNewConversation = async () => {
    if (isCreatingNew) return;
    
    setIsCreatingNew(true);
    try {
      await startNewConversation();
      onClose(); // Cerrar sidebar en móvil
      toast.success('Nueva conversación creada');
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Error al crear conversación');
    } finally {
      setIsCreatingNew(false);
    }
  };

  // Empezar edición
  const startEditing = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditingTitle(conversation.title);
  };

  // Cancelar edición
  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  // Guardar título editado
  const saveTitle = async () => {
    if (!editingId || !editingTitle.trim()) return;
    
    try {
      await updateConversationTitle(editingId, editingTitle.trim());
      setEditingId(null);
      setEditingTitle('');
      toast.success('Título actualizado');
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Error al actualizar título');
    }
  };

  // Eliminar conversación con confirmación
  const handleDeleteConversation = (conversationId: string, title: string) => {
    if (window.confirm(`¿Estás seguro de eliminar "${title}"?`)) {
      removeConversation(conversationId);
    }
  };

  // Cambiar a conversación (simplificado)
  const handleSwitchConversation = (conversation: Conversation) => {
    // Solo cerrar el sidebar - la selección se maneja desde ChatInterface
    onClose(); 
  };

  // Formatear fecha relativa
  const formatRelativeTime = (date: Date) => {
    try {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Ahora';
      if (diffMins < 60) return `${diffMins}min`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      
      return date.toLocaleDateString();
    } catch {
      return new Date(date).toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="h-full flex flex-col bg-black">
        {/* Header rediseñado */}
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-end mb-4 md:mb-6">
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="md:hidden p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-300"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Container centrado para ambos elementos */}
          <div className="max-w-sm mx-auto space-y-4">
            {/* Botón nueva conversación con efecto gota de agua */}
            <button
              onClick={handleNewConversation}
              disabled={isCreatingNew}
              className="w-full glass-button text-white py-3 px-4 rounded-2xl font-medium transition-all duration-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              {/* Contenido del botón centrado */}
              <div className="relative z-10">
                {isCreatingNew ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    <span className="text-sm">Creando...</span>
                  </div>
                ) : (
                  <span className="text-sm">Nueva conversación</span>
                )}
              </div>
              
              {/* Reflejo de cristal */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-2xl opacity-70"></div>
            </button>

            {/* Búsqueda centrada */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600 transition-all duration-300 text-sm"
                style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}
              />
            </div>
          </div>
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto custom-scroll" id="conversations-scroll">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
              </div>
              <p className="text-gray-400 mb-4 font-light" style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                {searchQuery ? 'No se encontraron conversaciones' : 'Comienza tu primera conversación'}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleNewConversation}
                  disabled={isCreatingNew}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-300 font-light disabled:opacity-50"
                  style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}
                >
                  Crear primera conversación
                </button>
              )}
            </div>
          ) : (
            <div className="py-2">
              {filteredConversations.map((conversation, index) => (
                <div
                  key={conversation.id}
                  className={`group cursor-pointer transition-all duration-300 px-4 py-4 mx-2 my-2 rounded-lg ${
                    currentConversation?.id === conversation.id
                      ? 'bg-gray-900 border-l-2 border-white'
                      : 'hover:bg-gray-900/50'
                  }`}
                  onMouseEnter={() => setHoveredItem(conversation.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {editingId === conversation.id ? (
                    // Modo edición
                    <div className="flex items-center space-x-3">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') saveTitle();
                          if (e.key === 'Escape') cancelEditing();
                        }}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gray-600 transition-all duration-300"
                        style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}
                        maxLength={100}
                      />
                      <button
                        onClick={saveTitle}
                        className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-all duration-300"
                        title="Guardar"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    // Modo normal
                    <div
                      onClick={() => handleSwitchConversation(conversation)}
                      className="flex items-start justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        {/* Título */}
                        <h3 className="font-light text-white text-base mb-2 truncate group-hover:text-gray-300 transition-colors duration-300" style={{ 
                          fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' 
                        }}>
                          {conversation.title}
                        </h3>
                        
                        {/* Preview del último mensaje */}
                        {conversation.messages.length > 0 && (
                          <p className="text-gray-500 text-sm mb-3 line-clamp-2 group-hover:text-gray-400 transition-colors duration-300 font-light">
                            {conversation.messages[conversation.messages.length - 1]?.message?.substring(0, 100) || 'Sin mensaje'}
                            {conversation.messages[conversation.messages.length - 1]?.message?.length > 100 && '...'}
                          </p>
                        )}
                        
                        {/* Metadatos sin cajas */}
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span className="font-light">{formatRelativeTime(conversation.updatedAt)}</span>
                          </div>
                          <span className="font-light">{conversation.messages.length} mensajes</span>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className={`flex items-center space-x-1 ml-3 transition-all duration-300 ${
                        hoveredItem === conversation.id ? 'opacity-100' : 'opacity-0'
                      }`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(conversation);
                          }}
                          className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-300"
                          title="Editar título"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conversation.id, conversation.title);
                          }}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                          title="Eliminar conversación"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Estilos CSS */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Lastica:wght@300;400;500;600;700&display=swap');
        
        /* Botón efecto gota de agua iOS - ligeramente más gris */
        .glass-button {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 
                      0 2px 6px rgba(0, 0, 0, 0.05),
                      inset 0 1px 0 rgba(255, 255, 255, 0.12);
          position: relative;
        }
        
        .glass-button:hover {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06));
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15), 
                      0 3px 8px rgba(0, 0, 0, 0.08),
                      inset 0 1px 0 rgba(255, 255, 255, 0.18);
          transform: translateY(-1px);
        }
        
        .glass-button:active {
          transform: translateY(0);
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1), 
                      0 1px 4px rgba(0, 0, 0, 0.05),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        
        /* Scrollbar minimalista que aparece solo al hacer scroll */
        .custom-scroll {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.3s ease;
        }
        
        .custom-scroll:hover {
          scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
        }
        
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scroll::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 2px;
          transition: background 0.3s ease;
        }
        
        .custom-scroll:hover::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
        }
        
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }

        /* Utilities */
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        /* Fuente Lastica */
        * {
          font-family: 'Lastica', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </>
  );
}