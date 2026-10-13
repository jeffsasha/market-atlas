import TrendingSection from '@/components/TrendingSection';
import type { Repo } from '@/components/RepoCard';
import { readCache } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function TrendingPage() {
  const repos = await readCache();
  const weekly = repos.filter(r => typeof r.stars_growth_7d === 'number').sort((a, b) => b.stars_growth_7d - a.stars_growth_7d);
  const results = weekly.length ? weekly : repos.sort((a, b) => b.stars - a.stars);
  return <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14"><p className="mono mb-3 text-[10px] uppercase tracking-widest market-accent">Explore / 04 · community favorites</p><h1 className="mb-4 text-4xl font-bold uppercase tracking-tight sm:text-6xl">{weekly.length ? 'Trending this week' : 'Popular right now'}</h1><p className="mb-7 text-sm text-neutral-500">{weekly.length ? 'Ranked by verified star growth across seven days of GitHub snapshots.' : 'Ranked by total GitHub stars. Weekly growth is unavailable until seven days of snapshots have been recorded.'}</p><TrendingSection repos={results.slice(0, 24) as Repo[]} /></div>;
}
