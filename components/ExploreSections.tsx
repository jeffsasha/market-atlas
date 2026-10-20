'use client';

import Link from 'next/link';
import FloatingSurface from './FloatingSurface';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function ExploreSections({ projects, skills, mcp }: { projects: number; skills: number; mcp: number }) {
  const sections = [
    { href: '#discover', title: 'Projects', detail: 'Research frameworks, data libraries, and trading systems.', footer: `${projects} indexed repositories` },
    { href: '/skills', title: 'Skills', detail: 'Reusable instructions for an AI-powered research workflow.', footer: `${skills} verified source${skills === 1 ? '' : 's'}` },
    { href: '/mcp', title: 'MCP Servers', detail: 'Financial data connections for your AI workspace.', footer: `${mcp} documented server${mcp === 1 ? '' : 's'}` },
    { href: '/lab', title: 'GitHub Lab', detail: 'Weekly top 10 across GitHub, profile comparisons, and favorites.', footer: 'Follow weekly momentum' },
    { href: '/trending', title: 'Trending', detail: 'Community favorites and verified weekly star growth.', footer: 'Follow the ecosystem' },
  ];
  return (
    <section className="border-y border-border-light py-9 dark:border-border-dark" aria-labelledby="explore-title">
      <div className="mb-5 flex items-center justify-between"><h2 id="explore-title" className="text-2xl font-bold uppercase tracking-tight">Explore</h2><span className="mono text-[10px] uppercase tracking-widest text-neutral-400">Choose your starting point</span></div>
      <div className="grid gap-px border border-border-light bg-[#E7E5E4] dark:border-border-dark dark:bg-[#27272A] sm:grid-cols-2 lg:grid-cols-5">
        {sections.map((item, index) => <motion.div key={item.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .06 }}>
          <FloatingSurface className="h-full"><Link href={item.href} className="explore-tile group flex h-full flex-col bg-[#FAFAF9] p-5 dark:bg-[#0A0A0B]">
            <div className="mb-6 flex items-center justify-between"><span className="mono text-xs text-neutral-400">0{index + 1}</span><ArrowUpRight size={17} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div>
            <h3 className="text-xl font-bold uppercase tracking-tight">{item.title}</h3><p className="mb-6 mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{item.detail}</p><p className="mono mt-auto text-[10px] uppercase tracking-wider text-neutral-500">{item.footer}</p>
          </Link></FloatingSurface>
        </motion.div>)}
      </div>
    </section>
  );
}
