// app/components/Chat/ChatInputBar.tsx - CORREGIDO
'use client';

import React, { useState, useRef, memo, useCallback, useEffect } from 'react';
import { 
  Send, Loader2, Plus, MessageCircle, X, FileText, Globe, Mic, MicOff, Atom, ArrowRight, Code, Zap, Sparkles, Check
} from 'lucide-react';
import { ChatMessage, PlanType, SpecialtyType, AdvancedModeType } from '../../lib/types';
import toast from 'react-hot-toast';

interface ChatInputBarProps {
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
  isLoading: boolean;
  userProfile: any;

  currentMode: 'normal' | 'developer' | 'specialist';
  currentSpecialty: SpecialtyType | undefined;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (enabled: boolean) => void;
  deepThinkingMode: boolean;
  setDeepThinkingMode: (enabled: boolean) => void;
  reportMode: boolean;
  setReportMode: (enabled: boolean) => void;
  advancedMode: AdvancedModeType | null;
  setAdvancedMode: (mode: AdvancedModeType | null) => void;
  handleModeChange: (mode: 'normal' | 'developer' | 'specialist', specialty?: SpecialtyType) => void;
  
  uploadedFiles: File[];
  removeFile: (index: number) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  isRecording: boolean;
  startVoiceRecording: () => void;
  stopVoiceRecording: () => void;
  voiceText: string;
  showVoiceText: boolean;

  toggleImageGenerator: () => void;
  toggleVideoGenerator: () => void;
  
