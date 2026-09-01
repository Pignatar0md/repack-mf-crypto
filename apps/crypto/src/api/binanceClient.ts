import type {BinanceTicker24hr, CryptoAsset} from './types';
import {computeLiquidityScore} from '../utils/formatters';
import {isUsdtPair, toBaseAsset} from '../utils/symbols';

export const BINANCE_REST_BASE = 'https://api.binance.com';
export const TOP_MARKETS_LIMIT = 50;
export const LIVE_DETAIL_LIMIT = 20;

function parseNumber(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapBinanceTickerToAsset(ticker: BinanceTicker24hr): CryptoAsset {
  const price = parseNumber(ticker.lastPrice);
  const quoteVolume = parseNumber(ticker.quoteVolume);
  const bestBid = parseNumber(ticker.bidPrice) || null;
  const bestAsk = parseNumber(ticker.askPrice) || null;

  return {
    symbol: ticker.symbol,
    baseAsset: toBaseAsset(ticker.symbol),
    price,
    volume24h: quoteVolume,
    change24h: parseNumber(ticker.priceChangePercent),
    change1h: null,
    marketCap: null,
    liquidityScore: computeLiquidityScore(quoteVolume, bestBid, bestAsk),
    bestBid,
    bestAsk,
    high24h: parseNumber(ticker.highPrice) || null,
    low24h: parseNumber(ticker.lowPrice) || null,
    lastUpdatedAt: Date.now(),
  };
}

export async function fetchBinanceMarkets(): Promise<CryptoAsset[]> {
  const response = await fetch(`${BINANCE_REST_BASE}/api/v3/ticker/24hr`);

  if (!response.ok) {
    throw new Error(`Binance REST error: ${response.status}`);
  }

  const payload = (await response.json()) as BinanceTicker24hr[];

  return payload
    .filter(item => isUsdtPair(item.symbol))
    .map(mapBinanceTickerToAsset)
    .sort((left, right) => right.volume24h - left.volume24h)
    .slice(0, TOP_MARKETS_LIMIT);
}

export function getTopSymbolsForStreams(assets: CryptoAsset[]): string[] {
  return assets.slice(0, LIVE_DETAIL_LIMIT).map(asset => asset.symbol.toLowerCase());
}
