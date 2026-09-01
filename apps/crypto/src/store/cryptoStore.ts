import {create} from 'zustand';
import type {
  CryptoAsset,
  KlineUpdate,
  MiniTickerUpdate,
  TickerUpdate,
  WebSocketStatus,
} from '../api/types';
import {computeLiquidityScore} from '../utils/formatters';

interface CryptoStore {
  assets: Record<string, CryptoAsset>;
  orderedSymbols: string[];
  wsStatus: WebSocketStatus;
  lastWsUpdateAt: number | null;
  setAssets: (assets: CryptoAsset[]) => void;
  mergeMarketCaps: (marketCaps: Record<string, number>) => void;
  setWsStatus: (status: WebSocketStatus) => void;
  mergeMiniTicker: (update: MiniTickerUpdate) => void;
  mergeTicker: (update: TickerUpdate) => void;
  mergeKline: (update: KlineUpdate) => void;
}

function patchAsset(
  assets: Record<string, CryptoAsset>,
  symbol: string,
  patch: Partial<CryptoAsset>,
): Record<string, CryptoAsset> {
  const current = assets[symbol];
  if (!current) {
    return assets;
  }

  return {
    ...assets,
    [symbol]: {
      ...current,
      ...patch,
      lastUpdatedAt: patch.lastUpdatedAt ?? Date.now(),
    },
  };
}

export const useCryptoStore = create<CryptoStore>((set, get) => ({
  assets: {},
  orderedSymbols: [],
  wsStatus: 'disconnected',
  lastWsUpdateAt: null,

  setAssets: assets =>
    set({
      assets: Object.fromEntries(assets.map(asset => [asset.symbol, asset])),
      orderedSymbols: assets.map(asset => asset.symbol),
    }),

  mergeMarketCaps: marketCaps =>
    set(state => {
      let nextAssets = state.assets;

      for (const [symbol, marketCap] of Object.entries(marketCaps)) {
        const asset = Object.values(state.assets).find(
          item => item.baseAsset.toLowerCase() === symbol,
        );

        if (asset) {
          nextAssets = patchAsset(nextAssets, asset.symbol, {marketCap});
        }
      }

      return {assets: nextAssets};
    }),

  setWsStatus: status => set({wsStatus: status}),

  mergeMiniTicker: update =>
    set(state => {
      const current = state.assets[update.symbol];
      if (!current) {
        return state;
      }

      const change24h =
        update.openPrice > 0
          ? ((update.price - update.openPrice) / update.openPrice) * 100
          : current.change24h;

      return {
        assets: patchAsset(state.assets, update.symbol, {
          price: update.price,
          volume24h: update.quoteVolume,
          change24h,
          high24h: update.highPrice,
          low24h: update.lowPrice,
        }),
        lastWsUpdateAt: update.eventTime,
      };
    }),

  mergeTicker: update =>
    set(state => {
      const current = state.assets[update.symbol];
      if (!current) {
        return state;
      }

      return {
        assets: patchAsset(state.assets, update.symbol, {
          price: update.price,
          change24h: update.change24h,
          volume24h: update.quoteVolume24h,
          bestBid: update.bestBid,
          bestAsk: update.bestAsk,
          liquidityScore: computeLiquidityScore(
            update.quoteVolume24h,
            update.bestBid,
            update.bestAsk,
          ),
        }),
        lastWsUpdateAt: update.eventTime,
      };
    }),

  mergeKline: update =>
    set(state => ({
      assets: patchAsset(state.assets, update.symbol, {
        change1h: update.change1h,
      }),
      lastWsUpdateAt: update.eventTime,
    })),
}));

export function selectOrderedAssets(state: CryptoStore): CryptoAsset[] {
  return state.orderedSymbols
    .map(symbol => state.assets[symbol])
    .filter((asset): asset is CryptoAsset => Boolean(asset));
}