  textareaRef: React.RefObject<HTMLTextAreaElement | null>; 
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const SPECIALTIES_FOR_MENU = [
  'Negocios', 'Ciencias', 'Educación', 'Salud', 'Marketing', 'Finanzas', 'Legal', 'Psicología', 
  'Ingeniería', 'Recursos Humanos', 'Ventas', 'Datos', 'Creatividad', 'Cardiología', 
  'Dermatología', 'Nutrición', 'Pediatría'
];

const MultiDotIcon = memo(function MultiDotIcon({ className }: { className: string }) {
  return (
    <svg 
      className={className}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  );
});

const ChatInputBar = memo(function ChatInputBar({
  input, setInput, sendMessage, isLoading, userProfile,
  currentMode, currentSpecialty, webSearchEnabled, setWebSearchEnabled,
  deepThinkingMode, setDeepThinkingMode, reportMode, setReportMode,
  advancedMode, setAdvancedMode, handleModeChange,
  uploadedFiles, removeFile, handleFileUpload,
  isRecording, startVoiceRecording, stopVoiceRecording, voiceText, showVoiceText,
  toggleImageGenerator, toggleVideoGenerator,
  textareaRef, fileInputRef,
}: ChatInputBarProps) {
  
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const sideMenuRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  
  const [showSpecialistSubmenu, setShowSpecialistSubmenu] = useState(false);
  const [showDocumentSubmenu, setShowDocumentSubmenu] = useState(false);
  const [showAnalysisSubmenu, setShowAnalysisSubmenu] = useState(false);
  
  const specialistParentRef = useRef<HTMLDivElement>(null);
  const documentParentRef = useRef<HTMLDivElement>(null);
  const analysisParentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 96) + 'px';
    }
  }, [input, textareaRef]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Verificar si el clic fue dentro de algún submenú
      const clickedInsideSubmenu = target.closest('.specialist-submenu') || target.closest('.document-submenu');
      
      if (clickedInsideSubmenu) {
        return; // No cerrar si se hace clic dentro de un submenú
      }
      
      const isClickInsideSideMenu = sideMenuRef.current && sideMenuRef.current.contains(target);
      const isClickInsideToolsMenu = toolsMenuRef.current && toolsMenuRef.current.contains(target);
      
      const isModesButton = target.closest('.modes-toggle');
      const isToolsButton = target.closest('.tools-toggle');
      
      if (!isClickInsideSideMenu && showSideMenu && !isModesButton) {
        setShowSideMenu(false);
        setShowSpecialistSubmenu(false);
        setShowDocumentSubmenu(false);
      }
      
      if (!isClickInsideToolsMenu && showToolsMenu && !isToolsButton) {
        setShowToolsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSideMenu, showToolsMenu]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleWebSearch = useCallback(() => {
    const newState = !webSearchEnabled;
    setWebSearchEnabled(newState);
    toast.success(newState ? 'Búsqueda web activada' : 'Búsqueda web desactivada');
  }, [webSearchEnabled, setWebSearchEnabled]);

  const toggleReportMode = useCallback(() => {
    const newState = !reportMode;
    setReportMode(newState);
    toast.success(newState ? 'Modo reporte activado' : 'Modo reporte desactivado');
  }, [reportMode, setReportMode]);

  const toggleDeepSearch = useCallback(() => {
    const newState = !deepThinkingMode;
    setDeepThinkingMode(newState);
    toast.success(newState ? 'Deep Search activado' : 'Deep Search desactivado');
  }, [deepThinkingMode, setDeepThinkingMode]);

  const closeAllMenus = useCallback(() => {
    setShowToolsMenu(false);
    setShowSideMenu(false);
    setShowSpecialistSubmenu(false);
    setShowDocumentSubmenu(false);
    setShowAnalysisSubmenu(false);
  }, []);
  
  const handleSelectMode = (mode: 'normal' | 'developer' | 'specialist', specialty?: SpecialtyType) => {
    handleModeChange(mode, specialty);
    closeAllMenus();
    if (mode === 'normal') toast.success('Chat Normal activado');
    else if (mode === 'developer') toast.success('Modo Desarrollador activado');
    else toast.success(`Modo ${specialty} activado`);
  };

  const handleSelectAdvancedMode = (mode: AdvancedModeType | 'report') => {
    closeAllMenus();
    if (mode === 'report') {
        setAdvancedMode(null);
        toggleReportMode(); 
    } else {
        setReportMode(false);
        setAdvancedMode(mode);
        toast.success(`${mode.replace('_', ' ')} activado`);
    }
  };

  const handleSelectSpecialistMode = (spec: string) => {
      handleModeChange('specialist', spec.toLowerCase().replace(/\s+/g, '_') as SpecialtyType);
      closeAllMenus();
      toast.success(`Modo ${spec} activado`);
  };

  const toggleSpecialistSubmenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowSpecialistSubmenu(prev => !prev);
    setShowDocumentSubmenu(false);
    setShowAnalysisSubmenu(false);
  }
  
  const toggleDocumentSubmenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowDocumentSubmenu(prev => !prev);
    setShowSpecialistSubmenu(false);
    setShowAnalysisSubmenu(false);
  }
  
  const toggleAnalysisSubmenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowAnalysisSubmenu(prev => !prev);
    setShowSpecialistSubmenu(false);
    setShowDocumentSubmenu(false);
  }

  return (
    <div className="bg-black/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-4">
        {uploadedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg text-sm">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">{file.name}</span>
                <button onClick={() => removeFile(index)} className="text-red-400 hover:text-red-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {reportMode && (
          <div className="mb-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2 text-purple-400">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Modo Reporte Activado</span>
            </div>
            <button onClick={toggleReportMode} className="text-purple-400 hover:text-purple-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {webSearchEnabled && (
          <div className="mb-3">
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-green-400">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">Búsqueda Web Activada</span>
                </div>
                <button onClick={toggleWebSearch} className="text-green-400 hover:text-green-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {showVoiceText && voiceText && (
          <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-400 mb-1">
              <Mic className="w-4 h-4" />
              <span className="text-xs font-medium">Texto reconocido:</span>
            </div>
            <p className="text-sm text-gray-300">{voiceText}</p>
          </div>
        )}

        <div className="flex items-center space-x-1 md:space-x-2 floating-input-container px-2 md:px-4 py-3">
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept=".txt,.pdf,.doc,.docx,.json,.csv,.xlsx,.xls"
            className="hidden"
          />

          <div className="relative">
            <button
              onClick={() => { closeAllMenus(); setShowToolsMenu(prev => !prev); }}
              className="floating-icon-button p-1.5 md:p-2 tools-toggle"
            >
              <Plus className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 transition-transform duration-300 ${showToolsMenu ? 'rotate-45' : ''}`} />
            </button>

            {showToolsMenu && (
              <div ref={toolsMenuRef} className="absolute bottom-full left-0 mb-2 floating-menu w-48 z-50">
                <button onClick={() => { toggleImageGenerator(); closeAllMenus(); }} className="floating-menu-item">
                  <span className="text-sm font-light">Generar imagen</span>
                </button>
                
                <button onClick={() => { toggleVideoGenerator(); closeAllMenus(); }} className="floating-menu-item">
                  <span className="text-sm font-light">Generar video</span>
                </button>

                <button onClick={toggleWebSearch} className={`floating-menu-item ${webSearchEnabled ? 'text-white' : 'text-gray-400'}`}>
                  <span className="text-sm font-light">
                    {webSearchEnabled ? 'Desactivar búsqueda' : 'Activar búsqueda'}
                  </span>
                </button>
                
                <button onClick={() => fileInputRef.current?.click()} className="floating-menu-item">
                  <span className="text-sm font-light">Subir archivos</span>
                </button>
              </div>
            )}
          </div>

          {/* MENÚ LATERAL CORREGIDO */}
          <div className="relative">
            <button
              onClick={() => { closeAllMenus(); setShowSideMenu(prev => !prev); }}
              className="floating-icon-button p-1.5 md:p-2 modes-toggle"
            >
               <MultiDotIcon className={`w-4 h-4 md:w-5 md:h-5 transition-colors duration-300 ${showSideMenu ? 'text-white' : 'text-gray-400'}`} />
            </button>

            {showSideMenu && (
              <div ref={sideMenuRef} className="modes-menu-container">
                
                <button onClick={() => { handleSelectMode('normal'); }} className="floating-menu-item border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-light text-white">Chat Normal</span>
                  </div>
                </button>

                <button onClick={() => { handleSelectMode('developer'); }} className="floating-menu-item border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-light text-white">Modo Desarrollador</span>
                  </div>
                </button>

                {/* SPECIALIST SUBMENU */}
                <div ref={specialistParentRef} className="border-b border-white/10 submenu-parent">
                  <button 
                    onClick={toggleSpecialistSubmenu} 
                    className="w-full px-4 py-3 hover:bg-white/5 cursor-pointer transition-all duration-300 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-light text-white">Especialistas</span>
                    </div>
                    <ArrowRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showSpecialistSubmenu ? 'rotate-90' : 'rotate-0'}`} />
                  </button>
                  
                  {showSpecialistSubmenu && (
                    <div className="submenu-popup">
                      {SPECIALTIES_FOR_MENU.map((spec) => (
                        <button
                          key={spec}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSpecialistMode(spec);
                          }}
                          className="submenu-button"
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* DOCUMENTS SUBMENU */}
                <div ref={documentParentRef} className="border-b border-white/10 submenu-parent">
                  <button 
                    onClick={toggleDocumentSubmenu}
                    className="w-full px-4 py-3 hover:bg-white/5 cursor-pointer transition-all duration-300 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-light text-white">Documentos</span>
                    </div>
                    <ArrowRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showDocumentSubmenu ? 'rotate-90' : 'rotate-0'}`} />
                  </button>
                  
                  {showDocumentSubmenu && (
                    <div className="submenu-popup">
                      <button onClick={(e) => { e.stopPropagation(); handleSelectAdvancedMode('document_detective'); }} className="submenu-button">Document Detective</button>
                      <button onClick={(e) => { e.stopPropagation(); handleSelectAdvancedMode('ai_detector'); }} className="submenu-button">AI Detector</button>
                      <button onClick={(e) => { e.stopPropagation(); handleSelectAdvancedMode('text_humanizer'); }} className="submenu-button">Text Humanizer</button>
                    </div>
                  )}
                </div>

                {/* ANALYSIS SUBMENU */}
                <div ref={analysisParentRef} className="submenu-parent">
                  <button 
                    onClick={toggleAnalysisSubmenu}
                    className="w-full px-4 py-3 hover:bg-white/5 cursor-pointer transition-all duration-300 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-light text-white">Análisis</span>
                    </div>
                    <ArrowRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showAnalysisSubmenu ? 'rotate-90' : 'rotate-0'}`} />
                  </button>
                  
                  {showAnalysisSubmenu && (
                    <div className="submenu-popup">
                      <button onClick={(e) => { e.stopPropagation(); handleSelectAdvancedMode('travel_planner'); }} className="submenu-button">Travel Planner</button>
                      <button onClick={(e) => { e.stopPropagation(); handleSelectAdvancedMode('brand_analyzer'); }} className="submenu-button">Brand Analyzer</button>
                      <button onClick={(e) => { e.stopPropagation(); handleSelectAdvancedMode('plant_doctor'); }} className="submenu-button">Plant Doctor</button>
                      
                      <button onClick={(e) => { e.stopPropagation(); handleSelectAdvancedMode('report'); }} className="submenu-button border-t border-white/10 mt-1 pt-2">
                        Generar Reporte {reportMode && <Check className="w-3 h-3 inline ml-1 text-green-400" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 relative flex items-center">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              disabled={isLoading}
              rows={1}
              className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-sm flex items-center"
              style={{ maxHeight: '96px', minHeight: '24px', lineHeight: '24px', paddingTop: '0px', paddingBottom: '0px' }}
            />
          </div>

          <button
            onClick={toggleDeepSearch}
            className="floating-icon-button p-1.5 md:p-2"
            title={deepThinkingMode ? 'Desactivar Deep Search' : 'Activar Deep Search'}
          >
            <Atom className={`w-4 h-4 md:w-5 md:h-5 transition-colors duration-300 ${deepThinkingMode ? 'text-white' : 'text-gray-400'}`} />
          </button>

          <button
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className="floating-icon-button p-1.5 md:p-2"
            title={isRecording ? 'Detener grabación' : 'Iniciar grabación de voz'}
          >
            {isRecording ? (
              <MicOff className="w-4 h-4 md:w-5 md:h-5 text-red-400 animate-pulse" />
            ) : (
              <Mic className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            )}
          </button>

          <button
            onClick={sendMessage}
            disabled={isLoading || (!input.trim() && uploadedFiles.length === 0)}
            className={`floating-send-button p-1.5 md:p-2 ${
              (input.trim() || uploadedFiles.length > 0) && !isLoading
                ? 'active'
                : 'disabled'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        /* CONTENEDOR PRINCIPAL DEL INPUT */
        .floating-input-container {
          position: relative;
          overflow: visible !important;
        }

        /* MENÚ PRINCIPAL */
        .modes-menu-container {
          position: absolute;
          bottom: 100%;
          left: 0;
          margin-bottom: 0.5rem;
          width: 16rem;
          background: linear-gradient(145deg, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.9));
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.5),
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          overflow: visible !important;
          z-index: 10000;
        }

        /* CONTENEDOR PADRE DE SUBMENÚ */
        .submenu-parent {
          position: relative;
          overflow: visible !important;
        }

        /* SUBMENÚS - DESPLEGADOS HACIA ARRIBA Y A LA DERECHA */
        .submenu-popup {
          position: absolute !important;
          bottom: 0 !important;
          left: 100% !important;
          margin-left: 0.5rem !important;
          width: 14rem !important;
          max-height: 24rem !important;
          overflow-y: auto !important;
          background: linear-gradient(145deg, rgba(0, 0, 0, 0.98), rgba(0, 0, 0, 0.95)) !important;
          backdrop-filter: blur(40px) !important;
          -webkit-backdrop-filter: blur(40px) !important;
          border: 2px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 16px !important;
          box-shadow: 
            0 25px 70px rgba(0, 0, 0, 0.7),
            0 10px 40px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
          pointer-events: auto !important;
          z-index: 99999 !important;
          animation: slideInFromLeft 0.2s ease-out !important;
        }

        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* BOTONES DENTRO DE SUBMENÚS */
        .submenu-button {
          cursor: pointer !important;
          pointer-events: auto !important;
          display: block !important;
          width: 100% !important;
          text-align: left !important;
          padding: 0.5rem 1rem !important;
          transition: all 0.3s ease !important;
          font-size: 0.875rem !important;
          color: #d1d5db !important;
          font-weight: 300 !important;
          background: transparent !important;
          border: none !important;
          user-select: none;
          -webkit-user-select: none;
        }

        .submenu-button:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          color: white !important;
        }

        .submenu-button:active {
          background: rgba(255, 255, 255, 0.15) !important;
          transform: scale(0.98);
        }

        /* SCROLLBAR PARA SUBMENÚS */
        .submenu-popup::-webkit-scrollbar {
          width: 6px;
        }
        .submenu-popup::-webkit-scrollbar-track {
          background: transparent;
        }
        .submenu-popup::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .submenu-popup::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }

        /* ASEGURAR QUE CONTENEDORES PADRE NO CORTEN */
        .bg-black\/80 {
          overflow: visible !important;
        }
        
        .max-w-4xl {
          overflow: visible !important;
        }
      `}</style>
    </div>
  );
});

export default ChatInputBar;