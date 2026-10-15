// Daily discovery: search GitHub for finance-related agent skills, MCP servers,
// AI agents, and top-starred finance projects; append genuinely new ones to
// data/sources.json. The regular `discover.ts --snapshot` run then picks them
// up for stats refresh + artifact verification.
//
// Usage: tsx scripts/discover-new.ts [--dry-run] [--max-add=10]
import { promises as fs } from 'fs';
import path from 'path';
import { searchRepos, checkSkillManifest, type GhRepo } from '../lib/github';
import { CATEGORIES } from '../lib/categories';

type Kind = 'skill' | 'mcp' | 'agent' | 'top';

const QUERIES: { q: string; kind: Kind; minStars: number; maxAgeDays: number; perPage: number }[] = [
  // --- agent skills (finance) ---
  { q: 'agent skill finance', kind: 'skill', minStars: 20, maxAgeDays: 365, perPage: 30 },
  { q: 'agent skill quantitative trading', kind: 'skill', minStars: 10, maxAgeDays: 365, perPage: 30 },
  { q: 'claude skill financial analysis', kind: 'skill', minStars: 10, maxAgeDays: 365, perPage: 30 },
  { q: 'SKILL.md stocks trading', kind: 'skill', minStars: 10, maxAgeDays: 365, perPage: 30 },
  // --- MCP servers (finance) ---
  { q: 'mcp server finance', kind: 'mcp', minStars: 10, maxAgeDays: 365, perPage: 30 },
  { q: 'model context protocol stocks', kind: 'mcp', minStars: 10, maxAgeDays: 365, perPage: 30 },
  { q: 'mcp server market data', kind: 'mcp', minStars: 10, maxAgeDays: 365, perPage: 30 },
  // --- AI agents (finance) ---
  { q: 'ai agent finance trading', kind: 'agent', minStars: 50, maxAgeDays: 365, perPage: 30 },
  { q: 'autonomous trading agent', kind: 'agent', minStars: 50, maxAgeDays: 365, perPage: 30 },
  { q: 'financial research agent llm', kind: 'agent', minStars: 20, maxAgeDays: 365, perPage: 30 },
  // --- top starred finance projects ---
  { q: 'quantitative finance stars:>1000', kind: 'top', minStars: 1000, maxAgeDays: 3650, perPage: 20 },
  { q: 'algorithmic trading stars:>1000', kind: 'top', minStars: 1000, maxAgeDays: 3650, perPage: 20 },
  { q: 'stock analysis stars:>1000', kind: 'top', minStars: 1000, maxAgeDays: 3650, perPage: 20 },
];

const FINANCE_RE = /financ|trad|stock|quant|portfolio|crypto|bitcoin|defi|blockchain|forex|option|future|backtest|invest|bank|fintech|market.?data|broker|hedge|equit|etf/i;
const MCP_RE = /mcp[ -]?server|model context protocol/i;

const CATEGORY_RULES: [RegExp, string][] = [
  [/crypto|bitcoin|defi|blockchain|web3/, 'crypto'],
  [/backtest/, 'backtest'],
  [/portfolio/, 'portfolio'],
  [/option|derivative|futures?/, 'derivatives'],
  [/sentiment|news/, 'sentiment'],
  [/risk/, 'risk'],
  [/technical|indicator/, 'ta'],
  [/market.?data|\bapi\b|dataset/, 'findata'],
  [/agent|skill|mcp|copilot|assistant/, 'ai-agents'],
  [/stock|equit|a-share|美股/, 'us-equity'],
];

const VALID_CATEGORIES = new Set(CATEGORIES.map(c => c.id));

function categorize(repo: GhRepo, kind: Kind): string[] {
  const hay = `${repo.full_name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`;
  const cats: string[] = [];
  for (const [re, id] of CATEGORY_RULES) {
    if (re.test(hay) && VALID_CATEGORIES.has(id) && !cats.includes(id)) cats.push(id);
  }
  if (!cats.length) cats.push(kind === 'top' ? 'quant' : 'ai-agents');
  return cats.slice(0, 2);
}

function isMcp(repo: GhRepo): boolean {
  const topics = repo.topics || [];
  if (topics.includes('mcp') || topics.includes('model-context-protocol')) return true;
  return MCP_RE.test(repo.full_name) || MCP_RE.test(repo.description || '');
}

function financeRelevant(repo: GhRepo): boolean {
  const hay = `${repo.full_name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`;
  return FINANCE_RE.test(hay);
}

