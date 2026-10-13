import { createHash } from 'node:crypto';
import { getRepoRef } from './github';
import { parseSkillManifest } from './manifest';
import type { CachedRepo } from './store';
import type { SkillArtifact } from './catalog';

export type CatalogSource = {
  full_name: string; categories: string[];
  skills?: { path: string; topics: string[]; trading_warning?: boolean }[];
  mcp?: { path: string; topics: string[]; transport: string; auth: string; publisher_status: string; description?: string; trading_warning?: boolean };
};

async function sourceFile(fullName: string, ref: string, file: string) {
  const url = `https://raw.githubusercontent.com/${fullName}/${ref}/${file.split('/').map(encodeURIComponent).join('/')}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'MarketAtlas' } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Source verification: GitHub ${response.status}`);
  return response.text();
}

export async function refreshArtifacts(repo: CachedRepo, source: CatalogSource, branch: string, now: string, knownRef?: string) {
  if (!source.skills && !source.mcp) return repo;
  const ref = knownRef || await getRepoRef(repo.full_name, branch);
  const sha = (text: string) => createHash('sha256').update(text).digest('hex');
  if (source.skills) {
    const skills: SkillArtifact[] = [];
    for (const candidate of source.skills) {
      const text = await sourceFile(repo.full_name, ref, candidate.path);
      const manifest = text && parseSkillManifest(text);
      if (!manifest) { console.warn(`Skipped missing/invalid manifest ${repo.full_name}/${candidate.path}`); continue; }
      skills.push({ ...manifest, description: manifest.description.slice(0, 400), path: candidate.path,
        topics: candidate.topics, trading_warning: !!candidate.trading_warning,
        source_url: `https://github.com/${repo.full_name}/blob/${ref}/${candidate.path}`,
        source_ref: ref, source_sha: sha(text), verified_at: now });
    }
    repo = { ...repo, skills, has_skill_md: skills.length > 0 };
  }
  if (source.mcp) {
    const text = await sourceFile(repo.full_name, ref, source.mcp.path);
    const verified = !!text && /model context protocol|mcp[ -]server/i.test(text);
    repo = { ...repo, is_mcp: verified, mcp_source_url: verified ? `https://github.com/${repo.full_name}/blob/${ref}/${source.mcp.path}` : null,
      mcp_source_ref: ref, mcp_source_sha: text ? sha(text) : null, mcp_verified_at: verified ? now : null,
      mcp_description: source.mcp.description || repo.description, mcp_topics: source.mcp.topics, mcp_transport: source.mcp.transport, mcp_auth: source.mcp.auth,
      mcp_status: source.mcp.publisher_status, mcp_trading_warning: !!source.mcp.trading_warning };
  }
  return repo;
}
