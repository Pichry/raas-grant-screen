import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AppDataProvider } from '@/context/AppDataContext';
import { ToastProvider } from '@/components/Toast';
import { Layout } from '@/components/Layout';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { Applications } from '@/pages/Applications';
import { ApplicationDetail } from '@/pages/ApplicationDetail';
import { SubmitApplication } from '@/pages/SubmitApplication';
import { HistoricalProposals } from '@/pages/HistoricalProposals';
import { ScreeningResult } from '@/pages/ScreeningResult';
import { ProposalComparison } from '@/pages/ProposalComparison';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';
import { Notifications } from '@/pages/Notifications';
import { GrantCalls } from '@/pages/GrantCalls';
import { UsersRoles } from '@/pages/UsersRoles';
import { AISettings } from '@/pages/AISettings';
import { ScreeningQueue } from '@/pages/ScreeningQueue';
import { MyActivity } from '@/pages/MyActivity';

function RequireRole({ allow }: { allow: Array<'ADMIN' | 'GRANT_OFFICER' | 'APPLICANT'> }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) {
    if (user.role === 'APPLICANT') return <Navigate to="/submit" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function ProtectedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />

<Route element={<RequireRole allow={['ADMIN']} />}>
          <Route path="/grant-calls" element={<GrantCalls />} />
          <Route path="/users" element={<UsersRoles />} />
          <Route path="/ai-settings" element={<AISettings />} />
        </Route>

        <Route element={<RequireRole allow={['ADMIN', 'GRANT_OFFICER', 'APPLICANT']} />}>
          <Route path="/applications" element={<Applications />} />
        </Route>

        <Route element={<RequireRole allow={['ADMIN', 'GRANT_OFFICER']} />}>
          <Route path="/historical" element={<HistoricalProposals />} />
          <Route path="/comparison/:appId/:histId" element={<ProposalComparison />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/screening" element={<ScreeningQueue />} />
          <Route path="/screening-queue" element={<ScreeningQueue />} />
          <Route path="/my-activity" element={<MyActivity />} />
        </Route>

        <Route element={<RequireRole allow={['APPLICANT']} />}>
          <Route path="/submit" element={<SubmitApplication />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route element={<RequireRole allow={['ADMIN', 'GRANT_OFFICER']} />}>
          <Route path="/screening/:id" element={<ScreeningResult />} />
        </Route>

        <Route element={<RequireRole allow={['ADMIN', 'GRANT_OFFICER', 'APPLICANT']} />}>
          <Route path="/applications/:id" element={<ApplicationDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppDataProvider>
            <ToastProvider>
              <Routes>
                <Route path="/login" element={<LoginGate />} />
                <Route path="/register" element={<RegisterGate />} />
                <Route path="/*" element={<ProtectedApp />} />
              </Routes>
            </ToastProvider>
          </AppDataProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

function LoginGate() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}

function RegisterGate() {
  const { user } = useAuth();
  if (user) return <Navigate to="/submit" replace />;
  return <Register />;
}
