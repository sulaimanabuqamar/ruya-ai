import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import type { User } from '../api/auth';
import * as authApi from '../api/auth';
import {
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
} from '../config/googleAuth';

WebBrowser.maybeCompleteAuthSession();

const AUTH_STORAGE_KEY = '@carpool_auth';

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  signInWithGoogle: () => Promise<void>;
  updateFemaleOnlyCarpool: (enabled: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

async function loadStoredAuth(): Promise<{ user: User; token: string } | null> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { user: User; token: string };
    if (data?.user?.id && data?.token) return data;
  } catch {
    // ignore
  }
  return null;
}

async function saveAuth(user: User, token: string): Promise<void> {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
}

async function clearStoredAuth(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    let cancelled = false;
    loadStoredAuth().then((stored) => {
      if (!cancelled && stored) {
        setUser(stored.user);
        setToken(stored.token);
      }
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login(email, password);
      setUser(res.user);
      setToken(res.token);
      await saveAuth(res.user, res.token);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Login failed';
      setError(message);
      console.error('[Auth] login failed', e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await authApi.signup(name, email, password);
        setUser(res.user);
        setToken(res.token);
        await saveAuth(res.user, res.token);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Sign up failed';
        setError(message);
        console.error('[Auth] signup failed', e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    clearStoredAuth();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await promptAsync();
      if (result?.type !== 'success') {
        setLoading(false);
        return;
      }

      const { authentication } = result;
      if (!authentication?.accessToken) {
        setError('Failed to get Google access token');
        setLoading(false);
        return;
      }

      const googleAccessToken = authentication.accessToken;

      // Fetch user profile from Google
      const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${googleAccessToken}` },
      });
      const profile = await profileRes.json();

      // Create user object from Google profile
      const googleUser: User = {
        id: profile.sub,
        name: profile.name || profile.email,
        email: profile.email,
        femaleOnlyCarpool: false, // Default to false for new users
      };

      setUser(googleUser);
      setToken(googleAccessToken);
      await saveAuth(googleUser, googleAccessToken);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Google sign-in failed';
      setError(message);
      console.error('[Auth] Google sign-in failed', e);
    } finally {
      setLoading(false);
    }
  }, [promptAsync]);

  const updateFemaleOnlyCarpool = useCallback(async (enabled: boolean) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      // TODO: Call backend API when available
      // await post('/profile/preferences', { femaleOnlyCarpool: enabled });
      
      // For now, update local state
      const updatedUser: User = {
        ...user,
        femaleOnlyCarpool: enabled,
      };
      
      setUser(updatedUser);
      if (token) {
        await saveAuth(updatedUser, token);
      }
      
      console.log('[Auth] Updated femaleOnlyCarpool preference:', enabled);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update preference';
      setError(message);
      console.error('[Auth] updateFemaleOnlyCarpool failed', e);
      throw e;
    }
  }, [user, token]);

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    login,
    signup,
    logout,
    clearError,
    signInWithGoogle,
    updateFemaleOnlyCarpool,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
