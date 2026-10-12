import { notFound } from 'next/navigation';
import { readCache } from '@/lib/store';
import { getReadme } from '@/lib/github';
import { Star, GitFork, ExternalLink } from 'lucide-react';

export default async function RepoDetail({ params }: { params: { owner: string; repo: string } }) {
  const full = `${params.owner}/${params.repo}`;
  const repos = await readCache();
  const r = repos.find(x => x.full_name.toLowerCase() === full.toLowerCase());
  if (!r) notFound();
  let readme: string | null = null;
  try { readme = await getReadme(params.owner, params.repo); } catch {}

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="mono text-2xl font-semibold tracking-tight">{r.full_name}</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">{r.description}</p>
        </div>
        {r.avatar_url && <img src={r.avatar_url} alt="" className="w-12 h-12 rounded-lg border" />}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {[
          { l: 'Stars', v: (r.stars || 0).toLocaleString() },
          { l: 'Forks', v: (r.forks || 0).toLocaleString() },
          { l: 'Language', v: r.language || '—' },
          { l: 'License', v: r.license_spdx || '—' },
        ].map(s => (
          <div key={s.l} className="border border-[#E7E5E4] dark:border-[#27272A] rounded-lg p-3 bg-white dark:bg-[#131316]">
            <div className="text-[11px] uppercase tracking-wide text-neutral-400">{s.l}</div>
            <div className="mono text-sm mt-1">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="mono text-xs text-neutral-500 mt-4 space-y-1">
        <div>Created: {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</div>
        <div>Last push: {r.pushed_at ? new Date(r.pushed_at).toLocaleString() : '—'}</div>
        {r.topics?.length > 0 && <div className="flex flex-wrap gap-1 pt-1">{r.topics.slice(0, 12).map((t: string) => <span key={t} className="border rounded px-1.5 py-0.5">{t}</span>)}</div>}
      </div>

      <a href={r.html_url} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-medium">
        Visit GitHub <ExternalLink size={14} />
      </a>

      {readme && (
        <div className="mt-8 border-t border-[#E7E5E4] dark:border-[#27272A] pt-6">
          <h2 className="font-semibold mb-3">README preview</h2>
          <pre className="mono text-xs whitespace-pre-wrap text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-white/5 border rounded-lg p-4 max-h-96 overflow-auto">{readme.slice(0, 8000)}</pre>
        </div>
      )}
      <p className="mt-6 text-[11px] mono text-neutral-400">Source: GitHub API · Synced {r.last_synced_at ? new Date(r.last_synced_at).toLocaleString() : 'unknown'}</p>
    </div>
  );
}
