import { NextRequest, NextResponse } from 'next/server';
import { readCache, filterRepos } from '@/lib/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const limit = Math.min(Number(searchParams.get('limit') || 8), 20);
  if (!q.trim()) return NextResponse.json({ results: [] });
  const repos = await readCache();
  const out = filterRepos(repos, { q, sort: 'popular' }).slice(0, limit);
  return NextResponse.json({ results: out });
}
