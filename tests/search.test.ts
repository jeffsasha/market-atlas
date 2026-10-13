import assert from 'node:assert/strict';
import test from 'node:test';
import catalog from '../data/catalog.json';
import { buildSearchIndex, searchCatalog } from '../lib/search';

const repos = catalog.repositories;

test('search includes human-readable categories and matches all query words regardless of case', () => {
  const index = buildSearchIndex(repos);
  const equity = searchCatalog(index, '  US EQUITY research  ', 'projects', 20);
  assert.ok(equity.some(item => item.repository === 'openbq-org/OpenBB'));
  assert.ok(searchCatalog(index, 'quantitative trading', 'projects', 20).length > 0);
  assert.equal(searchCatalog(index, 'nonexistent-xyz-123', 'all', 20).length, 0);
});

test('skills and MCP servers remain individually searchable with valid source destinations', () => {
  const index = buildSearchIndex(repos);
  const skills = searchCatalog(index, '', 'skills', 20);
  assert.ok(skills.length > 1);
  assert.ok(skills.every(item => item.kind === 'skills' && item.href.startsWith('https://github.com/')));
  const name = skills[0].title;
  assert.ok(searchCatalog(index, name.toUpperCase(), 'skills', 20).some(item => item.id === skills[0].id));
  const mcp = searchCatalog(index, 'alpaca', 'mcp', 20);
  assert.ok(mcp.length > 0);
  assert.ok(mcp.every(item => item.kind === 'mcp'));
  assert.ok(mcp.some(item => item.repository === 'alpacahq/alpaca-mcp-server'));
  assert.equal(new Set(index.map(item => item.id)).size, index.length);
});

test('search keeps project navigation internal, applies safe result limits, and handles an empty catalog', () => {
  const index = buildSearchIndex(repos);
  const projects = searchCatalog(index, '', 'projects', 2);
  assert.equal(projects.length, 2);
  assert.ok(projects.every(item => item.href === `/repositories/${item.repository}`));
  assert.equal(searchCatalog(index, '', 'all', Number.NaN).length, 8);
  assert.equal(searchCatalog(index, '', 'all', 999).length, 20);
  assert.deepEqual(searchCatalog(buildSearchIndex([]), '', 'all'), []);
});

test('search API respects MCP scope and returns usable results when its limit is invalid', async () => {
  const { NextRequest } = await import('next/server');
  const { GET } = await import('../app/api/search/route');
  const response = await GET(new NextRequest('http://localhost/api/search?q=alpaca&type=mcp&limit=bad'));
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.ok(data.results.length > 0 && data.results.length <= 8);
  assert.ok(data.results.every((item: { kind: string }) => item.kind === 'mcp'));
  assert.equal(data.results[0].repository, 'alpacahq/alpaca-mcp-server');
});
