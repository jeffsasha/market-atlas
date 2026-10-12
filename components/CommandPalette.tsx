'use client';
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

type Ctx = { open: () => void; close: () => void; isOpen: boolean };
const PaletteCtx = createContext<Ctx>({ open: () => {}, close: () => {}, isOpen: false });
export const useCommandPalette = () => useContext(PaletteCtx);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => { setIsOpen(false); setQ(''); }, []);

  useEffect(() => {
    if (!isOpen || !q.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`);
        const j = await r.json();
        setResults(j.results || []);
      } catch { setResults([]); }
    }, 180);
    return () => clearTimeout(t);
  }, [q, isOpen]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    if (isOpen) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, close]);

  return (
    <PaletteCtx.Provider value={{ open, close, isOpen }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div className="fixed inset-0 z-50 grid place-items-start justify-center pt-[12vh] px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <motion.div
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: 'spring', damping: 28, stiffness: 380 }}
              className="relative w-full max-w-xl bg-white dark:bg-[#131316] border border-[#E7E5E4] dark:border-[#27272A] rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 border-b border-[#E7E5E4] dark:border-[#27272A]">
                <Search size={16} className="text-neutral-400" />
                <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search repositories, skills, and MCP servers..."
                  className="w-full py-3 bg-transparent outline-none text-sm placeholder:text-neutral-400" />
                <kbd className="mono text-[10px] border rounded px-1.5 py-0.5 text-neutral-500">ESC</kbd>
              </div>
              <div className="max-h-80 overflow-auto p-2">
                {results.length === 0 && q && <p className="text-sm text-neutral-500 px-3 py-6 text-center">No results — try “backtesting” or “defi”.</p>}
                {results.map((r: any) => (
                  <a key={r.full_name} href={`/repositories/${r.full_name}`}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors">
                    <div>
                      <div className="mono text-sm font-medium">{r.full_name}</div>
                      <div className="text-xs text-neutral-500 truncate max-w-md">{r.description}</div>
                    </div>
                    <div className="mono text-xs text-neutral-500">★ {r.stars?.toLocaleString()}</div>
                  </a>
                ))}
                {!q && <p className="text-xs text-neutral-500 px-3 py-4">Type to search indexed projects. History is stored locally.</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PaletteCtx.Provider>
  );
}
