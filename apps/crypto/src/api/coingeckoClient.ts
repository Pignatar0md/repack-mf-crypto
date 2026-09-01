import type {CoinGeckoMarket} from './types';

const COINGECKO_REST_BASE = 'https://api.coingecko.com/api/v3';

export async function fetchMarketCapsBySymbol(
  symbols: string[],
): Promise<Record<string, number>> {
  if (symbols.length === 0) {
    return {};
  }

  const uniqueSymbols = [...new Set(symbols.map(symbol => symbol.toLowerCase()))];
  const params = new URLSearchParams({
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: '250',
    page: '1',
    sparkline: 'false',
  });

  const response = await fetch(`${COINGECKO_REST_BASE}/coins/markets?${params}`);

  if (!response.ok) {
    throw new Error(`CoinGecko REST error: ${response.status}`);
  }

  const payload = (await response.json()) as CoinGeckoMarket[];
  const symbolSet = new Set(uniqueSymbols);
  const marketCaps: Record<string, number> = {};

  for (const item of payload) {
    const symbol = item.symbol.toLowerCase();
    if (symbolSet.has(symbol) && item.market_cap > 0) {
      marketCaps[symbol] = item.market_cap;
    }
  }

  return marketCaps;
}
