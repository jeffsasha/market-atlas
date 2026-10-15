// Refresh an explicitly categorized catalog from GitHub; no invented metrics.
// Optional GITHUB_TOKEN raises public API rate limits. --snapshot updates the
// checked-in fallback as well as the local cache, ready for review in Git.
import { promises as fs } from 'fs';
import path from 'path';
import sources from '../data/sources.json';
import { getRepo, toRepoRecord } from '../lib/github';
import { readCache, writeCache, CachedRepo } from '../lib/store';
import { Snapshot, weeklyGrowth } from '../lib/snapshots';
import { refreshArtifacts, CatalogSource } from '../lib/artifacts';

async function main() {
  const previous = await readCache();
  const records = new Map(previous.map(r => [r.github_id, r]));
  const now = new Date().toISOString();
  const historyFile = path.join(process.cwd(), 'data', 'history.json');
  let history: Record<string, Snapshot[]> = {};
  try { history = JSON.parse(await fs.readFile(historyFile, 'utf8')); }
  catch (e: any) { if (e.code !== 'ENOENT') throw e; }
  let refreshed = 0;
  const only = process.argv.find(arg => arg.startsWith('--only='))?.slice(7).split(',');
  const selected = only ? sources.filter(source => only.includes(source.full_name)) : sources;
  if (!selected.length) throw new Error('No matching catalog sources.');
  for (const source of selected) {
    try {
      const g = await getRepo(...source.full_name.split('/') as [string, string]);
      const prior = records.get(g.id);
      const samples = history[g.full_name] || (prior?.last_synced_at ? [{ captured_at: prior.last_synced_at, stars: prior.stars }] : []);
      const latest = { captured_at: now, stars: g.stargazers_count };
      let repo: CachedRepo = { ...prior, ...toRepoRecord(g, source.categories[0]), categories: source.categories, last_synced_at: now, stars_growth_7d: weeklyGrowth(samples, latest), has_skill_md: prior?.has_skill_md || false, is_mcp: prior?.is_mcp || false };
      repo = await refreshArtifacts(repo, source as CatalogSource, g.default_branch, now);
      // Clear stale artifacts: if the source no longer declares skills/MCP,
      // previously verified data must not linger in the record.
      if (!source.skills) {
        repo.skills = []; repo.has_skill_md = false;
        delete repo.skill_path; delete repo.skill_source_url;
      }
      if (!source.mcp) {
        repo.is_mcp = false;
        for (const k of ['mcp_source_url', 'mcp_source_ref', 'mcp_source_sha', 'mcp_verified_at', 'mcp_description', 'mcp_topics', 'mcp_transport', 'mcp_auth', 'mcp_status', 'mcp_trading_warning']) delete repo[k];
      }
      records.set(g.id, repo);
      history[g.full_name] = [...samples.filter(s => s.captured_at.slice(0, 10) !== now.slice(0, 10) && +new Date(s.captured_at) >= Date.now() - 60 * 86400000), latest];
      refreshed++;
      console.log(`Refreshed ${g.full_name}`);
    } catch (error: any) {
      console.error(`Preserving previous data for ${source.full_name}: ${error.message}`);
    }
  }
  if (!refreshed) throw new Error('No repositories refreshed. Existing catalog was preserved.');
  // Full runs only (--only= skips this): drop records whose source was removed
  // from data/sources.json, keeping the catalog exactly in sync with the
  // curated list.
  if (!only) {
    const valid = new Set(selected.map(s => s.full_name.toLowerCase()));
    for (const [id, repo] of records) {
      if (!valid.has((repo.full_name || '').toLowerCase())) {
        records.delete(id);
        console.log(`Pruned ${repo.full_name} (no longer in sources.json)`);
      }
    }
  }
  const repos = [...records.values()].sort((a, b) => b.stars - a.stars);
  await writeCache(repos);
  await fs.writeFile(historyFile, JSON.stringify(history, null, 2) + '\n');
  if (process.argv.includes('--snapshot')) await fs.writeFile(path.join(process.cwd(), 'data', 'catalog.json'), JSON.stringify({ repositories: repos, cached_at: now, count: repos.length }, null, 2) + '\n');
  console.log(`Refreshed ${refreshed}/${selected.length}; serving ${repos.length} real projects.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
