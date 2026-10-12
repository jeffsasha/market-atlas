'use client';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ code, lang = 'tsx' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div className="relative border border-[#E7E5E4] dark:border-[#27272A] rounded-lg overflow-hidden bg-[#FAFAF9] dark:bg-black/40">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#E7E5E4] dark:border-[#27272A]">
        <span className="mono text-[11px] text-neutral-400">{lang}</span>
        <button onClick={copy} aria-label="Copy code" className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors">
          {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} className="text-neutral-400" />}
        </button>
      </div>
      <pre className="mono text-xs leading-relaxed p-4 overflow-x-auto text-neutral-700 dark:text-neutral-300">{code}</pre>
    </div>
  );
}
