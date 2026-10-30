import { NextRequest, NextResponse } from 'next/server';
import { readCache, filterRepos } from '@/lib/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const repos = await readCache();
  const out = filterRepos(repos, {
    q: searchParams.get('q') || undefined,
    category: searchParams.get('category') || undefined,
    language: searchParams.get('language') || undefined,
    minStars: searchParams.get('minStars') ? Number(searchParams.get('minStars')) : undefined,
    sort: searchParams.get('sort') || 'popular',
  });
  // Same clamping as lib/search.ts: non-finite values fall back to the default,
  // otherwise floor and clamp to [1, 100].
  const limitParam = searchParams.get('limit');
  const limitParsed = limitParam === null ? 24 : Number(limitParam);
  const limit = Number.isFinite(limitParsed) ? Math.max(1, Math.min(100, Math.floor(limitParsed))) : 24;
  return NextResponse.json({ results: out.slice(0, limit), total: out.length, cached: repos.length > 0 });
}
