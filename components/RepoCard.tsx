import { Star, GitFork } from 'lucide-react';

export type Repo = {
  full_name: string; owner: string; name: string; description: string | null;
  html_url: string; language: string | null; stars: number; forks: number;
  open_issues?: number; license_spdx?: string | null; pushed_at?: string | null;
  updated_at?: string | null; topics?: string[]; category?: string | null;
  stars_growth_7d?: number | null; avatar_url?: string | null;
};

export default function RepoCard({ repo, onPreview }: { repo: Repo; onPreview?: (r: Repo) => void }) {
  return (
    <div onClick={() => onPreview?.(repo)}
      className="group cursor-pointer border border-[#E7E5E4] dark:border-[#27272A] bg-white dark:bg-[#131316] rounded-lg p-4 hover:border-neutral-400 dark:hover:border-neutral-600 hover:-translate-y-[1px] hover:shadow-lg transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mono text-sm font-semibold truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{repo.full_name}</div>
          <p className="text-[13px] text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">{repo.description || 'No description'}</p>
        </div>
        {repo.avatar_url && <img src={repo.avatar_url} alt="" className="w-8 h-8 rounded-md border border-[#E7E5E4] dark:border-[#27272A]" loading="lazy" />}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-neutral-500">
        {repo.language && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />{repo.language}</span>}
        <span className="mono flex items-center gap-1" title="GitHub stars"><Star size={12} />{repo.stars.toLocaleString()}</span>
        <span className="mono flex items-center gap-1" title="Forks"><GitFork size={12} />{repo.forks.toLocaleString()}</span>
        {typeof repo.stars_growth_7d === 'number' ? (
          <span className="mono text-emerald-600 dark:text-emerald-400" title="Star growth over last 7 days (from snapshots)">+{repo.stars_growth_7d} this week</span>
        ) : (
          <span className="mono text-neutral-400" title="Insufficient snapshot history to compute weekly growth">— growth n/a</span>
        )}
        {repo.license_spdx && <span className="mono border rounded px-1">{repo.license_spdx}</span>}
        {repo.pushed_at && <span className="mono">updated {new Date(repo.pushed_at).toLocaleDateString()}</span>}
      </div>
      <div className="mt-3 flex items-center justify-between">
        {repo.category && <span className="text-[11px] uppercase tracking-wide text-neutral-400">{repo.category}</span>}
        <a href={repo.html_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
          className="text-xs mono text-neutral-500 hover:text-black dark:hover:text-white transition-colors">GitHub ↗</a>
      </div>
    </div>
  );
}
