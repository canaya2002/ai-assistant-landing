// lib/types.ts - ARCHIVO COMPLETO DE TIPOS ACTUALIZADO

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

// Tipos para Stripe
export interface StripeCheckoutData {
  plan: 'pro' | 'pro_max';
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface SubscriptionData {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  plan: 'pro' | 'pro_max';
  priceId: string;
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

// Tipos para configuración de planes
export interface PlanConfig {
  id: 'free' | 'pro' | 'pro_max';
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  limits: {
    dailyTokens: number;
    monthlyTokens: number;
    maxResponseTokens: number;
    analysesPerDay: number;
    analysesPerMonth: number;
  };
  features: {
    chat: boolean;
    voice: boolean;
    multimedia: boolean;
    code: boolean;
    pdf: boolean;
    liveMode: boolean;
    prioritySupport: boolean;
    apiAccess: boolean;
  };
  stripeProductId?: string;
  stripePriceIds: {
    monthly?: string;
    yearly?: string;
  };
}

export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Gratis',
    price: { monthly: 0, yearly: 0 },
    limits: {
      dailyTokens: 6600,
      monthlyTokens: 200000,
      maxResponseTokens: 150,
      analysesPerDay: 2,
      analysesPerMonth: 50
    },
    features: {
      chat: true,
      voice: false,
      multimedia: false,
      code: false,
      pdf: false,
      liveMode: false,
      prioritySupport: false,
      apiAccess: false
    },
    stripePriceIds: {}
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 15, yearly: 150 },
    limits: {
      dailyTokens: 333000,
      monthlyTokens: 10000000,
      maxResponseTokens: 500,
      analysesPerDay: 50,
      analysesPerMonth: 1500
    },
    features: {
      chat: true,
      voice: true,
      multimedia: true,
      code: true,
      pdf: true,
      liveMode: true,
      prioritySupport: true,
      apiAccess: false
    },
    stripePriceIds: {
      monthly: 'price_1S08CYPa2fV72c7wm3DC8M3y'
    }
  },
  pro_max: {
    id: 'pro_max',
    name: 'Pro Max',
    price: { monthly: 75, yearly: 750 },
    limits: {
      dailyTokens: 466000,
      monthlyTokens: -1, // Ilimitado
      maxResponseTokens: 1000,
      analysesPerDay: -1, // Ilimitado
      analysesPerMonth: -1 // Ilimitado
    },
    features: {
      chat: true,
      voice: true,
      multimedia: true,
      code: true,
      pdf: true,
      liveMode: true,
      prioritySupport: true,
      apiAccess: true
    },
    stripePriceIds: {
      monthly: 'price_1S12wKPa2fV72c7wX2NRAwQF'
    }
  }
};