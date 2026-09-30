import { Bot, Cpu, SlidersHorizontal, ShieldCheck } from 'lucide-react';

const settings = [
  { label: 'AI Provider', value: 'Local Advisory Engine' },
  { label: 'Similarity Threshold', value: '70%' },
  { label: 'Text Overlap Threshold', value: '65%' },
  { label: 'Model', value: 'Prototype Rule + NLP Model' },
  { label: 'Screening Prompt Mode', value: 'Review-first' },
];

export function AISettings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>AI Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Admin-configured screening risk thresholds and model behavior.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-slate-700"><Bot size={16} /> Provider</div>
          <div className="mt-3 text-sm text-slate-600">Local advisory engine</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-slate-700"><Cpu size={16} /> Model Status</div>
          <div className="mt-3 text-sm text-slate-600">Operational</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-slate-700"><ShieldCheck size={16} /> Secret Handling</div>
          <div className="mt-3 text-sm text-slate-600">Stored only in secure server env vars</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold"><SlidersHorizontal size={16} /> Screening Configuration</div>
        <div className="divide-y divide-slate-100">
          {settings.map(item => (
            <div key={item.label} className="flex items-center justify-between py-3">
              <span className="text-slate-600">{item.label}</span>
              <span className="text-slate-800 font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
