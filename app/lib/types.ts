// lib/types.ts - ARCHIVO COMPLETO DE TIPOS

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
  };
  monthly: {
    tokensUsed: number;
    tokensLimit: number;
    tokensRemaining: number;
    analysesCount: number;
    analysesLimit: number;
    analysesRemaining: number;
    chatMessagesCount: number;
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
  };
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
  tokensUsed?: number;
}

export interface FirebaseError {
  code: string;
  message: string;
}