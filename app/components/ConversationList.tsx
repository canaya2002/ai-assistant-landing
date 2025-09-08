// components/ConversationList.tsx
'use client';

import { useState, useRef } from 'react';
import { 
  MessageCircle, 
  Search, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  Clock,
  Check,
  X,
  BarChart3,
  Plus,
  Menu
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
    loadConversation,
    deleteConversation,
    updateConversationTitle,
    searchConversations,
    exportConversations,
    importConversations,
    getUsageStats
  } = useConversations();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showStats, setShowStats] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredConversations = searchQuery.trim() 
    ? searchConversations(searchQuery) 
    : conversations;

  const handleStartEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      updateConversationTitle(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleDeleteConversation = (conversationId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      deleteConversation(conversationId);
    }
  };

  const handleLoadConversation = (conversation: Conversation) => {
    loadConversation(conversation.id);
    onClose();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const success = await importConversations(file);
    if (success) {
      toast.success('Conversaciones importadas exitosamente');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Hoy';
    } else if (days === 1) {
      return 'Ayer';
    } else if (days < 7) {
      return `Hace ${days} días`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const stats = getUsageStats();

  return (
    <div className="h-full flex flex-col bg-black/60 backdrop-blur-xl">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white font-lastica">
            Conversaciones
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* New Conversation Button */}
        <button
          onClick={onNewConversation}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2 mb-4"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva conversación</span>
        </button>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-500/60"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Estadísticas"
          >
            <BarChart3 className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={exportConversations}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Exportar backup"
          >
            <Download className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Importar backup"
          >
            <Upload className="w-4 h-4 text-gray-400" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div className="p-4 bg-white/5 border-b border-white/10">
          <h3 className="text-sm font-medium text-white mb-3">Estadísticas</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-gray-400">Conversaciones</div>
              <div className="text-white font-medium">{stats.totalConversations}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-gray-400">Mensajes</div>
              <div className="text-white font-medium">{stats.totalMessages}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 col-span-2">
              <div className="text-gray-400">Promedio por conversación</div>
              <div className="text-white font-medium">{stats.avgMessagesPerConversation} mensajes</div>
            </div>
          </div>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center">
            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {searchQuery ? 'No se encontraron conversaciones' : 'No tienes conversaciones aún'}
            </p>
            {!searchQuery && (
              <button
                onClick={onNewConversation}
                className="mt-3 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Iniciar primera conversación
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-3">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentConversation?.id === conversation.id
                    ? 'bg-gray-600/20 border border-gray-500/30'
                    : 'hover:bg-white/5'
                }`}
              >
                {editingId === conversation.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-gray-500/60"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="p-1 text-green-400 hover:text-green-300"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      onClick={() => handleLoadConversation(conversation)}
                      className="flex-1"
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="text-white text-sm font-medium line-clamp-2 flex-1 pr-2">
                          {conversation.title}
                        </h3>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(conversation);
                            }}
                            className="p-1 text-gray-400 hover:text-white"
                            title="Editar título"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(conversation.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-400"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-3 text-xs text-gray-400">
                          <span className="flex items-center space-x-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{conversation.messages.length}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(conversation.updatedAt)}</span>
                          </span>
                        </div>
                      </div>

                      {/* Preview del último mensaje */}
                      {conversation.messages.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500 line-clamp-2">
                          {conversation.messages[conversation.messages.length - 1].message.substring(0, 100)}
                          {conversation.messages[conversation.messages.length - 1].message.length > 100 && '...'}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}