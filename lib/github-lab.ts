export type WeeklyRepo = {
  github_id: number; full_name: string; owner: string; name: string; description: string | null;
  html_url: string; avatar_url: string; language: string | null; license: string | null;
  created_at: string; stars: number; forks: number; weekly_stars: number;
  contributors: number | null; commits_7d: number | null; topics: string[];
};
export type WeeklySnapshot = {
  captured_at: string; activity_since: string; source_url: string; candidate_count: number;
  repositories: WeeklyRepo[];
};

// GitHub publishes these counts in its public weekly Trending selection.
// A missing weekly count is excluded instead of being replaced with total stars.
export function parseWeeklyTrending(html: string) {
  const unique = new Map<string, { full_name: string; weekly_stars: number }>();
  const articles = html.matchAll(/<article\b[^>]*class="[^"]*\bBox-row\b[^"]*"[^>]*>([\s\S]*?)<\/article>/g);
  for (const [, article] of articles) {
    const heading = article.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1];
    const full_name = heading?.match(/href="\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)"/)?.[1];
    const count = article.match(/([\d,]+)\s+stars this week/i)?.[1];
    if (!full_name || !count) continue;
    const weekly_stars = Number(count.replaceAll(',', ''));
    if (Number.isSafeInteger(weekly_stars) && weekly_stars >= 0) unique.set(full_name.toLowerCase(), { full_name, weekly_stars });
  }
  return [...unique.values()].sort((a, b) => b.weekly_stars - a.weekly_stars || a.full_name.localeCompare(b.full_name));
}

export function normalizeMetric(value: number | null, maximum: number) {
  if (value === null || !Number.isFinite(value)) return null;
  return maximum > 0 ? Math.max(0, Math.min(100, value / maximum * 100)) : 0;
}

export const labMetrics = [
  { key: 'stars', label: 'Total stars' },
  { key: 'contributors', label: 'Contributors' },
  { key: 'weekly_stars', label: 'Weekly stars' },
  { key: 'commits_7d', label: 'Commits · 7d' },
  { key: 'forks', label: 'Forks' },
] as const;
export type LabMetric = typeof labMetrics[number]['key'];
