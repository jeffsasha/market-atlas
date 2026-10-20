'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef, type ReactNode, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, BookOpen, FlaskConical, Layers3, Plug, Search, TrendingUp, X, type LucideIcon } from 'lucide-react';
import { searchCatalog, type SearchItem, type SearchKind } from '@/lib/search';

const scopes: { id: SearchKind; label: string }[] = [{ id: 'all', label: 'All' }, { id: 'projects', label: 'Projects' }, { id: 'skills', label: 'Skills' }, { id: 'mcp', label: 'MCP Servers' }];
const icons = { projects: Layers3, skills: BookOpen, mcp: Plug };
type PageEntry = { id: string; kind: 'page'; title: string; description: string; href: string; icon: LucideIcon; keywords: string };
const pages: PageEntry[] = [
  { id: 'page:discover', kind: 'page', title: 'Browse all projects', description: 'Filter the catalog by category, language, and topic', href: '/#discover', icon: Layers3, keywords: 'projects repositories catalog discover browse' },
  { id: 'page:skills', kind: 'page', title: 'Agent Skills', description: 'Verified skill manifests for research workflows', href: '/skills', icon: BookOpen, keywords: 'skills agent manifest' },
  { id: 'page:mcp', kind: 'page', title: 'MCP Servers', description: 'Financial data connections for your AI workspace', href: '/mcp', icon: Plug, keywords: 'mcp servers connections tools' },
  { id: 'page:lab', kind: 'page', title: 'GitHub Lab', description: 'Weekly top 10, profiles, comparisons, favorites', href: '/lab', icon: FlaskConical, keywords: 'lab weekly top github compare favorites radar' },
  { id: 'page:trending', kind: 'page', title: 'Trending', description: 'Community favorites and weekly star growth', href: '/trending', icon: TrendingUp, keywords: 'trending popular growth stars' },
];
type Entry = SearchItem | PageEntry;
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Wraps the query words found in `text` with <mark> so matches are easy to scan. */
function Highlight({ text, query }: { text: string; query: string }) {
  const words = query.trim().split(/\s+/).filter(Boolean).map(escape);
  if (!words.length) return <>{text}</>;
  const pattern = new RegExp(`(${words.join('|')})`, 'gi');
  return <>{text.split(pattern).map((part, index) => index % 2 ? <mark key={index} className="search-mark">{part}</mark> : part)}</>;
}
type Context = { open: (query?: string, kind?: SearchKind) => void; close: () => void; isOpen: boolean };
const PaletteContext = createContext<Context>({ open: () => {}, close: () => {}, isOpen: false });
export const useCommandPalette = () => useContext(PaletteContext);

