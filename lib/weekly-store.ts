import { promises as fs } from 'node:fs';
import path from 'node:path';
import fallback from '@/data/github-weekly.json';
import type { WeeklySnapshot } from './github-lab';

export async function readWeeklySnapshot(): Promise<WeeklySnapshot> {
  try {
    const data = JSON.parse(await fs.readFile(path.join(process.cwd(), 'data/weekly-cache.json'), 'utf8'));
    if (!Array.isArray(data.repositories) || data.repositories.length !== 10) throw new Error('Invalid weekly snapshot');
    return data;
  } catch { return fallback as WeeklySnapshot; }
}
