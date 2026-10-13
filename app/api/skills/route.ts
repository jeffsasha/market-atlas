import { NextResponse } from 'next/server';
import { readCache } from '@/lib/store';
import { listSkills } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  const repos = await readCache();
  const skills = listSkills(repos);
  return NextResponse.json({ results: skills, note: 'Only repos with verified SKILL.md are listed.' });
}
