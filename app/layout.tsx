import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Navbar from '@/components/Navbar';

const display = localFont({ src: './fonts/space-grotesk-latin.woff2', weight: '300 700', style: 'normal', display: 'swap' });

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
      <body className={display.className}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer className="border-t border-[#E7E5E4] dark:border-[#27272A] py-8 text-center text-sm text-neutral-500">
            <span className="mono">MarketAtlas</span> — open-source financial intelligence discovery. Data from GitHub API.
          </footer>
      </body>
    </html>
  );
}
