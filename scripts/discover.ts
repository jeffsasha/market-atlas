// Real GitHub discovery — no mock data. Run with GITHUB_TOKEN set.
// Usage: npm run discover  (writes data/cache.json)

const API = 'https://api.github.com';
const token = process.env.GITHUB_TOKEN;

const QUERIES: { q: string; category: string }[] = [
  { q: 'stock analysis language:python stars:>200', category: 'us-equity' },
  { q: 'financial modeling valuation language:python stars:>100', category: 'us-equity' },
  { q: 'quantitative finance backtesting stars:>300', category: 'backtest' },
  { q: 'algorithmic trading framework stars:>300', category: 'quant' },
  { q: 'portfolio optimization python stars:>100', category: 'portfolio' },
  { q: 'cryptocurrency trading bot stars:>300', category: 'crypto' },
  { q: 'blockchain analytics defi stars:>100', category: 'crypto' },
  { q: 'financial data api stocks stars:>100', category: 'findata' },
  { q: 'ai agent finance stock research stars:>50', category: 'ai-agents' },
  { q: 'mcp server finance stocks modelcontextprotocol', category: 'findata' },
  { q: 'technical analysis indicators python stars:>200', category: 'ta' },
];

async function gh(path: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(API + path, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'MarketAtlas-Discovery/0.1',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
      const reset = Number(res.headers.get('x-ratelimit-reset') || 0) * 1000;
      const wait = Math.max(reset - Date.now(), 1000);
      console.log(`Rate limited, waiting ${Math.ceil(wait / 1000)}s…`);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }
    if (res.status >= 500 && i < retries - 1) { await new Promise(r => setTimeout(r, 1000 * 2 ** i)); continue; }
    if (!res.ok) throw new Error(`GitHub ${res.status} ${path}: ${await res.text().then(t => t.slice(0, 200))}`);
    return res.json();
  }
  throw new Error('retries exhausted');
}

async function main() {
  const seen = new Map<number, any>();
  for (const { q, category } of QUERIES) {
    console.log(`Query: ${q}`);
    try {
      const data = await gh(`/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=30&page=1`);
      for (const item of data.items || []) {
        if (!seen.has(item.id)) {
          const [owner, name] = (item.full_name as string).split('/');
          seen.set(item.id, {
            github_id: item.id, owner, name, full_name: item.full_name,
            description: item.description, html_url: item.html_url, homepage: item.homepage,
            language: item.language, stars: item.stargazers_count, forks: item.forks_count,
            open_issues: item.open_issues_count, license_spdx: item.license?.spdx_id || null,
            topics: item.topics || [], created_at: item.created_at, pushed_at: item.pushed_at,
            updated_at: item.updated_at, avatar_url: item.owner?.avatar_url,
            category, stars_growth_7d: null, last_synced_at: new Date().toISOString(),
            has_skill_md: false, is_mcp: (item.topics || []).includes('mcp') || /mcp/i.test(item.description || ''),
          });
        }
      }
    } catch (e: any) { console.error(`  failed: ${e.message}`); }
    await new Promise(r => setTimeout(r, 2000)); // respect search rate limits
  }

  // Verify SKILL.md for candidates (name suggests skill)
  const candidates = Array.from(seen.values()).filter(r => /skill|agent/i.test(r.full_name + ' ' + (r.description || ''))).slice(0, 20);
  for (const r of candidates) {
    for (const p of ['SKILL.md', 'skills/SKILL.md']) {
      try { await gh(`/repos/${r.full_name}/contents/${p}`); r.has_skill_md = true; r.skill_path = p; console.log(`  skill verified: ${r.full_name} @ ${p}`); break; }
      catch {}
    }
    await new Promise(r => setTimeout(r, 500));
  }

  const repos = Array.from(seen.values()).sort((a, b) => b.stars - a.stars);
  const fs = await import('fs/promises');
  const path = await import('path');
  const out = path.join(process.cwd(), 'data', 'cache.json');
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, JSON.stringify({ repositories: repos, cached_at: new Date().toISOString(), count: repos.length }, null, 2));
  console.log(`Wrote ${repos.length} real repositories to data/cache.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
