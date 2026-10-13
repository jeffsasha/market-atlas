'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Star } from 'lucide-react';
import FloatingSurface from '@/components/FloatingSurface';

type Server = { name: string; description: string | null; github_url: string; source_url: string; transport: string; auth: string | null; publisher_status: string; trading_warning: boolean; topics: string[]; stars: number; license: string | null; verified_at: string | null };
const topics = ['All', 'Finance', 'Crypto'];
export default function McpPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [topic, setTopic] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/mcp', { signal: controller.signal }).then(response => { if (!response.ok) throw new Error('Catalog unavailable'); return response.json(); }).then(data => setServers(data.results || [])).catch(error => { if (error.name !== 'AbortError') setError(true); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  const matches = (server: Server, filter: string) => filter === 'All' || server.topics.includes(filter);
  const filtered = servers.filter(server => matches(server, topic));
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
      <p className="mono mb-3 text-[10px] uppercase tracking-widest market-accent">Explore / 03</p>
      <h1 className="text-4xl font-bold uppercase tracking-tight sm:text-6xl">MCP Servers</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-500">Connect your AI workspace to financial statements, market data, and crypto networks. Explore the tools and their upstream setup guides.</p>
      {!loading && !error && <p className="mono mt-4 text-[11px] text-neutral-400">{servers.length} documented servers · source links checked on GitHub</p>}
      {loading ? <p role="status" className="py-12 text-center text-sm text-neutral-500">Loading catalog…</p> : error ? <p role="alert" className="py-12 text-center text-sm text-neutral-500">Could not load the catalog. Please reload to try again.</p> : <>
        <div role="group" aria-label="MCP topics" className="my-8 flex flex-wrap gap-2">{topics.map(filter => <button key={filter} aria-pressed={topic === filter} onClick={() => setTopic(filter)} className={`rounded-full border px-4 py-2 text-xs transition-colors ${topic === filter ? 'border-purple-500 bg-purple-600 text-white dark:bg-fuchsia-300 dark:text-purple-950' : 'border-border-light text-neutral-500 hover:border-purple-400 dark:border-border-dark'}`}>{filter} <span className="mono ml-1 opacity-60">{servers.filter(server => matches(server, filter)).length}</span></button>)}</div>
        <p className="mb-4 text-xs text-neutral-500" aria-live="polite">{filtered.length} servers to explore</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filtered.map(server => <FloatingSurface key={server.name} className="border border-border-light bg-white dark:border-border-dark dark:bg-surface-dark">
          <article className="flex h-full min-w-0 flex-col p-5">
            <div className="mb-4 flex flex-wrap gap-1.5">{server.topics.map(tag => <span key={tag} className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">{tag}</span>)}<span className="rounded-full border border-border-light px-2.5 py-1 text-[10px] text-neutral-500 dark:border-border-dark">{server.publisher_status === 'official' ? 'Publisher maintained' : 'Community'}</span></div>
            <h2 className="break-words text-lg font-semibold tracking-tight">{server.name.split('/')[1]}</h2>
            <p className="mb-5 mt-2 line-clamp-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{server.description || 'Explore this server’s documentation on GitHub.'}</p>
            {server.trading_warning && <p className="mb-4 text-[10px] text-amber-700 dark:text-amber-300">Supports trading or wallet transactions.</p>}
            <dl className="mt-auto space-y-2 text-[11px] leading-relaxed"><div><dt className="inline text-neutral-400">Transport </dt><dd className="inline text-neutral-600 dark:text-neutral-300">{server.transport}</dd></div><div><dt className="inline text-neutral-400">Access </dt><dd className="inline text-neutral-600 dark:text-neutral-300">{server.auth || 'See upstream documentation'}</dd></div></dl>
            <p className="mono mt-4 truncate text-[10px] text-neutral-400" title={server.name}>{server.name}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-neutral-500"><span className="flex items-center gap-1" title="Repository stars"><Star size={11} />{server.stars.toLocaleString('en-US')}</span><span>{server.license || 'License not specified'}</span></div>
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-border-light pt-4 dark:border-border-dark"><span className="flex items-center gap-1 text-[10px] text-neutral-500" title={server.verified_at ? `Documentation checked ${server.verified_at.slice(0, 10)}` : undefined}><CheckCircle2 size={12} className="text-purple-500" />Source checked</span><a href={server.source_url} target="_blank" rel="noreferrer" aria-label={`View ${server.name} documentation on GitHub`} className="flex items-center gap-1 text-xs font-medium market-accent">Setup guide <ArrowUpRight size={13} /></a></div>
          </article>
        </FloatingSurface>)}</div>
        {!filtered.length && <p className="py-12 text-sm text-neutral-500">No servers in this topic yet.</p>}
      </>}
    </div>
  );
}
