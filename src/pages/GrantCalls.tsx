import { CalendarDays, CheckCircle2, CircleDashed, PencilLine, PlusCircle } from 'lucide-react';

const grantCalls = [
  {
    name: 'NRIF 2026 Innovation Challenge',
    status: 'Active',
    openingDate: '2026-01-15',
    closingDate: '2026-03-31',
    eligibleApplicants: 'Universities, Research Institutes, NGOs',
    funding: 'RWF 1.8B',
  },
  {
    name: 'Rwanda Health Systems Innovation Call',
    status: 'Active',
    openingDate: '2026-02-01',
    closingDate: '2026-04-15',
    eligibleApplicants: 'Hospitals, Government Agencies, Universities',
    funding: 'RWF 1.2B',
  },
  {
    name: 'Climate Resilience Research Call',
    status: 'Draft',
    openingDate: '2026-05-01',
    closingDate: '2026-07-30',
    eligibleApplicants: 'Universities, Private Sector, NGOs',
    funding: 'RWF 900M',
  },
];

export function GrantCalls() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Grant Calls</h1>
          <p className="text-sm text-slate-500 mt-1">Manage active and upcoming funding opportunities.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <PlusCircle size={15} /> Create Grant Call
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {grantCalls.map(call => (
          <div key={call.name} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{call.name}</h2>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-medium">
                  <CheckCircle2 size={12} /> {call.status}
                </div>
              </div>
              <button className="text-slate-500 hover:text-slate-700">
                <PencilLine size={16} />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="text-slate-400" />
                <span>{call.openingDate} → {call.closingDate}</span>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Eligible Applicants</div>
                <div>{call.eligibleApplicants}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Funding Envelope</div>
                <div>{call.funding}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="inline-flex items-center gap-1"><CircleDashed size={12} /> Rules configured</span>
              <button className="text-blue-600 hover:text-blue-700 font-medium">View details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
