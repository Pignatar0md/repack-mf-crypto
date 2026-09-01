import {useEffect, useRef} from 'react';
import {
  BinanceWebSocketManager,
  buildBinanceStreams,
} from '../api/binanceWebSocket';
import {useCryptoStore} from '../store/cryptoStore';

export function useCryptoLivePrices(symbols: string[]): void {
  const mergeMiniTicker = useCryptoStore(state => state.mergeMiniTicker);
  const mergeTicker = useCryptoStore(state => state.mergeTicker);
  const mergeKline = useCryptoStore(state => state.mergeKline);
  const setWsStatus = useCryptoStore(state => state.setWsStatus);
  const managerRef = useRef<BinanceWebSocketManager | null>(null);

  useEffect(() => {
    if (symbols.length === 0) {
      return undefined;
    }

    const manager = new BinanceWebSocketManager({
      onMiniTicker: mergeMiniTicker,
      onTicker: mergeTicker,
      onKline: mergeKline,
      onStatusChange: setWsStatus,
    });

    managerRef.current = manager;
    manager.connect(buildBinanceStreams(symbols));

    return () => {
      manager.disconnect();
      managerRef.current = null;
    };
  }, [symbols.join('|'), mergeMiniTicker, mergeTicker, mergeKline, setWsStatus]);
}
