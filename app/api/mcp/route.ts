import { NextResponse } from 'next/server';
import { readCache } from '@/lib/store';

export async function GET() {
  const repos = await readCache();
  const servers = repos.filter(r => r.is_mcp).map(r => ({
    name: r.full_name, description: r.description, github_url: r.html_url,
    transport: r.mcp_transport || 'unknown', auth: r.mcp_auth || null,
    publisher_status: r.mcp_status || 'community',
    trading_warning: !!r.mcp_trading_warning,
    last_updated: r.pushed_at, license: r.license_spdx,
  }));
  return NextResponse.json({ results: servers, note: 'Official status only when verified from publisher.' });
}
