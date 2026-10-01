import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ClipboardList, ShieldAlert } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { StatusBadge } from '@/components/StatusBadge';

export function ScreeningQueue() {
  const navigate = useNavigate();
  const { applications } = useAppData();

  const queue = applications.filter(app => ['PENDING', 'SCREENING', 'NEEDS_REVIEW', 'FLAGGED'].includes(app.status));
  const urgentCount = queue.filter(app => app.similarityScore && app.similarityScore >= 70).length;
  const needsReviewCount = queue.filter(app => app.status === 'NEEDS_REVIEW' || app.status === 'FLAGGED').length;
  const clearedCount = applications.filter(app => app.status === 'CLEARED').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Screening Queue</h1>
        <p className="text-sm text-slate-500 mt-1">Applications waiting for officer review and final decisioning.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wide">
            <ClipboardList size={14} /> Queue
          </div>
          <div className="mt-3 text-3xl font-bold text-slate-900">{queue.length}</div>
          <div className="text-sm text-slate-500">Active applications pending action</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-600 text-xs uppercase tracking-wide">
            <ShieldAlert size={14} /> Urgent
          </div>
          <div className="mt-3 text-3xl font-bold text-amber-600">{urgentCount}</div>
          <div className="text-sm text-slate-500">Applications above similarity alert threshold</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-600 text-xs uppercase tracking-wide">
            <CheckCircle2 size={14} /> Cleared
          </div>
          <div className="mt-3 text-3xl font-bold text-emerald-600">{clearedCount}</div>
          <div className="text-sm text-slate-500">Applications approved after review</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Review priority</h2>
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
            <AlertTriangle size={12} /> {needsReviewCount} require attention
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs">
              <tr>
                <th className="text-left px-4 py-3">Application</th>
                <th className="text-left px-4 py-3">Applicant</th>
                <th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.map(app => (
                <tr key={app.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/applications/${app.id}`)}>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-slate-500">{app.id}</div>
                    <div className="font-medium text-slate-800">{app.title}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{app.applicantName}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${app.similarityScore && app.similarityScore >= 70 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                      {app.similarityScore && app.similarityScore >= 70 ? 'High' : 'Medium'}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
