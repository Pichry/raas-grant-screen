import { BellRing, CheckCheck, Clock3, FileText, Sparkles } from 'lucide-react';

const notifications = [
  {
    id: 'n1',
    title: 'Application status updated',
    detail: 'Your proposal “AI-Driven Early Detection of Cassava Mosaic Disease in Rwanda” has been cleared for the next review stage.',
    time: '2 hours ago',
    type: 'status',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Document reminder',
    detail: 'Please confirm the final PDF upload for your smart irrigation advisory proposal before the review deadline.',
    time: 'Yesterday',
    type: 'reminder',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Grant officer feedback',
    detail: 'A reviewer requested clarification on the budget section of the youth innovation proposal. Please update the submission summary.',
    time: '3 days ago',
    type: 'feedback',
    unread: false,
  },
  {
    id: 'n4',
    title: 'Eligibility check complete',
    detail: 'Your application passed the completeness and eligibility checks and is now visible to the screening committee.',
    time: '1 week ago',
    type: 'system',
    unread: false,
  },
];

const typeStyles = {
  status: 'bg-emerald-100 text-emerald-700',
  reminder: 'bg-amber-100 text-amber-700',
  feedback: 'bg-blue-100 text-blue-700',
  system: 'bg-slate-200 text-slate-700',
};

export function Notifications() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-600">Applicant portal</p>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Notifications</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
          <BellRing size={15} /> {notifications.filter(n => n.unread).length} unread
        </div>
      </div>

      <div className="grid gap-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`rounded-2xl border p-4 shadow-sm ${notification.unread ? 'border-blue-200 bg-white' : 'border-slate-200 bg-slate-50/70'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  {notification.type === 'status' ? <CheckCheck size={18} /> : notification.type === 'reminder' ? <Clock3 size={18} /> : notification.type === 'feedback' ? <FileText size={18} /> : <Sparkles size={18} />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{notification.title}</h2>
                    {notification.unread && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white">New</span>}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{notification.detail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${typeStyles[notification.type as keyof typeof typeStyles]}`}>
                  {notification.type}
                </span>
                <span className="text-xs text-slate-400">{notification.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
