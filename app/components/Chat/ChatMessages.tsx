// app/components/Chat/ChatMessages.tsx
'use client';

import React, { memo, useRef, useEffect } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Copy, RefreshCw, Globe, FileText, AlertTriangle, User, Sparkles, Atom, Video } from 'lucide-react';
import { ChatMessage, AdvancedModeType } from '../../lib/types';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = memo(function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        components={{
          p: (props) => <p className="mb-3 leading-relaxed text-gray-100" {...props} />,
          h1: (props) => <h1 className="text-xl font-bold mb-4 text-white border-b border-gray-600 pb-2" {...props} />,
          h2: (props) => <h2 className="text-lg font-bold mb-3 text-white" {...props} />,
          h3: (props) => <h3 className="text-base font-bold mb-2 text-white" {...props} />,
          strong: (props) => <strong className="font-bold text-white" {...props} />,
          em: (props) => <em className="italic text-gray-200" {...props} />,
          ul: (props) => <ul className="list-disc list-inside mb-4 space-y-1 text-gray-100 ml-4" {...props} />,
          ol: (props) => <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-100 ml-4" {...props} />,
          li: (props) => <li className="mb-1 text-gray-100" {...props} />,
          code: (props) => {
            const { className, children, ...rest } = props;
            const isInline = !className;
            return isInline ? (
              <code className="bg-gray-700 px-2 py-1 rounded text-sm text-gray-200 font-mono" {...rest}>{children}</code>
            ) : (
              <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-200 overflow-x-auto my-4">
                <code {...rest}>{children}</code>
              </pre>
            );
          },
          blockquote: (props) => (
            <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-300 mb-4 bg-gray-800/50 py-2 rounded-r-lg" {...props} />
          ),
          a: (props) => (
            <a className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          table: (props) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-gray-600 rounded-lg" {...props} />
            </div>
          ),
          th: (props) => (
            <th className="border border-gray-600 px-4 py-2 bg-gray-700 text-white font-semibold text-left" {...props} />
          ),
          td: (props) => (
            <td className="border border-gray-600 px-4 py-2 text-gray-100" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  regenerateResponse: (messageId: string) => void;
  copyMessage: (text: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>; 
  currentMode: 'normal' | 'developer' | 'specialist';
  advancedMode: AdvancedModeType | null;
  reportMode: boolean;
  deepThinkingMode: boolean;
}

const ChatMessages = memo(function ChatMessages({
  messages,
  isLoading,
  regenerateResponse,
  copyMessage,
  messagesEndRef,
  currentMode,
  advancedMode,
  reportMode,
  deepThinkingMode,
}: ChatMessagesProps) {

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message: ChatMessage, index: number) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} group`}>
            <div className={`flex items-start space-x-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              
              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                {message.type === 'ai' ? (
                  <Image
                    src="/images/noralogoicon.png"
                    alt="NORA"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Bubble */}
              <div className={`flex-1 rounded-2xl ${
                message.type === 'user' 
                  ? 'bg-gray-700/80 border-2 border-gray-600/50 rounded-br-sm' 
                  : 'floating-card border-2 border-white/15 rounded-bl-sm'
              } p-4 shadow-lg animate-card-in`} style={{ fontFamily: 'Lastica, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                
                {/* File Previews */}
                {message.files && message.files.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {message.files.map((fileName, idx) => (
                      <div key={idx} className="flex items-center space-x-2 bg-gray-700/50 px-3 py-1 rounded-lg text-xs">
                        <FileText className="w-3 h-3" />
                        <span>{fileName}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Web Search Indicator */}
                {message.searchUsed && message.searchResults && (
                  <div className="mb-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-400 text-sm mb-2">
                      <Globe className="w-4 h-4" />
                      <span className="font-medium">BÃºsqueda Web Realizada</span>
                    </div>
                    <p className="text-xs text-gray-300">{message.searchResults.query}</p>
                  </div>
                )}

                {/* Advanced Mode Badge */}
                {(message.advancedMode || message.mode === 'developer' || message.mode === 'specialist') && (
                  <div className="mb-2 inline-flex items-center space-x-1 bg-purple-500/20 px-2 py-1 rounded text-xs text-purple-300">
                    <Sparkles className="w-3 h-3" />
                    <span>Modo: {message.advancedMode ? message.advancedMode.replace('_', ' ') : message.mode}</span>
                  </div>
                )}
                
                {/* Image/Video Content */}
                {message.imageUrl && (
                  <div className="my-3 rounded-xl overflow-hidden">
                    <Image src={message.imageUrl} alt="Generated Image" width={512} height={512} className="w-full h-auto" />
                  </div>
                )}

                {/* Main Content */}
                <MarkdownRenderer content={message.message} />

                {/* AI Actions */}
                {message.type === 'ai' && (
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => copyMessage(message.message)}
                      className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                      title="Copiar mensaje"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    
                    <button
                      onClick={() => regenerateResponse(message.id)}
                      disabled={isLoading}
                      className="p-1.5 hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                      title="Regenerar respuesta"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-[85%]">
              <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src="/images/noralogoicon.png"
                  alt="NORA"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl rounded-bl-sm p-4 border border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-gray-300 text-sm">
                    {advancedMode ? `Procesando en modo ${advancedMode.replace('_', ' ')}...` :
                     reportMode ? 'Generando reporte...' : 
                     deepThinkingMode ? 'Analizando...' : 
                     (messages[messages.length - 1]?.searchUsed || currentMode === 'normal' && messages[messages.length - 1]?.files?.length) ? 'Buscando y analizando...' : 'Pensando...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});

export default ChatMessages;