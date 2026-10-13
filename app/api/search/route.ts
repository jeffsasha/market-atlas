import { NextRequest, NextResponse } from 'next/server';
import { readCache } from '@/lib/store';
import { buildSearchIndex, searchCatalog, SearchKind } from '@/lib/search';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  if (!query.trim()) return NextResponse.json({ results: [] });
  const requested = searchParams.get('type') || 'all';
  const kind: SearchKind = ['projects', 'skills', 'mcp'].includes(requested) ? requested as SearchKind : 'all';
  const results = searchCatalog(buildSearchIndex(await readCache()), query, kind, Number(searchParams.get('limit') || 8));
  return NextResponse.json({ results });
}
