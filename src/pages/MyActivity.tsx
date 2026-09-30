import { useAppData } from '@/context/AppDataContext';

export function MyActivity() {
  const { auditLogs } = useAppData();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>My Activity</h1>
        <p className="text-sm text-slate-500 mt-1">Recent decisions, approvals, and screening actions.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Action</th>
              <th className="text-left px-4 py-3">Application</th>
              <th className="text-left px-4 py-3">Status Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditLogs.slice(0, 8).map(log => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-700">{log.userName}</td>
                <td className="px-4 py-3 text-slate-600">{log.action}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{log.applicationId}</td>
                <td className="px-4 py-3 text-slate-600">{log.previousStatus} → {log.newStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
