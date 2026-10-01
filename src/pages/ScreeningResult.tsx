import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, AlertTriangle, Brain, Copy, AlignLeft,
  ArrowLeft, ChevronRight, Play, RotateCcw, UserCheck, Flag, Minus,
  GitCompare, Shield, Loader2
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { useLanguage } from '@/context/LanguageContext';
import { StatusBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { MOCK_HISTORICAL_PROPOSALS, ScreeningResult as SR, EligibilityCheck } from '@/data/mockData';
import { analyzeApplication, getAiProviderStatus } from '@/services/aiService';

function CheckRow({ check }: { check: EligibilityCheck }) {
  const icon = check.result === 'PASS'
    ? <CheckCircle size={15} className="text-green-600 shrink-0" />
    : check.result === 'FAIL'
    ? <XCircle size={15} className="text-red-600 shrink-0" />
    : <AlertTriangle size={15} className="text-amber-500 shrink-0" />;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      {icon}
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-700">{check.rule}</div>
        <div className="text-xs text-slate-500">{check.detail}</div>
      </div>
      <StatusBadge status={check.result} />
    </div>
  );
}

const aiStatus = getAiProviderStatus();

export function ScreeningResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applications, screeningResults, saveScreeningResult, updateApplicationStatus, publishEligibilityDecision, addAuditLog } = useAppData();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [running, setRunning] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ action: string; label: string } | null>(null);
  const [notes, setNotes] = useState('');

  const app = applications.find(a => a.id === id);
  const result = id ? screeningResults[id] : null;

  if (!app) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Application not found.</p>
        <button onClick={() => navigate('/applications')} className="mt-4 text-blue-600 text-sm hover:underline">← Back to applications</button>
      </div>
    );
  }

  const runScreening = async () => {
    setRunning(true);
    await new Promise(r => setTimeout(r, 2500));
    const res = await analyzeApplication(app, MOCK_HISTORICAL_PROPOSALS);
    saveScreeningResult(res);
    const newStatus = res.finalStatus === 'CLEARED_FOR_REVIEW' ? 'CLEARED'
      : res.finalStatus === 'NEEDS_HUMAN_REVIEW' ? 'NEEDS_REVIEW'
      : 'INCOMPLETE';
    updateApplicationStatus(app.id, newStatus);
    toast('success', `Screening complete for ${app.id}`);
    setRunning(false);
  };

  const handleAction = (action: string) => {
    const statusMap: Record<string, typeof app.status> = {
      CLEAR: 'CLEARED',
      FLAG: 'FLAGGED',
      INCOMPLETE: 'INCOMPLETE',
    };
    const newStatus = statusMap[action];
    const prev = app.status;
    updateApplicationStatus(app.id, newStatus);
    addAuditLog({
      id: `log-${Date.now()}`,
      userId: user?.id ?? '',
      userName: user?.name ?? '',
      applicationId: app.id,
      action,
      previousStatus: prev,
      newStatus,
      timestamp: new Date().toISOString(),
      notes,
    });
    toast('success', `Application ${app.id} ${action === 'CLEAR' ? 'cleared' : action === 'FLAG' ? 'flagged for review' : 'marked incomplete'}.`);
    setConfirmModal(null);
    setNotes('');
  };

  const publishEligibility = (decision: 'PASS' | 'FAIL' | 'REVIEW' | 'PENDING', customMessage?: string) => {
    const messageMap: Record<typeof decision, string> = {
      PASS: 'Your application has been reviewed and is eligible for funding consideration under the current grant call.',
      FAIL: 'Your application is not eligible under the current grant call and will need to be revised before resubmission.',
      REVIEW: 'Your application requires additional review before an eligibility decision can be finalized.',
      PENDING: 'Your application eligibility is still pending while more review is completed.',
    };

    const decisionMessage = customMessage ?? messageMap[decision];
    publishEligibilityDecision(app.id, decision, decisionMessage);
    addAuditLog({
      id: `log-${Date.now()}`,
      userId: user?.id ?? '',
      userName: user?.name ?? '',
      applicationId: app.id,
      action: `PUBLISH_ELIGIBILITY_${decision}`,
      previousStatus: app.status,
      newStatus: app.status,
      timestamp: new Date().toISOString(),
      notes: decisionMessage,
    });
    toast('success', `Eligibility decision published to ${app.applicantName}.`);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => navigate(`/applications/${app.id}`)} className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
          <ArrowLeft size={14} /> {app.id}
        </button>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-500">{t('screening')}</span>
      </div>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Screening Report</h1>
          <p className="text-slate-500 text-sm">{app.title}</p>
        </div>
        {!result && (
          <button
            onClick={runScreening}
            disabled={running}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {running ? 'Running Screening…' : t('run_screening')}
          </button>
        )}
        {result && (
          <button onClick={runScreening} disabled={running}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm transition-colors">
            <RotateCcw size={14} /> Re-run Screening
          </button>
        )}
      </div>

      {running && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-blue-600 animate-spin" />
          <div className="text-center">
            <div className="text-sm font-semibold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Running AI-Assisted Screening</div>
            <div className="text-xs text-slate-500 mt-1">Checking eligibility · Analysing proposal · Comparing with historical records…</div>
          </div>
        </div>
      )}

      {!result && !running && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Shield size={40} className="text-slate-300 mx-auto mb-3" />
          <div className="text-slate-500 text-sm">No screening has been run for this application yet.</div>
          <div className="text-slate-400 text-xs mt-1">Click "Run Screening" to begin the automated analysis.</div>
        </div>
      )}

      {result && !running && (
        <div className="space-y-5">
          {user?.role !== 'APPLICANT' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-800 mb-3" style={{ fontFamily: 'var(--font-display)' }}>Publish Eligibility Decision to Applicant</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {(['PASS', 'REVIEW', 'FAIL', 'PENDING'] as const).map(decision => (
                  <button
                    key={decision}
                    onClick={() => publishEligibility(decision)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      decision === 'PASS'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : decision === 'FAIL'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : decision === 'REVIEW'
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-slate-600 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {decision}
                  </button>
                ))}
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Optional message to share with the applicant about the eligibility verdict…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => publishEligibility(app.eligibilityResult ?? 'PENDING', notes || undefined)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
                >
                  Publish to applicant
                </button>
              </div>
            </div>
          )}

          {/* AI disclaimer */}
          <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>AI-Assisted Screening Disclaimer:</strong> All AI analysis is advisory only. The system does not automatically reject proposals or confirm plagiarism. All screening findings require verification by a qualified grant officer before any final decision is recorded.
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Eligibility', value: result.eligibilityResult, icon: CheckCircle },
              { label: 'Completeness', value: result.completenessResult, icon: CheckCircle },
              { label: 'Textual Overlap', value: result.textualOverlapStatus, icon: AlignLeft },
              { label: 'Human Review', value: result.humanReviewRequired ? 'REQUIRED' : 'NOT_REQUIRED', icon: UserCheck },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <div className="text-xs text-slate-500 mb-2">{card.label}</div>
                <StatusBadge status={card.value} size="md" />
              </div>
            ))}
          </div>

          {/* Final status */}
          {result.finalStatus && (
            <div className={`rounded-xl border-2 p-5 ${result.finalStatus === 'CLEARED_FOR_REVIEW' ? 'bg-green-50 border-green-200' : result.finalStatus === 'NEEDS_HUMAN_REVIEW' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-3">
                {result.finalStatus === 'CLEARED_FOR_REVIEW'
                  ? <CheckCircle size={24} className="text-green-600" />
                  : result.finalStatus === 'NEEDS_HUMAN_REVIEW'
                  ? <AlertTriangle size={24} className="text-amber-600" />
                  : <XCircle size={24} className="text-red-600" />}
                <div>
                  <div className="font-bold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>
                    {result.finalStatus === 'CLEARED_FOR_REVIEW' ? 'Cleared for Review'
                      : result.finalStatus === 'NEEDS_HUMAN_REVIEW' ? 'Needs Human Review'
                      : 'Application Incomplete'}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">Screened: {new Date(result.screenedAt).toLocaleString('en-RW')}</div>
                </div>
                {result.flags.length > 0 && (
                  <div className="ml-auto text-right">
                    <div className="text-sm font-semibold text-slate-700">{result.flags.length} flag{result.flags.length > 1 ? 's' : ''}</div>
                    <div className="text-xs text-slate-500">Requires attention</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Eligibility checks */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <CheckCircle size={15} className="text-green-600" /> Eligibility Checks
              </h2>
              <div>
                {result.eligibilityChecks.map((c, i) => <CheckRow key={i} check={c} />)}
              </div>
            </div>

            {/* Completeness */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <Copy size={15} className="text-blue-600" /> Completeness Check
              </h2>
              <div className="mb-3">
                <StatusBadge status={result.completenessResult} size="md" />
              </div>
              {result.missingItems.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">Missing items:</p>
                  {result.missingItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-1.5 rounded-lg">
                      <XCircle size={13} className="text-red-500 shrink-0" /> {item}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">All required items present.</p>
              )}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <Brain size={15} className="text-indigo-600" /> AI Proposal Analysis
              <span className="ml-auto text-[10px] font-normal bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">ADVISORY ONLY</span>
            </h2>
            <p className="text-[11px] text-slate-400 mb-4">AI outputs are not legally or institutionally binding. Human verification is required.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">Summary</div>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed">{result.aiSummary}</p>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">Research Domain</div>
                <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{result.aiResearchDomain}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">Key Concepts</div>
                <div className="flex flex-wrap gap-1.5">
                  {result.aiKeyConcepts.map(c => (
                    <span key={c} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">Relevance to Grant Call</div>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed">{result.aiRelevance}</p>
              </div>
              {result.aiConcerns.length > 0 && (
                <div className="sm:col-span-2">
                  <div className="text-xs font-semibold text-amber-600 mb-1">Potential Concerns (AI-identified)</div>
                  <div className="space-y-1.5">
                    {result.aiConcerns.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 px-3 py-2 rounded-lg">
                        <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" /> {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="sm:col-span-2">
                <div className="text-xs font-semibold text-slate-500 mb-1">AI Explanation</div>
                <p className="text-sm text-slate-600 leading-relaxed italic">{result.aiExplanation}</p>
              </div>
            </div>
          </div>

          {/* Similarity detection */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <Copy size={15} className="text-purple-600" /> Semantic Similarity Detection
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Similarity indicators only — not evidence of duplication. Semantic comparison based on concepts, keywords, and title overlap.
            </p>
            {result.similarProposals.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No similar historical proposals found.</p>
            ) : (
              <div className="space-y-3">
                {result.similarProposals.map((sp, i) => (
                  <div key={i} className={`rounded-xl border p-4 ${sp.similarityScore >= 70 ? 'border-red-200 bg-red-50/50' : sp.similarityScore >= 40 ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-slate-500">{sp.proposalId}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">{sp.institution} · {sp.year}</span>
                        </div>
                        <div className="text-sm font-medium text-slate-800">{sp.title}</div>
                        {sp.matchedConcepts.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {sp.matchedConcepts.map(c => (
                              <span key={c} className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 text-slate-600 rounded">{c}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-2xl font-bold ${sp.similarityScore >= 70 ? 'text-red-600' : sp.similarityScore >= 40 ? 'text-amber-600' : 'text-slate-600'}`}
                          style={{ fontFamily: 'var(--font-display)' }}>
                          {sp.similarityScore}%
                        </div>
                        <div className="text-[10px] text-slate-400">similarity indicator</div>
                        <button
                          onClick={() => navigate(`/comparison/${app.id}/${sp.proposalId.replace(/\//g, '-')}`)}
                          className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <GitCompare size={11} /> Compare →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Textual overlap */}
          {result.textualOverlapStatus === 'POTENTIAL_OVERLAP' && (
            <div className="bg-white rounded-xl border border-purple-200 p-5">
              <div className="flex items-center gap-2 mb-1">
                <AlignLeft size={15} className="text-purple-600" />
                <h2 className="text-sm font-semibold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Textual Overlap Detection</h2>
                <span className="ml-auto text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">POTENTIAL OVERLAP — HUMAN VERIFICATION REQUIRED</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                The system identified potentially similar wording between this proposal and historical records. This is NOT confirmation of plagiarism.
              </p>
              {result.textualOverlaps.map((ov, i) => (
                <div key={i} className="space-y-3">
                  <div className="text-xs font-semibold text-slate-600">Section: {ov.section}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3">
                      <div className="text-[10px] font-semibold text-purple-600 mb-1.5 uppercase tracking-wider">Submitted</div>
                      <p className="text-xs text-slate-700 leading-relaxed">{ov.submittedText}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="text-[10px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Source: {ov.sourceProposalId}</div>
                      <p className="text-xs text-slate-700 leading-relaxed">{ov.sourceText}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-purple-700 bg-purple-50 px-3 py-2 rounded-lg">
                    <AlertTriangle size={12} className="shrink-0" />
                    Textual similarity indicator: <strong>{ov.indicator}%</strong> — Potential textual overlap detected — human verification required
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Flags */}
          {result.flags.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <Flag size={15} className="text-amber-500" /> Screening Flags
              </h2>
              <div className="space-y-2">
                {result.flags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 px-3 py-2.5 rounded-lg">
                    <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" /> {flag}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Human review actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
              <UserCheck size={15} className="text-slate-600" /> Grant Officer Review Action
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Record your final screening decision. All actions are logged in the audit trail. Confirmation is required before the status is changed.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setConfirmModal({ action: 'CLEAR', label: t('clear_application') })}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <UserCheck size={15} /> {t('clear_application')}
              </button>
              <button
                onClick={() => setConfirmModal({ action: 'FLAG', label: t('flag_for_review') })}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <Flag size={15} /> {t('flag_for_review')}
              </button>
              <button
                onClick={() => setConfirmModal({ action: 'INCOMPLETE', label: t('mark_incomplete') })}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <Minus size={15} /> {t('mark_incomplete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      <Modal open={!!confirmModal} onClose={() => setConfirmModal(null)} title={`Confirm: ${confirmModal?.label}`}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            You are about to <strong>{confirmModal?.label}</strong> for application <strong className="font-mono">{app.id}</strong>.
            This action will be recorded in the audit log.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Officer Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Add notes for the audit record…"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => handleAction(confirmModal!.action)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
              Confirm
            </button>
            <button onClick={() => setConfirmModal(null)}
              className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
