'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, GitFork, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';
import type { Repo } from './RepoCard';

export default function RepoPreview({ repo, onClose }: { repo: Repo | null; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <AnimatePresence>
      {repo && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            role="dialog" aria-modal="true" aria-label={`${repo.full_name} preview`}
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-[#131316] border-l border-[#E7E5E4] dark:border-[#27272A] shadow-2xl overflow-auto p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="mono font-semibold">{repo.full_name}</div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{repo.description}</p>
              </div>
              <button onClick={onClose} aria-label="Close preview" className="p-1.5 border rounded-lg"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: 'Stars', value: repo.stars.toLocaleString(), icon: Star },
                { label: 'Forks', value: repo.forks.toLocaleString(), icon: GitFork },
                { label: 'Language', value: repo.language || '—', icon: null },
              ].map(s => (
                <div key={s.label} className="border border-[#E7E5E4] dark:border-[#27272A] rounded-lg p-3">
                  <div className="text-[11px] uppercase tracking-wide text-neutral-400">{s.label}</div>
                  <div className="mono text-sm mt-1">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs mono text-neutral-500 space-y-1">
              {repo.license_spdx && <div>License: {repo.license_spdx}</div>}
              {repo.pushed_at && <div>Last push: {new Date(repo.pushed_at).toLocaleString()}</div>}
              {repo.topics && repo.topics.length > 0 && <div className="flex flex-wrap gap-1 pt-1">{repo.topics.slice(0, 8).map(t => <span key={t} className="border rounded px-1.5 py-0.5">{t}</span>)}</div>}
            </div>
            <a href={repo.html_url} target="_blank" rel="noreferrer"
              className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 transition-opacity">
              Visit GitHub <ExternalLink size={14} />
            </a>
            <a href={`/repositories/${repo.full_name}`} className="mt-2 block text-center text-sm text-neutral-500 hover:text-black dark:hover:text-white">Open full detail page →</a>
            <p className="mt-4 text-[11px] text-neutral-400">Source: GitHub API. Stats reflect last sync.</p>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
