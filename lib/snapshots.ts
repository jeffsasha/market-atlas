export type Snapshot = { captured_at: string; stars: number };

// Only compare against a real observation at least seven days old and at most
// eight days old. A missing daily run must not become fabricated weekly growth.
export function weeklyGrowth(history: Snapshot[], latest: Snapshot): number | null {
  const day = 86400000;
  const target = +new Date(latest.captured_at) - 7 * day;
  const baseline = history.filter(s => +new Date(s.captured_at) <= target && +new Date(s.captured_at) >= target - day)
    .sort((a, b) => +new Date(b.captured_at) - +new Date(a.captured_at))[0];
  return baseline ? latest.stars - baseline.stars : null;
}
