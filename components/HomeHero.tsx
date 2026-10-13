import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import HeroSearch from './HeroSearch';
import StrokeText from './StrokeText';

export default function HomeHero({ count, skillCount, mcpCount }: { count: number; skillCount: number; mcpCount: number }) {
  return <section className="market-hero border-b border-border-light dark:border-border-dark" aria-labelledby="hero-title">
    <div className="mx-auto max-w-[1240px] px-5 pb-8 pt-10 sm:pb-9 sm:pt-12">
      <p className="mono max-w-xl text-[9px] font-medium uppercase leading-relaxed tracking-[.17em] text-neutral-500 sm:text-[10px]">The open-source financial intelligence directory</p>
      <div className="mt-5 grid items-end gap-6 lg:grid-cols-[1fr_auto]">
        <h1 id="hero-title" className="hero-headline font-bold uppercase"><span className="sr-only">OPEN TOOLS. REAL EDGE.</span><StrokeText text="OPEN TOOLS." /><StrokeText text="REAL EDGE." gradient /></h1>
        <div className="hidden pb-2 lg:block"><Link href="/lab" className="hero-lab-link mono inline-flex items-center gap-3 rounded-full border px-4 py-2.5 text-[10px]">This week on GitHub <ArrowUpRight size={14} /></Link></div>
      </div>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-500 sm:text-[15px]">Discover open-source tools for financial research,<br className="hidden sm:block" /> quantitative trading, and AI-powered market intelligence.</p>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-neutral-500 sm:text-sm">Explore GitHub repositories, Agent Skills, and MCP servers in one place.</p>
      <HeroSearch />
      <div className="mt-5 flex items-center gap-5 text-[11px]"><a href="#discover" className="hero-text-link inline-flex items-center gap-2">Browse projects <ArrowDownRight size={13} /></a><Link href="/lab" className="inline-flex items-center gap-2 text-neutral-500 lg:hidden">Weekly top 10 <ArrowUpRight size={13} /></Link></div>
      <div className="hero-statistics mono mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border-light pt-5 text-[9px] uppercase tracking-wider text-neutral-500 dark:border-border-dark sm:flex sm:flex-wrap sm:gap-x-10"><span><strong>{count}</strong> GitHub projects</span><span><strong>{CATEGORIES.length - 1}</strong> Research categories</span><span><strong>{skillCount + mcpCount}</strong> Skills + MCP</span><span className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-violet-400" />Source-backed metadata</span></div>
    </div>
  </section>;
}
