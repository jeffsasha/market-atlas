'use client';
import { useState } from 'react';
import RepoCard, { Repo } from './RepoCard';
import RepoPreview from './RepoPreview';

export default function TrendingSection({ repos }: { repos: Repo[] }) {
  const [preview, setPreview] = useState<Repo | null>(null);
  return <><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{repos.map(repo => <RepoCard key={repo.full_name} repo={repo} onPreview={setPreview} />)}</div><RepoPreview repo={preview} onClose={() => setPreview(null)} items={repos} onNavigate={setPreview} /></>;
}
