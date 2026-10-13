import WeeklyTopTen from '@/components/WeeklyTopTen';
import { readWeeklySnapshot } from '@/lib/weekly-store';
import HomeHero from '@/components/HomeHero';
import HomeDiscovery from '@/components/HomeDiscovery';
import { readCache } from '@/lib/store';
import type { CatalogRepo } from '@/components/HomeDiscovery';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [repos, snapshot] = await Promise.all([readCache(), readWeeklySnapshot()]);
  return <><HomeHero count={repos.length} /><WeeklyTopTen snapshot={snapshot} /><HomeDiscovery repos={repos as CatalogRepo[]} /></>;
}
