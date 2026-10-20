export const compact = (value: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

const units: [Intl.RelativeTimeFormatUnit, number][] = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
const relative = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

/** "3 days ago" style label; empty string for missing or invalid dates. */
export function timeAgo(date: string | null | undefined, now = Date.now()) {
  const time = date ? new Date(date).getTime() : NaN;
  if (!Number.isFinite(time)) return '';
  const seconds = Math.round((time - now) / 1000);
  for (const [unit, size] of units) if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  return 'just now';
}

const normalize = (text: string) => text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();

/** True when every whitespace-separated word of `query` appears in one of `fields`. */
export function matchesQuery(query: string, fields: (string | null | undefined)[]) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = normalize(fields.filter(Boolean).join(' '));
  return words.every(word => haystack.includes(word));
}
