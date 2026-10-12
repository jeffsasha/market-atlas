'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, FlaskConical, Users } from 'lucide-react';

const badge = (s: string) => s === 'official'
  ? { icon: ShieldCheck, label: 'Official', cls: 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10' }
  : s === 'experimental'
  ? { icon: FlaskConical, label: 'Experimental', cls: 'text-amber-600 border-amber-500/30 bg-amber-500/10' }
  : { icon: Users, label: 'Community', cls: 'text-neutral-500 border-neutral-500/30 bg-neutral-500/10' };

export default function McpPage() {
  const [servers, setServers] = useState<any[]>([]);
  useEffect(() => { fetch('/api/mcp').then(r => r.json()).then(j => setServers(j.results || [])); }, []);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">MCP Servers</h1>
      <p className="text-sm text-neutral-500 mt-1 mb-6">Finance-related Model Context Protocol servers. “Official” only when verified from the publisher. Never auto-run install commands.</p>
      {servers.length === 0 ? <p className="text-sm text-neutral-500 py-12 text-center">No MCP servers indexed yet. Run <span className="mono">npm run seed</span>.</p> :
      <div className="grid md:grid-cols-2 gap-4">
        {servers.map(s => {
          const b = badge(s.publisher_status);
          const Icon = b.icon;
          return (
            <div key={s.name} className="border border-[#E7E5E4] dark:border-[#27272A] bg-white dark:bg-[#131316] rounded-lg p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="mono text-sm font-semibold truncate">{s.name}</div>
                <span className={`flex items-center gap-1 text-[11px] mono border rounded-full px-2 py-0.5 ${b.cls}`}><Icon size={11} />{b.label}</span>
              </div>
              <p className="text-[13px] text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">{s.description}</p>
              {s.trading_warning && (
                <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>Requests trading permissions or access to financial accounts. Review code before use.</span>
                </div>
              )}
              <div className="mono text-xs text-neutral-500 mt-3 space-y-1">
                <div>Transport: {s.transport}</div>
                {s.auth && <div>Auth: {s.auth}</div>}
              </div>
              <a href={s.github_url} target="_blank" rel="noreferrer" className="text-xs mono text-neutral-500 hover:text-black dark:hover:text-white mt-3 inline-block">GitHub ↗</a>
            </div>
          );
        })}
      </div>}
    </div>
  );
}
