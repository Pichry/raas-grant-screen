interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-slate-100 text-slate-600' },
  SCREENING: { label: 'Screening', className: 'bg-blue-100 text-blue-700' },
  CLEARED: { label: 'Cleared', className: 'bg-green-100 text-green-700' },
  NEEDS_REVIEW: { label: 'Needs Review', className: 'bg-amber-100 text-amber-700' },
  INCOMPLETE: { label: 'Incomplete', className: 'bg-red-100 text-red-700' },
  FLAGGED: { label: 'Flagged', className: 'bg-purple-100 text-purple-700' },
  PASS: { label: 'PASS', className: 'bg-green-100 text-green-700' },
  FAIL: { label: 'FAIL', className: 'bg-red-100 text-red-700' },
  REVIEW: { label: 'REVIEW', className: 'bg-amber-100 text-amber-700' },
  COMPLETE: { label: 'Complete', className: 'bg-green-100 text-green-700' },
  NONE: { label: 'None', className: 'bg-green-100 text-green-700' },
  POTENTIAL_OVERLAP: { label: 'Potential Overlap', className: 'bg-purple-100 text-purple-700' },
  CLEARED_FOR_REVIEW: { label: 'Cleared for Review', className: 'bg-green-100 text-green-700' },
  NEEDS_HUMAN_REVIEW: { label: 'Needs Human Review', className: 'bg-amber-100 text-amber-700' },
  REQUIRED: { label: 'Required', className: 'bg-amber-100 text-amber-700' },
  NOT_REQUIRED: { label: 'Not Required', className: 'bg-green-100 text-green-700' },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const cfg = CONFIG[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' };
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`inline-flex items-center rounded-full font-medium font-mono ${sizeClass} ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
