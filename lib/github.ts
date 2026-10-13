// Server-only GitHub client. Token never leaves the server.
const API = 'https://api.github.com';

function headers() {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'MarketAtlas/0.1',
  };
  const tok = process.env.GITHUB_TOKEN;
  if (tok) h.Authorization = `Bearer ${tok}`;
  return h;
}

async function gh(path: string, init?: RequestInit) {
  const res = await fetch(API + path, { signal: AbortSignal.timeout(20000), ...init, headers: { ...headers(), ...(init?.headers || {}) }, next: { revalidate: 3600 } });
  if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
    const reset = res.headers.get('x-ratelimit-reset');
    throw new Error(`GitHub rate limited until ${reset}`);
  }
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
  return res.json();
}

export type GhRepo = {
  id: number; full_name: string; owner: { login: string; avatar_url: string };
  name: string; description: string | null; html_url: string; homepage: string | null;
  language: string | null; stargazers_count: number; forks_count: number; open_issues_count: number;
  license: { spdx_id: string } | null; topics: string[]; created_at: string; pushed_at: string; updated_at: string;
  default_branch: string;
};

export async function searchRepos(query: string, perPage = 30, page = 1) {
  const q = encodeURIComponent(query);
  return gh(`/search/repositories?q=${q}&sort=stars&order=desc&per_page=${perPage}&page=${page}`) as Promise<{ total_count: number; items: GhRepo[] }>;
}

export async function getRepo(owner: string, repo: string) {
  return gh(`/repos/${owner}/${repo}`) as Promise<GhRepo>;
}

export async function getRepoRef(fullName: string, branch: string): Promise<string> {
  const ref = await gh(`/repos/${fullName}/git/ref/heads/${encodeURIComponent(branch)}`);
  return ref.object.sha;
}

export async function getReadme(owner: string, repo: string) {
  try {
    const j = await gh(`/repos/${owner}/${repo}/readme`, { headers: { Accept: 'application/vnd.github.raw' } });
    return typeof j === 'string' ? j : JSON.stringify(j).slice(0, 20000);
  } catch { return null; }
}

export async function checkSkillManifest(owner: string, repo: string): Promise<string | null> {
  const candidates = ['SKILL.md', 'skills/SKILL.md', '.claude/skills/SKILL.md', 'skill/SKILL.md'];
  for (const p of candidates) {
    try { await gh(`/repos/${owner}/${repo}/contents/${p}`); return p; } catch {}
  }
  return null;
}

export function toRepoRecord(g: GhRepo, category?: string) {
  const [owner, name] = g.full_name.split('/');
  return {
    github_id: g.id, owner, name, full_name: g.full_name,
    description: g.description, html_url: g.html_url, homepage: g.homepage,
    language: g.language, stars: g.stargazers_count, forks: g.forks_count,
    open_issues: g.open_issues_count, license_spdx: g.license?.spdx_id || null,
    topics: g.topics || [], created_at: g.created_at, pushed_at: g.pushed_at, updated_at: g.updated_at,
    avatar_url: g.owner.avatar_url, category: category || null,
    stars_growth_7d: null as number | null, // filled from snapshots when available
  };
}

// Count paginated public records without downloading every contributor/commit.
async function pageCount(endpoint: string): Promise<number | null> {
  const response = await fetch(API + endpoint, { headers: headers(), signal: AbortSignal.timeout(20000) });
  if (response.status === 204) return 0;
  if (!response.ok) throw new Error(`GitHub activity ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) return null;
  const link = response.headers.get('link') || '';
  const last = link.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/);
  return last ? Number(last[1]) : link.includes('rel="next"') ? null : data.length;
}

export async function getWeeklyActivity(fullName: string, since: string) {
  const results = await Promise.allSettled([
    pageCount(`/repos/${fullName}/contributors?anon=true&per_page=1`),
    pageCount(`/repos/${fullName}/commits?since=${encodeURIComponent(since)}&per_page=1`),
  ]);
  return {
    contributors: results[0].status === 'fulfilled' ? results[0].value : null,
    commits_7d: results[1].status === 'fulfilled' ? results[1].value : null,
  };
}
