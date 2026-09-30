import { useNavigate } from 'react-router-dom';
import { useAppData } from '@/context/AppDataContext';
import { StatusBadge } from '@/components/StatusBadge';

export function ScreeningQueue() {
  const navigate = useNavigate();
  const { applications } = useAppData();

  const queue = applications.filter(app => ['PENDING', 'SCREENING', 'NEEDS_REVIEW', 'FLAGGED'].includes(app.status));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Screening Queue</h1>
        <p className="text-sm text-slate-500 mt-1">Applications waiting for officer review and final decisioning.</p>
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
  );
}
