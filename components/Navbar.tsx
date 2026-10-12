'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Moon, Sun, Search, Github } from 'lucide-react';
import { useCommandPalette } from './CommandPalette';

export default function Navbar() {
  const [dark, setDark] = useState(false);
  const { open } = useCommandPalette();

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('ma-theme', next ? 'dark' : 'light'); } catch {}
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-[#E7E5E4] dark:border-[#27272A] bg-[#FAFAF9]/80 dark:bg-[#0A0A0B]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="w-6 h-6 rounded-md bg-emerald-500/15 border border-emerald-500/30 grid place-items-center mono text-emerald-600 dark:text-emerald-400 text-xs font-bold">M</span>
          <span>MarketAtlas</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
          <Link href="/repositories" className="hover:text-black dark:hover:text-white transition-colors">Discover</Link>
          <Link href="/repositories" className="hover:text-black dark:hover:text-white transition-colors">Repositories</Link>
          <Link href="/skills" className="hover:text-black dark:hover:text-white transition-colors">Skills</Link>
          <Link href="/mcp" className="hover:text-black dark:hover:text-white transition-colors">MCP Servers</Link>
          <Link href="/trending" className="hover:text-black dark:hover:text-white transition-colors">Trending</Link>
          <Link href="/design" className="hover:text-black dark:hover:text-white transition-colors">Design</Link>
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={open} className="hidden sm:flex items-center gap-2 text-sm border border-[#E7E5E4] dark:border-[#27272A] rounded-lg px-3 py-1.5 bg-white dark:bg-[#131316] hover:border-neutral-400 transition-colors">
            <Search size={14} />
            <span className="text-neutral-500">Search…</span>
            <kbd className="mono text-[10px] border rounded px-1 text-neutral-500">⌘K</kbd>
          </button>
          <button onClick={open} aria-label="Search" className="sm:hidden p-2 border rounded-lg"><Search size={16} /></button>
          <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="p-2 border border-[#E7E5E4] dark:border-[#27272A] rounded-lg hover:border-neutral-400 transition-colors"><Github size={16} /></a>
          <button onClick={toggle} aria-label="Toggle theme" className="p-2 border border-[#E7E5E4] dark:border-[#27272A] rounded-lg hover:border-neutral-400 transition-all">
            <span className="block transition-transform duration-300" style={{ transform: dark ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
