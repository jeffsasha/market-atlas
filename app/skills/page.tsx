'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Star } from 'lucide-react';
import FloatingSurface from '@/components/FloatingSurface';
import type { SkillListing } from '@/lib/catalog';

const topics = ['All', 'Finance', 'Crypto', 'Quant'];
export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillListing[]>([]);
  const [topic, setTopic] = useState('All');
  const [visible, setVisible] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/skills', { signal: controller.signal }).then(response => { if (!response.ok) throw new Error('Catalog unavailable'); return response.json(); }).then(data => setSkills(data.results || [])).catch(error => { if (error.name !== 'AbortError') setError(true); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  const matches = (skill: SkillListing, filter: string) => filter === 'All' || skill.topics.includes(filter);
  const filtered = skills.filter(skill => matches(skill, topic));
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
      <p className="mono mb-3 text-[10px] uppercase tracking-widest market-accent">Explore / 02</p>
      <h1 className="text-4xl font-bold uppercase tracking-tight sm:text-6xl">AI Agent Skills</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-500">From valuation models to on-chain research. Discover finance and crypto skills, each linked to its verified GitHub manifest.</p>
      {!loading && !error && <p className="mono mt-4 text-[11px] text-neutral-400">{skills.length} skills · {new Set(skills.map(skill => skill.repository)).size} source repositories</p>}
      {loading ? <p role="status" className="py-12 text-center text-sm text-neutral-500">Loading catalog…</p> : error ? <p role="alert" className="py-12 text-center text-sm text-neutral-500">Could not load the catalog. Please reload to try again.</p> : <>
        <div role="group" aria-label="Skill topics" className="my-8 flex flex-wrap gap-2">{topics.map(filter => <button key={filter} aria-pressed={topic === filter} onClick={() => { setTopic(filter); setVisible(12); }} className={`rounded-full border px-4 py-2 text-xs transition-colors ${topic === filter ? 'border-purple-500 bg-purple-600 text-white dark:bg-fuchsia-300 dark:text-purple-950' : 'border-border-light text-neutral-500 hover:border-purple-400 dark:border-border-dark'}`}>{filter} <span className="mono ml-1 opacity-60">{skills.filter(skill => matches(skill, filter)).length}</span></button>)}</div>
        <p className="mb-4 text-xs text-neutral-500" aria-live="polite">{filtered.length} skills to explore</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filtered.slice(0, visible).map(skill => <FloatingSurface key={skill.id} className="border border-border-light bg-white dark:border-border-dark dark:bg-surface-dark">
          <article className="flex h-full min-w-0 flex-col p-5">
            <div className="mb-4 flex flex-wrap gap-1.5">{skill.topics.map(tag => <span key={tag} className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">{tag}</span>)}{skill.trading_warning && <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] text-amber-700 dark:text-amber-300">Trading access</span>}</div>
            <h2 className="break-words text-lg font-semibold capitalize tracking-tight">{skill.skill_name.replace(/[-_]/g, ' ')}</h2>
            <p className="mb-5 mt-2 line-clamp-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{skill.description}</p>
            <p className="mono mt-auto truncate text-[10px] text-neutral-400" title={skill.repository}>{skill.repository}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-neutral-500"><span className="flex items-center gap-1" title="Repository stars"><Star size={11} />{skill.stars.toLocaleString('en-US')}</span><span>{skill.license || 'License not specified'}</span></div>
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-border-light pt-4 dark:border-border-dark"><span className="flex items-center gap-1 text-[10px] text-neutral-500" title={skill.verified_at ? `Manifest checked ${skill.verified_at.slice(0, 10)}` : undefined}><CheckCircle2 size={12} className="text-purple-500" />Verified manifest</span><a href={skill.source_url} target="_blank" rel="noreferrer" aria-label={`View ${skill.skill_name} manifest on GitHub`} className="flex items-center gap-1 text-xs font-medium market-accent">Source <ArrowUpRight size={13} /></a></div>
          </article>
        </FloatingSurface>)}</div>
        {!filtered.length && <p className="py-12 text-sm text-neutral-500">No skills in this topic yet.</p>}
        {visible < filtered.length && <div className="mt-8 text-center"><button onClick={() => setVisible(count => count + 12)} className="rounded-full border border-purple-300 px-6 py-3 text-xs market-accent">Discover more skills · {filtered.length - visible} remaining</button></div>}
      </>}
    </div>
  );
}
