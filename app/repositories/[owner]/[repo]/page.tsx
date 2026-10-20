import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readCache } from '@/lib/store';
import { getReadme } from '@/lib/github';
import { CATEGORIES } from '@/lib/categories';
import { timeAgo } from '@/lib/format';
import CopyButton from '@/components/CopyButton';
import { ArrowLeft, ArrowUpRight, ExternalLink } from 'lucide-react';

export default async function RepoDetail({ params }: { params: { owner: string; repo: string } }) {
  const full = `${params.owner}/${params.repo}`;
  const repos = await readCache();
  const r = repos.find(x => x.full_name.toLowerCase() === full.toLowerCase());
  if (!r) notFound();
  let readme: string | null = null;
  try { readme = await getReadme(params.owner, params.repo); } catch {}
  const categories = ((r.categories as string[] | undefined) || [r.category]).map(id => CATEGORIES.find(c => c.id === id)).filter(Boolean) as typeof CATEGORIES[number][];
  const clone = `git clone ${r.html_url}.git`;

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
        <Link href="/#discover" className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--market-accent)]"><ArrowLeft size={13} />All projects</Link>
        {categories[0] && <><span aria-hidden="true">/</span><Link href={`/?category=${categories[0].id}#discover`} className="transition-colors hover:text-[var(--market-accent)]">{categories[0].name}</Link></>}
      </nav>
      <div className="flex items-start gap-4">
        {r.avatar_url && <img src={r.avatar_url} alt="" width={56} height={56} className="h-14 w-14 shrink-0 rounded-xl border border-border-light dark:border-border-dark" />}
        <div className="min-w-0">
          <p className="mono truncate text-xs text-neutral-500">{r.owner} /</p>
          <h1 className="break-words text-3xl font-semibold tracking-tight sm:text-4xl">{r.name}</h1>
        </div>
      </div>
      <p className="mt-4 max-w-2xl leading-relaxed text-neutral-600 dark:text-neutral-400">{r.description}</p>
      {categories.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{categories.map(c => <Link key={c.id} href={`/?category=${c.id}#discover`} className="rounded-full bg-purple-500/10 px-2.5 py-1 text-[11px] text-purple-700 transition-colors hover:bg-purple-500/20 dark:text-purple-300">{c.name}</Link>)}</div>}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: 'Stars', v: (r.stars || 0).toLocaleString('en-US') },
          { l: 'Forks', v: (r.forks || 0).toLocaleString('en-US') },
          { l: 'Language', v: r.language || '—' },
          { l: 'License', v: r.license_spdx || '—' },
        ].map(s => (
          <div key={s.l} className="preview-stat rounded-xl p-3.5">
            <div className="text-[10px] uppercase tracking-wide text-neutral-500">{s.l}</div>
            <div className="mono mt-1.5 text-sm">{s.v}</div>
          </div>
        ))}
      </div>

      <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-xs text-neutral-500">
        <div><dt className="inline">Created </dt><dd className="inline text-[var(--page-text)]">{r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—'}</dd></div>
        <div><dt className="inline">Last push </dt><dd className="inline text-[var(--page-text)]" title={r.pushed_at ? new Date(r.pushed_at).toLocaleString() : undefined}>{timeAgo(r.pushed_at) || '—'}</dd></div>
        {typeof r.open_issues === 'number' && <div><dt className="inline">Open issues </dt><dd className="inline text-[var(--page-text)]">{r.open_issues.toLocaleString('en-US')}</dd></div>}
      </dl>
      {r.topics?.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{r.topics.slice(0, 12).map((t: string) => <span key={t} className="preview-topic mono rounded-md px-2 py-1 text-[10px]">{t}</span>)}</div>}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a href={r.html_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black">
          Visit GitHub <ExternalLink size={14} />
        </a>
        <div className="preview-clone flex min-w-0 flex-1 items-center gap-2 rounded-xl py-2 pl-3 pr-2">
          <code className="mono min-w-0 flex-1 truncate text-[11px] text-neutral-500">{clone}</code>
          <CopyButton text={clone} label="Copy" className="shrink-0 rounded-lg px-2.5 py-1.5 text-[11px]" />
        </div>
      </div>

      {readme && (
        <div className="mt-10 border-t border-border-light pt-6 dark:border-border-dark">
          <div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-semibold">README preview</h2><a href={`${r.html_url}#readme`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-[var(--market-accent)]">Read on GitHub <ArrowUpRight size={12} /></a></div>
          <pre className="preview-stat mono max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-xl p-4 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">{readme.slice(0, 8000)}</pre>
        </div>
      )}
      <p className="mono mt-6 text-[11px] text-neutral-500">Source: GitHub API · Synced {r.last_synced_at ? new Date(r.last_synced_at).toLocaleString() : 'unknown'}</p>
    </div>
  );
}
