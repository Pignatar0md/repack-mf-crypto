export interface CryptoAsset {
  symbol: string;
  baseAsset: string;
  price: number;
  volume24h: number;
  change24h: number | null;
  change1h: number | null;
  marketCap: number | null;
  liquidityScore: number | null;
  bestBid: number | null;
  bestAsk: number | null;
  high24h: number | null;
  low24h: number | null;
  lastUpdatedAt: number;
}

export interface BinanceTicker24hr {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
  quoteVolume: string;
  highPrice: string;
  lowPrice: string;
  bidPrice: string;
  askPrice: string;
}

export interface MiniTickerUpdate {
  symbol: string;
  price: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
  eventTime: number;
}

export interface TickerUpdate {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  quoteVolume24h: number;
  bestBid: number;
  bestAsk: number;
  eventTime: number;
}

export interface KlineUpdate {
  symbol: string;
  open: number;
  close: number;
  change1h: number;
  eventTime: number;
}

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected';

export interface CoinGeckoMarket {
  symbol: string;
  market_cap: number;
}