function freshEnough(repo: GhRepo, maxAgeDays: number): boolean {
  return +new Date(repo.pushed_at) >= Date.now() - maxAgeDays * 86400000;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const maxAdd = Number(process.argv.find(a => a.startsWith('--max-add='))?.slice(10) || 10);
  const sourcesPath = path.join(process.cwd(), 'data', 'sources.json');
  const sources: { full_name: string; categories: string[]; skills?: any[]; mcp?: any }[] =
    JSON.parse(await fs.readFile(sourcesPath, 'utf8'));
  const known = new Set(sources.map(s => s.full_name.toLowerCase()));

  const candidates = new Map<string, { repo: GhRepo; queryIdx: Set<number> }>();

  async function searchWithRetry(q: string, perPage: number) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await searchRepos(q, perPage, 1);
      } catch (e: any) {
        const m = /rate limited until (\d+)/.exec(e.message || '');
        if (m && attempt < 2) {
          const waitMs = Math.max(0, Number(m[1]) * 1000 - Date.now() + 5000);
          console.log(`rate limited; sleeping ${(waitMs / 1000).toFixed(0)}s before retry`);
          await new Promise(r => setTimeout(r, waitMs));
          continue;
        }
        throw e;
      }
    }
    throw new Error('unreachable');
  }

  for (let i = 0; i < QUERIES.length; i++) {
    const { q, perPage } = QUERIES[i];
    try {
      const res = await searchWithRetry(q, perPage);
      for (const item of res.items || []) {
        const key = item.full_name.toLowerCase();
        if (known.has(key)) continue;
        if (!candidates.has(key)) candidates.set(key, { repo: item, queryIdx: new Set() });
        candidates.get(key)!.queryIdx.add(i);
      }
      console.log(`query "${q}": ${res.total_count} total, kept scanning top ${perPage}`);
    } catch (e: any) {
      console.error(`query failed "${q}": ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 4000)); // stay under search rate limits
  }
  // evaluate with per-kind gates (a kind only counts if one of its own queries returned the repo)
  const scored: { repo: GhRepo; kinds: Kind[]; entry: any; reason: string }[] = [];
  let checked = 0;
  for (const { repo, queryIdx } of candidates.values()) {
    if (!financeRelevant(repo)) continue;
    const kinds: Kind[] = [];
    for (const i of queryIdx) {
      const cfg = QUERIES[i];
      if (repo.stargazers_count < cfg.minStars) continue;
      if (!freshEnough(repo, cfg.maxAgeDays)) continue;
      if (!kinds.includes(cfg.kind)) kinds.push(cfg.kind);
    }
    if (!kinds.length) continue;

    const [owner, name] = repo.full_name.split('/');
    const entry: any = { full_name: repo.full_name, categories: categorize(repo, kinds[0]) };
    const reasons: string[] = [];

    if (kinds.includes('skill') || kinds.includes('agent')) {
      if (checked < 40) {
        checked++;
        const skillPath = await checkSkillManifest(owner, name);
        // Only nested skill manifests (e.g. skills/foo/SKILL.md). Repo-root
        // SKILL.md files are repo-level agent instructions, not shippable
        // skills, and the catalog test suite requires a nested path.
        if (skillPath && skillPath.includes('/')) {
          entry.skills = [{ path: skillPath, topics: ['Finance'] }];
          reasons.push(`skill:${skillPath}`);
        }
      }
    }
    if (kinds.includes('mcp') && isMcp(repo)) {
      entry.mcp = { path: 'README.md', topics: ['Finance'], transport: 'unknown', auth: 'unknown', publisher_status: 'community' };
      reasons.push('mcp');
    }
    if (kinds.includes('agent')) reasons.push('agent');
    if (kinds.includes('top')) reasons.push('top-starred');
    if (!kinds.includes('skill') && !kinds.includes('agent') && !kinds.includes('top') && !entry.mcp) continue;
    if (!entry.skills && !entry.mcp && !kinds.includes('top') && !kinds.includes('agent')) continue;

    scored.push({ repo, kinds, entry, reason: reasons.join('+') });
  }

  scored.sort((a, b) => b.repo.stargazers_count - a.repo.stargazers_count);
  // Diversity: reserve slots for skills and MCP (they'd otherwise lose to giant repos).
  const primary = (s: (typeof scored)[number]) => s.kinds[0];
  const selected: typeof scored = [];
  const take = (kind: Kind, n: number) => {
    let taken = 0;
    for (const s of scored.filter(s => primary(s) === kind)) {
      if (selected.length >= maxAdd || taken >= n) break;
      selected.push(s); taken++;
    }
  };
  take('skill', 3);
  take('mcp', 3);
  for (const s of scored) {
    if (selected.length >= maxAdd) break;
    if (!selected.includes(s)) selected.push(s);
  }

  console.log(`\nCandidates after gates: ${scored.length}; selecting ${selected.length} (skills/MCP prioritized).`);
  for (const s of selected) {
    console.log(`  + ${s.repo.full_name} ★${s.repo.stargazers_count} [${s.reason}] -> ${s.entry.categories.join(',')}`);
  }

  if (dryRun) {
    console.log('(dry run: sources.json not modified)');
    return;
  }
  if (selected.length) {
    const updated = [...sources, ...selected.map(s => s.entry)];
    await fs.writeFile(sourcesPath + '.tmp', JSON.stringify(updated, null, 2) + '\n');
    await fs.rename(sourcesPath + '.tmp', sourcesPath);
    console.log(`Appended ${selected.length} new sources to data/sources.json (${sources.length} -> ${updated.length}).`);
  } else {
    console.log('No new sources to add.');
  }
}

main().catch(e => { console.error(e); process.exitCode = 1; });
