import { Application, HistoricalProposal, ScreeningResult } from '@/data/mockData';
import { apiFetch } from '@/lib/api';

export type ScreeningAnalysisResult = Omit<ScreeningResult, 'screenedAt' | 'screenedBy'> & {
  screenedAt: string;
  screenedBy: string;
};

export function getAiProviderStatus() {
  const provider = import.meta.env.VITE_AI_PROVIDER ?? 'local-demo';
  return {
    provider,
    configured: provider !== 'local-demo',
    note: provider === 'local-demo'
      ? 'No real LLM provider is configured in this prototype. AI findings are generated through a local rule-based simulator and should be treated as advisory only.'
      : 'Production AI provider is configured and will be used for remote analysis.',
  };
}

export function generateScreeningAnalysis(
  app: Application,
  historicalProposals: HistoricalProposal[],
): ScreeningAnalysisResult {
  const keywords = new Set(app.keywords.map((k) => k.toLowerCase()));

  const eligibilityChecks = [
    {
      rule: 'Eligible applicant category',
      result: ['University', 'Research Institute', 'Government Agency', 'Hospital/Health Facility'].includes(app.applicantType) ? 'PASS' : 'REVIEW',
      detail: `${app.applicantType} — ${['University', 'Research Institute', 'Government Agency', 'Hospital/Health Facility'].includes(app.applicantType) ? 'eligible' : 'requires category review'} under NRIF-2025 guidelines`,
    },
    {
      rule: 'Submission before deadline (April 30, 2025)',
      result: new Date(app.submissionDate) <= new Date('2025-04-30') ? 'PASS' : 'FAIL',
      detail: `Submitted ${new Date(app.submissionDate).toLocaleDateString('en-RW', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    },
    {
      rule: 'Proposal document attached',
      result: app.documentUrl ? 'PASS' : 'FAIL',
      detail: app.documentUrl ? `Document: ${app.documentUrl}` : 'No proposal document attached',
    },
    {
      rule: 'Required fields completed',
      result: app.abstract && app.title && app.email && app.applicantName && app.institution ? 'PASS' : 'FAIL',
      detail: 'All mandatory fields verified',
    },
    {
      rule: 'Applicable grant call',
      result: 'PASS',
      detail: `${app.grantCall} is active`,
    },
  ] as ScreeningResult['eligibilityChecks'];

  const eligibilityResult: ScreeningResult['eligibilityResult'] =
    eligibilityChecks.some((check) => check.result === 'FAIL') ? 'FAIL'
      : eligibilityChecks.some((check) => check.result === 'REVIEW') ? 'REVIEW'
      : 'PASS';

  const missingItems: string[] = [];
  if (!app.documentUrl) missingItems.push('Proposal document (PDF)');
  if (!app.abstract || app.abstract.split(/\s+/).length < 50) missingItems.push('Abstract (minimum 100 words recommended)');
  if (!app.keywords?.length) missingItems.push('Keywords');
  const completenessResult: ScreeningResult['completenessResult'] = missingItems.length > 0 ? 'INCOMPLETE' : 'COMPLETE';

  const similarProposals: ScreeningResult['similarProposals'] = historicalProposals
    .map((historical) => {
      const historicalKeywords = new Set(historical.keywords.map((k) => k.toLowerCase()));
      const intersection = [...keywords].filter((k) => historicalKeywords.has(k)).length;
      const union = new Set([...keywords, ...historicalKeywords]).size;
      const jaccardScore = union > 0 ? Math.round((intersection / union) * 100) : 0;
      const titleWords = new Set(app.title.toLowerCase().split(/\s+/));
      const historicalTitleWords = new Set(historical.title.toLowerCase().split(/\s+/));
      const titleSimilarity = [...titleWords].filter((word) => historicalTitleWords.has(word) && word.length > 3).length;
      const combined = Math.min(100, jaccardScore + titleSimilarity * 5);

      return {
        proposalId: historical.proposalId,
        title: historical.title,
        institution: historical.institution,
        year: historical.grantYear,
        similarityScore: combined,
        matchedConcepts: [...keywords].filter((k) => historicalKeywords.has(k)).slice(0, 5),
      };
    })
    .filter((proposal) => proposal.similarityScore > 5)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 3);

  const topScore = similarProposals[0]?.similarityScore ?? 0;

  const textualOverlaps: ScreeningResult['textualOverlaps'] = [];
  if (topScore >= 60 && similarProposals[0]) {
    const source = historicalProposals.find((proposal) => proposal.proposalId === similarProposals[0].proposalId);
    textualOverlaps.push({
      section: 'Abstract',
      submittedText: app.abstract.slice(0, 180) + '…',
      sourceText: source?.abstract.slice(0, 180) + '…' ?? '',
      sourceProposalId: similarProposals[0].proposalId,
      indicator: topScore,
    });
  }

  const flags: string[] = [];
  if (topScore >= 70) flags.push(`High semantic similarity (${topScore}%) with ${similarProposals[0]?.proposalId}`);
  if (textualOverlaps.length > 0) flags.push('Potential textual overlap — human verification required');
  if (completenessResult === 'INCOMPLETE') flags.push(`Missing: ${missingItems.join(', ')}`);
  if (eligibilityResult === 'FAIL') flags.push('Eligibility check failed');

  const humanReviewRequired = flags.length > 0;
  const finalStatus: ScreeningResult['finalStatus'] =
    completenessResult === 'INCOMPLETE' ? 'INCOMPLETE'
      : humanReviewRequired ? 'NEEDS_HUMAN_REVIEW'
      : 'CLEARED_FOR_REVIEW';

  return {
    applicationId: app.id,
    eligibilityResult,
    eligibilityChecks,
    completenessResult,
    missingItems,
    similarityScore: topScore,
    similarProposals,
    textualOverlapStatus: textualOverlaps.length > 0 ? 'POTENTIAL_OVERLAP' : 'NONE',
    textualOverlaps,
    aiSummary: `[AI ADVISORY] This proposal explores ${app.keywords.slice(0, 2).join(' and ')} in the context of ${app.grantCall}. The research appears to target ${app.institution}-based implementation with a focus on Rwanda-related priorities.`,
    aiKeyConcepts: app.keywords.slice(0, 5),
    aiResearchDomain: app.keywords[0] ?? 'General Research',
    aiRelevance: `The proposal aligns with the stated goals of ${app.grantCall}. Key concepts are relevant to Rwanda's research priorities.`,
    aiConcerns: topScore >= 70 ? ['High similarity with previously funded or reviewed work — differentiation should be clarified by a human officer.'] : [],
    aiExplanation: 'AI findings are advisory. A human grant officer must verify the proposal, historical similarity, and any potential overlap before making a final decision.',
    flags,
    humanReviewRequired,
    finalStatus,
    screenedAt: new Date().toISOString(),
    screenedBy: 'AI Advisory Layer',
  };
}

export async function analyzeApplication(
  app: Application,
  historicalProposals: HistoricalProposal[],
): Promise<ScreeningAnalysisResult> {
  const provider = import.meta.env.VITE_AI_PROVIDER ?? 'local-demo';
  if (provider === 'local-demo') {
    return generateScreeningAnalysis(app, historicalProposals);
  }

  try {
    const result = await apiFetch<ScreeningAnalysisResult>('/api/ai/screening', {
      method: 'POST',
      body: JSON.stringify({ app, historicalProposals }),
    });
    if (result && result.applicationId) {
      return result;
    }
  } catch (error) {
    console.warn('AI provider call failed, falling back to local simulation:', error);
  }

  return generateScreeningAnalysis(app, historicalProposals);
}
