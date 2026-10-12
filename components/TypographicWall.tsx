'use client';
import { useEffect, useState } from 'react';

const WORDS = [
  'FINANCIAL INTELLIGENCE',
  'OPEN SOURCE RESEARCH',
  'QUANTITATIVE SYSTEMS',
  'CRYPTO ANALYTICS',
  'MARKET DISCOVERY',
  'AI FINANCE',
  'ALGORITHMIC TRADING',
  'DATA DRIVEN INVESTING',
];

// Placeholder fallback. The real React Bits Pro TypographicWall is licensed
// and installed separately — see components/TypographicWall/README.md.
// This fallback is intentionally restrained and marked as such; it is not
// presented as the React Bits component.
export default function TypographicWall() {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setVisible(WORDS.length); return; }
    const t = setInterval(() => setVisible(v => (v >= WORDS.length ? v : v + 1)), 350);
    return () => clearInterval(t);
  }, []);
  return (
    <div aria-label="Typographic wall placeholder — licensed React Bits Pro component not installed" className="py-10 select-none">
      <div className="space-y-2">
        {WORDS.map((w, i) => (
          <div key={w} className={`mono text-2xl md:text-4xl font-bold tracking-tight transition-all duration-700 ${i < visible ? 'opacity-100 translate-y-0 text-neutral-800 dark:text-neutral-200' : 'opacity-0 translate-y-2'}`}>
            <span className="text-neutral-300 dark:text-neutral-700 mr-3">{String(i + 1).padStart(2, '0')}</span>{w}
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-neutral-400 mono">Placeholder — install React Bits Pro TypographicWall with a valid license to replace this.</p>
    </div>
  );
}
