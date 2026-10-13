'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, BookOpen, FlaskConical, ChevronDown, Github, Search, Layers3, Plug, TrendingUp, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import FloatingSurface from './FloatingSurface';
import { useCommandPalette } from './CommandPalette';

const destinations = [
  { href: '/#discover', label: 'Projects', detail: 'Open-source tools for market research, trading, and financial data.', icon: Layers3, tag: 'Find your toolkit' },
  { href: '/skills', label: 'Skills', detail: 'Reusable agent instructions with verified source manifests.', icon: BookOpen, tag: 'Build your workflow' },
  { href: '/mcp', label: 'MCP Servers', detail: 'Connect your AI workspace to financial tools and data.', icon: Plug, tag: 'Connect your workspace' },
  { href: '/lab', label: 'GitHub Lab', detail: 'Weekly top 10, repository profiles, comparisons, and your favorites.', icon: FlaskConical, tag: 'Explore this week' },
  { href: '/trending', label: 'Trending', detail: 'Discover community favorites across the financial ecosystem.', icon: TrendingUp, tag: 'See what’s moving' },
];

export default function Navbar() {
  const path = usePathname();
  const { open: openSearch } = useCommandPalette();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <header ref={headerRef} className="market-nav sticky top-0 z-30" onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-5">
        <Link href="/" onClick={() => setOpen(false)} aria-label="MarketAtlas" className="shrink-0 text-base font-bold uppercase tracking-[-.06em] sm:text-lg">Market<span className="text-fuchsia-300">Atlas</span><span className="ml-1 text-purple-400">/</span></Link>
        <nav aria-label="Main navigation" className="flex items-center gap-5 text-xs font-medium md:gap-7">
          <button ref={triggerRef} onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="explore-navigation" className="nav-explore flex items-center gap-2 rounded-full px-4 py-2.5">
            Explore <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {destinations.slice(1).map(item => <FloatingSurface key={item.href} inline><Link href={item.href} onClick={() => setOpen(false)} aria-current={path === item.href ? 'page' : undefined} className={`nav-link hidden py-2 lg:block ${path === item.href ? 'text-fuchsia-300' : 'text-neutral-300'}`}>{item.label}</Link></FloatingSurface>)}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={() => { setOpen(false); openSearch(); }} aria-label="Search MarketAtlas" title="Search (⌘K / Ctrl+K)" className="grid h-9 w-9 place-items-center rounded-full text-neutral-300 hover:bg-white/5"><Search size={16} /></button>
          <a href="https://github.com/jeffsasha/market-atlas" target="_blank" rel="noreferrer" aria-label="GitHub" className="hidden h-9 w-9 place-items-center rounded-full border border-white/20 text-neutral-300 transition-colors hover:border-fuchsia-300 hover:text-white sm:grid"><Github size={16} /></a>
          <ThemeToggle />
        </div>
      </div>
      <AnimatePresence>
        {open && <motion.div id="explore-navigation" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: reduced ? 0 : .24, ease: [.22, 1, .36, 1] }} className="mega-panel absolute left-0 right-0 top-full overflow-hidden border-b border-purple-100 bg-white text-[#23192F] shadow-2xl">
          <div className="mega-scroll mx-auto max-w-7xl px-5 py-6 sm:py-8">
            <div className="mb-5 flex items-center justify-between"><p className="mono text-[10px] uppercase tracking-[.2em] text-purple-700">Explore MarketAtlas</p><button onClick={() => { setOpen(false); triggerRef.current?.focus(); }} aria-label="Close navigation" className="rounded-full p-2 text-neutral-500 hover:bg-purple-50"><X size={17} /></button></div>
            <nav aria-label="Explore catalog" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {destinations.map((item, index) => <FloatingSurface key={item.href} className="h-full"><Link href={item.href} onClick={() => setOpen(false)} aria-current={path === item.href.split('#')[0] ? 'page' : undefined} className="mega-link group flex h-full gap-3 rounded-xl border border-transparent p-4 sm:block sm:p-5">
                <div className="mb-0 flex items-center justify-between sm:mb-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-700"><item.icon size={19} /></span><ArrowUpRight size={17} className="hidden text-purple-400 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 sm:block" /></div>
                <div><span className="mono mb-1 block text-[9px] uppercase tracking-wider text-purple-500">0{index + 1} / {item.tag}</span><h2 className="text-lg font-semibold tracking-tight">{item.label}</h2><p className="mt-2 text-xs leading-relaxed text-neutral-500">{item.detail}</p></div>
              </Link></FloatingSurface>)}
            </nav>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-purple-100 pt-5 text-xs"><Link href="/design" onClick={() => setOpen(false)} className="font-medium text-purple-700">Component gallery</Link><a href="https://github.com/jeffsasha/market-atlas" target="_blank" rel="noreferrer" className="flex items-center gap-2 font-medium text-purple-700">Build with us on GitHub <ArrowUpRight size={13} /></a></div>
          </div>
        </motion.div>}
      </AnimatePresence>
    </header>
  );
}
