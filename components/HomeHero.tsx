'use client';

import dynamic from 'next/dynamic';
import { ArrowDownRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CATEGORIES } from '@/lib/categories';

const GradientWaves = dynamic(() => import('./GradientWaves/GradientWaves'), { ssr: false });

export default function HomeHero({ count }: { count: number }) {
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMotionAllowed(!preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  return (
    <section className="market-hero relative isolate overflow-hidden border-b border-border-light dark:border-border-dark" aria-labelledby="hero-title">
      <div className="hero-waves absolute inset-0 -z-10" aria-hidden="true">
        {motionAllowed && !paused && <GradientWaves horizonColor="#6424D8" waveColor="#E65BCB" crestColor="#FFE8FA" speed={0.25} amplitude={2.5} waveScale={0.6} waveRatio={0.9} swell={35} turbulence={20} tilt={1.11} zoom={1} height={5.5} fogDepth={18} detail="low" brightness={1} opacity={0.9} mouseInteraction parallaxStrength={0.35} grain grainIntensity={0.025} />}
      </div>
      <div className="hero-scrim pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-10 sm:pb-12 sm:pt-14">
        <div className="flex items-center justify-between gap-4">
          <p className="mono text-[10px] font-medium uppercase tracking-[.18em] text-neutral-500 dark:text-neutral-400">Independent tools. Open possibilities.</p>
          {motionAllowed && <button onClick={() => setPaused(v => !v)} aria-pressed={paused} aria-label={paused ? 'Resume background animation' : 'Pause background animation'} className="border border-border-light p-2 text-neutral-500 transition-colors hover:border-purple-500 dark:border-border-dark">{paused ? <Play size={12} /> : <Pause size={12} />}</button>}
        </div>
        <div className="mt-7 grid items-end gap-8 lg:grid-cols-[1.35fr_1fr]">
          <h1 id="hero-title" className="hero-headline font-bold uppercase">Open tools.<br /><span className="hero-gradient-text">Real edge.</span></h1>
          <div className="max-w-sm pb-1 lg:justify-self-end">
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">The open-source toolkit for market research.<br />Explore financial repositories, agent skills, and MCP servers — straight from GitHub.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#discover" className="market-button group inline-flex items-center gap-5 px-5 py-3 text-[11px] font-bold uppercase tracking-wider">Browse projects <ArrowDownRight size={16} className="transition-transform group-hover:translate-y-1" /></a>
              <a href="/lab" className="inline-flex items-center gap-2 border border-border-light px-4 py-3 text-[11px] font-medium dark:border-border-dark">Weekly top 10 <ArrowUpRight size={14} /></a>
            </div>
          </div>
        </div>
        <div className="mono mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border-light pt-5 text-[10px] uppercase tracking-wider text-neutral-500 dark:border-border-dark dark:text-neutral-400"><span><strong className="mr-2 text-base font-medium text-neutral-900 dark:text-white">{count}</strong>GitHub projects</span><span>{CATEGORIES.length - 1} research categories</span><span>Skills + MCP</span><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 bg-purple-500" />Source-backed metadata</span></div>
      </div>
    </section>
  );
}
