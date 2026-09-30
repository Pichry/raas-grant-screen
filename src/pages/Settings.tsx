import { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Globe, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

const ELIGIBILITY_RULES = [
  { id: 'cat', label: 'Eligible applicant category check', enabled: true, description: 'Verify that the applicant type is among NRIF-approved categories' },
  { id: 'deadline', label: 'Submission deadline check', enabled: true, description: 'Ensure submission date is before the grant call deadline (April 30, 2025)' },
  { id: 'doc', label: 'Proposal document required', enabled: true, description: 'Flag applications without an attached PDF proposal' },
  { id: 'fields', label: 'Required fields completeness', enabled: true, description: 'Check that all mandatory application fields are present' },
  { id: 'grantcall', label: 'Active grant call validation', enabled: true, description: 'Verify that the referenced grant call is currently open' },
];

export function Settings() {
  const { user } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [rules, setRules] = useState(ELIGIBILITY_RULES);
  const [similarityThreshold, setSimilarityThreshold] = useState(70);
  const [saved, setSaved] = useState(false);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>{t('settings')}</h1>
        <p className="text-slate-500 text-sm mt-1">System configuration and preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <Shield size={15} className="text-slate-500" /> Account
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-700 font-bold text-lg">{user?.name?.[0]}</span>
          </div>
          <div>
            <div className="font-semibold text-slate-900">{user?.name}</div>
            <div className="text-sm text-slate-500">{user?.email}</div>
            <div className="mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user?.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <Globe size={15} className="text-slate-500" /> Language / Ururimi
        </h2>
        <div className="flex gap-3">
          {[
            { code: 'en', label: 'English', sub: 'Interface language' },
            { code: 'rw', label: 'Kinyarwanda', sub: 'Ururimi rw\'Ikinyarwanda' },
          ].map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code as 'en' | 'rw')}
              className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-colors ${lang === l.code ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <div className={`text-sm font-semibold ${lang === l.code ? 'text-blue-700' : 'text-slate-700'}`}>{l.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{l.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Eligibility rules */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <CheckCircle size={15} className="text-slate-500" /> Eligibility Rule Configuration
        </h2>
        <p className="text-xs text-slate-400 mb-4">Configure which deterministic rules run during automated eligibility checking.</p>
        <div className="space-y-3">
          {rules.map(rule => (
            <div key={rule.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <input
                type="checkbox"
                checked={rule.enabled}
                onChange={() => toggleRule(rule.id)}
                className="mt-0.5 accent-blue-600"
                id={rule.id}
              />
              <label htmlFor={rule.id} className="flex-1 cursor-pointer">
                <div className="text-sm font-medium text-slate-800">{rule.label}</div>
                <div className="text-xs text-slate-500">{rule.description}</div>
              </label>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${rule.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                {rule.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Similarity threshold */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <Database size={15} className="text-slate-500" /> Similarity Alert Threshold
        </h2>
        <p className="text-xs text-slate-400 mb-4">Applications with a similarity score at or above this threshold are automatically flagged for human review.</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Current threshold</span>
            <span className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'var(--font-display)' }}>{similarityThreshold}%</span>
          </div>
          <input
            type="range"
            min={40}
            max={95}
            step={5}
            value={similarityThreshold}
            onChange={e => setSimilarityThreshold(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>40% (sensitive)</span>
            <span>95% (strict)</span>
          </div>
        </div>
      </div>

      {/* AI notice */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <AlertTriangle size={15} className="text-amber-500" /> AI System Notice
        </h2>
        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <p>• AI analysis in this prototype is <strong>simulated</strong>. In production, an LLM API (OpenAI/Gemini) would be called via a secure backend Cloud Function.</p>
          <p>• API keys are never stored in frontend code. All AI calls originate server-side.</p>
          <p>• AI outputs are advisory only and do not constitute final grant decisions.</p>
          <p>• The system does not automatically reject applications or confirm plagiarism.</p>
          <p>• All screening decisions require authorization by a qualified grant officer.</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
          style={{ fontFamily: 'var(--font-display)' }}>
          Save Settings
        </button>
        {saved && (
          <div className="flex items-center gap-1.5 text-green-700 text-sm">
            <CheckCircle size={15} /> Settings saved
          </div>
        )}
      </div>
    </div>
  );
}
