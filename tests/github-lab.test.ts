import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseWeeklyTrending, normalizeMetric } from '../lib/github-lab';

const row = (name: string, count: string) => `<article class="Box-row"><h2><a href="/${name}">Repo</a></h2><span class="float-sm-right">${count} stars this week</span></article>`;

test('weekly ranking uses reported weekly stars, deduplicates repositories, and ignores missing metrics', () => {
  const html = row('a/first','1,234') + row('b/second','9,000') + row('a/first','1,234') + '<article class="Box-row"><h2><a href="/c/unknown">Unknown</a></h2></article>';
  assert.deepEqual(parseWeeklyTrending(html).map(repo => [repo.full_name, repo.weekly_stars]), [['b/second',9000],['a/first',1234]]);
  assert.deepEqual(parseWeeklyTrending('<html>GitHub unavailable</html>'), []);
});

test('radar normalization distinguishes unavailable data from zero and stays within its scale', () => {
  assert.equal(normalizeMetric(null,100), null);
  assert.equal(normalizeMetric(0,100),0);
  assert.equal(normalizeMetric(50,100),50);
  assert.equal(normalizeMetric(200,100),100);
  assert.equal(normalizeMetric(0,0),0);
});

test('bundled Lab snapshot has ten unique repositories ordered by weekly growth', async () => {
  const { default: snapshot } = await import('../data/github-weekly.json');
  assert.equal(snapshot.repositories.length, 10);
  assert.equal(new Set(snapshot.repositories.map(repo => repo.github_id)).size, 10);
  assert.equal(snapshot.source_url, 'https://github.com/trending?since=weekly');
  assert.ok(Number.isFinite(Date.parse(snapshot.captured_at)));
  snapshot.repositories.forEach((repo, index) => {
    assert.ok(Number.isSafeInteger(repo.weekly_stars) && repo.weekly_stars >= 0);
    assert.ok(repo.html_url.startsWith('https://github.com/'));
    if (index) assert.ok(snapshot.repositories[index - 1].weekly_stars >= repo.weekly_stars);
  });
});