export function CommandPaletteProvider({ children, items }: { children: ReactNode; items: SearchItem[] }) {
  const [isOpen, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<SearchKind>('all');
  const [active, setActive] = useState(0);
  const shell = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const catalog = useMemo(() => searchCatalog(items, query, kind, 10), [items, query, kind]);
  const jumps = useMemo(() => {
    if (kind !== 'all') return [];
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(page => q.split(/\s+/).every(word => `${page.title} ${page.keywords}`.toLowerCase().includes(word))).slice(0, 2);
  }, [query, kind]);
  const results: Entry[] = useMemo(() => [...jumps, ...catalog], [catalog, jumps]);
  const selected = Math.min(active, Math.max(0, results.length - 1));

  const open = useCallback((nextQuery = '', nextKind: SearchKind = 'all') => {
    if (!isOpen) returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    else input.current?.focus();
    setQuery(nextQuery); setKind(nextKind); setActive(0); setOpen(true);
  }, [isOpen]);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function shortcuts(event: KeyboardEvent) {
      if (event.isComposing) return;
      const target = event.target instanceof Element ? event.target : null;
      const editing = target?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
      if ((event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !editing && !event.metaKey && !event.ctrlKey && !event.altKey)) {
        event.preventDefault(); open();
      } else if (isOpen && event.key === 'Escape') { event.preventDefault(); close(); }
    }
    document.addEventListener('keydown', shortcuts);
    return () => document.removeEventListener('keydown', shortcuts);
  }, [open, close, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar) document.body.style.paddingRight = `${scrollbar}px`;
    shell.current?.setAttribute('inert', '');
    shell.current?.setAttribute('aria-hidden', 'true');
    input.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      shell.current?.removeAttribute('inert');
      shell.current?.removeAttribute('aria-hidden');
      if (returnFocus.current?.isConnected) returnFocus.current.focus();
    };
  }, [isOpen]);

  useEffect(() => { dialog.current?.querySelector(`#search-result-${selected}`)?.scrollIntoView({ block: 'nearest' }); }, [selected, query, kind]);

  function keys(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Tab') {
      const targets = dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input, a[href]');
      if (!targets?.length) return;
      const first = targets[0], last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    if (event.target !== input.current || !results.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); setActive((selected + (event.key === 'ArrowDown' ? 1 : results.length - 1)) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault(); dialog.current?.querySelector<HTMLAnchorElement>(`#search-result-${selected}`)?.click();
    }
  }

  return <PaletteContext.Provider value={{ open, close, isOpen }}>
    <div ref={shell}>{children}</div>
    <AnimatePresence>
      {isOpen && <motion.div className="search-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .12 }} onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
        <motion.div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="search-title" onKeyDown={keys} className="command-palette" initial={{ y: reduced ? 0 : 8 }} animate={{ y: 0 }}>
          <div className="flex items-center justify-between px-5 pt-4"><h2 id="search-title" className="mono text-[10px] uppercase tracking-[.16em] text-neutral-500">Search MarketAtlas</h2><button onClick={close} aria-label="Close search" className="search-close rounded-md p-1.5 text-neutral-500"><X size={16} /></button></div>
          <div className="flex items-center gap-3 px-5 py-4"><Search size={20} className="shrink-0 text-neutral-500" /><input ref={input} value={query} onChange={event => { setQuery(event.target.value); setActive(0); }} placeholder="Search projects, skills, MCP servers..." aria-label="Search projects, skills, MCP servers" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="search-results" aria-activedescendant={results.length ? `search-result-${selected}` : undefined} className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-neutral-500" /><kbd className="mono hidden rounded border border-current/15 px-1.5 py-1 text-[10px] text-neutral-500 sm:block">ESC</kbd></div>
          <div role="group" aria-label="Search category" className="flex gap-1 border-y border-current/10 px-4 py-2">{scopes.map(scope => <button key={scope.id} onClick={() => { setKind(scope.id); setActive(0); input.current?.focus(); }} aria-pressed={kind === scope.id} className={`search-scope rounded-md px-3 py-1.5 text-xs ${kind === scope.id ? 'is-active' : ''}`}>{scope.label}</button>)}</div>
          <div className="max-h-[min(50svh,360px)] overflow-y-auto p-2">
            <p className="mono px-3 pb-2 pt-1 text-[10px] uppercase tracking-wider text-neutral-500" aria-live="polite">{query.trim() ? `${catalog.length} catalog result${catalog.length === 1 ? '' : 's'}${catalog.length === 10 ? ' · refine to narrow' : ''}` : 'Jump to a section or pick a popular project'}</p>
            <div id="search-results" role="listbox" aria-label="Catalog search results">{results.map((item, index) => {
              const Icon = item.kind === 'page' ? item.icon : icons[item.kind]; const external = item.href.startsWith('https://');
              const heading = item.kind === 'page' ? index === 0 && 'Jump to' : (index === 0 || results[index - 1].kind === 'page') && (query.trim() ? 'Catalog' : 'Popular in the catalog');
              return <div key={item.id}>
                {heading && <p className={`mono px-3 pb-1.5 text-[10px] uppercase tracking-wider text-neutral-500 ${index ? 'pt-3' : 'pt-1'}`} aria-hidden="true">{heading}</p>}
                <Link prefetch={false} id={`search-result-${index}`} role="option" aria-selected={selected === index} href={item.href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} onClick={close} onFocus={() => setActive(index)} onMouseMove={() => { if (selected !== index) setActive(index); }} className={`search-result flex items-center gap-3 rounded-lg px-3 ${item.kind === 'page' ? 'py-2.5' : 'py-3'} ${selected === index ? 'is-active' : ''}`}>
                  <span className={`search-result-icon grid shrink-0 place-items-center rounded-lg ${item.kind === 'page' ? 'h-8 w-8' : 'h-9 w-9'}`}><Icon size={16} /></span>
                  {item.kind === 'page' ? <div className="min-w-0 flex-1"><span className="block truncate text-sm font-medium"><Highlight text={item.title} query={query} /></span><p className="mt-0.5 truncate text-xs text-neutral-500">{item.description}</p></div>
                  : <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="truncate text-sm font-medium"><Highlight text={item.title} query={query} /></span><span className="search-kind mono shrink-0 rounded px-1.5 py-0.5 text-[10px]">{item.kind === 'mcp' ? 'MCP' : item.kind === 'skills' ? 'SKILL' : 'PROJECT'}</span></div><p className="mt-1 truncate text-xs text-neutral-500"><Highlight text={item.description || item.repository} query={query} /></p><p className="mono mt-1.5 truncate text-[10px] text-neutral-500">{item.repository} · {item.category} · ★ {item.stars.toLocaleString('en-US')}</p></div>}
                  {item.kind === 'page' ? <ArrowRight size={14} aria-hidden="true" className="search-go shrink-0 text-neutral-500" /> : <ArrowUpRight size={14} aria-hidden="true" className="search-go shrink-0 text-neutral-500" />}
                </Link>
              </div>;
            })}</div>
            {!results.length && <div className="px-4 py-10 text-center"><p className="text-sm">No matches for “{query.trim()}”{kind !== 'all' ? ' in this category' : ''}.</p><p className="mt-2 text-xs text-neutral-500">Try a project name, research topic, or another category.</p></div>}
          </div>
          <div className="mono flex flex-wrap justify-between gap-2 border-t border-current/10 px-5 py-3 text-[10px] text-neutral-500"><span className="flex items-center gap-3"><span><kbd className="search-key">↑</kbd><kbd className="search-key">↓</kbd> navigate</span><span><kbd className="search-key">↵</kbd> open</span><span><kbd className="search-key">esc</kbd> close</span></span><span>Source-backed catalog</span></div>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  </PaletteContext.Provider>;
}
