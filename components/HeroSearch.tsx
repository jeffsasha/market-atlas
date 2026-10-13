'use client';

import { Search } from 'lucide-react';
import { useCommandPalette } from './CommandPalette';
import { CATEGORIES } from '@/lib/categories';

const suggestions = ['quant', 'findata', 'ai-agents', 'portfolio'];
export default function HeroSearch() {
  const { open } = useCommandPalette();
  return <div className="mt-7 w-full max-w-[720px]">
    <button onClick={() => open()} className="hero-search flex h-[58px] w-full items-center gap-3 rounded-xl px-4 text-left sm:px-5" aria-label="Search projects, skills, MCP servers">
      <Search size={19} className="shrink-0 text-neutral-500" /><span className="min-w-0 flex-1 truncate text-sm sm:text-base">Search projects, skills, MCP servers...</span><kbd className="mono shrink-0 rounded-md border border-current/15 px-2 py-1 text-[11px] text-neutral-500" aria-hidden="true">⌘ K</kbd>
    </button>
    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2"><span className="text-[10px] text-neutral-500">Popular searches</span>{suggestions.map(id => {
      const category = CATEGORIES.find(item => item.id === id)!;
      return <button key={id} onClick={() => open(category.name, 'projects')} className="search-suggestion rounded-full px-2.5 py-1 text-[10px]">{category.name}</button>;
    })}<button onClick={() => open('', 'mcp')} className="search-suggestion rounded-full px-2.5 py-1 text-[10px]">MCP Servers</button></div>
  </div>;
}
