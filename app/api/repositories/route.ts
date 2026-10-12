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
  const limit = Math.min(Number(searchParams.get('limit') || 24), 100);
  return NextResponse.json({ results: out.slice(0, limit), total: out.length, cached: repos.length > 0 });
}
