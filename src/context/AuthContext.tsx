import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DEMO_USERS, User } from '@/data/mockData';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string; user?: User }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_PASSWORDS: Record<string, string> = {
  'admin@raas.rw': 'Admin2025!',
  'officer@raas.rw': 'Officer2025!',
  'applicant@raas.rw': 'Applicant2025!',
};

const readPersistedUser = (): User | null => {
  const stored = localStorage.getItem('raas_user');
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(readPersistedUser());
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    await new Promise(r => setTimeout(r, 600));

    const normalizedEmail = email.trim().toLowerCase();
    const expectedPw = DEMO_PASSWORDS[normalizedEmail];
    const savedUser = readPersistedUser();
    const found = DEMO_USERS.find(u => u.email.toLowerCase() === normalizedEmail)
      ?? (savedUser && savedUser.email.toLowerCase() === normalizedEmail ? savedUser : null);

    if (found && expectedPw === password) {
      setUser(found);
      localStorage.setItem('raas_user', JSON.stringify(found));
      return {};
    }

    if (savedUser && savedUser.email.toLowerCase() === normalizedEmail) {
      const candidate = JSON.parse(localStorage.getItem('raas_registered_users') ?? '[]') as User[];
      const match = candidate.find(u => u.email.toLowerCase() === normalizedEmail);
      if (match && password === (localStorage.getItem(`raas_password_${match.id}`) ?? '')) {
        setUser(match);
        localStorage.setItem('raas_user', JSON.stringify(match));
        return {};
      }
    }

    return { error: 'Invalid email or password. Use the demo credentials or a registered applicant account.' };
  };

  const register = async (name: string, email: string, password: string): Promise<{ error?: string; user?: User }> => {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!trimmedName || !normalizedEmail || !password.trim()) {
      return { error: 'Please provide a valid name, email and password.' };
    }

    const existing = JSON.parse(localStorage.getItem('raas_registered_users') ?? '[]') as User[];
    if (existing.some(user => user.email.toLowerCase() === normalizedEmail)) {
      return { error: 'An account with that email already exists.' };
    }

    const generatedUser: User = {
      id: `app-${Date.now()}`,
      name: trimmedName,
      email: normalizedEmail,
      role: 'APPLICANT',
    };

    const nextUsers = [generatedUser, ...existing];
    localStorage.setItem('raas_registered_users', JSON.stringify(nextUsers));
    localStorage.setItem(`raas_password_${generatedUser.id}`, password);
    setUser(generatedUser);
    localStorage.setItem('raas_user', JSON.stringify(generatedUser));
    return { user: generatedUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('raas_user');
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
