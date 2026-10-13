import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterRepos } from '../lib/store';
import catalog from '../data/catalog.json';
import { listSkills } from '../lib/catalog';
import { weeklyGrowth } from '../lib/snapshots';

test('bundled catalog has real projects across every browse category', () => {
  const repos = catalog.repositories;
  assert.ok(repos.length >= 20);
  for (const category of ['us-equity','crypto','quant','backtest','portfolio','findata','ai-agents','sentiment','ta','risk','derivatives']) {
    assert.ok(filterRepos(repos, { category }).length > 0, category);
  }
  const skills = listSkills(repos);
  assert.ok(skills.length >= 25);
  assert.equal(new Set(skills.map(skill => skill.id)).size, skills.length);
  for (const skill of skills) {
    assert.match(skill.source_url, /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[a-f0-9]{40}\/.+SKILL\.md$/);
    assert.ok(skill.verified_at);
  }
  const servers = repos.filter(r => r.is_mcp);
  assert.ok(servers.length >= 8);
  for (const server of servers) {
    assert.ok(server.mcp_source_url);
    assert.ok(server.mcp_verified_at);
  }
});

test('category membership supports multiple uses without duplicating projects', () => {
  const repos = [{ full_name: 'owner/project', category: 'crypto', categories: ['crypto', 'backtest'], stars: 20 }];
  assert.equal(filterRepos(repos, { category: 'backtest' }).length, 1);
  assert.equal(filterRepos(repos, { category: 'us-equity' }).length, 0);
});

test('weekly growth requires a real baseline; zero and negative growth stay valid', () => {
  const latest = { captured_at: '2026-10-12T12:00:00Z', stars: 100 };
  assert.equal(weeklyGrowth([], latest), null);
  assert.equal(weeklyGrowth([{ captured_at: '2026-10-10T12:00:00Z', stars: 90 }], latest), null);
  assert.equal(weeklyGrowth([{ captured_at: '2026-10-05T12:00:00Z', stars: 90 }], latest), 10);
  assert.equal(weeklyGrowth([{ captured_at: '2026-10-05T12:00:00Z', stars: 100 }], latest), 0);
  assert.equal(weeklyGrowth([{ captured_at: '2026-10-05T12:00:00Z', stars: 110 }], latest), -10);
});
