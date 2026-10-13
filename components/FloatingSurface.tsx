'use client';

import type { PointerEvent, ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function FloatingSurface({ children, className = '', inline = false }: { children: ReactNode; className?: string; inline?: boolean }) {
  const reduced = useReducedMotion();
  const Tag = inline ? 'span' : 'div';
  function move(event: PointerEvent<HTMLElement>) {
    if (reduced || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5));
    const y = Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5));
    const style = event.currentTarget.style;
    style.setProperty('--float-x', `${x * 6}px`);
    style.setProperty('--tilt-x', `${-y * 6}deg`);
    style.setProperty('--tilt-y', `${x * 6}deg`);
    style.setProperty('--glow-x', `${(x + .5) * 100}%`);
    style.setProperty('--glow-y', `${(y + .5) * 100}%`);
  }
  function reset(event: PointerEvent<HTMLElement>) {
    for (const key of ['--float-x', '--tilt-x', '--tilt-y', '--glow-x', '--glow-y']) event.currentTarget.style.removeProperty(key);
  }
  return <Tag className={`floating-surface ${className}`} onPointerMove={move} onPointerLeave={reset}>{children}</Tag>;
}
