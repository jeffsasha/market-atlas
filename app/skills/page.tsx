'use client';
import { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function SkillsPage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  useEffect(() => { fetch('/api/skills').then(r => r.json()).then(j => setSkills(j.results || [])); }, []);

  const copy = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 1500); };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">AI Agent Skills</h1>
      <p className="text-sm text-neutral-500 mt-1 mb-6">Only skills with a verified <span className="mono">SKILL.md</span> are listed. Install commands come from project docs — never invented.</p>
      {skills.length === 0 ? <p className="text-sm text-neutral-500 py-12 text-center">No verified skills yet. Run <span className="mono">npm run seed</span> to discover.</p> :
      <div className="grid md:grid-cols-2 gap-4">
        {skills.map(s => (
          <div key={s.skill_name} className="border border-[#E7E5E4] dark:border-[#27272A] bg-white dark:bg-[#131316] rounded-lg p-4">
            <div className="mono text-sm font-semibold">{s.skill_name}</div>
            <p className="text-[13px] text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">{s.description}</p>
            <div className="mono text-xs text-neutral-500 mt-2">path: {s.skill_path} · by {s.author}</div>
            {s.install_command ? (
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 mono text-xs bg-neutral-100 dark:bg-white/5 border rounded-lg px-3 py-2 truncate">{s.install_command}</code>
                <button onClick={() => copy(s.install_command, s.skill_name)} className="p-2 border rounded-lg" aria-label="Copy install command">
                  {copied === s.skill_name ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            ) : <p className="mono text-xs text-neutral-400 mt-3">No verified install command in docs.</p>}
            <a href={s.source_url} target="_blank" rel="noreferrer" className="text-xs mono text-neutral-500 hover:text-black dark:hover:text-white mt-3 inline-block">Source ↗</a>
          </div>
        ))}
      </div>}
    </div>
  );
}
