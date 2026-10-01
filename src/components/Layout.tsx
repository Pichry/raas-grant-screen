import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, PlusCircle, Archive,
  ClipboardCheck, BarChart2, Settings, LogOut,
  Menu, Bell, ChevronDown, Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

const ADMIN_NAV_ITEMS = [
  { key: 'dashboard', path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'grant_calls', path: '/grant-calls', icon: FileText, label: 'Grant Calls' },
  { key: 'applications', path: '/applications', icon: FileText, label: 'Applications' },
  { key: 'screening', path: '/screening', icon: ClipboardCheck, label: 'Screening' },
  { key: 'historical_proposals', path: '/historical', icon: Archive, label: 'Historical Proposals' },
  { key: 'users_roles', path: '/users', icon: Shield, label: 'Users & Roles' },
  { key: 'reports', path: '/reports', icon: BarChart2, label: 'Reports' },
  { key: 'ai_settings', path: '/ai-settings', icon: Shield, label: 'AI Settings' },
  { key: 'settings', path: '/settings', icon: Settings, label: 'Settings' },
];

const OFFICER_NAV_ITEMS = [
  { key: 'dashboard', path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'screening_queue', path: '/screening-queue', icon: ClipboardCheck, label: 'Screening Queue' },
  { key: 'applications', path: '/applications', icon: FileText, label: 'Applications' },
  { key: 'historical_proposals', path: '/historical', icon: Archive, label: 'Historical Proposals' },
  { key: 'reports', path: '/reports', icon: BarChart2, label: 'Reports' },
  { key: 'my_activity', path: '/my-activity', icon: BarChart2, label: 'My Activity' },
  { key: 'settings', path: '/settings', icon: Settings, label: 'Settings' },
];

const APPLICANT_NAV_ITEMS = [
  { key: 'dashboard', path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'my_applications', path: '/applications', icon: FileText, label: 'My Applications' },
  { key: 'submit_application', path: '/submit', icon: PlusCircle, label: 'New Application' },
  { key: 'notifications', path: '/notifications', icon: Bell, label: 'Notifications' },
  { key: 'settings', path: '/settings', icon: Settings, label: 'Profile' },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  const navItems =
    user?.role === 'APPLICANT'
      ? APPLICANT_NAV_ITEMS
      : user?.role === 'ADMIN'
        ? ADMIN_NAV_ITEMS
        : OFFICER_NAV_ITEMS;

  const roleLabel =
    user?.role === 'ADMIN'
      ? t('administrator')
      : user?.role === 'APPLICANT'
        ? t('applicant')
        : t('grant_officer');

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4f8]">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#0f2248] flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight" style={{ fontFamily: 'var(--font-display)' }}>RAAS GrantScreen</div>
              <div className="text-[#94b4d6] text-xs">AI Screening System</div>
            </div>
          </div>
          <div className="mt-3 px-2 py-1 bg-blue-600/20 rounded-md border border-blue-500/30">
            <p className="text-[10px] text-blue-300 text-center font-medium tracking-wide">DEMO PROTOTYPE — SAMPLE DATA</p>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-white/10">
          <div className="text-[11px] text-[#94b4d6] text-center leading-tight">
            {t('rwanda_national_innovation_fund')}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
          <div className="space-y-0.5">
            {navItems.map(({ key, path, icon: Icon, label }) => (
              <NavLink
                key={key}
                to={path}
                end={path === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-[#94b4d6] hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon size={17} />
                <span style={{ fontFamily: 'var(--font-display)' }}>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center shrink-0">
              <span className="text-blue-300 text-xs font-semibold">{user?.name?.[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-[#94b4d6] text-[11px]">{roleLabel}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#94b4d6] hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm"
          >
            <LogOut size={15} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center gap-4 shrink-0">
          <button className="lg:hidden text-slate-500 hover:text-slate-700" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-1.5 bg-slate-100 rounded-full p-1">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${lang === 'en' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('rw')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${lang === 'rw' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              RW
            </button>
          </div>

          <button
            className="relative text-slate-500 hover:text-slate-700"
            onClick={() => navigate(user?.role === 'APPLICANT' ? '/notifications' : '/settings')}
            aria-label="Open notifications"
          >
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center">3</span>
          </button>

          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 text-xs font-bold">{user?.name?.[0]}</span>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
              <p className="text-[11px] text-slate-500">{user?.role}</p>
            </div>
            <ChevronDown size={13} className="text-slate-400" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
