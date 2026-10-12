import { promises as fs } from 'fs';
import path from 'path';

// File-backed cache for local dev / free-tier MVP without Supabase.
// In production with Supabase, API routes query Postgres instead.
// Cache is ONLY populated from real GitHub API responses (scripts/seed.ts).

const CACHE = path.join(process.cwd(), 'data', 'cache.json');

export type CachedRepo = Record<string, any> & { full_name: string };

export async function readCache(): Promise<CachedRepo[]> {
  try {
    const raw = await fs.readFile(CACHE, 'utf-8');
    const j = JSON.parse(raw);
    return j.repositories || [];
  } catch { return []; }
}

export async function writeCache(repos: CachedRepo[]) {
  await fs.mkdir(path.dirname(CACHE), { recursive: true });
  await fs.writeFile(CACHE, JSON.stringify({ repositories: repos, cached_at: new Date().toISOString() }, null, 2));
}

export function filterRepos(repos: CachedRepo[], opts: { q?: string; category?: string; language?: string; minStars?: number; sort?: string }) {
  let out = [...repos];
  if (opts.q) {
    const q = opts.q.toLowerCase();
    out = out.filter(r => (r.full_name + ' ' + (r.description || '') + ' ' + (r.topics || []).join(' ')).toLowerCase().includes(q));
  }
  if (opts.category && opts.category !== 'all') out = out.filter(r => r.category === opts.category);
  if (opts.language) out = out.filter(r => r.language === opts.language);
  if (opts.minStars) out = out.filter(r => (r.stars || 0) >= opts.minStars!);
  switch (opts.sort) {
    case 'stars': out.sort((a, b) => b.stars - a.stars); break;
    case 'updated': out.sort((a, b) => +new Date(b.pushed_at || 0) - +new Date(a.pushed_at || 0)); break;
    case 'created': out.sort((a, b) => +new Date(b.created_at || 0) - +new Date(a.created_at || 0)); break;
    case 'az': out.sort((a, b) => a.full_name.localeCompare(b.full_name)); break;
    case 'trending': out.sort((a, b) => (b.stars_growth_7d || -1) - (a.stars_growth_7d || -1)); break;
    default: out.sort((a, b) => b.stars - a.stars);
  }
  return out;
}
