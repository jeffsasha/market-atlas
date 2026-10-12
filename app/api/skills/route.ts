import { NextResponse } from 'next/server';
import { readCache } from '@/lib/store';

export async function GET() {
  const repos = await readCache();
  const skills = repos.filter(r => r.has_skill_md).map(r => ({
    skill_name: r.full_name, description: r.description, repository: r.full_name,
    author: r.owner, skill_path: r.skill_path, install_command: r.skill_install || null,
    last_updated: r.pushed_at, license: r.license_spdx, source_url: r.html_url,
  }));
  return NextResponse.json({ results: skills, note: 'Only repos with verified SKILL.md are listed.' });
}
