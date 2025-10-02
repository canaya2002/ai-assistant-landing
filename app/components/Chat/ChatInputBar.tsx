// app/components/Chat/ChatInputBar.tsx
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

  // Mode and State Props/Setters
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
  
  // File Props
  uploadedFiles: File[];
  removeFile: (index: number) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  // Voice Props
  isRecording: boolean;
  startVoiceRecording: () => void;
  stopVoiceRecording: () => void;
  voiceText: string;
  showVoiceText: boolean;

  // Toggle UI
  toggleImageGenerator: () => void;
  toggleVideoGenerator: () => void;
  
  // Refs (Fixes for Error 1: Accepts RefObject<... | null>)
  textareaRef: React.RefObject<HTMLTextAreaElement | null>; 
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const SPECIALTIES_FOR_MENU = [
  'Negocios', 'Ciencias', 'EducaciÃ³n', 'Salud', 'Marketing', 'Finanzas', 'Legal', 'PsicologÃ­a', 
  'IngenierÃ­a', 'Recursos Humanos', 'Ventas', 'Datos', 'Creatividad', 'CardiologÃ­a', 
  'DermatologÃ­a', 'NutriciÃ³n', 'PediatrÃ­a'
];

// NEW MultiDotIcon component (Restore original icon)
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
  
  // State for nested submenus
  const [showSpecialistSubmenu, setShowSpecialistSubmenu] = useState(false);
  const [showDocumentSubmenu, setShowDocumentSubmenu] = useState(false);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 96) + 'px';
    }
  }, [input, textareaRef]);
  
  // LÃ³gica para cerrar menÃºs al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isClickInsideSideMenu = sideMenuRef.current && sideMenuRef.current.contains(event.target as Node);
      const isClickInsideToolsMenu = toolsMenuRef.current && toolsMenuRef.current.contains(event.target as Node);
      
      const isModesButton = (event.target as HTMLElement).closest('.modes-toggle');
      const isToolsButton = (event.target as HTMLElement).closest('.tools-toggle');
      
      // Close side menu and submenus
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

  // FIX: Passing the calculated new state value (boolean) directly to the setter
  const toggleWebSearch = useCallback(() => {
    const newState = !webSearchEnabled;
    setWebSearchEnabled(newState);
    toast.success(newState ? 'BÃºsqueda web activada' : 'BÃºsqueda web desactivada');
  }, [webSearchEnabled, setWebSearchEnabled]);

  // FIX: Passing the calculated new state value (boolean) directly to the setter
  const toggleReportMode = useCallback(() => {
    const newState = !reportMode;
    setReportMode(newState);
    toast.success(newState ? 'Modo reporte activado' : 'Modo reporte desactivado');
  }, [reportMode, setReportMode]);

  // FIX: Passing the calculated new state value (boolean) directly to the setter
  const toggleDeepSearch = useCallback(() => {
    const newState = !deepThinkingMode;
    setDeepThinkingMode(newState);
    toast.success(newState ? 'Deep Search activado' : 'Deep Search desactivado');
  }, [deepThinkingMode, setDeepThinkingMode]);

  const closeAllMenus = useCallback(() => {
    setShowToolsMenu(false);
    setShowSideMenu(false);
    setShowSpecialistSubmenu(false); // Close submenus on parent close
    setShowDocumentSubmenu(false); // Close submenus on parent close
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
        // ToggleReportMode already includes logic and toast
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

  // NEW FUNCTIONS: Toggle handlers for nested menus
  const toggleSpecialistSubmenu = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent closing the main menu
    setShowSpecialistSubmenu(prev => !prev);
    setShowDocumentSubmenu(false); // Close other submenu
  }
  
  const toggleDocumentSubmenu = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent closing the main menu
    setShowDocumentSubmenu(prev => !prev);
    setShowSpecialistSubmenu(false); // Close other submenu
  }


  return (
    <div className="bg-black/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-4">
        {/* Alerts and Previews (Simplified for brevity, assuming they are correct) */}
        {uploadedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-lg text-sm">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-400 hover:text-red-300"
                >
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
                  <span className="text-sm font-medium">BÃºsqueda Web Activada</span>
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

        {/* Input Bar */}
        <div className="flex items-center space-x-1 md:space-x-2 floating-input-container px-2 md:px-4 py-3">
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept=".txt,.pdf,.doc,.docx,.json,.csv,.xlsx,.xls"
            className="hidden"
          />

          {/* Tools Menu Button */}
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
                    {webSearchEnabled ? 'Desactivar bÃºsqueda' : 'Activar bÃºsqueda'}
                  </span>
                </button>
                
                <button onClick={() => fileInputRef.current?.click()} className="floating-menu-item">
                  <span className="text-sm font-light">Subir archivos</span>
                </button>
              </div>
            )}
          </div>

          {/* Modes Menu Button (Icon Restored) */}
          <div className="relative">
            <button
              onClick={() => { closeAllMenus(); setShowSideMenu(prev => !prev); }}
              className="floating-icon-button p-1.5 md:p-2 modes-toggle"
            >
               <MultiDotIcon className={`w-4 h-4 md:w-5 md:h-5 transition-colors duration-300 ${showSideMenu ? 'text-white' : 'text-gray-400'}`} />
            </button>

            {showSideMenu && (
              <div ref={sideMenuRef} className="absolute bottom-full left-0 mb-2 w-64 floating-menu overflow-visible z-50">
                
                {/* Chat Normal */}
                <button onClick={() => { handleSelectMode('normal'); }} className="floating-menu-item border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-light text-white">Chat Normal</span>
                  </div>
                </button>

                {/* Modo Desarrollador */}
                <button onClick={() => { handleSelectMode('developer'); }} className="floating-menu-item border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-light text-white">Modo Desarrollador</span>
                  </div>
                </button>

                {/* Specialist Mode Submenu (FIXED Z-INDEX to ensure visibility) */}
                <div 
                    className="border-b border-white/10 relative group"
                >
                  <div onClick={toggleSpecialistSubmenu} className="w-full px-4 py-3 hover:bg-white/5 cursor-pointer transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-light text-white">Especialistas</span>
                      </div>
                      <ArrowRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showSpecialistSubmenu ? 'rotate-90' : 'rotate-0'}`} />
                    </div>
                  </div>
                  {/* Submenu Content: ANCHOR bottom-0 for upward deployment and Z-INDEX 999 for visibility */}
                  {showSpecialistSubmenu && (
                      <div className="absolute left-full bottom-0 ml-1 w-56 floating-submenu z-[999] transition-all duration-300 max-h-96 overflow-y-auto custom-scroll">
                        {SPECIALTIES_FOR_MENU.map((spec) => (
                          <button
                            key={spec}
                            onClick={() => handleSelectSpecialistMode(spec)}
                            className="w-full text-left px-4 py-2 hover:bg-white/5 transition-all duration-300 text-sm text-gray-300 font-light"
                          >
                            {spec}
                          </button>
                        ))}
                      </div>
                  )}
                </div>

                {/* Advanced Modes / Documents Submenu (FIXED Z-INDEX to ensure visibility) */}
                <div
                    className="relative group"
                >
                  <div onClick={toggleDocumentSubmenu} className="w-full px-4 py-3 hover:bg-white/5 cursor-pointer transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-light text-white">Documentos & AnÃ¡lisis</span>
                      </div>
                      <ArrowRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showDocumentSubmenu ? 'rotate-90' : 'rotate-0'}`} />
                    </div>
                  </div>
                   {/* Submenu Content: ANCHOR bottom-0 for upward deployment and Z-INDEX 999 for visibility */}
                  {showDocumentSubmenu && (
                      <div className="absolute left-full bottom-0 ml-1 w-56 floating-submenu z-[999] transition-all duration-300">
                        {/* Modos Avanzados visíbles aquí */}
                        <button onClick={() => handleSelectAdvancedMode('document_detective')} className="w-full text-left px-4 py-2 hover:bg-white/5 transition-all duration-300 text-sm text-gray-300 font-light">Document Detective</button>
                        <button onClick={() => handleSelectAdvancedMode('ai_detector')} className="w-full text-left px-4 py-2 hover:bg-white/5 transition-all duration-300 text-sm text-gray-300 font-light">AI Detector</button>
                        <button onClick={() => handleSelectAdvancedMode('text_humanizer')} className="w-full text-left px-4 py-2 hover:bg-white/5 transition-all duration-300 text-sm text-gray-300 font-light">Text Humanizer</button>
                        <button onClick={() => handleSelectAdvancedMode('travel_planner')} className="w-full text-left px-4 py-2 hover:bg-white/5 transition-all duration-300 text-sm text-gray-300 font-light">Travel Planner</button>
                        <button onClick={() => handleSelectAdvancedMode('brand_analyzer')} className="w-full text-left px-4 py-2 hover:bg-white/5 transition-all duration-300 text-sm text-gray-300 font-light">Brand Analyzer</button>
                        <button onClick={() => handleSelectAdvancedMode('plant_doctor')} className="w-full text-left px-4 py-2 hover:bg-white/5 transition-all duration-300 text-sm text-gray-300 font-light">Plant Doctor</button>
                        
                        <button onClick={() => handleSelectAdvancedMode('report')} className="w-full text-left px-4 py-2 hover:bg-white/5 transition-all duration-300 text-sm text-gray-300 font-light border-t border-white/10 mt-1 pt-2">
                          Generar Reporte {reportMode && <Check className="w-3 h-3 inline ml-1 text-green-400" />}
                        </button>
                      </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Textarea */}
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

          {/* Deep Search Toggle */}
          <button
            onClick={toggleDeepSearch}
            className="floating-icon-button p-1.5 md:p-2"
            title={deepThinkingMode ? 'Desactivar Deep Search' : 'Activar Deep Search'}
          >
            <Atom className={`w-4 h-4 md:w-5 md:h-5 transition-colors duration-300 ${deepThinkingMode ? 'text-white' : 'text-gray-400'}`} />
          </button>

          {/* Voice Button */}
          <button
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className="floating-icon-button p-1.5 md:p-2"
            title={isRecording ? 'Detener grabaciÃ³n' : 'Iniciar grabaciÃ³n de voz'}
          >
            {isRecording ? (
              <MicOff className="w-4 h-4 md:w-5 md:h-5 text-red-400 animate-pulse" />
            ) : (
              <Mic className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            )}
          </button>

          {/* Send Button */}
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
    </div>
  );
});

export default ChatInputBar;