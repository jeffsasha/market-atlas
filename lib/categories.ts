export const CATEGORIES = [
  { id: 'all', name: 'All Projects' },
  { id: 'us-equity', name: 'US Equity Research' },
  { id: 'crypto', name: 'Crypto & Blockchain' },
  { id: 'quant', name: 'Quantitative Trading' },
  { id: 'backtest', name: 'Backtesting' },
  { id: 'portfolio', name: 'Portfolio Optimization' },
  { id: 'findata', name: 'Financial Data' },
  { id: 'ai-agents', name: 'AI Finance Agents' },
  { id: 'sentiment', name: 'Market Sentiment' },
  { id: 'ta', name: 'Technical Analysis' },
  { id: 'risk', name: 'Risk Management' },
  { id: 'derivatives', name: 'Options & Derivatives' },
] as const;

export const SORTS = [
  { id: 'popular', name: 'Most Popular' },
  { id: 'stars', name: 'Most Starred' },
  { id: 'updated', name: 'Recently Updated' },
  { id: 'created', name: 'Recently Created' },
  { id: 'trending', name: 'Trending' },
  { id: 'az', name: 'Alphabetical' },
] as const;
