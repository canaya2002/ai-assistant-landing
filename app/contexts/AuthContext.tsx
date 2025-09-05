'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, cloudFunctions } from '../lib/firebase';
import { UserProfile } from '../lib/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: FirebaseUser | null;
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

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      setUserProfile(null);
      return;
    }

    try {
      const result = await cloudFunctions.getUserProfile();
      setUserProfile(result.data as UserProfile);
      setError(null);
    } catch (error: unknown) {
      console.error('Error fetching user profile:', error);
      setError('Error cargando perfil de usuario');
      setUserProfile({
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || '',
          plan: 'free',
          isPremium: false,
          isPro: false,
          isProMax: false
        },
        usage: {
          daily: { 
            tokensUsed: 0, 
            tokensLimit: 6600, 
            tokensRemaining: 6600,
            analysesCount: 0, 
            analysesLimit: 2,
            analysesRemaining: 2,
            chatMessagesCount: 0
          },
          monthly: { 
            tokensUsed: 0, 
            tokensLimit: 200000, 
            tokensRemaining: 200000,
            analysesCount: 0, 
            analysesLimit: 50,
            analysesRemaining: 50,
            chatMessagesCount: 0
          }
        },
        limits: {
          dailyTokens: 6600,
          monthlyTokens: 200000,
          dailyAnalyses: 2,
          monthlyAnalyses: 50,
          chatEnabled: false,
          voiceEnabled: false,
          multimediaEnabled: false,
          codeEnabled: false,
          pdfEnabled: false
        },
        planInfo: {
          currentPlan: 'free',
          displayName: 'Gratis',
          availableFeatures: {
            chat: false,
            voice: false,
            multimedia: false,
            code: false,
            pdf: false,
            liveMode: false
          }
        }
      });
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      setError(null);
      toast.success('Sesión cerrada correctamente');
    } catch (error: unknown) {
      console.error('Error signing out:', error);
      toast.error('Error al cerrar sesión. Intenta nuevamente.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(true);
      
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    refreshProfile,
    signOut,
    isAuthenticated: !!user,
    isPremium: userProfile?.user?.isPremium || false,
    isPro: userProfile?.user?.isPro || false,
    isProMax: userProfile?.user?.isProMax || false,
    plan: userProfile?.user?.plan || 'free',
    usage: userProfile?.usage || null,
    limits: userProfile?.limits || null,
    planInfo: userProfile?.planInfo || null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
