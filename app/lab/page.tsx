import GitHubLab from '@/components/GitHubLab';
import { readWeeklySnapshot } from '@/lib/weekly-store';

export const dynamic = 'force-dynamic';
export default async function LabPage({ searchParams }: { searchParams: { repo?: string } }) {
  const snapshot = await readWeeklySnapshot();
  return <GitHubLab snapshot={snapshot} initialRepo={typeof searchParams.repo === 'string' ? searchParams.repo : undefined} />;
}
