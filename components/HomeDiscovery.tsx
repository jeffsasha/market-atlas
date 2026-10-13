'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { ArrowUpRight, Flame } from 'lucide-react';
import RepoCard, { Repo } from './RepoCard';
import RepoPreview from './RepoPreview';
import ExploreSections from './ExploreSections';
import { CATEGORIES } from '@/lib/categories';
import { listSkills } from '@/lib/catalog';

export type CatalogRepo = Repo & { categories?: string[]; has_skill_md?: boolean; is_mcp?: boolean; last_synced_at?: string };

export default function HomeDiscovery({ repos }: { repos: CatalogRepo[] }) {
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('stars');
  const [visible, setVisible] = useState(12);
  const [preview, setPreview] = useState<Repo | null>(null);
  const belongs = (r: CatalogRepo, id: string) => id === 'all' || (r.categories || [r.category]).includes(id);
  const filtered = repos.filter(r => belongs(r, category)).sort((a, b) => sort === 'updated' ? +new Date(b.pushed_at || 0) - +new Date(a.pushed_at || 0) : b.stars - a.stars);
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
          <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Project categories">
            {CATEGORIES.map(c => <button key={c.id} aria-pressed={category === c.id} onClick={() => { setCategory(c.id); setVisible(12); }} className={`relative isolate flex items-center gap-2 px-3.5 py-2 text-xs transition-colors ${category === c.id ? 'text-white dark:text-black' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10'}`}>
              {category === c.id && <motion.span layoutId="category-pill" className="absolute inset-0 -z-10 category-active" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}{c.name}<span className={`mono text-[10px] ${category === c.id ? 'opacity-60' : 'text-neutral-400'}`}>{repos.filter(r => belongs(r, c.id)).length}</span>
            </button>)}
          </div>
          <div className="mb-4 flex items-center justify-between gap-3 text-xs text-neutral-500"><p aria-live="polite">{filtered.length} projects to explore</p><label className="flex items-center gap-2">Sort by<select value={sort} onChange={e => setSort(e.target.value)} className="border border-border-light bg-transparent px-2 py-1.5 text-xs dark:border-border-dark"><option value="stars">Most starred</option><option value="updated">Recently updated</option></select></label></div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={category} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .18 }} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(0, visible).map(repo => <RepoCard key={repo.full_name} repo={repo} onPreview={setPreview} />)}
            </motion.div>
          </AnimatePresence>
          {!filtered.length && <p className="py-12 text-center text-sm text-neutral-500">No projects in this category yet.</p>}
          {visible < filtered.length && <div className="mt-7 text-center"><button onClick={() => setVisible(v => v + 12)} className="border border-border-light px-6 py-2.5 text-xs hover:border-purple-500 dark:border-border-dark">Discover more · {filtered.length - visible} remaining</button></div>}
        </section>


      </div>
      <RepoPreview repo={preview} onClose={() => setPreview(null)} />
    </MotionConfig>
  );
}
