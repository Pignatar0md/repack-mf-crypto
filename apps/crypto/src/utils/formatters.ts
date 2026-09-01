export function formatPrice(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return '—';
  }

  if (value >= 1000) {
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  if (value >= 1) {
    return `$${value.toFixed(2)}`;
  }

  if (value >= 0.01) {
    return `$${value.toFixed(4)}`;
  }

  return `$${value.toFixed(8)}`;
}

export function formatCompactUsd(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return 'N/D';
  }

  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_000_000_000_000) {
    return `${sign}$${(abs / 1_000_000_000_000).toFixed(2)}T`;
  }

  if (abs >= 1_000_000_000) {
    return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  }

  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  }

  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(2)}K`;
  }

  return `${sign}$${abs.toFixed(2)}`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return '—';
  }

  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}

export function percentColor(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return '#94A3B8';
  }

  if (value > 0) {
    return '#22C55E';
  }

  if (value < 0) {
    return '#EF4444';
  }

  return '#94A3B8';
}

export function computeLiquidityScore(
  quoteVolume24h: number,
  bestBid: number | null,
  bestAsk: number | null,
): number {
  const spread =
    bestBid != null && bestAsk != null && bestBid > 0
      ? ((bestAsk - bestBid) / bestBid) * 100
      : 1;

  const spreadFactor = Math.max(0, 100 - spread * 100);
  return quoteVolume24h * (spreadFactor / 100);
}
