'use client';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, CircleDot, ExternalLink, GitFork, Scale, Star, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { Repo } from './RepoCard';
import CopyButton from './CopyButton';
import { CATEGORIES } from '@/lib/categories';
import { timeAgo } from '@/lib/format';

type Props = { repo: Repo | null; onClose: () => void; items?: Repo[]; onNavigate?: (repo: Repo) => void };

export default function RepoPreview({ repo, onClose, items, onNavigate }: Props) {
  const panel = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const isOpen = !!repo;
  const index = repo && items ? items.findIndex(item => item.full_name === repo.full_name) : -1;
  const previous = index > 0 ? items![index - 1] : null;
  const next = index >= 0 && index < items!.length - 1 ? items![index + 1] : null;

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      const typing = e.target instanceof Element && e.target.closest('input, textarea, select');
      if (!typing && onNavigate && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === 'ArrowLeft' && previous) { e.preventDefault(); onNavigate(previous); }
        if (e.key === 'ArrowRight' && next) { e.preventDefault(); onNavigate(next); }
      }
      if (e.key !== 'Tab') return;
      const nodes = panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]');
      if (!nodes?.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, onNavigate, isOpen, previous, next]);

  // Lock scroll and manage focus once per open, not on every step through the list.
  useEffect(() => {
    if (!isOpen) return;
    const origin = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLButtonElement>('[data-autofocus]')?.focus();
    return () => { document.body.style.overflow = overflow; origin?.focus(); };
  }, [isOpen]);

  useEffect(() => { panel.current?.scrollTo({ top: 0 }); }, [repo?.full_name]);

  const categories = repo ? ((repo as Repo & { categories?: string[] }).categories || [repo.category]).map(id => CATEGORIES.find(c => c.id === id)?.name).filter(Boolean) : [];
  const pushed = timeAgo(repo?.pushed_at);

  return (
    <AnimatePresence>
      {repo && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            ref={panel}
            role="dialog" aria-modal="true" aria-label={`${repo.full_name} preview`}
            initial={{ opacity: 0, x: reduced ? 0 : 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduced ? 0 : 40 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="preview-panel fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col overflow-auto shadow-2xl">
            <div className="preview-header sticky top-0 z-10 flex items-center justify-between gap-2 px-5 py-3">
              <span className="mono text-[10px] uppercase tracking-[.16em] text-neutral-500">Project preview</span>
              <div className="flex items-center gap-1">
                {onNavigate && index >= 0 && <>
                  <span className="mono mr-1 text-[10px] text-neutral-500" aria-live="polite">{index + 1} / {items!.length}</span>
                  <button onClick={() => previous && onNavigate(previous)} disabled={!previous} aria-label="Previous project" title="Previous (←)" className="preview-icon-button"><ChevronLeft size={16} /></button>
                  <button onClick={() => next && onNavigate(next)} disabled={!next} aria-label="Next project" title="Next (→)" className="preview-icon-button"><ChevronRight size={16} /></button>
                </>}
                <button data-autofocus onClick={onClose} aria-label="Close preview" title="Close (Esc)" className="preview-icon-button ml-1"><X size={16} /></button>
              </div>
            </div>
            <motion.div key={repo.full_name} initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .18 }} className="flex flex-1 flex-col p-6">
              <div className="flex items-start gap-4">
                {repo.avatar_url && <img src={repo.avatar_url} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-xl" />}
                <div className="min-w-0">
                  <p className="mono truncate text-xs text-neutral-500">{repo.owner} /</p>
                  <h2 className="break-words text-2xl font-semibold tracking-tight">{repo.name}</h2>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{repo.description || 'Explore this project on GitHub.'}</p>
              {categories.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{categories.map(name => <span key={name} className="rounded-full bg-purple-500/10 px-2.5 py-1 text-[11px] text-purple-700 dark:text-purple-300">{name}</span>)}</div>}
              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  { label: 'Stars', value: repo.stars.toLocaleString('en-US'), icon: Star },
                  { label: 'Forks', value: repo.forks.toLocaleString('en-US'), icon: GitFork },
                  { label: 'Open issues', value: typeof repo.open_issues === 'number' ? repo.open_issues.toLocaleString('en-US') : '—', icon: CircleDot },
                ].map(s => (
                  <div key={s.label} className="preview-stat rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-neutral-500"><s.icon size={11} />{s.label}</div>
                    <div className="mono mt-1.5 text-sm">{s.value}</div>
                  </div>
                ))}
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div><dt className="text-[10px] uppercase tracking-wide text-neutral-500">Language</dt><dd className="mt-1">{repo.language || 'Not specified'}</dd></div>
                <div><dt className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-neutral-500"><Scale size={10} />License</dt><dd className="mt-1">{repo.license_spdx || 'Not specified'}</dd></div>
                <div className="col-span-2"><dt className="text-[10px] uppercase tracking-wide text-neutral-500">Last push</dt><dd className="mt-1" title={repo.pushed_at ? new Date(repo.pushed_at).toLocaleString() : undefined}>{pushed || '—'}</dd></div>
              </dl>
              {repo.topics && repo.topics.length > 0 && <div className="mt-5 flex flex-wrap gap-1.5">{repo.topics.slice(0, 10).map(t => <span key={t} className="preview-topic mono rounded-md px-2 py-1 text-[10px]">{t}</span>)}</div>}
              <div className="preview-clone mt-6 flex items-center gap-2 rounded-xl py-2 pl-3 pr-2">
                <code className="mono min-w-0 flex-1 truncate text-[11px] text-neutral-500">git clone {repo.html_url}.git</code>
                <CopyButton text={`git clone ${repo.html_url}.git`} label="Copy" className="shrink-0 rounded-lg px-2.5 py-1.5 text-[11px]" />
              </div>
              <div className="mt-auto pt-6">
                <a href={repo.html_url} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black">
                  Visit GitHub <ExternalLink size={14} />
                </a>
                <Link href={`/repositories/${repo.full_name}`} onClick={onClose} className="preview-secondary mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm">Open full details <ArrowRight size={14} /></Link>
                <p className="mt-4 text-center text-[11px] text-neutral-500">Source: GitHub API. Stats reflect the last sync.{onNavigate && index >= 0 ? ' Use ← → to browse.' : ''}</p>
              </div>
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
