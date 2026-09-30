import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, FileText, CheckCircle, AlertTriangle, Copy, TrendingUp } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useLanguage } from '@/context/LanguageContext';
import { StatusBadge } from '@/components/StatusBadge';

function exportToCSV(data: object[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => JSON.stringify((row as any)[h] ?? '')).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#94a3b8',
  SCREENING: '#3b82f6',
  CLEARED: '#16a34a',
  NEEDS_REVIEW: '#d97706',
  INCOMPLETE: '#dc2626',
  FLAGGED: '#7c3aed',
};

export function Reports() {
  const { applications, screeningResults, auditLogs } = useAppData();
  const { t } = useLanguage();

  const stats = useMemo(() => {
    const total = applications.length;
    const screened = Object.keys(screeningResults).length;
    const cleared = applications.filter(a => a.status === 'CLEARED').length;
    const flagged = applications.filter(a => a.status === 'FLAGGED' || a.status === 'NEEDS_REVIEW').length;
    const incomplete = applications.filter(a => a.status === 'INCOMPLETE').length;
    const highSimilarity = applications.filter(a => (a.similarityScore ?? 0) >= 70).length;
    const overlap = Object.values(screeningResults).filter(r => r.textualOverlapStatus === 'POTENTIAL_OVERLAP').length;
    return { total, screened, cleared, flagged, incomplete, highSimilarity, overlap };
  }, [applications, screeningResults]);

  const statusChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach(a => { counts[a.status] = (counts[a.status] ?? 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [applications]);

  const grantCallData = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach(a => { counts[a.grantCall] = (counts[a.grantCall] ?? 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace('NRIF-', ''), value }));
  }, [applications]);

  const handleExportApplications = () => {
    const data = applications.map(a => ({
      ID: a.id,
      Applicant: a.applicantName,
      Institution: a.institution,
      Type: a.applicantType,
      Email: a.email,
      Title: a.title,
      GrantCall: a.grantCall,
      SubmissionDate: a.submissionDate,
      Status: a.status,
      SimilarityScore: a.similarityScore ?? 0,
    }));
    exportToCSV(data, 'raas_applications_report.csv');
  };

  const handleExportAudit = () => {
    const data = auditLogs.map(l => ({
      LogID: l.id,
      Officer: l.userName,
      ApplicationID: l.applicationId,
      Action: l.action,
      PreviousStatus: l.previousStatus,
      NewStatus: l.newStatus,
      Timestamp: l.timestamp,
      Notes: l.notes ?? '',
    }));
    exportToCSV(data, 'raas_audit_log.csv');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>{t('reports')}</h1>
          <p className="text-slate-500 text-sm mt-1">Aggregate screening statistics and export tools</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportApplications}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors">
            <Download size={14} /> Export Applications (CSV)
          </button>
          <button onClick={handleExportAudit}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors">
            <Download size={14} /> Export Audit Log (CSV)
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: stats.total, icon: FileText, color: 'bg-slate-600' },
          { label: 'Screened', value: stats.screened, icon: CheckCircle, color: 'bg-blue-600' },
          { label: 'Cleared', value: stats.cleared, icon: CheckCircle, color: 'bg-green-600' },
          { label: 'Flagged / Review', value: stats.flagged, icon: AlertTriangle, color: 'bg-amber-500' },
          { label: 'Incomplete', value: stats.incomplete, icon: FileText, color: 'bg-red-600' },
          { label: 'High Similarity (≥70%)', value: stats.highSimilarity, icon: Copy, color: 'bg-purple-600' },
          { label: 'Textual Overlap Cases', value: stats.overlap, icon: Copy, color: 'bg-indigo-600' },
          { label: 'Audit Actions', value: auditLogs.length, icon: TrendingUp, color: 'bg-teal-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon size={16} className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</div>
              <div className="text-xs text-slate-500 leading-tight">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Applications by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusChartData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.name] ?? '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-display)' }}>Applications by Grant Call</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={grantCallData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Eligibility results table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Screening Results Detail</h3>
          <span className="text-xs text-slate-400">{Object.keys(screeningResults).length} screened applications</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Application</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Eligibility</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Completeness</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Similarity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Textual Overlap</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Final Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Screened By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {Object.values(screeningResults).map(r => {
                const app = applications.find(a => a.id === r.applicationId);
                return (
                  <tr key={r.applicationId} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-slate-500">{r.applicationId}</div>
                      <div className="text-xs text-slate-700 truncate max-w-[160px]">{app?.title}</div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.eligibilityResult} /></td>
                    <td className="px-4 py-3"><StatusBadge status={r.completenessResult} /></td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs font-bold ${r.similarityScore >= 70 ? 'text-red-600' : r.similarityScore >= 40 ? 'text-amber-600' : 'text-green-600'}`}>
                        {r.similarityScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.textualOverlapStatus} /></td>
                    <td className="px-4 py-3">{r.finalStatus ? <StatusBadge status={r.finalStatus} /> : <span className="text-xs text-slate-400">—</span>}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{r.screenedBy}</td>
                  </tr>
                );
              })}
              {Object.keys(screeningResults).length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm">No screening results yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit log */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Audit Log</h3>
          <p className="text-xs text-slate-400 mt-0.5">Record of officer review actions</p>
        </div>
        <div className="divide-y divide-slate-50">
          {auditLogs.map(log => (
            <div key={log.id} className="flex items-start gap-4 px-5 py-3.5">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-slate-600">
                {log.userName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-slate-800">{log.userName}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="font-mono text-xs text-blue-600">{log.applicationId}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <StatusBadge status={log.action} />
                </div>
                {log.notes && <p className="text-xs text-slate-500 mt-0.5">{log.notes}</p>}
              </div>
              <div className="text-xs text-slate-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleDateString('en-RW')}</div>
            </div>
          ))}
          {auditLogs.length === 0 && (
            <div className="px-5 py-8 text-center text-slate-400 text-sm">No audit actions recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
