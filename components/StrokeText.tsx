'use client';

// Adapted from React Bits StrokeText (David Haz), public TS/Tailwind source.
// https://github.com/DavidHDev/react-bits/blob/main/src/ts-tailwind/TextAnimations/StrokeText/StrokeText.tsx
// Mount-only version with stable HTML geometry, an SSR fallback, and reduced motion.
// See LICENSE.react-bits.md for upstream terms.
import { useEffect, useId, useRef, useState } from 'react';
import { gsap } from 'gsap';

type Box = { x: number; y: number; width: number; height: number };
export default function StrokeText({ text, gradient = false, drawDuration = 1.35, fillDelay = .15, stagger = .03 }: { text: string; gradient?: boolean; drawDuration?: number; fillDelay?: number; stagger?: number }) {
  const root = useRef<HTMLSpanElement>(null);
  const stroke = useRef<SVGTextElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [phase, setPhase] = useState('static');
  const id = `headline-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const letters = Array.from(text);

  useEffect(() => {
    let cancelled = false;
    const measure = () => {
      if (cancelled || !stroke.current) return;
      const bounds = stroke.current.getBBox();
      if (bounds.width) setBox({ x: bounds.x - 1, y: bounds.y - 1, width: bounds.width + 2, height: bounds.height + 2 });
    };
    document.fonts.ready.then(measure).catch(() => {});
    return () => { cancelled = true; };
  }, [text]);

  useEffect(() => {
    if (!box || !root.current) return;
    const strokes = root.current.querySelectorAll('[data-stroke-char]');
    const fills = root.current.querySelectorAll('[data-fill-char]');
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timeline: gsap.core.Timeline | undefined;
    const finish = () => { timeline?.kill(); gsap.set(strokes, { strokeDashoffset: 0 }); gsap.set(fills, { opacity: 1 }); setPhase('complete'); };
    if (preference.matches) finish();
    else {
      gsap.set(strokes, { strokeDasharray: 896, strokeDashoffset: 896 });
      gsap.set(fills, { opacity: 0 }); setPhase('animating');
      timeline = gsap.timeline({ onComplete: () => setPhase('complete') });
      timeline.to(strokes, { strokeDashoffset: 0, duration: drawDuration, ease: 'power2.out', stagger }, 0)
        .to(fills, { opacity: 1, duration: .65, ease: 'power2.out', stagger }, drawDuration + fillDelay);
    }
    const change = () => { if (preference.matches) finish(); };
    preference.addEventListener('change', change);
    return () => { timeline?.kill(); gsap.killTweensOf([...strokes, ...fills]); preference.removeEventListener('change', change); };
  }, [box, drawDuration, fillDelay, stagger]);

  return <span ref={root} className={`stroke-text ${gradient ? 'stroke-text--gradient' : ''}`} data-phase={phase} aria-hidden="true">
    <span className="stroke-text__fallback">{text}</span>
    <svg className="stroke-text__svg" viewBox={box ? `${box.x} ${box.y} ${box.width} ${box.height}` : '0 -128 760 154'} preserveAspectRatio="xMinYMid meet" focusable="false">
      <defs><linearGradient id={id} x1="0%" x2="100%"><stop offset="0%" stopColor="var(--headline-gradient-start)" /><stop offset="100%" stopColor="var(--headline-gradient-end)" /></linearGradient></defs>
      <text ref={stroke} x="0" y="0" fill="none" stroke="var(--headline-stroke)" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" style={{ fontSize: 128, fontWeight: 700, letterSpacing: -6 }}>{letters.map((letter, index) => <tspan key={index} data-stroke-char>{letter}</tspan>)}</text>
      <text x="0" y="0" fill={gradient ? `url(#${id})` : 'var(--page-text)'} style={{ fontSize: 128, fontWeight: 700, letterSpacing: -6 }}>{letters.map((letter, index) => <tspan key={index} data-fill-char>{letter}</tspan>)}</text>
    </svg>
  </span>;
}
