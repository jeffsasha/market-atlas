import Link from 'next/link';
import TypographicWall from '@/components/TypographicWall';
import TrendingSection from '@/components/TrendingSection';

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-8">
        <p className="mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4">Open-source financial intelligence</p>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
          Discover the tools shaping financial research.
        </h1>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
          Explore open-source repositories, quantitative frameworks, crypto research tools, and AI-powered financial intelligence.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/repositories" className="px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 transition-opacity">
            Browse repositories
          </Link>
          <Link href="/trending" className="px-5 py-2.5 rounded-lg border border-[#E7E5E4] dark:border-[#27272A] text-sm hover:border-neutral-400 transition-colors">
            Trending this week
          </Link>
        </div>
      </section>

      {/* Typographic Wall centerpiece */}
      <section className="mx-auto max-w-7xl px-4 border-t border-[#E7E5E4] dark:border-[#27272A]">
        <TypographicWall />
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-4 py-10 border-t border-[#E7E5E4] dark:border-[#27272A]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-tight">Trending This Week</h2>
          <Link href="/trending" className="text-sm text-neutral-500 hover:text-black dark:hover:text-white">View all →</Link>
        </div>
        <TrendingSection />
        <p className="mt-4 text-[11px] mono text-neutral-400">
          Trending = 7-day star growth from GitHub snapshots. Shown only when verified history exists; otherwise “— growth n/a”.
        </p>
      </section>
    </div>
  );
}
