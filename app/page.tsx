import WeeklyTopTen from '@/components/WeeklyTopTen';
import { readWeeklySnapshot } from '@/lib/weekly-store';
import HomeHero from '@/components/HomeHero';
import HomeDiscovery from '@/components/HomeDiscovery';
import { readCache } from '@/lib/store';
import { listSkills } from '@/lib/catalog';
import type { CatalogRepo } from '@/components/HomeDiscovery';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [repos, snapshot] = await Promise.all([readCache(), readWeeklySnapshot()]);
  return <><HomeHero count={repos.length} skillCount={listSkills(repos).length} mcpCount={repos.filter(repo => repo.is_mcp).length} /><WeeklyTopTen snapshot={snapshot} /><HomeDiscovery repos={repos as CatalogRepo[]} /></>;
}
