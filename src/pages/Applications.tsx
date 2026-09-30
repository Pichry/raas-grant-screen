import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useLanguage } from '@/context/LanguageContext';
import { StatusBadge } from '@/components/StatusBadge';
import { GRANT_CALLS, Application } from '@/data/mockData';

type SortKey = 'id' | 'applicantName' | 'submissionDate' | 'status' | 'similarityScore';
type SortDir = 'asc' | 'desc';

function SimilarityBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-slate-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-slate-600 font-mono">{score}%</span>
    </div>
  );
}

export function Applications() {
  const { applications } = useAppData();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [grantFilter, setGrantFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('submissionDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const statuses = ['ALL', 'PENDING', 'SCREENING', 'CLEARED', 'NEEDS_REVIEW', 'INCOMPLETE', 'FLAGGED'];

  const filtered = useMemo(() => {
    let list = [...applications];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.id.toLowerCase().includes(q) ||
        a.applicantName.toLowerCase().includes(q) ||
        a.institution.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'ALL') list = list.filter(a => a.status === statusFilter);
    if (grantFilter !== 'ALL') list = list.filter(a => a.grantCall === grantFilter);

    list.sort((a, b) => {
      let av: any = a[sortKey as keyof Application] ?? '';
      let bv: any = b[sortKey as keyof Application] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [applications, search, statusFilter, grantFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronUp size={13} className="text-slate-300" />;
    return sortDir === 'asc' ? <ChevronUp size={13} className="text-blue-600" /> : <ChevronDown size={13} className="text-blue-600" />;
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>{t('applications')}</h1>
        <p className="text-slate-500 text-sm mt-1">{filtered.length} of {applications.length} applications</p>
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('search')}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          >
            {statuses.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}</option>)}
          </select>

          <select
            value={grantFilter}
            onChange={e => setGrantFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          >
            <option value="ALL">All Grant Calls</option>
            {GRANT_CALLS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                {[
                  { label: 'App ID', key: 'id' as SortKey },
                  { label: 'Applicant', key: 'applicantName' as SortKey },
                  { label: 'Institution', key: null },
                  { label: 'Title', key: null },
                  { label: 'Grant Call', key: null },
                  { label: 'Submitted', key: 'submissionDate' as SortKey },
                  { label: 'Status', key: 'status' as SortKey },
                  { label: 'Similarity', key: 'similarityScore' as SortKey },
                ].map(col => (
                  <th key={col.label} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {col.key ? (
                      <button onClick={() => toggleSort(col.key!)} className="flex items-center gap-1 hover:text-slate-700">
                        {col.label} <SortIcon k={col.key} />
                      </button>
                    ) : col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm">
                    No applications match your filters.
                  </td>
                </tr>
              ) : filtered.map(app => (
                <tr
                  key={app.id}
                  onClick={() => navigate(`/applications/${app.id}`)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">{app.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{app.applicantName}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap max-w-[140px] truncate">{app.institution}</td>
                  <td className="px-4 py-3 text-slate-700 max-w-[200px]">
                    <span className="line-clamp-2 leading-tight">{app.title}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">{app.grantCall}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">{new Date(app.submissionDate).toLocaleDateString('en-RW')}</td>
                  <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                  <td className="px-4 py-3"><SimilarityBar score={app.similarityScore ?? 0} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
