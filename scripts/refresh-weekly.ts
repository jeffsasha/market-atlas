import { promises as fs } from 'node:fs';
import { getRepo, getWeeklyActivity } from '../lib/github';
import { parseWeeklyTrending, WeeklyRepo, WeeklySnapshot } from '../lib/github-lab';

async function main() {
  const source_url = 'https://github.com/trending?since=weekly';
  const response = await fetch(source_url, { headers: { 'User-Agent': 'MarketAtlas', Accept: 'text/html' }, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`GitHub Trending returned ${response.status}; previous snapshot preserved.`);
  const candidates = parseWeeklyTrending(await response.text());
  if (candidates.length < 10) throw new Error(`Only ${candidates.length} weekly records found; previous snapshot preserved.`);
  const captured_at = new Date().toISOString();
  const activity_since = new Date(Date.now() - 7 * 86400000).toISOString();
  const repositories: WeeklyRepo[] = [];
  const chosen = candidates.slice(0, 10);
  // Three repositories at a time, with optional activity requests handled separately.
  for (let offset = 0; offset < chosen.length; offset += 3) {
    const batch = await Promise.all(chosen.slice(offset, offset + 3).map(async candidate => {
      const g = await getRepo(...candidate.full_name.split('/') as [string, string]);
      const activity = await getWeeklyActivity(g.full_name, activity_since);
      console.log(`Verified ${g.full_name}: +${candidate.weekly_stars} weekly stars`);
      return { github_id: g.id, full_name: g.full_name, owner: g.owner.login, name: g.name,
        description: g.description, html_url: g.html_url, avatar_url: g.owner.avatar_url,
        language: g.language, license: g.license?.spdx_id || null, created_at: g.created_at,
        stars: g.stargazers_count, forks: g.forks_count, weekly_stars: candidate.weekly_stars,
        contributors: activity.contributors, commits_7d: activity.commits_7d, topics: g.topics || [] };
    }));
    repositories.push(...batch);
  }
  if (new Set(repositories.map(repo => repo.github_id)).size !== 10) throw new Error('Duplicate repository IDs; previous snapshot preserved.');
  const snapshot: WeeklySnapshot = { captured_at, activity_since, source_url, candidate_count: candidates.length, repositories };
  await fs.mkdir('data', { recursive: true });
  for (const file of ['data/weekly-cache.json', ...(process.argv.includes('--snapshot') ? ['data/github-weekly.json'] : [])]) {
    await fs.writeFile(file + '.tmp', JSON.stringify(snapshot, null, 2) + '\n');
    await fs.rename(file + '.tmp', file);
  }
  console.log(`Saved 10 ranked repositories from ${candidates.length} weekly Trending candidates.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
