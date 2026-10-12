'use client';
import { useEffect, useState } from 'react';
import RepoCard, { Repo } from '@/components/RepoCard';

export default function TrendingPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [verified, setVerified] = useState(false);
  const [note, setNote] = useState('');
  useEffect(() => {
    fetch('/api/trending?limit=24').then(r => r.json()).then(j => { setRepos(j.results || []); setVerified(j.verified); setNote(j.note); });
  }, []);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Trending</h1>
      <p className="mono text-xs text-neutral-500 mb-6">{verified ? '✓ ' : ''}{note}</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{repos.map(r => <RepoCard key={r.full_name} repo={r} />)}</div>
    </div>
  );
}
