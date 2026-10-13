'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PixelSwap from './PixelSwap/PixelSwap';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [cover, setCover] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const current = document.documentElement.classList.contains('dark');
    setDark(current);
    setPending(current);
    setReady(true);
    return () => { delete document.documentElement.dataset.themeSwapping; };
  }, []);

  function apply(next: boolean) {
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('ma-theme', next ? 'dark' : 'light'); } catch {}
  }

  function toggle() {
    if (busy) return;
    const next = !dark;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !Element.prototype.animate) {
      apply(next);
      return;
    }
    setPending(next);
    setBusy(true);
    setCover(true);
    document.documentElement.dataset.themeSwapping = 'true';
  }

  function complete(covered: boolean) {
    if (covered) {
      apply(pending);
      setCover(false);
    } else {
      setBusy(false);
      delete document.documentElement.dataset.themeSwapping;
    }
  }

  return (
    <>
      <button onClick={toggle} disabled={busy} aria-label="Toggle theme" aria-pressed={dark} aria-busy={busy} title={dark ? 'Switch to light mode' : 'Switch to dark mode'} className="theme-toggle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-500">
        <span className="block h-full w-full" aria-hidden="true">
          {ready ? <PixelSwap
            firstContent={<div className="theme-tile theme-tile--light"><Moon size={16} /></div>}
            secondContent={<div className="theme-tile theme-tile--dark"><Sun size={16} /></div>}
            active={dark}
            initialActive={dark}
            trigger="manual"
            pixelSize={8}
            duration={400}
            pixelDuration={220}
            pattern="diagonal"
            randomness={0.15}
            aspectRatio="1"
          /> : <span className="grid h-full place-items-center"><Moon size={16} className="dark:hidden" /><Sun size={16} className="hidden dark:block" /></span>}
        </span>
      </button>
      {ready && createPortal(
        <div className="theme-wipe" aria-hidden="true" style={{ pointerEvents: busy ? 'auto' : 'none' }}>
          <PixelSwap firstContent={<div className="h-full w-full" />} secondContent={<div className="h-full w-full" style={{ background: pending ? '#0A0A0B' : '#FAFAF9' }} />} active={cover} initialActive={false} trigger="manual" pixelSize={80} duration={460} pixelDuration={240} pattern="diagonal" randomness={.15} revealUnderlay onComplete={complete} aspectRatio="auto" style={{ height: '100%' }} />
        </div>, document.body
      )}
    </>
  );
}
