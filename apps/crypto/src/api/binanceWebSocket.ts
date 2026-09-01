import type {
  KlineUpdate,
  MiniTickerUpdate,
  TickerUpdate,
} from './types';

const BINANCE_WS_BASE = 'wss://stream.binance.com:9443';

type MiniTickerPayload = {
  e: '24hrMiniTicker';
  E: number;
  s: string;
  c: string;
  o: string;
  h: string;
  l: string;
  v: string;
  q: string;
};

type TickerPayload = {
  e: '24hrTicker';
  E: number;
  s: string;
  c: string;
  P: string;
  q: string;
  b: string;
  a: string;
};

type KlinePayload = {
  e: 'kline';
  E: number;
  s: string;
  k: {
    o: string;
    c: string;
    x: boolean;
  };
};

type CombinedStreamPayload = {
  stream: string;
  data: MiniTickerPayload | TickerPayload | KlinePayload | MiniTickerPayload[];
};

export interface BinanceWebSocketHandlers {
  onMiniTicker: (update: MiniTickerUpdate) => void;
  onTicker: (update: TickerUpdate) => void;
  onKline: (update: KlineUpdate) => void;
  onStatusChange: (status: 'connecting' | 'connected' | 'disconnected') => void;
}

function parseNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildCombinedStreamUrl(streams: string[]): string {
  const encoded = streams.map(stream => encodeURIComponent(stream)).join('/');
  return `${BINANCE_WS_BASE}/stream?streams=${encoded}`;
}

export class BinanceWebSocketManager {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private shouldReconnect = true;
  private streams: string[] = [];

  constructor(private readonly handlers: BinanceWebSocketHandlers) {}

  connect(streams: string[]): void {
    this.streams = streams;
    this.shouldReconnect = true;
    this.openSocket();
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
    this.handlers.onStatusChange('disconnected');
  }

  private openSocket(): void {
    if (this.streams.length === 0) {
      return;
    }

    this.handlers.onStatusChange('connecting');
    this.socket?.close();

    const url = buildCombinedStreamUrl(this.streams);
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.handlers.onStatusChange('connected');
    };

    this.socket.onmessage = event => {
      this.handleMessage(String(event.data));
    };

    this.socket.onerror = () => {
      this.handlers.onStatusChange('disconnected');
    };

    this.socket.onclose = () => {
      this.handlers.onStatusChange('disconnected');
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect) {
      return;
    }

    const delay = Math.min(30_000, 1_000 * 2 ** this.reconnectAttempts);
    this.reconnectAttempts += 1;

    this.reconnectTimer = setTimeout(() => {
      this.openSocket();
    }, delay);
  }

  private handleMessage(raw: string): void {
    let payload: CombinedStreamPayload | MiniTickerPayload[];

    try {
      payload = JSON.parse(raw) as CombinedStreamPayload | MiniTickerPayload[];
    } catch {
      return;
    }

    if (Array.isArray(payload)) {
      for (const item of payload) {
        this.emitMiniTicker(item);
      }
      return;
    }

    if (!payload.data) {
      return;
    }

    if (Array.isArray(payload.data)) {
      for (const item of payload.data) {
        this.emitMiniTicker(item);
      }
      return;
    }

    const data = payload.data;

    if (data.e === '24hrMiniTicker') {
      this.emitMiniTicker(data);
      return;
    }

    if (data.e === '24hrTicker') {
      this.handlers.onTicker({
        symbol: data.s,
        price: parseNumber(data.c),
        change24h: parseNumber(data.P),
        volume24h: parseNumber(data.q),
        quoteVolume24h: parseNumber(data.q),
        bestBid: parseNumber(data.b),
        bestAsk: parseNumber(data.a),
        eventTime: data.E,
      });
      return;
    }

    if (data.e === 'kline') {
      const open = parseNumber(data.k.o);
      const close = parseNumber(data.k.c);
      const change1h = open > 0 ? ((close - open) / open) * 100 : 0;

      this.handlers.onKline({
        symbol: data.s,
        open,
        close,
        change1h,
        eventTime: data.E,
      });
    }
  }

  private emitMiniTicker(data: MiniTickerPayload): void {
    this.handlers.onMiniTicker({
      symbol: data.s,
      price: parseNumber(data.c),
      openPrice: parseNumber(data.o),
      highPrice: parseNumber(data.h),
      lowPrice: parseNumber(data.l),
      volume: parseNumber(data.v),
      quoteVolume: parseNumber(data.q),
      eventTime: data.E,
    });
  }
}

export function buildBinanceStreams(symbols: string[]): string[] {
  const normalized = symbols.map(symbol => symbol.toLowerCase());
  const streams = ['!miniTicker@arr'];

  for (const symbol of normalized) {
    streams.push(`${symbol}@ticker`);
    streams.push(`${symbol}@kline_1h`);
  }

  return streams;
}
