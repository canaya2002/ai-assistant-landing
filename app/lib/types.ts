// app/lib/types.ts - COMPLETO CON BÚSQUEDA WEB MANUAL
export type PlanType = 'free' | 'pro' | 'pro_max';

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
  imageUrl?: string;
  imageId?: string;
  // CAMPOS EXISTENTES para modos especializados
  mode?: 'normal' | 'developer' | 'specialist';
  specialty?: SpecialtyType;
  specialtyName?: string;
  // ✅ NUEVOS CAMPOS PARA BÚSQUEDA WEB
  searchUsed?: boolean;
  searchResults?: SearchResults;
  limitReached?: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
  messageCount: number;
  isArchived: boolean;
  tags: string[];
  summary?: string;
  // CAMPOS EXISTENTES
  mode?: 'normal' | 'developer' | 'specialist';
  specialty?: SpecialtyType;
}

// USERPROFILE ACTUALIZADO MANTENIENDO COMPATIBILIDAD
export interface UserProfile {
  user: User;
  usage: {
    daily: {
      tokensUsed: number;
      tokensLimit: number;
      tokensRemaining: number;
      imagesGenerated: number;
      imagesLimit: number;
      videosGenerated: number;
      videosLimit: number;
      analysesCount: number;
      analysesLimit: number;
      analysesRemaining: number;
      chatMessagesCount: number;
      // CAMPOS EXISTENTES (opcionales para compatibilidad)
      developerModeUsed?: number;
      developerModeLimit?: number;
      developerModeRemaining?: number;
      specialistModeUsed?: number;
      specialistModeLimit?: number;
      specialistModeRemaining?: number;
    };
    monthly: {
      tokensUsed: number;
      tokensLimit: number;
      tokensRemaining: number;
      imagesGenerated: number;
      imagesLimit: number;
      videosGenerated: number;
      videosLimit: number;
      analysesCount: number;
      analysesLimit: number;
      analysesRemaining: number;
      chatMessagesCount: number;
      // CAMPOS EXISTENTES
      developerModeUsed?: number;
      developerModeLimit?: number;
      developerModeRemaining?: number;
      specialistModeUsed?: number;
      specialistModeLimit?: number;
      specialistModeRemaining?: number;
      // ✅ NUEVOS CAMPOS - BÚSQUEDAS WEB
      webSearchesUsed?: number;
      webSearchesLimit?: number;
      webSearchesRemaining?: number;
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
    imageGeneration?: boolean;
    videoGeneration?: boolean;
    maxVideoLength?: number;
    // CAMPOS EXISTENTES
    developerModeEnabled?: boolean;
    specialistModeEnabled?: boolean;
    developerModeDaily?: number;
    developerModeMonthly?: number;
    specialistModeDaily?: number;
    specialistModeMonthly?: number;
    maxTokensPerSpecialistResponse?: number;
    // ✅ NUEVOS LÍMITES - BÚSQUEDA WEB
    webSearchEnabled?: boolean;
    webSearchMonthly?: number;
    webSearchRemaining?: number;
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
      imageGeneration: boolean;
      videoGeneration: boolean;
      // CARACTERÍSTICAS EXISTENTES
      developerMode?: boolean;
      specialistMode?: boolean;
      unlimitedSpecialist?: boolean;
      priorityProcessing?: boolean;
      // ✅ NUEVA CARACTERÍSTICA
      webSearch?: boolean;
      webSearchLimit?: number;
    };
  };
  subscription?: SubscriptionData;
  preferences: {
    theme: 'dark' | 'light';
    notifications: boolean;
    autoSave: boolean;
  };
  createdAt: Date;
  lastLogin: Date;
  totalConversations: number;
}

export interface FileUpload {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  base64?: string;
}

// ========================================
// ✅ TIPOS PARA BÚSQUEDAS WEB
// ========================================
export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

export interface SearchResults {
  query: string;
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
}

export interface SearchWebInput {
  query: string;
  maxResults?: number;
}

export interface SearchWebOutput {
  success: boolean;
  query: string;
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  searchLimits?: {
    used: number;
    limit: number;
    remaining: number;
    canSearch: boolean;
  };
}

