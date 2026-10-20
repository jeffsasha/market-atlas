'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle2, RotateCcw, Star } from 'lucide-react';
import FloatingSurface from '@/components/FloatingSurface';
import FilterBar, { CardSkeletons, EmptyResults, FilterSelect } from '@/components/FilterBar';
import CopyButton from '@/components/CopyButton';
import type { SkillListing } from '@/lib/catalog';
import { matchesQuery } from '@/lib/format';
import { useUrlFilters } from '@/lib/use-url-filters';

const topics = ['All', 'Finance', 'Crypto', 'Quant'];
const sorts = [{ value: 'stars', label: 'Most starred' }, { value: 'name', label: 'Name A–Z' }, { value: 'repository', label: 'Repository' }];
const PAGE = 12;
export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillListing[]>([]);
  const { filters, update, reset, changed } = useUrlFilters({ topic: 'All', q: '', sort: 'stars' });
  const { topic, q, sort } = filters;
  const [visible, setVisible] = useState(PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(false);
    fetch('/api/skills', { signal: controller.signal }).then(response => { if (!response.ok) throw new Error('Catalog unavailable'); return response.json(); }).then(data => setSkills(data.results || [])).catch(error => { if (error.name !== 'AbortError') setError(true); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);
  const matches = (skill: SkillListing, filter: string) => filter === 'All' || skill.topics.includes(filter);
  const searched = skills.filter(skill => matchesQuery(q, [skill.skill_name.replace(/[-_]/g, ' '), skill.description, skill.repository, ...skill.topics]));
  const filtered = searched.filter(skill => matches(skill, topic)).sort((a, b) => sort === 'name' ? a.skill_name.localeCompare(b.skill_name) : sort === 'repository' ? a.repository.localeCompare(b.repository) || a.skill_name.localeCompare(b.skill_name) : b.stars - a.stars);
  const setFilter = (patch: Partial<typeof filters>) => { update(patch); setVisible(PAGE); };
  const resetAll = () => { reset(); setVisible(PAGE); };
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
      <p className="mono mb-3 text-[10px] uppercase tracking-widest market-accent">Explore / 02</p>
      <h1 className="text-4xl font-bold uppercase tracking-tight sm:text-6xl">AI Agent Skills</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-500">From valuation models to on-chain research. Discover finance and crypto skills, each linked to its verified GitHub manifest.</p>
      {!loading && !error && <p className="mono mt-4 text-[11px] text-neutral-400">{skills.length} skills · {new Set(skills.map(skill => skill.repository)).size} source repositories</p>}
      {loading ? <div className="mt-8"><CardSkeletons /></div> : error ? <div role="alert" className="empty-results mt-8"><p className="text-sm font-medium">Could not load the catalog.</p><p className="mt-1.5 text-xs text-neutral-500">Check your connection and try again.</p><button onClick={() => setAttempt(value => value + 1)} className="filter-reset mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs"><RotateCcw size={12} />Retry</button></div> : <>
        <div className="mt-8"><FilterBar query={q} onQuery={value => setFilter({ q: value })} placeholder="Filter skills by name, task, or repository" count={filtered.length} total={skills.length} noun="skills" changed={changed} onReset={resetAll}>
          <FilterSelect label="Sort" value={sort} onChange={value => setFilter({ sort: value })} options={sorts} />
        </FilterBar></div>
        <div role="group" aria-label="Skill topics" className="chip-scroller mb-6">{topics.map(filter => <button key={filter} aria-pressed={topic === filter} onClick={() => setFilter({ topic: filter })} className={`shrink-0 rounded-full border px-4 py-2 text-xs transition-colors ${topic === filter ? 'border-purple-500 bg-purple-600 text-white dark:bg-fuchsia-300 dark:text-purple-950' : 'border-border-light text-neutral-500 hover:border-purple-400 dark:border-border-dark'}`}>{filter} <span className="mono ml-1 opacity-60">{searched.filter(skill => matches(skill, filter)).length}</span></button>)}</div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filtered.slice(0, visible).map(skill => <FloatingSurface key={skill.id} className="border border-border-light bg-white dark:border-border-dark dark:bg-surface-dark">
          <article className="flex h-full min-w-0 flex-col p-5">
            <div className="mb-4 flex flex-wrap gap-1.5">{skill.topics.map(tag => <span key={tag} className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">{tag}</span>)}{skill.trading_warning && <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] text-amber-700 dark:text-amber-300">Trading access</span>}</div>
            <h2 className="break-words text-lg font-semibold capitalize tracking-tight">{skill.skill_name.replace(/[-_]/g, ' ')}</h2>
            <p className="mb-5 mt-2 line-clamp-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400" title={skill.description}>{skill.description}</p>
            <p className="mono mt-auto truncate text-[10px] text-neutral-400" title={skill.repository}>{skill.repository}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-neutral-500"><span className="flex items-center gap-1" title="Repository stars"><Star size={11} />{skill.stars.toLocaleString('en-US')}</span><span>{skill.license || 'License not specified'}</span></div>
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-border-light pt-4 dark:border-border-dark"><span className="flex items-center gap-1 text-[10px] text-neutral-500" title={skill.verified_at ? `Manifest checked ${skill.verified_at.slice(0, 10)}` : undefined}><CheckCircle2 size={12} className="text-purple-500" />Verified manifest</span><div className="flex items-center gap-3"><CopyButton text={skill.source_url} label="Copy link" className="text-[11px] text-neutral-500 hover:text-[var(--market-accent)]" /><a href={skill.source_url} target="_blank" rel="noreferrer" aria-label={`View ${skill.skill_name} manifest on GitHub`} className="flex items-center gap-1 text-xs font-medium market-accent">Source <ArrowUpRight size={13} /></a></div></div>
          </article>
        </FloatingSurface>)}</div>
        {!filtered.length && <EmptyResults title="No skills match these filters." detail={q ? `Nothing found for “${q}”. Try a broader word or another topic.` : 'Try another topic.'} onReset={resetAll} />}
        {visible < filtered.length && <div className="mt-8 flex flex-wrap justify-center gap-2"><button onClick={() => setVisible(count => count + PAGE)} className="load-more px-6 py-2.5 text-xs">Show {Math.min(PAGE, filtered.length - visible)} more</button><button onClick={() => setVisible(filtered.length)} className="load-more load-more--quiet px-5 py-2.5 text-xs">Show all {filtered.length}</button></div>}
      </>}
    </div>
  );
}
