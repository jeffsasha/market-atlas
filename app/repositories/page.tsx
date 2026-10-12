'use client';
import { useEffect, useState } from 'react';
import { CATEGORIES, SORTS } from '@/lib/categories';
import RepoCard, { Repo } from '@/components/RepoCard';
import RepoPreview from '@/components/RepoPreview';
import { SlidersHorizontal } from 'lucide-react';

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('popular');
  const [language, setLanguage] = useState('');
  const [preview, setPreview] = useState<Repo | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams({ sort, limit: '48' });
    if (q) p.set('q', q);
    if (category !== 'all') p.set('category', category);
    if (language) p.set('language', language);
    const t = setTimeout(() => {
      fetch(`/api/repositories?${p}`).then(r => r.json()).then(j => { setRepos(j.results || []); setLoading(false); }).catch(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, category, sort, language]);

  const sidebar = (
    <div className="space-y-1">
      {CATEGORIES.map(c => (
        <button key={c.id} onClick={() => setCategory(c.id)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === c.id ? 'bg-neutral-900 dark:bg-white text-white dark:text-black font-medium' : 'hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400'}`}>
          {c.name}
        </button>
      ))}
      <div className="pt-4 border-t border-[#E7E5E4] dark:border-[#27272A] mt-4">
        <label className="text-xs uppercase tracking-wide text-neutral-400">Language</label>
        <input value={language} onChange={e => setLanguage(e.target.value)} placeholder="e.g. Python"
          className="mt-1 w-full text-sm border border-[#E7E5E4] dark:border-[#27272A] rounded-lg px-3 py-2 bg-transparent outline-none" />
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Discover Repositories</h1>
        <button onClick={() => setDrawer(true)} className="lg:hidden p-2 border rounded-lg"><SlidersHorizontal size={16} /></button>
      </div>
      <div className="flex gap-8">
        <aside className="hidden lg:block w-56 shrink-0">{sidebar}</aside>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-3 mb-6">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search repositories, skills, and MCP servers..."
              className="flex-1 min-w-[200px] text-sm border border-[#E7E5E4] dark:border-[#27272A] rounded-lg px-4 py-2.5 bg-white dark:bg-[#131316] outline-none focus:border-neutral-400 transition-colors" />
            <select value={sort} onChange={e => setSort(e.target.value)} className="text-sm border border-[#E7E5E4] dark:border-[#27272A] rounded-lg px-3 py-2.5 bg-white dark:bg-[#131316] outline-none">
              {SORTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          {loading ? <div className="grid md:grid-cols-2 gap-4">{[...Array(8)].map((_, i) => <div key={i} className="h-44 border rounded-lg animate-pulse bg-neutral-100 dark:bg-white/5" />)}</div>
          : repos.length === 0 ? <p className="text-sm text-neutral-500 py-12 text-center">No projects indexed yet. Run <span className="mono">npm run seed</span> with a GitHub token to pull real data.</p>
          : <div className="grid md:grid-cols-2 gap-4">{repos.map(r => <RepoCard key={r.full_name} repo={r} onPreview={setPreview} />)}</div>}
        </div>
      </div>
      {/* mobile filter drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#131316] border-r p-4 overflow-auto">{sidebar}
            <button onClick={() => setDrawer(false)} className="mt-4 w-full py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black text-sm">Done</button>
          </div>
        </div>
      )}
      <RepoPreview repo={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
