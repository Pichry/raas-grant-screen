import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DEMO_USERS, User } from '@/data/mockData';
import { apiFetch } from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string; user?: User }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const readPersistedAuth = (): { user: User | null; token: string | null } => {
  const stored = localStorage.getItem('raas_auth');
  if (!stored) return { user: null, token: null };
  try {
    return JSON.parse(stored) as { user: User | null; token: string | null };
  } catch {
    return { user: null, token: null };
  }
};

const persistAuth = (user: User | null, token: string | null) => {
  if (user && token) {
    localStorage.setItem('raas_auth', JSON.stringify({ user, token }));
  } else {
    localStorage.removeItem('raas_auth');
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const persisted = readPersistedAuth();
    setUser(persisted.user);
    setToken(persisted.token);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await apiFetch<{ user: User; token: string }>('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      setUser(response.user);
      setToken(response.token);
      persistAuth(response.user, response.token);
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Invalid email or password.' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ error?: string; user?: User }> => {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!trimmedName || !normalizedEmail || !password.trim()) {
      return { error: 'Please provide a valid name, email and password.' };
    }

    try {
      const response = await apiFetch<{ user: User; token: string }>('/api/register', {
        method: 'POST',
        body: JSON.stringify({ name: trimmedName, email: normalizedEmail, password }),
      });

      setUser(response.user);
      setToken(response.token);
      persistAuth(response.user, response.token);
      return { user: response.user };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unable to register account.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    persistAuth(null, null);
  };

  return <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
