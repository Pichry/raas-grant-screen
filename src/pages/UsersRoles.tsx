import { ShieldCheck, UserCog, UserRound } from 'lucide-react';

const users = [
  { name: 'Amina Uwase', email: 'admin@raas.rw', role: 'ADMIN', status: 'Active' },
  { name: 'Jean-Paul Nkurunziza', email: 'officer@raas.rw', role: 'GRANT_OFFICER', status: 'Active' },
  { name: 'Marie Mukamana', email: 'applicant@raas.rw', role: 'APPLICANT', status: 'Active' },
  { name: 'Samuel Rugema', email: 'officer2@raas.rw', role: 'GRANT_OFFICER', status: 'Pending Review' },
];

export function UsersRoles() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Users & Roles</h1>
        <p className="text-sm text-slate-500 mt-1">Manage access controls and account lifecycle.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-slate-700"><ShieldCheck size={16} /> Admin</div>
          <div className="mt-3 text-2xl font-bold text-slate-900">1</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-slate-700"><UserCog size={16} /> Grant Officers</div>
          <div className="mt-3 text-2xl font-bold text-slate-900">4</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-slate-700"><UserRound size={16} /> Applicants</div>
          <div className="mt-3 text-2xl font-bold text-slate-900">18</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.email} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-1 text-xs font-medium">{user.role}</span>
                </td>
                <td className="px-4 py-3 text-slate-600">{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
