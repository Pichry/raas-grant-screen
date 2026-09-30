import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { FileText, CheckCircle, AlertTriangle, XCircle, Copy, AlignLeft, TrendingUp } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { StatusBadge } from '@/components/StatusBadge';
import { useNavigate } from 'react-router-dom';

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: number | string; sub?: string; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>{value}</div>
        <div className="text-sm font-medium text-slate-600">{label}</div>
        {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#94a3b8',
  SCREENING: '#3b82f6',
  CLEARED: '#16a34a',
  NEEDS_REVIEW: '#d97706',
  INCOMPLETE: '#dc2626',
  FLAGGED: '#7c3aed',
};

const PIE_COLORS = ['#16a34a', '#d97706', '#3b82f6', '#94a3b8', '#dc2626', '#7c3aed'];

export function Dashboard() {
  const { user } = useAuth();
  const { applications, screeningResults } = useAppData();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const visibleApplications = user?.role === 'APPLICANT'
    ? applications.filter(app => app.email.toLowerCase() === user.email.toLowerCase())
    : applications;

  const stats = useMemo(() => {
    const total = visibleApplications.length;
    const eligible = visibleApplications.filter(a => a.status === 'CLEARED').length;
    const needsReview = visibleApplications.filter(a => a.status === 'NEEDS_REVIEW' || a.status === 'FLAGGED').length;
    const incomplete = visibleApplications.filter(a => a.status === 'INCOMPLETE').length;
    const potentialDuplicates = visibleApplications.filter(a => (a.similarityScore ?? 0) >= 70).length;
    const textualOverlap = Object.values(screeningResults).filter(r => r.textualOverlapStatus === 'POTENTIAL_OVERLAP').length;
    return { total, eligible, needsReview, incomplete, potentialDuplicates, textualOverlap };
  }, [applications, screeningResults]);

  // Status distribution for bar/pie
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    visibleApplications.forEach(a => { counts[a.status] = (counts[a.status] ?? 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [applications]);

  // Applications over time (by submission month)
  const timelineData = useMemo(() => {
    const byMonth: Record<string, number> = {};
    applications.forEach(a => {
      const month = a.submissionDate.slice(0, 7);
      byMonth[month] = (byMonth[month] ?? 0) + 1;
    });
    return Object.entries(byMonth).sort().map(([month, count]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-RW', { month: 'short', year: '2-digit' }),
      Applications: count,
    }));
  }, [applications]);

  // Flags distribution
  const flagsData = useMemo(() => {
    const flagCounts: Record<string, number> = {
      'High Similarity': 0,
      'Textual Overlap': 0,
      'Incomplete': 0,
      'Eligibility Issue': 0,
    };
    visibleApplications.forEach(a => {
      if ((a.similarityScore ?? 0) >= 70) flagCounts['High Similarity']++;
      if (a.status === 'INCOMPLETE') flagCounts['Incomplete']++;
    });
    Object.values(screeningResults).forEach(r => {
      if (r.textualOverlapStatus === 'POTENTIAL_OVERLAP') flagCounts['Textual Overlap']++;
      if (r.eligibilityResult === 'FAIL') flagCounts['Eligibility Issue']++;
    });
    return Object.entries(flagCounts).map(([name, value]) => ({ name, value }));
  }, [applications, screeningResults]);

  const recentApps = visibleApplications.slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
            {t('dashboard')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">NRIF 2025 Grant Screening Overview</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Grant Period</div>
          <div className="text-sm font-semibold text-slate-700">March – April 2025</div>
        </div>
      </div>

      {/* Demo banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle size={15} className="text-amber-500 shrink-0" />
        <p className="text-xs text-amber-800">
          <strong>Demo Mode:</strong> All data shown is fictional and for demonstration purposes only. AI analyses are simulated.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label={t('total_applications')} value={stats.total} sub="All submissions" icon={FileText} color="bg-slate-600" />
        <StatCard label={t('eligible_applications')} value={stats.eligible} sub="Cleared" icon={CheckCircle} color="bg-green-600" />
        <StatCard label={t('needs_review')} value={stats.needsReview} sub="Flagged / Review" icon={AlertTriangle} color="bg-amber-500" />
        <StatCard label={t('incomplete')} value={stats.incomplete} sub="Missing fields" icon={XCircle} color="bg-red-500" />
        <StatCard label={t('potential_duplicates')} value={stats.potentialDuplicates} sub="≥70% similarity" icon={Copy} color="bg-purple-600" />
        <StatCard label={t('textual_overlap')} value={stats.textualOverlap} sub="Flagged cases" icon={AlignLeft} color="bg-indigo-600" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart - applications over time */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Applications Over Time</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Area type="monotone" dataKey="Applications" stroke="#3b82f6" strokeWidth={2} fill="url(#appGrad)" dot={{ fill: '#3b82f6', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart - status distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={false}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar chart - flags */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Screening Flags Distribution</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={flagsData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={120} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent applications */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Recent Applications</h3>
          <button onClick={() => navigate('/applications')} className="text-xs text-blue-600 hover:text-blue-700 font-medium">View all →</button>
        </div>
        <div className="divide-y divide-slate-50">
          {recentApps.map(app => (
            <div
              key={app.id}
              onClick={() => navigate(`/applications/${app.id}`)}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-slate-400 mb-0.5">{app.id}</div>
                <div className="text-sm font-medium text-slate-800 truncate">{app.title}</div>
                <div className="text-xs text-slate-500">{app.applicantName} · {app.institution}</div>
              </div>
              <div className="text-xs text-slate-400 hidden sm:block">{app.grantCall}</div>
              <StatusBadge status={app.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
