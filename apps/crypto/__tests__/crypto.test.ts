import {
  computeLiquidityScore,
  formatCompactUsd,
  formatPercent,
  formatPrice,
  percentColor,
} from '../src/utils/formatters';
import {
  selectOrderedAssets,
  useCryptoStore,
} from '../src/store/cryptoStore';

describe('formatters', () => {
  it('formats large prices with grouping', () => {
    expect(formatPrice(67234.5)).toBe('$67,234.50');
  });

  it('formats compact USD values', () => {
    expect(formatCompactUsd(1_500_000_000)).toBe('$1.50B');
  });

  it('formats percent with sign', () => {
    expect(formatPercent(2.345)).toBe('+2.35%');
    expect(formatPercent(-1.2)).toBe('-1.20%');
  });

  it('returns semantic percent colors', () => {
    expect(percentColor(1)).toBe('#22C55E');
    expect(percentColor(-1)).toBe('#EF4444');
  });

  it('computes liquidity score from volume and spread', () => {
    const score = computeLiquidityScore(1_000_000, 100, 100.1);
    expect(score).toBeGreaterThan(900_000);
  });
});

describe('cryptoStore', () => {
  beforeEach(() => {
    useCryptoStore.setState({
      assets: {},
      orderedSymbols: [],
      wsStatus: 'disconnected',
      lastWsUpdateAt: null,
    });
  });

  it('sets and orders assets', () => {
    useCryptoStore.getState().setAssets([
      {
        symbol: 'BTCUSDT',
        baseAsset: 'BTC',
        price: 100,
        volume24h: 1000,
        change24h: 1,
        change1h: null,
        marketCap: null,
        liquidityScore: 500,
        bestBid: 99,
        bestAsk: 101,
        high24h: 110,
        low24h: 90,
        lastUpdatedAt: Date.now(),
      },
    ]);

    const ordered = selectOrderedAssets(useCryptoStore.getState());
    expect(ordered).toHaveLength(1);
    expect(ordered[0]?.symbol).toBe('BTCUSDT');
  });

  it('merges mini ticker updates', () => {
    useCryptoStore.getState().setAssets([
      {
        symbol: 'ETHUSDT',
        baseAsset: 'ETH',
        price: 3000,
        volume24h: 500,
        change24h: 0,
        change1h: null,
        marketCap: null,
        liquidityScore: 100,
        bestBid: null,
        bestAsk: null,
        high24h: null,
        low24h: null,
        lastUpdatedAt: Date.now(),
      },
    ]);

    useCryptoStore.getState().mergeMiniTicker({
      symbol: 'ETHUSDT',
      price: 3100,
      openPrice: 3000,
      highPrice: 3200,
      lowPrice: 2900,
      volume: 10,
      quoteVolume: 600,
      eventTime: Date.now(),
    });

    const asset = useCryptoStore.getState().assets.ETHUSDT;
    expect(asset?.price).toBe(3100);
    expect(asset?.volume24h).toBe(600);
    expect(asset?.change24h).toBeCloseTo(3.333, 2);
  });

  it('merges kline 1h change', () => {
    useCryptoStore.getState().setAssets([
      {
        symbol: 'SOLUSDT',
        baseAsset: 'SOL',
        price: 150,
        volume24h: 200,
        change24h: 0,
        change1h: null,
        marketCap: null,
        liquidityScore: 50,
        bestBid: null,
        bestAsk: null,
        high24h: null,
        low24h: null,
        lastUpdatedAt: Date.now(),
      },
    ]);

    useCryptoStore.getState().mergeKline({
      symbol: 'SOLUSDT',
      open: 100,
      close: 110,
      change1h: 10,
      eventTime: Date.now(),
    });

    expect(useCryptoStore.getState().assets.SOLUSDT?.change1h).toBe(10);
  });
});
