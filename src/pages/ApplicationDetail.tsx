import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, User, Building, Mail, Calendar, Tag, ClipboardList, ChevronRight, AlertTriangle } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { StatusBadge } from '@/components/StatusBadge';

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-500 mb-0.5">{label}</div>
      <div className={`text-sm text-slate-800 ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}

export function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { applications, screeningResults } = useAppData();
  const { t } = useLanguage();

  const app = applications.find(a => a.id === id);
  const result = id ? screeningResults[id] : null;
  const canViewScreening = user?.role !== 'APPLICANT';

  if (!app) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Application not found.</p>
        <button onClick={() => navigate('/applications')} className="mt-4 text-blue-600 text-sm hover:underline">← Back to applications</button>
      </div>
    );
  }

  if (user?.role === 'APPLICANT' && app.email.toLowerCase() !== user.email.toLowerCase()) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">You do not have access to this application.</p>
        <button onClick={() => navigate('/applications')} className="mt-4 text-blue-600 text-sm hover:underline">← Back to my applications</button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => navigate(user?.role === 'APPLICANT' ? '/submit' : '/applications')} className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
          <ArrowLeft size={14} /> {user?.role === 'APPLICANT' ? 'Submit Application' : 'Applications'}
        </button>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-500 font-mono">{app.id}</span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{app.id}</span>
            <StatusBadge status={app.status} size="md" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>{app.title}</h1>
        </div>
        {canViewScreening && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => navigate(`/screening/${app.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <ClipboardList size={15} />
              {result ? 'View Screening' : t('run_screening')}
            </button>
          </div>
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: application info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User size={15} className="text-slate-400" /> Applicant Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Applicant Name" value={app.applicantName} />
              <Field label="Institution" value={app.institution} />
              <Field label="Applicant Type" value={app.applicantType} />
              <Field label="Email" value={app.email} />
              <Field label="Grant Call" value={app.grantCall} mono />
              <Field label="Submission Date" value={new Date(app.submissionDate).toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText size={15} className="text-slate-400" /> Proposal Details
            </h2>
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1">Abstract</div>
              <p className="text-sm text-slate-700 leading-relaxed">{app.abstract}</p>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 mb-2">Keywords</div>
              <div className="flex flex-wrap gap-2">
                {app.keywords.map(k => (
                  <span key={k} className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    <Tag size={10} /> {k}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1">Proposal Document</div>
              {app.documentUrl ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                  <FileText size={14} className="text-slate-400" />
                  <span className="text-slate-700">{app.documentUrl}</span>
                  <span className="text-xs text-green-600 font-medium ml-auto">Attached</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm">
                  <AlertTriangle size={14} className="text-red-400" />
                  <span className="text-red-700">No document attached</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Similarity Indicator</h2>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-1 ${(app.similarityScore ?? 0) >= 70 ? 'text-red-600' : (app.similarityScore ?? 0) >= 40 ? 'text-amber-600' : 'text-green-600'}`}
                style={{ fontFamily: 'var(--font-display)' }}>
                {app.similarityScore ?? 0}%
              </div>
              <div className="text-xs text-slate-500 mb-3">Semantic similarity score</div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${(app.similarityScore ?? 0) >= 70 ? 'bg-red-500' : (app.similarityScore ?? 0) >= 40 ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${app.similarityScore ?? 0}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-3 leading-snug">
                Similarity indicator only — not evidence of duplication. Human verification required.
              </p>
            </div>
          </div>

          {app.eligibilityResult && app.eligibilityPublishedAt && (user?.role === 'APPLICANT' || user?.role !== 'APPLICANT') && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Eligibility Decision</h2>
              <div className="space-y-3">
                <StatusBadge status={app.eligibilityResult} size="md" />
                <div className="text-sm text-slate-700 leading-relaxed">{app.eligibilityMessage || 'An eligibility decision has been published for this application.'}</div>
                <div className="text-[11px] text-slate-500">Published: {new Date(app.eligibilityPublishedAt).toLocaleString('en-RW')}</div>
              </div>
            </div>
          )}

          {canViewScreening && result && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Screening Summary</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Eligibility</span>
                  <StatusBadge status={result.eligibilityResult} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Completeness</span>
                  <StatusBadge status={result.completenessResult} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Textual Overlap</span>
                  <StatusBadge status={result.textualOverlapStatus} />
                </div>
                {result.finalStatus && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-500 mb-1">Final Status</div>
                    <StatusBadge status={result.finalStatus} size="md" />
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate(`/screening/${app.id}`)}
                className="w-full mt-4 text-center text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View full screening report →
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Metadata</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Created</span>
                <span className="text-slate-700 font-mono">{new Date(app.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Grant Call</span>
                <span className="text-slate-700 font-mono text-right">{app.grantCall}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
