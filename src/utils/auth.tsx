import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { setAccessToken, clearAccessToken, authApi } from './api';

interface User {
  id: string;
  email: string;
  fullName?: string;
  role?: 'farmer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token with backend
      const response = await authApi.verify();
      
      if (response.user) {
        setUser({
          id: response.user.id,
          email: response.user.email,
          fullName: response.user.fullName,
          role: response.user.role || 'farmer', // Default to farmer if role not provided
        });
      }
    } catch (error) {
      // Token invalid or expired, clear it
      clearAccessToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await checkSession();
  };

  const signOut = async () => {
    try {
      clearAccessToken();
      setUser(null);
    } catch (error) {
      // Sign out error
      clearAccessToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
