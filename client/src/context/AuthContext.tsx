import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchMeUser, loginUser, registerUser, logoutUser } from '../services/api';
import { Loader2, Layers } from 'lucide-react';

export interface User {
  id: number | string;
  name: string;
  username: string;
  email: string;
  role?: string;
  created_at?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (u: string, p: string) => Promise<void>;
  register: (u: string, p: string, e?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const data = await fetchMeUser();
      if (data && data.user) {
        setUser({
          id: data.user.id,
          name: data.user.username || data.user.name || 'User',
          username: data.user.username,
          email: data.user.email || `${data.user.username}@cronmaster.dev`,
          role: 'Developer',
          created_at: data.user.created_at,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.username)}&background=10b981&color=fff`
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      await loginUser(username, password);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, email?: string) => {
    setIsLoading(true);
    try {
      await registerUser(username, password, email);
      // Automatically log in after registration
      await loginUser(username, password);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      refreshUser
    }}>
      {isLoading ? (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10 animate-bounce">
            <Layers className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
            <span>Loading CronMaster...</span>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
