'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { ArrowUpRight, Flame } from 'lucide-react';
import RepoCard, { Repo } from './RepoCard';
import RepoPreview from './RepoPreview';
import ExploreSections from './ExploreSections';
import FilterBar, { EmptyResults, FilterSelect } from './FilterBar';
import { CATEGORIES } from '@/lib/categories';
import { listSkills } from '@/lib/catalog';
import { matchesQuery } from '@/lib/format';
import { useUrlFilters } from '@/lib/use-url-filters';

const PAGE = 12;
const sorts = [
  { value: 'stars', label: 'Most starred' },
  { value: 'updated', label: 'Recently updated' },
  { value: 'forks', label: 'Most forked' },
  { value: 'name', label: 'Name A–Z' },
];
const sorters: Record<string, (a: Repo, b: Repo) => number> = {
  stars: (a, b) => b.stars - a.stars,
  updated: (a, b) => +new Date(b.pushed_at || 0) - +new Date(a.pushed_at || 0),
  forks: (a, b) => b.forks - a.forks,
  name: (a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }),
};

export type CatalogRepo = Repo & { categories?: string[]; has_skill_md?: boolean; is_mcp?: boolean; last_synced_at?: string };

export default function HomeDiscovery({ repos }: { repos: CatalogRepo[] }) {
  const { filters, update, reset, changed } = useUrlFilters({ category: 'all', q: '', language: '', sort: 'stars' });
  const { category, q, language, sort } = filters;
  const [visible, setVisible] = useState(PAGE);
  const [preview, setPreview] = useState<Repo | null>(null);
  const belongs = (r: CatalogRepo, id: string) => id === 'all' || (r.categories || [r.category]).includes(id);
  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    for (const repo of repos) if (repo.language) counts.set(repo.language, (counts.get(repo.language) || 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name, total]) => ({ value: name, label: `${name} (${total})` }));
  }, [repos]);
  // Category counts follow the search and language filters so the chips show what each click will return.
  const searched = repos.filter(r => (!language || r.language === language) && matchesQuery(q, [r.full_name, r.description, r.language, ...(r.topics || [])]));
  const filtered = searched.filter(r => belongs(r, category)).sort(sorters[sort] || sorters.stars);
  const setFilter = (patch: Partial<typeof filters>) => { update(patch); setVisible(PAGE); };
  const resetAll = () => { reset(); setVisible(PAGE); };
  const weekly = repos.filter(r => typeof r.stars_growth_7d === 'number').sort((a, b) => b.stars_growth_7d! - a.stars_growth_7d!);
  const featured = (weekly.length ? weekly : [...repos].sort((a, b) => b.stars - a.stars)).slice(0, 3);
  const synced = repos.map(r => r.last_synced_at || '').sort().slice(-1)[0];

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-7xl px-5 pb-16">
        <section className="py-7" aria-labelledby="popular-title">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 id="popular-title" className="flex items-center gap-2 text-xl font-bold uppercase tracking-tight"><Flame size={18} className="text-pink-500" />{weekly.length ? 'Trending this week' : 'Popular right now'}</h2>
            <Link href="/trending" className="flex items-center gap-1 text-xs text-neutral-500 hover:text-purple-600">Explore trending <ArrowUpRight size={14} /></Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">{featured.map((repo, i) => <motion.div key={repo.full_name} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .07, duration: .35 }} className="relative"><span className="mono pointer-events-none absolute right-5 top-5 z-10 text-xs text-neutral-400">0{i + 1}</span><RepoCard repo={repo} onPreview={setPreview} featured /></motion.div>)}</div>
          {!weekly.length && <p className="mt-3 text-[11px] text-neutral-500">Ranked by total GitHub stars. Weekly growth becomes available after seven days of recorded snapshots.</p>}
        </section>

        <ExploreSections projects={repos.length} skills={listSkills(repos).length} mcp={repos.filter(r => r.is_mcp).length} />

        <section id="discover" className="scroll-mt-28 pt-10" aria-labelledby="discover-title">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div><p className="mono mb-2 text-[10px] uppercase tracking-[.2em] text-neutral-400">Follow your curiosity</p><h2 id="discover-title" className="text-3xl font-bold uppercase tracking-tight">Discover the ecosystem<span className="text-purple-500">.</span></h2></div>
            <p className="mono text-[10px] text-neutral-500">{repos.length} GitHub projects · {synced ? `synced ${new Date(synced).toISOString().slice(0, 10)}` : 'awaiting sync'}</p>
          </div>
          <FilterBar query={q} onQuery={value => setFilter({ q: value })} placeholder="Filter by name, topic, or description" count={filtered.length} total={repos.length} noun="projects" changed={changed} onReset={resetAll}>
            <FilterSelect label="Language" value={language} onChange={value => setFilter({ language: value })} options={[{ value: '', label: 'Any' }, ...languages]} />
            <FilterSelect label="Sort" value={sort} onChange={value => setFilter({ sort: value })} options={sorts} />
          </FilterBar>
          <div className="chip-scroller mb-6" role="group" aria-label="Project categories">
            {CATEGORIES.map(c => {
              const total = searched.filter(r => belongs(r, c.id)).length;
              return <button key={c.id} aria-pressed={category === c.id} onClick={() => setFilter({ category: c.id })} className={`relative isolate flex shrink-0 items-center gap-2 px-3.5 py-2 text-xs transition-colors ${category === c.id ? 'text-white dark:text-black' : total ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10' : 'bg-neutral-100/60 text-neutral-400 dark:bg-white/[.03] dark:text-neutral-600'}`}>
                {category === c.id && <motion.span layoutId="category-pill" className="absolute inset-0 -z-10 category-active" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}{c.name}<span className={`mono text-[10px] ${category === c.id ? 'opacity-60' : 'text-neutral-400'}`}>{total}</span>
              </button>;
            })}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={category} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .18 }} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(0, visible).map(repo => <RepoCard key={repo.full_name} repo={repo} onPreview={setPreview} />)}
            </motion.div>
          </AnimatePresence>
          {!filtered.length && <EmptyResults title="No projects match these filters." detail={q ? `Nothing found for “${q}”. Try a broader word or another category.` : 'Try another category or language.'} onReset={resetAll} />}
          {visible < filtered.length && <div className="mt-8 flex flex-col items-center gap-3">
            <p className="mono text-[10px] uppercase tracking-wider text-neutral-500">Showing {visible} of {filtered.length}</p>
            <div className="flex flex-wrap justify-center gap-2"><button onClick={() => setVisible(v => v + PAGE)} className="load-more px-6 py-2.5 text-xs">Show {Math.min(PAGE, filtered.length - visible)} more</button><button onClick={() => setVisible(filtered.length)} className="load-more load-more--quiet px-5 py-2.5 text-xs">Show all {filtered.length}</button></div>
          </div>}
        </section>


      </div>
      <RepoPreview repo={preview} onClose={() => setPreview(null)} items={preview && filtered.some(r => r.full_name === preview.full_name) ? filtered : featured} onNavigate={setPreview} />
    </MotionConfig>
  );
}
