// Read only the discovery fields; manifests are data, never instructions to run.
export function parseSkillManifest(text: string): { name: string; description: string } | null {
  const frontmatter = text.replace(/^\uFEFF/, '').match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
  if (!frontmatter) return null;
  function field(key: string) {
    const match = frontmatter!.match(new RegExp(`^${key}:[ \\t]*([^\\n]*)(?:\\n((?:[ \\t]+[^\\n]*(?:\\n|$))*))?`, 'm'));
    if (!match) return '';
    const value = match[1].trim();
    return (/^[>|][-+]?\s*$/.test(value) ? (match[2] || '').trim().replace(/\s+/g, ' ') : value.replace(/^(['"])([\s\S]*)\1$/, '$2')).trim();
  }
  const name = field('name'), description = field('description');
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(name) && description ? { name, description } : null;
}
