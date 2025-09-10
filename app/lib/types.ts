// lib/types.ts - ERRORES COMPLETAMENTE CORREGIDOS
// Tipos base existentes
export type PlanType = 'free' | 'pro' | 'pro_max';

// Función de validación para PlanType
export function isValidPlan(plan: any): plan is PlanType {
  return plan === 'free' || plan === 'pro' || plan === 'pro_max';
}

export interface User {
  uid: string;
  email: string;
  name: string;
  plan: PlanType;
  isPremium: boolean;
  isPro: boolean;
  isProMax: boolean;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
  tokensUsed?: number;
  conversationId: string;
  imageUrl?: string; // Para mensajes con imágenes generadas
  imageId?: string;  // ID de imagen generada
}

export interface UserProfile {
  user: User;
  usage: {
    daily: {
      tokensUsed: number;
      tokensLimit: number;
      tokensRemaining: number;
      analysesCount: number;
      analysesLimit: number;
      analysesRemaining: number;
      chatMessagesCount: number; // ✅ AÑADIDO PARA CORREGIR ERROR
    };
    monthly: {
      tokensUsed: number;
      tokensLimit: number;
      tokensRemaining: number;
      analysesCount: number;
      analysesLimit: number;
      analysesRemaining: number;
      chatMessagesCount: number; // ✅ AÑADIDO PARA CORREGIR ERROR
    };
  };
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
    maxResponseTokens: number;
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
      imageGeneration: boolean; // ✨ Nuevo
    };
  };
}

// ✅ CONVERSACIÓN CORREGIDA CON PROPIEDADES FALTANTES
export interface Conversation {
  id: string;
  userId: string; // ✅ AÑADIDO PARA CORREGIR ERROR
  title: string;
  createdAt: Date;
  lastActivity: Date;
  updatedAt: Date; // ✅ AÑADIDO PARA CORREGIR ERROR
  messageCount: number;
  messages: ChatMessage[];
  isArchived?: boolean;
  tags?: string[];
  summary?: string;
}

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

// 🎨 NUEVOS TIPOS PARA GENERACIÓN DE IMÁGENES

export interface ImageGenerationRequest {
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '21:9' | '1:2' | '2:1';
  style?: 'realistic' | 'artistic' | 'digital_art' | 'illustration' | 'photography' | 'painting' | 'sketch' | 'cartoon';
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl: string;
  imageId: string;
  cost: number;
  remainingDaily: number;
  remainingMonthly: number;
  model: string;
  quality: string;
  generationTime?: number;
  limits?: {
    remainingQuota?: number;
    suggestedPlan?: PlanType;
    retryAfter?: number;
  };
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    requestId: string;
    timestamp: number;
    processingTime: number;
  };
}

export interface GeneratedImage {
  id: string;
  userId: string;
  prompt: string;
  imageUrl: string;
  aspectRatio: string;
  style: string;
  plan: PlanType;
  model: string;
  cost: number;
  timestamp: Date;
  metadata: {
    quality: string;
    generationTime: number;
  };
}

export interface ImageUsageStatus {
  plan: PlanType;
  limits: {
    daily: number;
    monthly: number;
    remainingDaily: number;
    remainingMonthly: number;
  };
  features: {
    model: string;
    quality: string;
    aspectRatios: string[];
    maxPromptLength: number;
    costPerImage: number;
  };
  history: GeneratedImage[];
}

export interface ImageModelConfig {
  model: string;
  dailyLimit: number;
  monthlyLimit: number;
  costPerImage: number;
  maxPromptLength: number;
  aspectRatios: string[];
  quality: 'standard' | 'high' | 'ultra';
}

// Configuración de modelos por plan
export const IMAGE_MODELS_CONFIG: Record<PlanType, ImageModelConfig> = {
  free: {
    model: 'gemini-2.5-flash-image-preview',
    dailyLimit: 3,
    monthlyLimit: 90,
    costPerImage: 0.039,
    maxPromptLength: 100,
    aspectRatios: ['1:1'],
    quality: 'standard'
  },
  pro: {
    model: 'gemini-2.5-flash-image-preview',
    dailyLimit: 50,
    monthlyLimit: 1500,
    costPerImage: 0.03,
    maxPromptLength: 500,
    aspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
    quality: 'high'
  },
  pro_max: {
    model: 'gemini-2.5-flash-image-preview',
    dailyLimit: 200,
    monthlyLimit: 6000,
    costPerImage: 0.025,
    maxPromptLength: 1000,
    aspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9', '1:2', '2:1'],
    quality: 'ultra'
  }
};

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

// Tipos para Cloud Functions
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

export interface GenerateImageInput {
  prompt: string;
  aspectRatio?: string;
  style?: string;
}

export interface GenerateImageOutput {
  success: boolean;
  imageUrl: string;
  imageId: string;
  cost: number;
  remainingDaily: number;
  remainingMonthly: number;
  model: string;
  quality: string;
}

export interface GetImageUsageStatusOutput {
  plan: PlanType;
  limits: {
    daily: number;
    monthly: number;
    remainingDaily: number;
    remainingMonthly: number;
  };
  features: {
    model: string;
    quality: string;
    aspectRatios: string[];
    maxPromptLength: number;
    costPerImage: number;
  };
  history: GeneratedImage[];
}

export interface CreateStripeCheckoutInput {
  plan: string;
  priceId: string;
}

export interface CreateStripeCheckoutOutput {
  url: string;
}

export interface ManageSubscriptionOutput {
  url: string;
}

export interface ConversationMetadataInput {
  userId: string;
  conversationId: string;
  title: string;
  messageCount: number;
  lastActivity: string;
  tags?: string[];
}

// 🎨 TIPOS PARA INTERFAZ DE USUARIO

export interface ImageStyle {
  value: string;
  label: string;
  icon?: any;
}

export interface AspectRatioOption {
  value: string;
  label: string;
  free: boolean;
}

export interface ImageGeneratorUIState {
  prompt: string;
  selectedStyle: string;
  selectedAspectRatio: string;
  isGenerating: boolean;
  showAdvancedOptions: boolean;
  showHistory: boolean;
  selectedImage: string | null;
}

export interface ImageGalleryItem {
  id: string;
  imageUrl: string;
  thumbnail?: string;
  prompt: string;
  createdAt: Date;
  style: string;
  aspectRatio: string;
  favorite?: boolean;
  tags?: string[];
}