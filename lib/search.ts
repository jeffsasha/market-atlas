import { CATEGORIES } from './categories';
import { listSkills } from './catalog';

export type SearchKind = 'all' | 'projects' | 'skills' | 'mcp';
export type SearchItem = {
  id: string; kind: Exclude<SearchKind, 'all'>; title: string; description: string;
  repository: string; full_name: string; href: string; category: string; stars: number;
  searchText: string;
};
type SearchRepo = Parameters<typeof listSkills>[0][number] & {
  categories?: string[]; category?: string | null; topics?: string[]; is_mcp?: boolean;
  mcp_description?: string; mcp_topics?: string[]; mcp_source_url?: string;
};
const normalize = (text: string) => text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().trim();

export function buildSearchIndex(repos: SearchRepo[]): SearchItem[] {
  const items: SearchItem[] = [];
  function add(item: Omit<SearchItem, 'searchText' | 'full_name'>, tags: string[]) {
    items.push({ ...item, full_name: item.repository, searchText: normalize([item.title, item.repository, item.description, item.category, ...tags].join(' ')) });
  }
  for (const repo of repos) {
    const categories = (repo.categories || [repo.category]).filter(Boolean).map(id => CATEGORIES.find(category => category.id === id)?.name || id!);
    add({ id: `project:${repo.full_name}`, kind: 'projects', title: repo.full_name.split('/')[1], description: repo.description || '', repository: repo.full_name, href: `/repositories/${repo.full_name}`, category: categories[0] || 'Project', stars: repo.stars || 0 }, [...categories, ...(repo.topics || [])]);
    if (repo.is_mcp) add({ id: `mcp:${repo.full_name}`, kind: 'mcp', title: repo.full_name.split('/')[1], description: repo.mcp_description || repo.description || '', repository: repo.full_name, href: repo.mcp_source_url || repo.html_url || `https://github.com/${repo.full_name}`, category: 'MCP Servers', stars: repo.stars || 0 }, [...categories, ...(repo.mcp_topics || []), ...(repo.topics || [])]);
  }
  for (const skill of listSkills(repos)) add({ id: `skill:${skill.id}`, kind: 'skills', title: skill.skill_name, description: skill.description, repository: skill.repository, href: skill.source_url, category: 'Agent Skills', stars: skill.stars }, skill.topics);
  return items;
}

export function searchCatalog(index: SearchItem[], query: string, kind: SearchKind = 'all', limit = 8): SearchItem[] {
  const q = normalize(query);
  const words = q.split(/\s+/).filter(Boolean);
  const size = Number.isFinite(limit) ? Math.max(1, Math.min(20, Math.floor(limit))) : 8;
  const score = (item: SearchItem) => normalize(item.title) === q ? 3 : normalize(item.title).startsWith(q) ? 2 : normalize(item.repository).includes(q) ? 1 : 0;
  return index.filter(item => (kind === 'all' || item.kind === kind) && words.every(word => item.searchText.includes(word)))
    .sort((a, b) => (q ? score(b) - score(a) : 0) || b.stars - a.stars || a.id.localeCompare(b.id)).slice(0, size);
}
