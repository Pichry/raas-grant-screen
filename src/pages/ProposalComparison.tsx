import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Tag } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { MOCK_HISTORICAL_PROPOSALS } from '@/data/mockData';

function HighlightText({ text, highlight = '' }: { text: string; highlight?: string }) {
  if (!highlight.trim()) return <p className="text-sm text-slate-700 leading-relaxed">{text}</p>;
  const parts = text.split(new RegExp(`(${highlight.slice(0, 20)})`, 'gi'));
  return (
    <p className="text-sm text-slate-700 leading-relaxed">
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.slice(0, 20).toLowerCase()
          ? <mark key={i} className="bg-yellow-200 text-slate-800">{part}</mark>
          : part
      )}
    </p>
  );
}

export function ProposalComparison() {
  const { appId, histId } = useParams<{ appId: string; histId: string }>();
  const navigate = useNavigate();
  const { applications, screeningResults } = useAppData();

  const app = applications.find(a => a.id === appId);
  const histProposal = MOCK_HISTORICAL_PROPOSALS.find(
    h => h.proposalId === histId?.replace(/-/g, '/') || h.proposalId.replace(/\//g, '-') === histId
  );
  const result = appId ? screeningResults[appId] : null;
  const simEntry = result?.similarProposals.find(sp => sp.proposalId === histProposal?.proposalId);
  const overlap = result?.textualOverlaps.find(o => o.sourceProposalId === histProposal?.proposalId);

  if (!app || !histProposal) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Comparison data not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 text-sm hover:underline">← Go back</button>
      </div>
    );
  }

  const score = simEntry?.similarityScore ?? 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Screening
        </button>
      </div>

      <div>
        <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Proposal Comparison</h1>
        <p className="text-slate-500 text-sm mt-1">Side-by-side analysis of submitted vs historical proposal</p>
      </div>

      {/* Similarity banner */}
      <div className={`rounded-xl border-2 p-4 flex items-center gap-4 ${score >= 70 ? 'bg-red-50 border-red-200' : score >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className={`text-4xl font-bold ${score >= 70 ? 'text-red-600' : score >= 40 ? 'text-amber-600' : 'text-slate-600'}`} style={{ fontFamily: 'var(--font-display)' }}>
          {score}%
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-800">Semantic Similarity Indicator</div>
          <div className="text-xs text-slate-500">
            {score >= 70 ? 'High similarity detected — human verification strongly recommended'
              : score >= 40 ? 'Moderate similarity — review concept overlap carefully'
              : 'Low similarity — proposals appear sufficiently distinct'}
          </div>
        </div>
        <div className="ml-auto">
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
            <AlertTriangle size={12} />
            Indicator only — not proof of duplication
          </div>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: submitted */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold max-w-max">
            Submitted Proposal — {app.id}
          </div>

          <div className="bg-white rounded-xl border border-blue-200 p-5 space-y-4">
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Title</div>
              <h3 className="text-base font-bold text-slate-900 leading-snug" style={{ fontFamily: 'var(--font-display)' }}>{app.title}</h3>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Applicant</div>
              <div className="text-sm text-slate-700">{app.applicantName} · {app.institution}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Abstract</div>
              {overlap ? (
                <HighlightText text={app.abstract} highlight={overlap.submittedText.slice(0, 30)} />
              ) : (
                <p className="text-sm text-slate-700 leading-relaxed">{app.abstract}</p>
              )}
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Keywords</div>
              <div className="flex flex-wrap gap-1.5">
                {app.keywords.map(k => {
                  const matched = histProposal.keywords.some(hk => hk.toLowerCase() === k.toLowerCase());
                  return (
                    <span key={k} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${matched ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-50 text-blue-700'}`}>
                      {matched && <AlertTriangle size={9} />}
                      {k}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: historical */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-600 text-white rounded-lg text-xs font-semibold max-w-max">
            Historical Proposal — {histProposal.proposalId}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Title</div>
              <h3 className="text-base font-bold text-slate-900 leading-snug" style={{ fontFamily: 'var(--font-display)' }}>{histProposal.title}</h3>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Applicant</div>
              <div className="text-sm text-slate-700">{histProposal.applicantName} · {histProposal.institution} · {histProposal.grantYear}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Abstract</div>
              {overlap ? (
                <HighlightText text={histProposal.abstract} highlight={overlap.sourceText.slice(0, 30)} />
              ) : (
                <p className="text-sm text-slate-700 leading-relaxed">{histProposal.abstract}</p>
              )}
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Keywords</div>
              <div className="flex flex-wrap gap-1.5">
                {histProposal.keywords.map(k => {
                  const matched = app.keywords.some(ak => ak.toLowerCase() === k.toLowerCase());
                  return (
                    <span key={k} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${matched ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-600'}`}>
                      {matched && <AlertTriangle size={9} />}
                      {k}
                    </span>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Domain</div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{histProposal.domain}</span>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Outcome</div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${histProposal.status === 'Awarded' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {histProposal.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlap details */}
      {overlap && (
        <div className="bg-white rounded-xl border border-purple-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} className="text-purple-600" />
            <h2 className="text-sm font-semibold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>Potential Textual Overlap Detail</h2>
          </div>
          <div className="px-3 py-2 bg-purple-50 rounded-lg text-xs text-purple-800 mb-4">
            Potential textual overlap detected in the <strong>{overlap.section}</strong> section. Similarity indicator: <strong>{overlap.indicator}%</strong>. This requires human verification and is NOT confirmation of plagiarism.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-semibold text-blue-600 mb-2 uppercase tracking-wider">Submitted Text</div>
              <blockquote className="text-sm text-slate-700 bg-blue-50 border-l-4 border-blue-400 pl-3 pr-3 py-2 rounded-r-lg leading-relaxed italic">
                "{overlap.submittedText}"
              </blockquote>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">Source Text ({overlap.sourceProposalId})</div>
              <blockquote className="text-sm text-slate-700 bg-slate-50 border-l-4 border-slate-400 pl-3 pr-3 py-2 rounded-r-lg leading-relaxed italic">
                "{overlap.sourceText}"
              </blockquote>
            </div>
          </div>
        </div>
      )}

      {/* Matched concepts */}
      {simEntry?.matchedConcepts && simEntry.matchedConcepts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
            <Tag size={14} className="text-slate-500" /> Matched Concepts
          </h2>
          <div className="flex flex-wrap gap-2">
            {simEntry.matchedConcepts.map(c => (
              <span key={c} className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-medium">{c}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