export interface WebSearchStatusOutput {
  plan: string;
  limits: {
    monthly: number;
    used: number;
    remaining: number;
  };
  canSearch: boolean;
  usagePercentage: number;
}

// ========================================
// TIPOS EXISTENTES PARA IMÁGENES - MANTENER
// ========================================
export interface GeneratedImage {
  id: string;
  userId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  prompt: string;
  style?: string;
  aspectRatio?: string;
  model: string;
  quality: string;
  createdAt: Date;
  cost: number;
  isFavorite?: boolean;
  tags?: string[];
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

// ========================================
// TIPOS EXISTENTES PARA VIDEOS - MANTENER
// ========================================
export interface GeneratedVideo {
  id: string;
  userId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  prompt: string;
  model: string;
  duration: number;
  aspectRatio: string;
  style: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: Date;
  cost: number;
  runwayTaskId?: string;
  isFavorite?: boolean;
  tags?: string[];
}

export interface VideoGenerationRequest {
  prompt: string;
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  style?: 'cinematic' | 'realistic' | 'artistic' | 'animation';
}

export interface VideoGenerationResponse {
  success: boolean;
  videoUrl?: string;
  videoId: string;
  taskId: string;
  cost: number;
  remainingDaily: number;
  remainingMonthly: number;
  estimatedTime: number;
  status: 'generating' | 'completed' | 'failed';
}

export interface VideoUsageStatus {
  plan: PlanType;
  limits: {
    daily: number;
    monthly: number;
    remainingDaily: number;
    remainingMonthly: number;
    maxDuration: number;
  };
  features: {
    model: string;
    aspectRatios: string[];
    maxPromptLength: number;
    costPerSecond: number;
  };
  history: GeneratedVideo[];
}

export interface VideoStyle {
  value: string;
  label: string;
  icon?: any;
}

export interface VideoAspectRatioOption {
  value: string;
  label: string;
  free: boolean;
}

export interface VideoGeneratorUIState {
  prompt: string;
  selectedStyle: string;
  selectedAspectRatio: string;
  selectedDuration: number;
  isGenerating: boolean;
  showAdvancedOptions: boolean;
  showHistory: boolean;
  selectedVideo: string | null;
  generatingVideos: string[];
}

// ========================================
// TIPOS EXISTENTES PARA CLOUD FUNCTIONS - ACTUALIZADOS
// ========================================
export interface ChatWithAIInput {
  message: string;
  fileContext?: string;
  chatHistory: ChatMessage[];
  maxTokens?: number;
  // ✅ NUEVO CAMPO PARA BÚSQUEDA MANUAL
  enableWebSearch?: boolean;
}

export interface ChatWithAIOutput {
  response: string;
  tokensUsed: number;
  // ✅ NUEVOS CAMPOS PARA BÚSQUEDA WEB
  searchUsed?: boolean;
  searchResults?: SearchResults;
  limitReached?: boolean;
  searchLimits?: {
    used: number;
    limit: number;
    remaining: number;
    canSearch: boolean;
  };
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
  generationTime?: number;
  limits?: {
    remainingQuota?: number;
    suggestedPlan?: PlanType;
    retryAfter?: number;
  };
}

export interface GetImageUsageStatusOutput {
  plan: PlanType;
  limits: {
    remainingMonthly: number;
    remainingDaily: number;
    monthlyLimit: number;
    dailyLimit: number;
  };
  features: {
    maxPromptLength: number;
    model: string;
    quality: string;
    aspectRatios: string[];
    costPerImage: number; 
  };
  history: GeneratedImage[];
  warningAt80Percent?: boolean;
  usagePercentage?: number;
}

export interface GenerateVideoInput {
  prompt: string;
  duration?: number;
  aspectRatio?: string;
  style?: string;
}

export interface GenerateVideoOutput {
  success: boolean;
  videoId: string;
  taskId: string;
  cost: number;
  remainingDaily: number;
  remainingMonthly: number;
  estimatedTime: number;
  status: string;
  videoUrl?: string;
}

export interface GetVideoUsageStatusOutput {
  plan: PlanType;
  limits: {
    daily: number;
    monthly: number;
    remainingDaily: number;
    remainingMonthly: number;
    maxDuration: number;
  };
  features: {
    model: string;
    aspectRatios: string[];
    maxPromptLength: number;
    costPerSecond: number;
  };
  history: GeneratedVideo[];
  warningAt80Percent?: boolean;
  usagePercentage?: number;
}

export interface CheckVideoStatusInput {
  taskId: string;
  videoId: string;
}

export interface CheckVideoStatusOutput {
  status: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  progress: number;
}

export interface CreateStripeCheckoutInput {
  plan: string;
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateStripeCheckoutOutput {
  success: boolean;
  url: string;
  sessionId?: string;
}

export interface ManageSubscriptionOutput {
  success: boolean;
  url: string;
}

// ========================================
// TIPOS EXISTENTES PARA MODOS ESPECIALIZADOS
// ========================================
export type SpecialtyType = 
  | 'business' 
  | 'science' 
  | 'education' 
  | 'health'
  | 'marketing'
  | 'finance' 
  | 'legal'
  | 'psychology'
  | 'engineering'
  | 'hr'
  | 'sales'
  | 'data';

export interface Specialty {
  name: string;
  icon: string;
  systemPrompt: string;
}

export interface SpecialistModeLimits {
  plan: PlanType;
  limits: {
    developerMode: {
      dailyLimit: number;
      monthlyLimit: number;
      dailyRemaining: number;
      monthlyRemaining: number;
    };
    specialistMode: {
      dailyLimit: number;
      monthlyLimit: number;
      dailyRemaining: number;
      monthlyRemaining: number;
    };
    maxTokensPerResponse: number;
  };
  usage: {
    developer: {
      daily: number;
      monthly: number;
    };
    specialist: {
      daily: number;
      monthly: number;
    };
  };
  availableSpecialties: Record<SpecialtyType, Specialty>;
  features: {
    codeGeneration: boolean;
    advancedAnalysis: boolean;
    priorityProcessing: boolean;
    unlimitedContextMemory: boolean;
  };
}

export interface DeveloperModeChatInput {
  message: string;
  chatHistory?: ChatMessage[];
  fileContext?: string;
}

export interface DeveloperModeChatOutput {
  response: string;
  tokensUsed: number;
  mode: 'developer';
  remainingDaily: number;
  remainingMonthly: number;
  specialty: 'programming';
}

export interface SpecialistModeChatInput {
  message: string;
  specialty: SpecialtyType;
  chatHistory?: ChatMessage[];
  fileContext?: string;
}

export interface SpecialistModeChatOutput {
  response: string;
  tokensUsed: number;
  mode: 'specialist';
  specialty: SpecialtyType;
  specialtyName: string;
  remainingDaily: number;
  remainingMonthly: number;
}

// ========================================
// TIPOS ADICIONALES
// ========================================
export interface SubscriptionData {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  plan: 'pro' | 'pro_max';
  priceId: string;
}

export interface ConversationMetadata {
  userId: string;
  conversationId: string;
  title: string;
  messageCount: number;
  lastActivity: Date;
  tags?: string[];
}

export interface ConversationMetadataInput {
  userId: string;
  conversationId: string;
  title: string;
  messageCount: number;
  lastActivity: string;
  tags?: string[];
}

export interface FirebaseError {
  code: string;
  message: string;
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
    timestamp: Date;
    version: string;
    requestId: string;
  };
}

// ========================================
// CONSTANTES EXISTENTES - MANTENER
// ========================================
export const VIDEO_STYLES = [
  { value: 'cinematic', label: 'Cinematográfico' },
  { value: 'realistic', label: 'Realista' },
  { value: 'artistic', label: 'Artístico' },
  { value: 'animation', label: 'Animación' }
] as const;

export const VIDEO_ASPECT_RATIOS = [
  { value: '16:9', label: 'Panorámico', free: true },
  { value: '9:16', label: 'Vertical', free: false },
  { value: '1:1', label: 'Cuadrado', free: false },
  { value: '4:3', label: 'Clásico', free: false },
  { value: '3:4', label: 'Retrato', free: false }
] as const;

export const IMAGE_STYLES = [
  { value: 'realistic', label: 'Realista' },
  { value: 'artistic', label: 'Artístico' },
  { value: 'digital_art', label: 'Arte Digital' },
  { value: 'illustration', label: 'Ilustración' },
  { value: 'photography', label: 'Fotografía' },
  { value: 'painting', label: 'Pintura' },
  { value: 'sketch', label: 'Boceto' },
  { value: 'cartoon', label: 'Caricatura' }
] as const;

export const ASPECT_RATIOS = [
  { value: '1:1', label: 'Cuadrado', free: true },
  { value: '16:9', label: 'Panorámico', free: true },
  { value: '9:16', label: 'Vertical', free: false },
  { value: '4:3', label: 'Clásico', free: false },
  { value: '3:4', label: 'Retrato', free: false },
  { value: '21:9', label: 'Ultra Panorámico', free: false },
  { value: '1:2', label: 'Banner Vertical', free: false },
  { value: '2:1', label: 'Banner Horizontal', free: false }
] as const;

export const VIDEO_PLAN_LIMITS = {
  free: {
    dailyVideos: 0,
    monthlyVideos: 0,
    maxDuration: 0,
    features: []
  },
  pro: {
    dailyVideos: 1,
    monthlyVideos: 20,
    maxDuration: 8,
    features: ['gen-4-turbo', 'basic_editing']
  },
  pro_max: {
    dailyVideos: 2,
    monthlyVideos: 30,
    maxDuration: 10,
    features: ['gen-4-turbo', 'advanced_editing', 'priority_queue']
  }
} as const;

export const PLAN_LIMITS = {
  free: {
    dailyTokens: 10000,
    monthlyTokens: 100000,
    dailyImages: 3,
    monthlyImages: 30,
    webSearchesPerMonth: 50, // ✅ NUEVO LÍMITE
    features: ['basic_chat', 'basic_images', 'limited_web_search']
  },
  pro: {
    dailyTokens: 100000,
    monthlyTokens: 1000000,
    dailyImages: 25,
    monthlyImages: 500,
    webSearchesPerMonth: 500, // ✅ NUEVO LÍMITE
    features: ['advanced_chat', 'premium_images', 'file_upload', 'conversation_export', 'web_search']
  },
  pro_max: {
    dailyTokens: -1,
    monthlyTokens: -1,
    dailyImages: 100,
    monthlyImages: 2000,
    webSearchesPerMonth: 2000, // ✅ NUEVO LÍMITE
    features: ['unlimited_chat', 'premium_images', 'priority_support', 'advanced_features', 'unlimited_web_search']
  }
} as const;

// CONSTANTES EXISTENTES PARA MODOS ESPECIALIZADOS
export const SPECIALIST_MODES = [
  { 
    id: 'business', 
    name: 'Negocios', 
    icon: '📊', 
    color: 'green', 
    description: 'Estrategia empresarial y análisis de mercado',
    features: ['Análisis FODA', 'Plan de negocios', 'ROI', 'KPIs'],
    systemPrompt: 'Eres un experto consultor de negocios especializado en estrategia empresarial, análisis de mercado, y optimización de procesos.'
  },
  { 
    id: 'science', 
    name: 'Ciencias', 
    icon: '🔬', 
    color: 'purple', 
    description: 'Investigación científica y análisis técnico',
    features: ['Metodología', 'Estadística', 'Papers', 'Hipótesis'],
    systemPrompt: 'Eres un científico experto con conocimientos profundos en investigación, metodología científica y análisis de datos.'
  },
  { 
    id: 'education', 
    name: 'Educación', 
    icon: '📚', 
    color: 'yellow', 
    description: 'Pedagogía y métodos de enseñanza',
    features: ['Pedagogía', 'Currículo', 'Evaluación', 'Didáctica'],
    systemPrompt: 'Eres un pedagogo experto especializado en diseño curricular, métodos de enseñanza y psicología educativa.'
  },
  { 
    id: 'health', 
    name: 'Salud', 
    icon: '⚕️', 
    color: 'red', 
    description: 'Medicina preventiva y bienestar',
    features: ['Prevención', 'Nutrición', 'Ejercicio', 'Wellness'],
    systemPrompt: 'Eres un profesional de la salud especializado en medicina preventiva, nutrición y bienestar general.'
  },
  { 
    id: 'marketing', 
    name: 'Marketing', 
    icon: '📢', 
    color: 'orange', 
    description: 'Publicidad digital y estrategias de marca',
    features: ['SEO/SEM', 'Social Media', 'Branding', 'Analytics'],
    systemPrompt: 'Eres un experto en marketing digital, branding, publicidad y estrategias de crecimiento empresarial.'
  },
  { 
    id: 'finance', 
    name: 'Finanzas', 
    icon: '💰', 
    color: 'emerald', 
    description: 'Inversiones y planificación financiera',
    features: ['Inversiones', 'Riesgo', 'Análisis', 'Portafolio'],
    systemPrompt: 'Eres un analista financiero experto en inversiones, planificación financiera, análisis de riesgo y mercados.'
  },
  { 
    id: 'legal', 
    name: 'Legal', 
    icon: '⚖️', 
    color: 'indigo', 
    description: 'Asesoría jurídica y cumplimiento',
    features: ['Contratos', 'Compliance', 'Regulación', 'Derecho'],
    systemPrompt: 'Eres un asesor legal especializado en derecho corporativo, contratos, compliance y regulaciones.'
  },
  { 
    id: 'psychology', 
    name: 'Psicología', 
    icon: '🧠', 
    color: 'pink', 
    description: 'Coaching y desarrollo personal',
    features: ['Coaching', 'Mindset', 'Emocional', 'Liderazgo'],
    systemPrompt: 'Eres un psicólogo y coach experto en desarrollo personal, inteligencia emocional y técnicas de coaching.'
  },
  { 
    id: 'engineering', 
    name: 'Ingeniería', 
    icon: '⚙️', 
    color: 'slate', 
    description: 'Sistemas técnicos y arquitectura',
    features: ['Arquitectura', 'Sistemas', 'DevOps', 'Cloud'],
    systemPrompt: 'Eres un ingeniero experto en arquitectura de sistemas, tecnología, automatización y soluciones técnicas.'
  },
  { 
    id: 'hr', 
    name: 'Recursos Humanos', 
    icon: '👥', 
    color: 'teal', 
    description: 'Gestión de talento y cultura organizacional',
    features: ['Reclutamiento', 'Cultura', 'Performance', 'Talento'],
    systemPrompt: 'Eres un especialista en recursos humanos, reclutamiento, desarrollo de talento y cultura organizacional.'
  },
  { 
    id: 'sales', 
    name: 'Ventas', 
    icon: '🎯', 
    color: 'rose', 
    description: 'Estrategias de ventas y CRM',
    features: ['Negociación', 'CRM', 'Pipeline', 'Cierre'],
    systemPrompt: 'Eres un experto en ventas, negociación, gestión de clientes y técnicas de cierre.'
  },
  { 
    id: 'data', 
    name: 'Análisis de Datos', 
    icon: '📈', 
    color: 'violet', 
    description: 'Big Data y Business Intelligence',
    features: ['Big Data', 'BI', 'ML', 'Estadística'],
    systemPrompt: 'Eres un científico de datos experto en análisis estadístico, machine learning y business intelligence.'
  }
];

export const SPECIALIST_PLAN_LIMITS = {
  free: {
    developerMode: { daily: 1, monthly: 5 },
    specialistMode: { daily: 1, monthly: 3 },
    maxTokensPerResponse: 1500,
    features: ['basic_analysis']
  },
  pro: {
    developerMode: { daily: 15, monthly: 200 },
    specialistMode: { daily: 10, monthly: 150 },
    maxTokensPerResponse: 6000,
    features: ['advanced_analysis', 'code_generation', 'file_context']
  },
  pro_max: {
    developerMode: { daily: -1, monthly: -1 },
    specialistMode: { daily: -1, monthly: -1 },
    maxTokensPerResponse: 12000,
    features: ['unlimited_analysis', 'priority_processing', 'unlimited_context']
  }
} as const;