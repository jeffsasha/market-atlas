'use client';

import { useRef, type ReactNode } from 'react';
import { RotateCcw, Search, X } from 'lucide-react';

type Props = {
  query: string; onQuery: (value: string) => void; placeholder: string;
  count: number; total: number; noun: string;
  changed?: boolean; onReset?: () => void; children?: ReactNode;
};

/** Search box, extra controls (sort, language) and a live result count with a reset action. */
export default function FilterBar({ query, onQuery, placeholder, count, total, noun, changed, onReset, children }: Props) {
  const input = useRef<HTMLInputElement>(null);
  return <div className="filter-bar">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label className="filter-search group">
        <Search size={16} className="shrink-0 text-neutral-500" aria-hidden="true" />
        <input ref={input} type="search" value={query} onChange={event => onQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape' && query) { event.stopPropagation(); onQuery(''); } }} placeholder={placeholder} aria-label={placeholder} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-500" />
        {query && <button type="button" onClick={() => { onQuery(''); input.current?.focus(); }} aria-label="Clear search" className="filter-clear grid h-6 w-6 shrink-0 place-items-center rounded-full"><X size={13} /></button>}
      </label>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
    <div className="mt-3 flex min-h-[28px] flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
      <p aria-live="polite"><strong className="font-medium text-[var(--page-text)]">{count}</strong> {count === total ? `${noun}` : `of ${total} ${noun}`}</p>
      {changed && onReset && <button type="button" onClick={onReset} className="filter-reset inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"><RotateCcw size={12} />Reset filters</button>}
    </div>
  </div>;
}

export function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return <label className="filter-select">
    <span className="text-neutral-500">{label}</span>
    <select value={value} onChange={event => onChange(event.target.value)} className="bg-transparent text-xs outline-none">
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>;
}

/** Empty-state block with an optional reset button. */
export function EmptyResults({ title, detail, onReset }: { title: string; detail: string; onReset?: () => void }) {
  return <div className="empty-results">
    <Search size={22} className="mx-auto mb-3 text-neutral-500" aria-hidden="true" />
    <p className="text-sm font-medium">{title}</p>
    <p className="mt-1.5 text-xs text-neutral-500">{detail}</p>
    {onReset && <button type="button" onClick={onReset} className="filter-reset mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs"><RotateCcw size={12} />Reset filters</button>}
  </div>;
}

/** Placeholder cards shown while a catalog request is in flight. */
export function CardSkeletons({ count = 6 }: { count?: number }) {
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading catalog">
    {Array.from({ length: count }, (_, index) => <div key={index} className="skeleton-card">
      <span className="skeleton-line w-20" /><span className="skeleton-line mt-5 h-4 w-2/3" /><span className="skeleton-line mt-3 w-full" /><span className="skeleton-line mt-2 w-4/5" /><span className="skeleton-line mt-auto w-1/3" />
    </div>)}
  </div>;
}
