'use client';
import { useEffect, useState, ReactNode } from 'react';
import { Moon, Sun, Star, GitFork, Search } from 'lucide-react';
import CodeBlock from '@/components/CodeBlock';
import RepoCard, { Repo } from '@/components/RepoCard';
import TypographicWall from '@/components/TypographicWall';
import { useCommandPalette } from '@/components/CommandPalette';

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

function ThemeToggleDemo() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), []);
  return (
    <button onClick={() => { const n = !dark; setDark(n); document.documentElement.classList.toggle('dark', n); try { localStorage.setItem('ma-theme', n ? 'dark' : 'light'); } catch {} }}
      aria-label="Toggle theme" className="p-2.5 border border-[#E7E5E4] dark:border-[#27272A] rounded-lg hover:border-neutral-400 transition-all">
      <span className="block transition-transform duration-300" style={{ transform: dark ? 'rotate(180deg)' : 'rotate(0deg)' }}>
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </span>
    </button>
  );
}

function PaletteTriggerDemo() {
  const { open } = useCommandPalette();
  return (
    <button onClick={open} className="flex items-center gap-2 text-sm border border-[#E7E5E4] dark:border-[#27272A] rounded-lg px-4 py-2 bg-white dark:bg-[#131316] hover:border-neutral-400 transition-colors">
      <Search size={14} /><span className="text-neutral-500">Search…</span>
      <kbd className="mono text-[10px] border rounded px-1 text-neutral-500">⌘K</kbd>
    </button>
  );
}

const SECTIONS = [
  { id: 'theme-toggle', label: 'Theme Toggle' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'repo-card', label: 'Repository Card' },
  { id: 'badges', label: 'Badges & Metrics' },
  { id: 'palette', label: 'Command Palette Trigger' },
  { id: 'stat-blocks', label: 'Stat Blocks' },
  { id: 'type-wall', label: 'Typographic Wall' },
];

export default function DesignPage() {
  const [sample, setSample] = useState<Repo | null>(null);
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
        <p className="mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">Design System</p>
        <h1 className="text-3xl font-semibold tracking-tight">Component Previews</h1>
        <p className="text-neutral-500 mt-2 mb-4 max-w-2xl">Every primitive in MarketAtlas, live. Inspired by <a href="https://reactbits.dev" target="_blank" rel="noreferrer" className="underline underline-offset-2">reactbits.dev</a> — preview first, code second. All components support light/dark themes and respect <span className="mono text-xs">prefers-reduced-motion</span>.</p>

        <Section id="theme-toggle" title="Theme Toggle" desc="Sun/moon icon with a 180° rotation transition. Persists to localStorage, respects system preference, no flash on load."
          preview={<ThemeToggleDemo />}
          code={`// Toggles .dark on <html>, persists choice\nconst [dark, setDark] = useState(false);\nconst toggle = () => {\n  const next = !dark;\n  setDark(next);\n  document.documentElement.classList.toggle('dark', next);\n  localStorage.setItem('ma-theme', next ? 'dark' : 'light');\n};\n// <span style={{ transform: dark ? 'rotate(180deg)' : 'rotate(0deg)' }}>\n//   {dark ? <Sun size={16}/> : <Moon size={16}/>}\n// </span>`} />

        <Section id="buttons" title="Buttons" desc="Two weights: solid primary, subtle bordered secondary. Restrained radius, no gradients."
          preview={<div className="flex gap-3"><button className="px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 transition-opacity">Browse repositories</button><button className="px-5 py-2.5 rounded-lg border border-[#E7E5E4] dark:border-[#27272A] text-sm hover:border-neutral-400 transition-colors">Trending this week</button></div>}
          code={`<button className="px-5 py-2.5 rounded-lg bg-neutral-900 dark:bg-white\n  text-white dark:text-black text-sm font-medium hover:opacity-90">\n  Browse repositories\n</button>\n<button className="px-5 py-2.5 rounded-lg border\n  border-[#E7E5E4] dark:border-[#27272A] text-sm\n  hover:border-neutral-400">\n  Trending this week\n</button>`} />

        <Section id="repo-card" title="Repository Card" desc="The core surface: mono repo name, description, language dot, stars/forks in mono, verified 7-day growth or an honest n/a, license chip, category, GitHub link. Click opens the floating preview."
          preview={sample ? <div className="w-full max-w-md"><RepoCard repo={sample} /></div> : <p className="text-sm text-neutral-500">Loading real data…</p>}
          code={`<RepoCard repo={repo} onPreview={setPreview} />\n// repo: { full_name, description, language,\n//   stars, forks, stars_growth_7d | null,\n//   license_spdx, category, html_url, avatar_url }`} />

        <Section id="badges" title="Badges & Metrics" desc="Monospace for every number. Tooltips explain each metric. Growth is only shown from verified snapshots."
          preview={<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />Python</span>
            <span className="mono flex items-center gap-1"><Star size={12} />55,306</span>
            <span className="mono flex items-center gap-1"><GitFork size={12} />12,408</span>
            <span className="mono text-emerald-600 dark:text-emerald-400">+214 this week</span>
            <span className="mono border rounded px-1">MIT</span>
            <span className="mono text-neutral-400" title="Insufficient snapshot history">— growth n/a</span>
          </div>}
          code={`<span className="mono flex items-center gap-1">\n  <Star size={12} />{repo.stars.toLocaleString()}\n</span>\n{typeof growth === 'number'\n  ? <span className="mono text-emerald-600">+{growth} this week</span>\n  : <span className="mono text-neutral-400">— growth n/a</span>}`} />

        <Section id="palette" title="Command Palette Trigger" desc="Opens the floating ⌘K palette. Try it — it searches real indexed data."
          preview={<PaletteTriggerDemo />}
          code={`const { open } = useCommandPalette();\n// ⌘K / Ctrl+K listener lives in Navbar\n<button onClick={open}>…</button>`} />

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

        <Section id="type-wall" title="Typographic Wall" desc="Homepage centerpiece. The licensed React Bits Pro component drops in here when REACTBITS_LICENSE_KEY is configured — see components/TypographicWall/README.md. Current placeholder shown below."
          preview={<div className="w-full"><TypographicWall /></div>}
          code={`// Licensed: npx shadcn@latest add\n//   @reactbits-starter/typographic-wall-tw\nimport { TypographicWall } from '@/components/ui/typographic-wall';\n<TypographicWall words={[\n  'FINANCIAL INTELLIGENCE',\n  'OPEN SOURCE RESEARCH',\n  // …8 lines total\n]} />`} />
      </div>
    </div>
  );
}
