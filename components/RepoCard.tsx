import Link from 'next/link';
import { ArrowUpRight, Star, GitFork } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';

export type Repo = {
  full_name: string; owner: string; name: string; description: string | null;
  html_url: string; language: string | null; stars: number; forks: number;
  open_issues?: number; license_spdx?: string | null; pushed_at?: string | null;
  updated_at?: string | null; topics?: string[]; category?: string | null;
  stars_growth_7d?: number | null; avatar_url?: string | null;
};

export default function RepoCard({ repo, onPreview, featured = false }: { repo: Repo; onPreview?: (r: Repo) => void; featured?: boolean }) {
  const label = CATEGORIES.find(c => c.id === repo.category)?.name;
  return (
    <article className={`repo-card group relative isolate flex h-full flex-col overflow-hidden rounded-none border border-border-light bg-white p-5 dark:border-border-dark dark:bg-surface-dark ${featured ? 'min-h-[215px] featured-card' : 'min-h-[205px]'}`}>
      {onPreview && <button onClick={() => onPreview(repo)} aria-label={`Preview ${repo.full_name}`} className="absolute inset-0 z-10 rounded-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-purple-500" />}
      <div className="pointer-events-none relative flex items-center gap-3">
        {repo.avatar_url && <img src={repo.avatar_url} alt="" width={32} height={32} className="h-8 w-8 rounded-sm" loading="lazy" />}
        <span className="mono truncate pr-5 text-[11px] text-neutral-500">{repo.owner}</span>
      </div>
      <h3 className="relative mt-4 truncate text-lg font-semibold tracking-tight transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">{onPreview ? repo.name : <Link href={`/repositories/${repo.full_name}`}>{repo.name}</Link>}</h3>
      <p className="pointer-events-none relative mb-5 mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">{repo.description || 'Explore this project on GitHub.'}</p>
      <div className="pointer-events-none relative mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-neutral-500">
        <span className="mono flex items-center gap-1.5" title="Total GitHub stars"><Star size={13} className={featured ? 'text-pink-400' : ''} />{repo.stars.toLocaleString('en-US')}</span>
        <span className="mono flex items-center gap-1.5" title="Forks"><GitFork size={12} />{repo.forks.toLocaleString('en-US')}</span>
        {repo.language && <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-purple-500" />{repo.language}</span>}
        {typeof repo.stars_growth_7d === 'number' && <span className="mono text-purple-600 dark:text-purple-400">{repo.stars_growth_7d >= 0 ? '+' : ''}{repo.stars_growth_7d} this week</span>}
      </div>
      <div className="relative mt-4 flex items-center justify-between gap-2 border-t border-border-light pt-3 dark:border-border-dark">
        <span className="truncate text-[10px] text-neutral-400">{label}</span>
        <a href={repo.html_url} target="_blank" rel="noreferrer" className="relative z-20 flex shrink-0 items-center gap-1 text-[11px] text-neutral-500 hover:text-purple-600">GitHub <ArrowUpRight size={12} /></a>
      </div>
    </article>
  );
}
