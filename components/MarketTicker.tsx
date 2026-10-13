'use client';

import { useEffect, useRef, useState } from 'react';

const symbols = [
  ['NASDAQ:AAPL', 'AAPL'], ['NASDAQ:MSFT', 'MSFT'], ['NASDAQ:NVDA', 'NVDA'],
  ['NASDAQ:GOOGL', 'GOOGL'], ['NASDAQ:AMZN', 'AMZN'], ['NASDAQ:META', 'META'],
  ['NASDAQ:TSLA', 'TSLA'], ['AMEX:SPY', 'SPY'], ['NASDAQ:QQQ', 'QQQ'],
  ['COINBASE:BTCUSD', 'BTC/USD'], ['COINBASE:ETHUSD', 'ETH/USD'], ['COINBASE:SOLUSD', 'SOL/USD'],
];
const marketUrl = (symbol: string) => `https://www.tradingview.com/symbols/${symbol.replace(':', '-')}/`;

export default function MarketTicker() {
  const host = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'dark' | 'light' | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const update = () => setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    update(); const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = host.current;
    if (!container || !theme) return;
    let cancelled = false;
    let frame: HTMLIFrameElement | null = null;
    const ready = () => { if (!cancelled) { clearTimeout(deadline); setState('ready'); } };
    const unavailable = () => { if (!cancelled) { clearTimeout(deadline); setState('unavailable'); } };
    setState('loading');
    const deadline = setTimeout(unavailable, 20000);
    const observer = new MutationObserver(() => {
      const next = container.querySelector('iframe');
      if (next && next !== frame) {
        frame = next; frame.title = 'US stock and cryptocurrency quotes by TradingView';
        // Provide stable keyboard-accessible symbol links beside the provider-owned marquee.
        frame.tabIndex = -1;
        frame.addEventListener('load', ready, { once: true });
        frame.addEventListener('error', unavailable, { once: true });
      }
    });
    observer.observe(container, { childList: true, subtree: true });
    const widget = document.createElement('div'); widget.className = 'tradingview-widget-container__widget';
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true; script.onerror = unavailable;
    script.textContent = JSON.stringify({ symbols: symbols.map(([proName, title]) => ({ proName, title })), colorTheme: theme, locale: 'en', isTransparent: false, showSymbolLogo: false, displayMode: 'regular' });
    const generation = document.createElement('div');
    generation.className = 'tradingview-widget-container';
    container.replaceChildren(generation);
    generation.append(widget, script);
    return () => {
      cancelled = true; clearTimeout(deadline); observer.disconnect();
      frame?.removeEventListener('load', ready); frame?.removeEventListener('error', unavailable);
      script.onerror = null; generation.remove();
    };
  }, [theme, attempt]);

  return <section className="market-ticker relative flex min-w-0 items-center" aria-label="US stock and crypto market ticker">
    <details className="market-symbols shrink-0">
      <summary className="mono flex h-[46px] cursor-pointer flex-col justify-center px-3 text-[9px] outline-offset-[-3px] sm:px-5" aria-label="Browse market symbols"><span className="flex items-center gap-1.5 font-medium"><span className="h-1 w-1 rounded-full bg-violet-400" />MARKETS ↗</span><span className="mt-1 text-[8px] text-neutral-500">Equities delayed</span></summary>
      <div className="market-symbol-menu absolute left-3 top-full z-20 w-64 rounded-xl border p-4 shadow-lg"><p className="mb-3 text-[11px] leading-relaxed text-neutral-500">USD quotes by TradingView. Equities are delayed; exchange availability and market status are shown by the provider. Crypto trades continuously.</p><div className="grid grid-cols-3 gap-2">{symbols.map(([symbol, name]) => <a key={symbol} href={marketUrl(symbol)} target="_blank" rel="noopener noreferrer" className="search-suggestion rounded px-2 py-2 text-center text-[10px]">{name}</a>)}</div><a href="https://www.tradingview.com/markets/" target="_blank" rel="noopener noreferrer" className="mt-4 block text-[10px] underline underline-offset-4">Market quotes by TradingView</a></div>
    </details>
    <div className="relative h-[46px] min-w-0 flex-1">
      <div ref={host} className={`tradingview-widget-container h-[46px] w-full ${state !== 'ready' ? 'invisible' : ''}`} />
      {state !== 'ready' && <div className="ticker-placeholder absolute inset-0 flex items-center overflow-hidden" aria-live="polite"><div className="flex min-w-max items-center">{symbols.map(([, name]) => <span key={name} className="mono flex w-[165px] shrink-0 items-center gap-3 border-l border-current/10 px-4 text-[10px]"><span>{name}</span><span className="text-neutral-500">—</span><span className="text-neutral-500">{state === 'loading' ? 'Loading' : 'Unavailable'}</span></span>)}</div></div>}
    </div>
    <div className="ticker-source mono shrink-0 px-2 text-[8px] text-neutral-500 sm:px-4">{state === 'unavailable' ? <button onClick={() => setAttempt(value => value + 1)} className="underline underline-offset-2">Retry quotes</button> : <a href="https://www.tradingview.com/markets/" target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">by TradingView</a>}</div>
  </section>;
}
