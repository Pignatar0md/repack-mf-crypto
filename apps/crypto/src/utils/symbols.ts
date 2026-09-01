const QUOTE_SUFFIXES = ['USDT', 'USDC', 'BUSD', 'BTC', 'ETH'] as const;

export function toBaseAsset(symbol: string): string {
  for (const quote of QUOTE_SUFFIXES) {
    if (symbol.endsWith(quote) && symbol.length > quote.length) {
      return symbol.slice(0, -quote.length);
    }
  }

  return symbol;
}

export function isUsdtPair(symbol: string): boolean {
  return symbol.endsWith('USDT');
}
