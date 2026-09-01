import {useQuery} from '@tanstack/react-query';
import {
  fetchBinanceMarkets,
  getTopSymbolsForStreams,
} from '../api/binanceClient';
import {fetchMarketCapsBySymbol} from '../api/coingeckoClient';
import {useCryptoStore} from '../store/cryptoStore';
import {useEffect} from 'react';

export function useCryptoMarkets() {
  const setAssets = useCryptoStore(state => state.setAssets);
  const mergeMarketCaps = useCryptoStore(state => state.mergeMarketCaps);

  const marketsQuery = useQuery({
    queryKey: ['crypto', 'markets'],
    queryFn: fetchBinanceMarkets,
    staleTime: 60_000,
    refetchOnReconnect: true,
  });

  const marketCapQuery = useQuery({
    queryKey: ['crypto', 'market-caps', marketsQuery.data?.map(item => item.symbol)],
    queryFn: async () => {
      const baseAssets = (marketsQuery.data ?? []).map(item => item.baseAsset);
      return fetchMarketCapsBySymbol(baseAssets);
    },
    enabled: Boolean(marketsQuery.data?.length),
    staleTime: 5 * 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (marketsQuery.data) {
      setAssets(marketsQuery.data);
    }
  }, [marketsQuery.data, setAssets]);

  useEffect(() => {
    if (marketCapQuery.data) {
      mergeMarketCaps(marketCapQuery.data);
    }
  }, [marketCapQuery.data, mergeMarketCaps]);

  return {
    isLoading: marketsQuery.isLoading,
    isError: marketsQuery.isError,
    error: marketsQuery.error,
    refetch: marketsQuery.refetch,
    streamSymbols: getTopSymbolsForStreams(marketsQuery.data ?? []),
    isRefreshing: marketsQuery.isFetching && !marketsQuery.isLoading,
  };
}
