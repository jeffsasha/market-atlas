'use client';

import type { ReactNode } from 'react';

export default function FloatingSurface({ children, className = '', inline = false }: { children: ReactNode; className?: string; inline?: boolean }) {
  const Tag = inline ? 'span' : 'div';
  return <Tag className={`floating-surface ${className}`}>{children}</Tag>;
}
