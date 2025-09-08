// lib/types.ts - ARCHIVO COMPLETO DE TIPOS ACTUALIZADO Y CORREGIDO

export interface User {
  uid: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'pro_max';
  isPremium: boolean;
  isPro: boolean;
  isProMax: boolean;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';
  lastTokenReset?: Date;
}

export interface Usage {
  daily: {
    tokensUsed: number;
    tokensLimit: number;
    tokensRemaining: number;
    analysesCount: number;
    analysesLimit: number;
    analysesRemaining: number;
    chatMessagesCount: number;
    lastResetDate?: string; // Para tracking del reset diario
  };
  monthly: {
    tokensUsed: number;
    tokensLimit: number;
    tokensRemaining: number;
    analysesCount: number;
    analysesLimit: number;
    analysesRemaining: number;
    chatMessagesCount: number;
    lastResetDate?: string; // Para tracking del reset mensual
  };
}

export interface UserProfile {
  user: User;
  usage: Usage;
  limits: {
    dailyTokens: number;
    monthlyTokens: number;
    dailyAnalyses: number;
    monthlyAnalyses: number;
    chatEnabled: boolean;
    voiceEnabled: boolean;
    multimediaEnabled: boolean;
    codeEnabled: boolean;
    pdfEnabled: boolean;
    maxResponseTokens: number; // Nuevo límite para optimizar respuestas
  };
  planInfo: {
    currentPlan: string;
    displayName: string;
    availableFeatures: {
      chat: boolean;
      voice: boolean;
      multimedia: boolean;
      code: boolean;
      pdf: boolean;
      liveMode: boolean;
    };
    billingInfo?: {
      nextBillingDate?: Date;
      subscriptionStatus?: string;
      cancelAtPeriodEnd?: boolean;
    };
  };
  preferences?: {
    theme?: 'dark' | 'light';
    language?: 'es' | 'en';
    notifications?: boolean;
    autoSaveConversations?: boolean;
  };
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
  tokensUsed?: number;
  conversationId?: string; // Para agrupación de conversaciones
  metadata?: {
    model?: string;
    responseTime?: number;
    regenerated?: boolean;
  };
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isArchived?: boolean;
  tags?: string[];
  summary?: string; // Resumen automático para conversaciones largas
}

// Metadatos para Firebase (mínimo)
export interface ConversationMetadata {
  userId: string;
  conversationId: string;
  title: string;
  messageCount: number;
  lastActivity: Date;
  tags?: string[];
}

export interface FirebaseError {
  code: string;
  message: string;
}

// ✅ TIPOS PARA STRIPE CORREGIDOS Y COMPLETOS
export interface StripeCheckoutData {
  plan: 'pro' | 'pro_max';
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface StripeCheckoutInput {
  plan: string;
  priceId: string;
}

export interface StripeCheckoutOutput {
  url: string;
}

export interface ManageSubscriptionOutput {
  url: string;
}

export interface SubscriptionData {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  plan: 'pro' | 'pro_max';
  priceId: string;
}

// ✅ TIPOS PARA RESPUESTAS DE CLOUD FUNCTIONS
export interface CloudFunctionResponse<T> {
  data: T;
}

// Tipos para respuestas optimizadas de AI
export interface OptimizedChatRequest {
  message: string;
  fileContext?: string;
  chatHistory: ChatMessage[];
  maxTokens?: number;
  model?: 'gemini-flash' | 'gemini-pro' | 'gemini-pro-max';
  temperature?: number;
  systemPrompt?: string;
}

export interface OptimizedChatResponse {
  response: string;
  tokensUsed: number;
  model: string;
  responseTime: number;
  finishReason: 'stop' | 'length' | 'safety';
}

// ✅ TIPOS PARA CHAT CON AI
export interface ChatWithAIInput {
  message: string;
  fileContext?: string;
  chatHistory: ChatMessage[];
  maxTokens?: number;
}

export interface ChatWithAIOutput {
  response: string;
  tokensUsed: number;
}

// Tipos para configuración del usuario
export interface UserSettings {
  notifications: {
    email: boolean;
    browser: boolean;
    tokenWarnings: boolean;
    billingAlerts: boolean;
  };
  privacy: {
    saveConversations: boolean;
    allowAnalytics: boolean;
    shareUsageData: boolean;
  };
  interface: {
    theme: 'dark' | 'light' | 'auto';
    language: 'es' | 'en';
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
  };
}

// Tipos para analytics y métricas (sin datos personales)
export interface UsageMetrics {
  totalTokensUsed: number;
  totalMessages: number;
  averageResponseTime: number;
  mostUsedFeatures: string[];
  dailyUsagePattern: number[];
  planUtilization: number; // Porcentaje de límites utilizados
}

// Tipos para el sistema de límites dinámicos
export interface DynamicLimits {
  baseTokens: number;
  bonusTokens: number; // Para usuarios leales, etc.
  temporaryBoost: number; // Boost temporal por promociones
  penaltyReduction: number; // Reducción por abuso
  effectiveLimit: number; // Límite final después de todos los ajustes
}

// Tipos para webhooks de Stripe
export interface StripeWebhookEvent {
  type: string;
  data: {
    object: any;
  };
  created: number;
  id: string;
}

// Tipos para manejo de errores mejorado
export interface APIError extends Error {
  code: string;
  status?: number;
  details?: any;
  retryable?: boolean;
}

// ✅ TIPOS PARA CONVERSACIONES MEJORADOS
export interface ConversationStats {
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  oldestConversation: Date | null;
  newestConversation: Date | null;
}

export interface BackupSettings {
  autoBackup: boolean;
  backupInterval: number; // días
  lastBackup: Date | null;
  googleDriveEnabled: boolean;
}

// ✅ TIPOS PARA METADATOS DE CONVERSACIÓN
export interface ConversationMetadataInput {
  userId: string;
  conversationId: string;
  title: string;
  messageCount: number;
  lastActivity: string; // ISO string
  tags?: string[];
}

// ✅ TIPOS PARA COMPONENTES
export interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ConversationListProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

// ✅ TIPOS PARA AUTH CONTEXT
export interface AuthContextType {
  user: any | null; // Firebase User
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isPremium: boolean;
  isPro: boolean;
  isProMax: boolean;
  plan: string;
  usage: UserProfile['usage'] | null;
  limits: UserProfile['limits'] | null;
  planInfo: UserProfile['planInfo'] | null;
}

// ✅ TIPOS PARA CONVERSATION CONTEXT
export interface ConversationContextType {
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
  getUsageStats: () => ConversationStats;
}

// ✅ TIPOS PARA VALIDACIÓN
export interface ValidationResult {
  isValid: boolean;
  message: string;
}

// ✅ TIPOS PARA RESPUESTAS DE API
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// ✅ CONSTANTES DE TIPOS
export const USER_PLANS = ['free', 'pro', 'pro_max'] as const;
export type UserPlan = typeof USER_PLANS[number];

export const MESSAGE_TYPES = ['user', 'ai'] as const;
export type MessageType = typeof MESSAGE_TYPES[number];

export const THEME_OPTIONS = ['dark', 'light', 'auto'] as const;
export type ThemeOption = typeof THEME_OPTIONS[number];

export const LANGUAGE_OPTIONS = ['es', 'en'] as const;
export type LanguageOption = typeof LANGUAGE_OPTIONS[number];