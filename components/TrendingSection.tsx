'use client';
import { useEffect, useState } from 'react';
import RepoCard, { Repo } from './RepoCard';

export default function TrendingSection() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trending?limit=6').then(r => r.json()).then(j => { setRepos(j.results || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid md:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-40 border rounded-lg animate-pulse bg-neutral-100 dark:bg-white/5" />)}</div>;
  if (repos.length === 0) return <p className="text-sm text-neutral-500">No trending data yet — run <span className="mono">npm run seed</span> to pull real GitHub data.</p>;

  return <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{repos.map(r => <RepoCard key={r.full_name} repo={r} />)}</div>;
}
