'use client';
import { useEffect, useState, ReactNode } from 'react';
import { Star, GitFork } from 'lucide-react';
import CodeBlock from '@/components/CodeBlock';
import RepoCard, { Repo } from '@/components/RepoCard';
import ThemeToggle from '@/components/ThemeToggle';
import FloatingSurface from '@/components/FloatingSurface';
import RepoPreview from '@/components/RepoPreview';

function Section({ id, title, desc, preview, code }: { id: string; title: string; desc: string; preview: ReactNode; code: string }) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-[#E7E5E4] dark:border-[#27272A] py-10">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-neutral-500 mt-1 mb-5 max-w-2xl">{desc}</p>
      <div className="border border-[#E7E5E4] dark:border-[#27272A] rounded-xl p-6 bg-white dark:bg-[#131316] mb-4 grid place-items-center min-h-[140px]">
        {preview}
      </div>
      <CodeBlock code={code} />
    </section>
  );
}

const SECTIONS = [
  { id: 'theme-toggle', label: 'Theme Toggle' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'repo-card', label: 'Repository Card' },
  { id: 'badges', label: 'Badges & Metrics' },
  { id: 'floating', label: 'Floating Surface' },
  { id: 'stat-blocks', label: 'Stat Blocks' },
  { id: 'headline', label: 'Headline' },
];

export default function DesignPage() {
  const [sample, setSample] = useState<Repo | null>(null);
  const [preview, setPreview] = useState<Repo | null>(null);
  useEffect(() => {
    fetch('/api/repositories?limit=1').then(r => r.json()).then(j => setSample(j.results?.[0] || null)).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 flex gap-10">
      <aside className="hidden lg:block w-52 shrink-0">
        <div className="sticky top-20 space-y-1">
          <p className="mono text-[11px] uppercase tracking-widest text-neutral-400 px-3 mb-2">Components</p>
          {SECTIONS.map(s => (
            <a key={s.id} href={`#${s.id}`} className="block px-3 py-1.5 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors">{s.label}</a>
          ))}
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <p className="mono text-xs uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-2">Design System</p>
        <h1 className="text-3xl font-semibold tracking-tight">Component Previews</h1>
        <p className="text-neutral-500 mt-2 mb-4 max-w-2xl">A selection of MarketAtlas components, live. Inspired by <a href="https://reactbits.dev" target="_blank" rel="noreferrer" className="underline underline-offset-2">reactbits.dev</a> — preview first, code second. Interactive surfaces support light/dark themes and respect <span className="mono text-xs">prefers-reduced-motion</span>.</p>

        <Section id="theme-toggle" title="Theme Toggle" desc="PixelSwap theme transition with a persisted choice and an immediate switch for reduced motion."
          preview={<ThemeToggle />}
          code={`import ThemeToggle from '@/components/ThemeToggle';\n<ThemeToggle />`} />

        <Section id="buttons" title="Buttons" desc="Solid primary and bordered secondary styles."
          preview={<div className="flex gap-3"><button className="px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 transition-opacity">Browse repositories</button><button className="px-5 py-2.5 rounded-lg border border-[#E7E5E4] dark:border-[#27272A] text-sm hover:border-neutral-400 transition-colors">Trending this week</button></div>}
          code={`<button className="px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white\n  text-white dark:text-black text-sm font-medium hover:opacity-90">\n  Browse repositories\n</button>\n<button className="px-5 py-2.5 rounded-lg border\n  border-[#E7E5E4] dark:border-[#27272A] text-sm\n  hover:border-neutral-400">\n  Trending this week\n</button>`} />

        <Section id="repo-card" title="Repository Card" desc="The core surface: mono repo name, description, language dot, stars/forks in mono, verified 7-day growth or an honest n/a, license chip, category, GitHub link. Click opens the floating preview."
          preview={sample ? <div className="w-full max-w-md"><RepoCard repo={sample} onPreview={setPreview} /></div> : <p className="text-sm text-neutral-500">Loading real data…</p>}
          code={`<RepoCard repo={repo} onPreview={setPreview} />\n// repo: { full_name, description, language,\n//   stars, forks, stars_growth_7d | null,\n//   license_spdx, category, html_url, avatar_url }`} />

        <Section id="badges" title="Badges & Metrics" desc="Illustrative metric styles. Repository cards show live catalog values and verified growth when available."
          preview={<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500/70" />Python</span>
            <span className="mono flex items-center gap-1"><Star size={12} />55,306</span>
            <span className="mono flex items-center gap-1"><GitFork size={12} />12,408</span>
            <span className="mono text-purple-600 dark:text-purple-400">+214 this week</span>
            <span className="mono border rounded px-1">MIT</span>
            <span className="mono text-neutral-400" title="Insufficient snapshot history">— growth n/a</span>
          </div>}
          code={`<span className="mono flex items-center gap-1">\n  <Star size={12} />{repo.stars.toLocaleString()}\n</span>\n{typeof growth === 'number'\n  ? <span className="mono text-purple-600">+{growth} this week</span>\n  : <span className="mono text-neutral-400">— growth n/a</span>}`} />

        <Section id="floating" title="Floating Surface" desc="Pointer-driven lift, tilt, and glow. Touch and reduced-motion preferences keep the surface steady."
          preview={<FloatingSurface><a href="/skills" className="block rounded-xl border border-purple-200 bg-purple-50 p-6 text-purple-800">Explore Skills →</a></FloatingSurface>}
          code={`import FloatingSurface from '@/components/FloatingSurface';\n<FloatingSurface><a href="/skills">Explore Skills</a></FloatingSurface>`} />

        <Section id="stat-blocks" title="Stat Blocks" desc="Detail-page metrics: 1px borders, 8px radius, uppercase micro-labels, mono values."
          preview={<div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-xl">
            {[['Stars', '55,306'], ['Forks', '12,408'], ['Language', 'Python'], ['License', 'Apache-2.0']].map(([l, v]) => (
              <div key={l} className="border border-[#E7E5E4] dark:border-[#27272A] rounded-lg p-3 bg-white dark:bg-[#131316] text-left">
                <div className="text-[11px] uppercase tracking-wide text-neutral-400">{l}</div>
                <div className="mono text-sm mt-1">{v}</div>
              </div>
            ))}
          </div>}
          code={`<div className="border rounded-lg p-3">\n  <div className="text-[11px] uppercase tracking-wide\n    text-neutral-400">Stars</div>\n  <div className="mono text-sm mt-1">55,306</div>\n</div>`} />

        <Section id="headline" title="Headline" desc="Large, tightly tracked typography with purple-to-pink emphasis."
          preview={<h2 className="text-4xl font-bold uppercase tracking-[-.06em] sm:text-5xl">Open tools.<br /><span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Real edge.</span></h2>}
          code={`<h2 className="text-5xl font-bold uppercase tracking-[-.06em]">\n  Open tools.\n  <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Real edge.</span>\n</h2>`} />
        <RepoPreview repo={preview} onClose={() => setPreview(null)} />
      </div>
    </div>
  );
}
