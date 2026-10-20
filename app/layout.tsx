import './globals.css';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import localFont from 'next/font/local';
import Navbar from '@/components/Navbar';
import GlobalBackground from '@/components/GlobalBackground';
import MarketTicker from '@/components/MarketTicker';
import BackToTop from '@/components/BackToTop';
import { CommandPaletteProvider } from '@/components/CommandPalette';
import { readCache } from '@/lib/store';
import { buildSearchIndex } from '@/lib/search';

const display = localFont({ src: './fonts/space-grotesk-latin.woff2', weight: '300 700', style: 'normal', display: 'swap' });

export const metadata: Metadata = {
  title: 'MarketAtlas — Discover open-source financial research tools',
  description: 'Explore open-source repositories, quantitative frameworks, crypto research tools, and AI-powered financial intelligence.',
};

function themeInit() {
  // inline to avoid flash
  return `(function(){try{var t=localStorage.getItem('ma-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const items = buildSearchIndex(await readCache());
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInit() }} /></head>
      <body className={display.className}>
          <CommandPaletteProvider items={items}>
          <a href="#main" className="skip-link">Skip to content</a>
          <GlobalBackground />
          <Navbar />
          <MarketTicker />
          <main id="main" tabIndex={-1} className="min-h-screen outline-none">{children}</main>
          <BackToTop />
          <footer className="border-t border-[#E7E5E4] dark:border-[#27272A] py-8 text-center text-sm text-neutral-500">
            <a href="https://github.com/jeffsasha" target="_blank" rel="noopener noreferrer" className="mono transition-colors hover:text-violet-400">GitHub · @jeffsasha</a>
          </footer>
          </CommandPaletteProvider>
          <Analytics />
      </body>
    </html>
  );
}
