'use client';

import { useId, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { labMetrics, normalizeMetric, LabMetric, WeeklyRepo } from '@/lib/github-lab';

export default function RepoRadar({ repo, comparison, all }: { repo: WeeklyRepo; comparison?: WeeklyRepo; all: WeeklyRepo[] }) {
  const id = useId();
  const reduced = useReducedMotion();
  const [active, setActive] = useState<LabMetric>('weekly_stars');
  const axes = labMetrics.filter(metric => repo[metric.key] !== null);
  const maximum = (key: LabMetric) => Math.max(0, ...all.map(item => item[key] ?? 0));
  const point = (index: number, radius: number) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / axes.length;
    return [210 + Math.cos(angle) * radius, 176 + Math.sin(angle) * radius];
  };
  const polygon = (item: WeeklyRepo) => axes.map((metric, index) => point(index, (normalizeMetric(item[metric.key], maximum(metric.key)) ?? 0) / 100 * 114).join(',')).join(' ');
  const canCompare = comparison && axes.every(metric => comparison[metric.key] !== null);
  const label = labMetrics.find(metric => metric.key === active)?.label;
  const value = (number: number | null) => number === null ? 'Unavailable' : number.toLocaleString('en-US');
  return (
    <div className="min-w-0">
      <svg viewBox="0 0 420 355" className="mx-auto block w-full max-w-[440px] overflow-visible" role="img" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>{`${repo.full_name} repository metrics`}</title>
        <desc id={`${id}-description`}>{`Each axis is scaled from zero to the highest value in this top-ten snapshot. ${axes.map(metric => `${metric.label}: ${value(repo[metric.key])}`).join('. ')}.`}</desc>
        {[.25,.5,.75,1].map(scale => <polygon key={scale} points={axes.map((_, index) => point(index, 114 * scale).join(',')).join(' ')} fill="none" stroke="currentColor" className="text-neutral-300 dark:text-neutral-700" strokeDasharray="4 6" />)}
        {axes.map((metric, index) => {
          const end = point(index, 114), text = point(index, 151);
          return <g key={metric.key}><line x1="210" y1="176" x2={end[0]} y2={end[1]} stroke="currentColor" className="text-neutral-300 dark:text-neutral-700" /><text x={text[0]} y={text[1]} textAnchor="middle" dominantBaseline="middle" fill="currentColor" className="fill-neutral-500 text-[11px] font-medium dark:fill-neutral-400">{metric.label}</text></g>;
        })}
        {[25,50,75,100].map(value => <text key={value} x="219" y={176 - value / 100 * 114 + 4} className="fill-neutral-400 text-[8px] dark:fill-neutral-600">{value}</text>)}
        {canCompare && <motion.polygon initial={false} animate={{ points: polygon(comparison) }} transition={{ duration: reduced ? 0 : .35 }} fill="#ec48991a" stroke="#ec4899" strokeWidth="2" strokeDasharray="5 4" />}
        <motion.polygon initial={false} animate={{ points: polygon(repo) }} transition={{ duration: reduced ? 0 : .35 }} fill="#a855f72b" stroke="#a855f7" strokeWidth="3" strokeLinejoin="round" />
        {axes.map((metric, index) => {
          const position = point(index, (normalizeMetric(repo[metric.key], maximum(metric.key)) ?? 0) / 100 * 114);
          return <circle key={metric.key} cx={position[0]} cy={position[1]} r={active === metric.key ? 6 : 4} fill="#c084fc" stroke="var(--lab-surface)" strokeWidth="2" />;
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Inspect chart metrics">{axes.map(metric => <button key={metric.key} onClick={() => setActive(metric.key)} aria-pressed={active === metric.key} className={`rounded-full px-2.5 py-1 text-[10px] ${active === metric.key ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300' : 'text-neutral-500 hover:bg-purple-500/5'}`}>{metric.label}</button>)}</div>
      <p className="mt-4 text-center text-xs text-neutral-500" aria-live="polite">{label}: <strong className="text-neutral-900 dark:text-white">{value(repo[active])}</strong>{canCompare && <> <span className="mx-1">vs</span> <strong className="text-pink-600 dark:text-pink-300">{value(comparison[active])}</strong></>}</p>
      <p className="mt-3 text-center text-[10px] leading-relaxed text-neutral-400">100 = the largest value in this top-10 snapshot.<br />Contributors include anonymous contributors. Commits cover the default branch over seven days.</p>
      {comparison && !canCompare && <p className="mt-2 text-center text-[10px] text-neutral-500">Comparison chart unavailable because a source metric is missing.</p>}
    </div>
  );
}
