// app/lib/userPreferencesService.ts - SERVICIO DE PREFERENCIAS DEL USUARIO

import { cloudFunctions } from './firebase';

export interface UserPreferences {
  responseStyle: 'conversational' | 'concise' | 'detailed' | 'balanced';
  detailLevel: 'low' | 'medium' | 'high';
  codeLanguagePreferences: string[];
  theme: 'dark' | 'light';
  language: 'es' | 'en';
  enableWebSearch: boolean;
  enableDeepThinking: boolean;
  notificationPreferences: {
    newFeatures: boolean;
    updates: boolean;
    tips: boolean;
  };
}

export interface ActiveProject {
  name: string;
  type: string;
  description: string;
  tags: string[];
  createdAt: any;
  lastAccessed: any;
}

export interface FrequentCommand {
  command: string;
  category: string;
  count: number;
  firstUsed: any;
  lastUsed: any;
}

export interface LastSession {
  conversationId: string;
  lastMessage: string;
  context: string;
  timestamp: any;
}

export interface UserPreferencesData {
  preferences: UserPreferences;
  activeProjects: ActiveProject[];
  frequentCommands: FrequentCommand[];
  lastSession: LastSession | null;
}

class UserPreferencesService {
  private preferencesCache: UserPreferencesData | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  // ========================================
  // OBTENER PREFERENCIAS
  // ========================================
  async getPreferences(): Promise<UserPreferencesData> {
    try {
      // Verificar cache
      const now = Date.now();
      if (this.preferencesCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
        return this.preferencesCache;
      }

      const response = await cloudFunctions.getUserPreferences();
      this.preferencesCache = response.data as UserPreferencesData;
      this.cacheTimestamp = now;
      
      return response.data as UserPreferencesData;
    } catch (error) {
      console.error('Error obteniendo preferencias:', error);
      
      // Devolver preferencias por defecto en caso de error
      return {
        preferences: {
          responseStyle: 'balanced',
          detailLevel: 'medium',
          codeLanguagePreferences: [],
          theme: 'dark',
          language: 'es',
          enableWebSearch: true,
          enableDeepThinking: false,
          notificationPreferences: {
            newFeatures: true,
            updates: true,
            tips: true
          }
        },
        activeProjects: [],
        frequentCommands: [],
        lastSession: null
      };
    }
  }

  // ========================================
  // GUARDAR PREFERENCIAS
  // ========================================
  async savePreferences(preferences: Partial<UserPreferences>): Promise<void> {
    try {
      await cloudFunctions.saveUserPreferences({ preferences });
      
      // Actualizar cache
      if (this.preferencesCache) {
        this.preferencesCache.preferences = {
          ...this.preferencesCache.preferences,
          ...preferences
        };
      }
      
      // Invalidar cache para forzar recarga
      this.cacheTimestamp = 0;
    } catch (error) {
      console.error('Error guardando preferencias:', error);
      throw error;
    }
  }

  // ========================================
  // ACTUALIZAR ÚLTIMA SESIÓN
  // ========================================
  async updateLastSession(conversationId: string, lastMessage: string, context: string): Promise<void> {
    try {
      await cloudFunctions.updateLastSession({
        conversationId,
        lastMessage,
        context
      });
      
      // Actualizar cache
      if (this.preferencesCache) {
        this.preferencesCache.lastSession = {
          conversationId,
          lastMessage,
          context,
          timestamp: new Date()
        };
      }
    } catch (error) {
      console.error('Error actualizando última sesión:', error);
      // No lanzar error, esto es opcional
    }
  }

  // ========================================
  // GUARDAR PROYECTO ACTIVO
  // ========================================
  async saveActiveProject(
    projectName: string, 
    projectType: string, 
    description: string, 
    tags: string[]
  ): Promise<ActiveProject[]> {
    try {
      const response = await cloudFunctions.saveActiveProject({
        projectName,
        projectType,
        description,
        tags
      });
      
      // Actualizar cache
      if (this.preferencesCache) {
        this.preferencesCache.activeProjects = response.data.projects as ActiveProject[];
      }
      
      return response.data.projects as ActiveProject[];
    } catch (error) {
      console.error('Error guardando proyecto:', error);
      throw error;
    }
  }

  // ========================================
  // ELIMINAR PROYECTO ACTIVO
  // ========================================
  async removeActiveProject(projectName: string): Promise<ActiveProject[]> {
    try {
      const response = await cloudFunctions.removeActiveProject({ projectName });
      
      // Actualizar cache
      if (this.preferencesCache) {
        this.preferencesCache.activeProjects = response.data.projects as ActiveProject[];
      }
      
      return response.data.projects as ActiveProject[];
    } catch (error) {
      console.error('Error eliminando proyecto:', error);
      throw error;
    }
  }

  // ========================================
  // REGISTRAR COMANDO FRECUENTE
  // ========================================
  async recordFrequentCommand(command: string, category: string = 'general'): Promise<void> {
    try {
      const response = await cloudFunctions.recordFrequentCommand({
        command,
        category
      });
      
      // Actualizar cache
      if (this.preferencesCache) {
        this.preferencesCache.frequentCommands = response.data.commands as FrequentCommand[];
      }
    } catch (error) {
      console.error('Error registrando comando frecuente:', error);
      // No lanzar error, esto es opcional
    }
  }

  // ========================================
  // OBTENER COMANDOS FRECUENTES
  // ========================================
  async getFrequentCommands(limit: number = 20): Promise<FrequentCommand[]> {
    try {
      const response = await cloudFunctions.getFrequentCommands({ limit });
      return response.data.commands as FrequentCommand[];
    } catch (error) {
      console.error('Error obteniendo comandos frecuentes:', error);
      return [];
    }
  }

  // ========================================
  // LIMPIAR CACHE
  // ========================================
  clearCache(): void {
    this.preferencesCache = null;
    this.cacheTimestamp = 0;
  }
}

// Exportar instancia singleton
export const userPreferencesService = new UserPreferencesService();