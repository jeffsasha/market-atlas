'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CopyButton({ text, label, className = '' }: { text: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    try { await navigator.clipboard.writeText(text); } catch { return; }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }
  return <button type="button" onClick={copy} aria-label={copied ? 'Copied' : label} title={label} className={`copy-button inline-flex items-center gap-1.5 ${className}`}>
    {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
    <span aria-live="polite">{copied ? 'Copied' : label}</span>
  </button>;
}
