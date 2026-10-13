export type SkillArtifact = {
  name: string; description: string; path: string; source_url: string;
  topics?: string[]; verified_at?: string; source_ref?: string; source_sha?: string; trading_warning?: boolean;
};

type CatalogRepo = {
  full_name: string; owner?: string; description?: string | null; html_url?: string;
  stars?: number; license_spdx?: string | null; pushed_at?: string | null; last_synced_at?: string;
  has_skill_md?: boolean; skills?: SkillArtifact[]; skill_path?: string; skill_source_url?: string;
};

export function listSkills(repos: CatalogRepo[]) {
  return repos.filter(repo => repo.has_skill_md).flatMap(repo => {
    const skills = repo.skills ?? (repo.skill_path ? [{ name: repo.skill_path.split('/').at(-2) || repo.full_name, description: repo.description || '', path: repo.skill_path, source_url: repo.skill_source_url || repo.html_url || '', topics: ['Finance'], verified_at: repo.last_synced_at }] : []);
    return skills.filter(skill => skill.path && skill.name && skill.source_url).map(skill => ({
      id: `${repo.full_name}:${skill.path}`, skill_name: skill.name, description: skill.description,
      repository: repo.full_name, author: repo.owner || repo.full_name.split('/')[0], skill_path: skill.path,
      source_url: skill.source_url, topics: skill.topics || [], verified_at: skill.verified_at,
      trading_warning: !!skill.trading_warning, stars: repo.stars || 0, license: repo.license_spdx || null,
      last_updated: repo.pushed_at,
    }));
  });
}
export type SkillListing = ReturnType<typeof listSkills>[number];
