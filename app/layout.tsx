import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { CommandPaletteProvider } from '@/components/CommandPalette';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MarketAtlas — Discover open-source financial research tools',
  description: 'Explore open-source repositories, quantitative frameworks, crypto research tools, and AI-powered financial intelligence.',
};

function themeInit() {
  // inline to avoid flash
  return `(function(){try{var t=localStorage.getItem('ma-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInit() }} /></head>
      <body className={inter.className}>
        <CommandPaletteProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer className="border-t border-[#E7E5E4] dark:border-[#27272A] py-8 text-center text-sm text-neutral-500">
            <span className="mono">MarketAtlas</span> — open-source financial intelligence discovery. Data from GitHub API.
          </footer>
        </CommandPaletteProvider>
      </body>
    </html>
  );
}
