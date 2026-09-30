import { useState, useMemo } from 'react';
import { Search, Archive, ExternalLink } from 'lucide-react';
import { MOCK_HISTORICAL_PROPOSALS } from '@/data/mockData';
import { useLanguage } from '@/context/LanguageContext';

export function HistoricalProposals() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');

  const domains = ['ALL', ...Array.from(new Set(MOCK_HISTORICAL_PROPOSALS.map(h => h.domain)))];

  const filtered = useMemo(() => {
    let list = [...MOCK_HISTORICAL_PROPOSALS];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(h =>
        h.title.toLowerCase().includes(q) ||
        h.proposalId.toLowerCase().includes(q) ||
        h.institution.toLowerCase().includes(q) ||
        h.applicantName.toLowerCase().includes(q) ||
        h.keywords.some(k => k.toLowerCase().includes(q))
      );
    }
    if (domainFilter !== 'ALL') list = list.filter(h => h.domain === domainFilter);
    return list;
  }, [search, domainFilter]);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>{t('historical_proposals')}</h1>
        <p className="text-slate-500 text-sm mt-1">
          Historical NRIF-funded proposals used as reference database for similarity analysis. All data is fictional and for demonstration only.
        </p>
      </div>

      {/* Demo notice */}
      <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Archive size={15} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          <strong>Reference Dataset:</strong> {MOCK_HISTORICAL_PROPOSALS.length} historical proposals spanning agriculture, health, climate, education, and technology. Used exclusively for semantic similarity comparison. All names, institutions, and data are fictional.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search proposals, institutions, keywords…"
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </div>
        <select
          value={domainFilter}
          onChange={e => setDomainFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
        >
          {domains.map(d => <option key={d} value={d}>{d === 'ALL' ? 'All Domains' : d}</option>)}
        </select>
        <span className="text-xs text-slate-400">{filtered.length} records</span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(h => (
          <div key={h.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{h.proposalId}</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${h.status === 'Awarded' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {h.status}
                </span>
                <span className="text-[10px] text-slate-400">{h.grantYear}</span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2 line-clamp-2" style={{ fontFamily: 'var(--font-display)' }}>
              {h.title}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">{h.abstract}</p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {h.keywords.slice(0, 4).map(k => (
                <span key={k} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">{k}</span>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-slate-700">{h.applicantName}</div>
                <div className="text-[10px] text-slate-400">{h.institution}</div>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{h.domain}</span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400">
            <Archive size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No historical proposals match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
