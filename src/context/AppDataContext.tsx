import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Application,
  ScreeningResult,
  AuditLog,
  User,
  DEMO_USERS,
  MOCK_APPLICATIONS,
  MOCK_SCREENING_RESULTS,
  MOCK_AUDIT_LOGS,
} from '@/data/mockData';
import { apiFetch } from '@/lib/api';

interface AppDataContextValue {
  users: User[];
  applications: Application[];
  screeningResults: Record<string, ScreeningResult>;
  auditLogs: AuditLog[];
  addApplication: (app: Application) => void;
  updateApplicationStatus: (id: string, status: Application['status']) => void;
  saveScreeningResult: (result: ScreeningResult) => void;
  addAuditLog: (log: AuditLog) => void;
  addUser: (user: User) => void;
  getUserByEmail: (email: string) => User | undefined;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

const readStorage = <T,>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => readStorage('raas_users', DEMO_USERS));
  const [applications, setApplications] = useState<Application[]>(() => readStorage('raas_applications', MOCK_APPLICATIONS));
  const [screeningResults, setScreeningResults] = useState<Record<string, ScreeningResult>>(() => readStorage('raas_screening_results', MOCK_SCREENING_RESULTS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => readStorage('raas_audit_logs', MOCK_AUDIT_LOGS));

  useEffect(() => {
    let ignore = false;

    const syncFromApi = async () => {
      try {
        const response = await apiFetch<{ users: User[]; applications: Application[]; screeningResults: Record<string, ScreeningResult>; auditLogs: AuditLog[] }>('/api/data');
        if (!ignore) {
          setUsers(response.users ?? DEMO_USERS);
          setApplications(response.applications ?? MOCK_APPLICATIONS);
          setScreeningResults(response.screeningResults ?? MOCK_SCREENING_RESULTS);
          setAuditLogs(response.auditLogs ?? MOCK_AUDIT_LOGS);
        }
      } catch {
        // fallback to localStorage-only behavior when backend is not running
      }
    };

    syncFromApi();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('raas_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('raas_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('raas_screening_results', JSON.stringify(screeningResults));
  }, [screeningResults]);

  useEffect(() => {
    localStorage.setItem('raas_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addApplication = (app: Application) => {
    setApplications(prev => [app, ...prev]);
    void apiFetch('/api/applications', {
      method: 'POST',
      body: JSON.stringify(app),
    }).catch(() => undefined);
  };

  const updateApplicationStatus = (id: string, status: Application['status']) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    void apiFetch(`/api/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }).catch(() => undefined);
  };

  const saveScreeningResult = (result: ScreeningResult) => {
    setScreeningResults(prev => ({ ...prev, [result.applicationId]: result }));
    void apiFetch('/api/screening-results', {
      method: 'POST',
      body: JSON.stringify(result),
    }).catch(() => undefined);
  };

  const addAuditLog = (log: AuditLog) => {
    setAuditLogs(prev => [log, ...prev]);
    void apiFetch('/api/audit-logs', {
      method: 'POST',
      body: JSON.stringify(log),
    }).catch(() => undefined);
  };

  const addUser = (user: User) => {
    setUsers(prev => {
      if (prev.some(entry => entry.email.toLowerCase() === user.email.toLowerCase())) {
        return prev;
      }
      return [user, ...prev];
    });
  };

  const getUserByEmail = (email: string) => users.find(user => user.email.toLowerCase() === email.toLowerCase());

  return (
    <AppDataContext.Provider value={{ users, applications, screeningResults, auditLogs, addApplication, updateApplicationStatus, saveScreeningResult, addAuditLog, addUser, getUserByEmail }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
