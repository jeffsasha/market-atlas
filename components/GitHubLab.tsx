'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, FlaskConical, GitFork, Heart, Star, TrendingUp, Users } from 'lucide-react';
import { MotionConfig } from 'framer-motion';
import RepoRadar from './RepoRadar';
import FloatingSurface from './FloatingSurface';
import type { WeeklySnapshot } from '@/lib/github-lab';

const compact = (value: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
const favoriteKey = 'ma-lab-favorites-v1';

export default function GitHubLab({ snapshot, initialRepo }: { snapshot: WeeklySnapshot; initialRepo?: string }) {
  const { repositories } = snapshot;
  const [selectedName, setSelectedName] = useState(initialRepo || repositories[0].full_name);
  const [comparisonName, setComparisonName] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [view, setView] = useState<'weekly' | 'favorites'>('weekly');
  const [savedReady, setSavedReady] = useState(false);
  const firstName = repositories[0].full_name;
  useEffect(() => {
    setSelectedName(initialRepo || firstName);
    setComparisonName('');
  }, [initialRepo, firstName]);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(favoriteKey) || '[]');
      if (Array.isArray(stored)) setFavorites(stored.filter(value => Number.isSafeInteger(value) && value > 0).slice(0, 100));
    } catch {}
    setSavedReady(true);
  }, []);
  const saved = repositories.filter(repo => favorites.includes(repo.github_id));
  const rows = view === 'favorites' ? saved : repositories;
  const repo = rows.find(item => item.full_name === selectedName) || rows[0];
  const comparison = repositories.find(item => item.full_name === comparisonName && item.github_id !== repo?.github_id);
  const rank = repo ? repositories.findIndex(item => item.github_id === repo.github_id) + 1 : 0;
  const captured = new Date(snapshot.captured_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Chicago' });
  const stale = Date.now() - new Date(snapshot.captured_at).getTime() > 48 * 3600000;

  function select(name: string) {
    setSelectedName(name);
    setComparisonName('');
    window.history.replaceState(null, '', `/lab?repo=${encodeURIComponent(name)}`);
  }
  function toggleFavorite(id: number) {
    const next = favorites.includes(id) ? favorites.filter(value => value !== id) : [...favorites, id];
    setFavorites(next);
    try { localStorage.setItem(favoriteKey, JSON.stringify(next)); } catch {}
  }

  return <MotionConfig reducedMotion="user"><div className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:pt-14">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div><p className="mono mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[.18em] market-accent"><FlaskConical size={13} />MarketAtlas / GitHub Lab</p><h1 className="text-4xl font-bold uppercase leading-[.95] tracking-tight sm:text-6xl">The week in<br /><span className="hero-gradient-text">open source.</span></h1><p className="mt-5 max-w-xl text-sm leading-relaxed text-neutral-500">Ten projects gaining attention across GitHub. Explore their momentum, compare their profiles, and keep your favorites close.</p></div>
      <div className="mono text-[10px] leading-relaxed text-neutral-400"><span className="mb-2 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />{stale ? 'Saved snapshot' : 'Latest captured snapshot'}</span><time dateTime={snapshot.captured_at}>{captured} CT</time><p>All languages · all project categories</p></div>
    </div>
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-border-light pb-5 dark:border-border-dark">
      <div role="group" aria-label="Lab view" className="flex gap-2"><button onClick={() => setView('weekly')} aria-pressed={view === 'weekly'} className={`lab-tab ${view === 'weekly' ? 'lab-tab-active' : ''}`}>Weekly top 10</button><button onClick={() => setView('favorites')} aria-pressed={view === 'favorites'} className={`lab-tab ${view === 'favorites' ? 'lab-tab-active' : ''}`}>Favorites <span className="mono ml-1 text-[10px] opacity-60">{savedReady ? saved.length : '—'}</span></button></div>
      <a href={snapshot.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-neutral-500">GitHub weekly source <ArrowUpRight size={13} /></a>
    </div>
    <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <section aria-label={view === 'weekly' ? 'Weekly repository ranking' : 'Saved repositories'} className="min-w-0">
        <div className="mb-3 flex justify-between px-2 text-[9px] uppercase tracking-widest text-neutral-400"><span>Project</span><span>Stars this week</span></div>
        <div className="space-y-2">{rows.map(item => <button key={item.github_id} onClick={() => select(item.full_name)} aria-pressed={repo?.github_id === item.github_id} aria-label={`Explore ${item.full_name}`} className={`lab-rank-row group flex w-full min-w-0 items-center gap-3 rounded-xl border p-3.5 text-left ${repo?.github_id === item.github_id ? 'border-purple-400/50 bg-purple-500/10' : 'border-transparent hover:bg-purple-500/5'}`}>
          <span className="mono w-5 shrink-0 text-[10px] text-neutral-400">{String(repositories.findIndex(value => value.github_id === item.github_id) + 1).padStart(2, '0')}</span><img src={item.avatar_url} width={28} height={28} alt="" className="h-7 w-7 shrink-0 rounded-lg" /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{item.name}</span><span className="mono mt-1 block truncate text-[9px] text-neutral-400">{item.owner}</span></span><span className="mono shrink-0 text-xs font-medium market-accent">+{compact(item.weekly_stars)}</span>
        </button>)}</div>
        {!rows.length && <p className="rounded-xl border border-dashed border-purple-400/30 p-5 text-sm leading-relaxed text-neutral-500">Save a project with the heart button. Your favorites from this top-10 snapshot will appear here.</p>}
        <p className="mt-5 px-2 text-[10px] leading-relaxed text-neutral-400">Ranked by reported weekly stars among {snapshot.candidate_count} projects on GitHub’s weekly Trending page. Favorites stay on this device.</p>
      </section>
      {repo ? <section aria-label={`${repo.full_name} profile`} className="lab-profile min-w-0 overflow-hidden rounded-2xl border border-border-light dark:border-border-dark">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-light px-6 py-4 dark:border-border-dark"><span className="mono text-[10px] uppercase tracking-widest text-neutral-400">Repository overview</span><span className="rounded-full bg-purple-500/10 px-3 py-1.5 text-[10px] font-medium text-purple-700 dark:text-purple-300">Weekly selection #{rank}</span></div>
        <div className="grid gap-6 p-6 xl:grid-cols-[1fr_1.1fr]">
          <div className="min-w-0">
            <div className="mb-5 flex items-start justify-between gap-3"><img src={repo.avatar_url} width={60} height={60} alt="" className="h-[60px] w-[60px] rounded-2xl" /><button onClick={() => toggleFavorite(repo.github_id)} disabled={!savedReady} aria-pressed={favorites.includes(repo.github_id)} aria-label={`${favorites.includes(repo.github_id) ? 'Unsave' : 'Save'} ${repo.full_name}`} className="rounded-full border border-border-light p-3 text-pink-500 transition-transform hover:scale-110 dark:border-border-dark"><Heart size={18} fill={favorites.includes(repo.github_id) ? 'currentColor' : 'none'} /></button></div>
            <p className="mono mb-1 break-all text-xs text-neutral-400">{repo.owner} /</p><h2 className="break-words text-3xl font-semibold tracking-tight">{repo.name}</h2><p className="mt-4 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{repo.description || 'Explore the project and its source code on GitHub.'}</p>
            <div className="mt-6 flex flex-wrap items-center gap-5 text-neutral-500"><span className="flex items-center gap-2 text-sm" title="Total stars"><Star size={15} className="text-pink-400" /><strong className="text-neutral-900 dark:text-white">{compact(repo.stars)}</strong></span><span className="flex items-center gap-2 text-sm" title="Forks"><GitFork size={15} /><strong className="text-neutral-900 dark:text-white">{compact(repo.forks)}</strong></span><span className="flex items-center gap-2 text-sm" title="Contributors, including anonymous"><Users size={15} /><strong className="text-neutral-900 dark:text-white">{repo.contributors === null ? '—' : compact(repo.contributors)}</strong></span></div>
            <div className="mt-6 grid grid-cols-2 gap-4 border-y border-border-light py-5 dark:border-border-dark"><div><p className="mono text-[9px] uppercase tracking-widest text-neutral-400">Weekly stars</p><p className="mt-2 text-2xl font-semibold market-accent">+{compact(repo.weekly_stars)}</p></div><div><p className="mono text-[9px] uppercase tracking-widest text-neutral-400">Commits · 7 days</p><p className="mt-2 text-2xl font-semibold">{repo.commits_7d === null ? '—' : repo.commits_7d.toLocaleString('en-US')}</p></div></div>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-xs"><div><dt className="text-[10px] text-neutral-400">Language</dt><dd className="mt-1">{repo.language || 'Not specified'}</dd></div><div><dt className="text-[10px] text-neutral-400">License</dt><dd className="mt-1">{repo.license || 'Not specified'}</dd></div><div className="col-span-2"><dt className="text-[10px] text-neutral-400">Created</dt><dd className="mt-1">{new Date(repo.created_at).toLocaleDateString('en-US',{dateStyle:'medium',timeZone:'America/Chicago'})}</dd></div></dl>
          </div>
          <div className="min-w-0"><div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-xs font-semibold">Project profile</h3><span className="mono text-[9px] uppercase tracking-wider text-neutral-400">Relative scale</span></div><RepoRadar repo={repo} comparison={comparison} all={repositories} /><label className="mt-6 block text-[10px] uppercase tracking-wider text-neutral-400">Compare with<select aria-label="Compare repository" value={comparisonName} onChange={event => setComparisonName(event.target.value)} className="mt-2 block w-full min-w-0 rounded-lg border border-border-light bg-transparent p-2.5 text-xs normal-case tracking-normal text-neutral-700 dark:border-border-dark dark:text-neutral-300"><option value="">Choose another project</option>{repositories.filter(item => item.github_id !== repo.github_id).map(item => <option key={item.github_id} value={item.full_name}>{item.full_name}</option>)}</select></label>{comparison && <div className="mt-3 flex flex-wrap gap-3 text-[10px]"><span className="text-purple-600 dark:text-purple-300">● {repo.name}</span><span className="text-pink-500">● {comparison.name}</span></div>}</div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border-light px-6 py-4 dark:border-border-dark"><div className="flex flex-wrap gap-2">{repo.topics.slice(0,4).map(topic => <span key={topic} className="rounded-full bg-purple-500/5 px-2.5 py-1 text-[9px] text-neutral-500">{topic}</span>)}</div><div className="flex gap-4 text-xs"><a href={`https://www.star-history.com/${repo.full_name}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-neutral-500">Star History <ArrowUpRight size={12} /></a><a href={repo.html_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-medium market-accent">GitHub <ArrowUpRight size={12} /></a></div></div>
      </section> : <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-dashed border-purple-400/30 p-10 text-center text-neutral-500"><div><Heart size={30} className="mx-auto mb-4 text-pink-400" /><h2 className="font-semibold">Your next discovery belongs here.</h2><p className="mt-2 text-sm">Open Weekly top 10 and save a project to get started.</p></div></div>}
    </div>
    <FloatingSurface className="mt-8 rounded-xl border border-border-light p-5 dark:border-border-dark"><p className="flex items-center gap-2 text-xs font-medium"><TrendingUp size={14} className="text-purple-400" />How this ranking works</p><p className="mt-2 text-xs leading-relaxed text-neutral-500">Weekly star counts come from GitHub’s public Trending page; repository facts, contributors, and seven-day default-branch commits come from the GitHub REST API. The snapshot is refreshed separately from the financial catalog. Missing activity metrics appear as unavailable. Favorites do not change your GitHub account.</p></FloatingSurface>
  </div></MotionConfig>;
}
