'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { auth, cloudFunctions } from '../lib/firebase';
import { 
  User, 
  UserProfile, 
  PlanType 
} from '../lib/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  plan: PlanType;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const plan: PlanType = userProfile?.user?.plan || 'free';

  // Función auxiliar para obtener límites de especialista
  const safeGetSpecialistLimits = async (uid: string, plan: string) => {
    try {
      const response = await cloudFunctions.getSpecialistModeLimits();
      return response.data;
    } catch (error) {
      console.error('⚠️ Error obteniendo límites de especialista, usando valores por defecto:', error);
      // RETORNAR LÍMITES POR DEFECTO BASADOS EN EL PLAN
      return {
        limits: {
          developerMode: {
            daily: { 
              limit: plan === 'free' ? 1 : plan === 'pro' ? 15 : -1, 
              used: 0, 
              remaining: plan === 'free' ? 1 : plan === 'pro' ? 15 : -1 
            },
            monthly: { 
              limit: plan === 'free' ? 5 : plan === 'pro' ? 200 : -1, 
              used: 0, 
              remaining: plan === 'free' ? 5 : plan === 'pro' ? 200 : -1 
            }
          },
          specialistMode: {
            daily: { 
              limit: plan === 'free' ? 1 : plan === 'pro' ? 10 : -1, 
              used: 0, 
              remaining: plan === 'free' ? 1 : plan === 'pro' ? 10 : -1 
            },
            monthly: { 
              limit: plan === 'free' ? 3 : plan === 'pro' ? 150 : -1, 
              used: 0, 
              remaining: plan === 'free' ? 3 : plan === 'pro' ? 150 : -1 
            }
          }
        },
        specialties: {},
        maxTokensPerResponse: plan === 'free' ? 1500 : plan === 'pro' ? 6000 : 12000
      };
    }
  };

  // Función para obtener perfil del usuario
  const fetchUserProfile = async (firebaseUser: FirebaseUser): Promise<UserProfile | null> => {
    try {
      const response = await cloudFunctions.getUserProfile();
      const profile = response.data;
      
      // Crear objeto base de availableFeatures para evitar undefined
      const baseAvailableFeatures = {
        chat: true,
        voice: false,
        multimedia: false,
        code: false,
        pdf: false,
        liveMode: false,
        imageGeneration: false,
        videoGeneration: false,
        developerMode: true,
        specialistMode: true,
        unlimitedSpecialist: false,
        priorityProcessing: false,
        webSearch: false,
        webSearchLimit: 0,
      };

      // Verificar que availableFeatures existe antes de usarlo
      const existingFeatures = profile.planInfo?.availableFeatures || {};

      // Asegurar que el perfil tenga todas las propiedades requeridas
      const completeProfile: UserProfile = {
        user: profile.user,
        usage: {
          daily: {
            ...profile.usage.daily,
            // Agregar campos opcionales con valores por defecto
            developerModeUsed: profile.usage.daily.developerModeUsed || 0,
            developerModeLimit: profile.usage.daily.developerModeLimit || 0,
            developerModeRemaining: profile.usage.daily.developerModeRemaining || 0,
            specialistModeUsed: profile.usage.daily.specialistModeUsed || 0,
            specialistModeLimit: profile.usage.daily.specialistModeLimit || 0,
            specialistModeRemaining: profile.usage.daily.specialistModeRemaining || 0,
          },
          monthly: {
            ...profile.usage.monthly,
            // Agregar campos opcionales con valores por defecto
            developerModeUsed: profile.usage.monthly.developerModeUsed || 0,
            developerModeLimit: profile.usage.monthly.developerModeLimit || 0,
            developerModeRemaining: profile.usage.monthly.developerModeRemaining || 0,
            specialistModeUsed: profile.usage.monthly.specialistModeUsed || 0,
            specialistModeLimit: profile.usage.monthly.specialistModeLimit || 0,
            specialistModeRemaining: profile.usage.monthly.specialistModeRemaining || 0,
          }
        },
        limits: {
          ...profile.limits,
          // Agregar campos opcionales con valores por defecto
          developerModeEnabled: profile.limits?.developerModeEnabled !== undefined ? profile.limits.developerModeEnabled : true,
          specialistModeEnabled: profile.limits?.specialistModeEnabled !== undefined ? profile.limits.specialistModeEnabled : true,
          developerModeDaily: profile.limits?.developerModeDaily || (plan === 'free' ? 1 : plan === 'pro' ? 15 : -1),
          developerModeMonthly: profile.limits?.developerModeMonthly || (plan === 'free' ? 5 : plan === 'pro' ? 200 : -1),
          specialistModeDaily: profile.limits?.specialistModeDaily || (plan === 'free' ? 1 : plan === 'pro' ? 10 : -1),
          specialistModeMonthly: profile.limits?.specialistModeMonthly || (plan === 'free' ? 3 : plan === 'pro' ? 150 : -1),
          maxTokensPerSpecialistResponse: profile.limits?.maxTokensPerSpecialistResponse || (plan === 'free' ? 1500 : plan === 'pro' ? 6000 : 12000),
        },
        planInfo: {
          ...profile.planInfo,
          availableFeatures: {
            ...baseAvailableFeatures, // Usar objeto base como fallback
            ...existingFeatures, // Solo aplicar spread si existe
            // Agregar nuevas características opcionales con verificación segura
            developerMode: existingFeatures.developerMode !== undefined ? existingFeatures.developerMode : true,
            specialistMode: existingFeatures.specialistMode !== undefined ? existingFeatures.specialistMode : true,
            unlimitedSpecialist: existingFeatures.unlimitedSpecialist !== undefined ? existingFeatures.unlimitedSpecialist : plan === 'pro_max',
            priorityProcessing: existingFeatures.priorityProcessing !== undefined ? existingFeatures.priorityProcessing : plan === 'pro_max',
            webSearch: existingFeatures.webSearch !== undefined ? existingFeatures.webSearch : plan !== 'free',
          }
        },
        subscription: profile.subscription,
        preferences: profile.preferences,
        createdAt: profile.createdAt,
        lastLogin: profile.lastLogin,
        totalConversations: profile.totalConversations
      };

      return completeProfile;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      
      // Crear perfil por defecto si hay error
      const defaultProfile: UserProfile = {
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          plan: 'free',
          isPremium: false,
          isPro: false,
          isProMax: false
        },
        usage: {
          daily: {
            tokensUsed: 0,
            tokensLimit: 10000,
            tokensRemaining: 10000,
            imagesGenerated: 0,
            imagesLimit: 0,
            videosGenerated: 0,
            videosLimit: 0,
            analysesCount: 0,
            analysesLimit: 5,
            analysesRemaining: 5,
            chatMessagesCount: 0,
            developerModeUsed: 0,
            developerModeLimit: 1,
            developerModeRemaining: 1,
            specialistModeUsed: 0,
            specialistModeLimit: 1,
            specialistModeRemaining: 1,
          },
          monthly: {
            tokensUsed: 0,
            tokensLimit: 50000,
            tokensRemaining: 50000,
            imagesGenerated: 0,
            imagesLimit: 0,
            videosGenerated: 0,
            videosLimit: 0,
            analysesCount: 0,
            analysesLimit: 20,
            analysesRemaining: 20,
            chatMessagesCount: 0,
            developerModeUsed: 0,
            developerModeLimit: 5,
            developerModeRemaining: 5,
            specialistModeUsed: 0,
            specialistModeLimit: 3,
            specialistModeRemaining: 3,
          }
        },
        limits: {
          dailyTokens: 10000,
          monthlyTokens: 50000,
          dailyAnalyses: 5,
          monthlyAnalyses: 20,
          chatEnabled: true,
          voiceEnabled: false,
          multimediaEnabled: false,
          codeEnabled: false,
          pdfEnabled: false,
          maxResponseTokens: 1000,
          imageGeneration: false,
          videoGeneration: false,
          maxVideoLength: 0,
          developerModeEnabled: true,
          specialistModeEnabled: true,
          developerModeDaily: 1,
          developerModeMonthly: 5,
          specialistModeDaily: 1,
          specialistModeMonthly: 3,
          maxTokensPerSpecialistResponse: 1500,
        },
        planInfo: {
          currentPlan: 'free',
          displayName: 'Gratis',
          availableFeatures: {
            chat: true,
            voice: false,
            multimedia: false,
            code: false,
            pdf: false,
            liveMode: false,
            imageGeneration: false,
            videoGeneration: false,
            developerMode: true,
            specialistMode: true,
            unlimitedSpecialist: false,
            priorityProcessing: false,
            webSearch: false,
          }
        },
        subscription: undefined,
        preferences: {
          theme: 'dark',
          notifications: true,
          autoSave: true
        },
        createdAt: new Date(),
        lastLogin: new Date(),
        totalConversations: 0
      };

      return defaultProfile;
    }
  };

  // Función para refrescar perfil
  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user);
      setUserProfile(profile);
    }
  };

  // Función para cerrar sesión
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  // Efecto para manejar cambios en autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          const profile = await fetchUserProfile(firebaseUser);
          setUserProfile(profile);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error en AuthProvider:', error);
        // SI HAY ERROR TOTAL, AL MENOS MANTENER EL USUARIO
        if (firebaseUser) {
          setUser(firebaseUser);
          // CREAR PERFIL MÍNIMO EN CASO DE ERROR CRÍTICO
          const fallbackProfile: UserProfile = {
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
              plan: 'free',
              isPremium: false,
              isPro: false,
              isProMax: false
            },
            usage: {
              daily: {
                tokensUsed: 0,
                tokensLimit: 10000,
                tokensRemaining: 10000,
                imagesGenerated: 0,
                imagesLimit: 0,
                videosGenerated: 0,
                videosLimit: 0,
                analysesCount: 0,
                analysesLimit: 5,
                analysesRemaining: 5,
                chatMessagesCount: 0,
                developerModeUsed: 0,
                developerModeLimit: 1,
                developerModeRemaining: 1,
                specialistModeUsed: 0,
                specialistModeLimit: 1,
                specialistModeRemaining: 1,
              },
              monthly: {
                tokensUsed: 0,
                tokensLimit: 50000,
                tokensRemaining: 50000,
                imagesGenerated: 0,
                imagesLimit: 0,
                videosGenerated: 0,
                videosLimit: 0,
                analysesCount: 0,
                analysesLimit: 20,
                analysesRemaining: 20,
                chatMessagesCount: 0,
                developerModeUsed: 0,
                developerModeLimit: 5,
                developerModeRemaining: 5,
                specialistModeUsed: 0,
                specialistModeLimit: 3,
                specialistModeRemaining: 3,
              }
            },
            limits: {
              dailyTokens: 10000,
              monthlyTokens: 50000,
              dailyAnalyses: 5,
              monthlyAnalyses: 20,
              chatEnabled: true,
              voiceEnabled: false,
              multimediaEnabled: false,
              codeEnabled: false,
              pdfEnabled: false,
              maxResponseTokens: 1000,
              imageGeneration: false,
              videoGeneration: false,
              maxVideoLength: 0,
              developerModeEnabled: true,
              specialistModeEnabled: true,
              developerModeDaily: 1,
              developerModeMonthly: 5,
              specialistModeDaily: 1,
              specialistModeMonthly: 3,
              maxTokensPerSpecialistResponse: 1500,
            },
            planInfo: {
              currentPlan: 'free',
              displayName: 'Gratis',
              availableFeatures: {
                chat: true,
                voice: false,
                multimedia: false,
                code: false,
                pdf: false,
                liveMode: false,
                imageGeneration: false,
                videoGeneration: false,
                developerMode: true,
                specialistMode: true,
                unlimitedSpecialist: false,
                priorityProcessing: false,
                webSearch: false,
              }
            },
            subscription: undefined,
            preferences: {
              theme: 'dark',
              notifications: true,
              autoSave: true
            },
            createdAt: new Date(),
            lastLogin: new Date(),
            totalConversations: 0
          };
          setUserProfile(fallbackProfile);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    plan,
    loading,
    signOut: handleSignOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}