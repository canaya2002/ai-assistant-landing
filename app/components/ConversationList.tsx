// app/components/ConversationList.tsx - ACTUALIZADO PARA FIRESTORE
'use client';

import { useState, useEffect } from 'react';
import { useConversations } from '../hooks/useConversations'; // ✅ NUEVO HOOK
import { useAuth } from '../contexts/AuthContext';
import { ChatMessage } from '../lib/types'; // ✅ IMPORT AGREGADO
import { MessageSquare, Trash2, X, Search, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface ConversationListProps {
  isOpen: boolean;
  onClose: () => void;
  onNewConversation: () => void;
}

export default function ConversationList({ isOpen, onClose, onNewConversation }: ConversationListProps) {
  const { user } = useAuth();
  const {
    conversations,
    currentConversation,
    loading,
    loadConversation,
    deleteConversation,
    exportConversations,
    getStats,
    setCurrentConversation // ✅ AGREGAR ESTO
  } = useConversations();

  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    avgMessagesPerConversation: 0
  });

  // ✅ Cargar estadísticas
  useEffect(() => {
    const loadStats = async () => {
      const statsData = await getStats();
      if (statsData) {
        setStats(statsData);
      }
    };
    
    if (user) {
      loadStats();
    }
  }, [user, conversations.length, getStats]);

  // ✅ Filtrar conversaciones por búsqueda
  const filteredConversations = searchQuery.trim()
    ? conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.messages.some((msg: ChatMessage) => msg.message.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : conversations;

  // ✅ Manejar eliminación
  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('¿Eliminar esta conversación?')) {
      return;
    }

    await deleteConversation(conversationId);
  };

  // ✅ Manejar exportación
  const handleExport = async () => {
    await exportConversations();
  };

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Conversaciones</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
          />
        </div>

        {/* Botón nueva conversación */}
        <button
          onClick={() => {
            setCurrentConversation(null); // ✅ Solo limpia, no crea
            onNewConversation();
          }}
          className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          + Nueva Conversación
        </button>
      </div>

      {/* Estadísticas */}
      <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-800">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-gray-400">Total</div>
            <div className="font-bold text-white">{stats.totalConversations}</div>
          </div>
          <div>
            <div className="text-gray-400">Mensajes</div>
            <div className="font-bold text-white">{stats.totalMessages}</div>
          </div>
          <div>
            <div className="text-gray-400">Promedio</div>
            <div className="font-bold text-white">{stats.avgMessagesPerConversation}</div>
          </div>
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
            <p>
              {searchQuery ? 'No se encontraron conversaciones' : 'No hay conversaciones'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  loadConversation(conv.id);
                  onClose();
                }}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  currentConversation?.id === conv.id
                    ? 'bg-purple-600/20 border-2 border-purple-500'
                    : 'bg-gray-800 hover:bg-gray-700 border-2 border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate mb-1">
                      {conv.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <MessageSquare className="w-3 h-3" />
                      <span>{conv.messageCount} mensajes</span>
                      <span>•</span>
                      <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {conv.messages.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {conv.messages[conv.messages.length - 1].message.substring(0, 60)}...
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="ml-2 p-1.5 hover:bg-red-500/20 rounded-lg transition-colors group"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer con exportar */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleExport}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Exportar Conversaciones
        </button>
      </div>
    </div>
  );
}