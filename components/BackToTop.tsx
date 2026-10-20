'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => setVisible(window.scrollY > 900);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  function top() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true });
  }
  return <button type="button" onClick={top} aria-label="Back to top" title="Back to top" tabIndex={visible ? 0 : -1} aria-hidden={!visible} className={`back-to-top ${visible ? 'is-visible' : ''}`}><ArrowUp size={16} /></button>;
}
