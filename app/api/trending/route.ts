import { NextRequest, NextResponse } from 'next/server';
import { readCache } from '@/lib/store';

// Trending must use verified historical growth, never total stars as growth.
// With file-cache MVP, stars_growth_7d is null until snapshots exist → we return
// repos sorted by stars but growth shows as n/a, and flag verified:false.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get('limit') || 20), 100);
  const repos = await readCache();
  const withGrowth = repos.filter(r => typeof r.stars_growth_7d === 'number').sort((a, b) => b.stars_growth_7d - a.stars_growth_7d);
  const verified = withGrowth.length > 0;
  const results = (verified ? withGrowth : [...repos].sort((a, b) => b.stars - a.stars)).slice(0, limit);
  return NextResponse.json({ results, verified, note: verified ? '7-day star growth from snapshots' : 'insufficient snapshot history — growth unavailable' });
}
