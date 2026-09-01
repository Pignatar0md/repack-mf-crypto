import {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {CryptoAsset} from '../api/types';
import {
  formatCompactUsd,
  formatPercent,
  formatPrice,
  percentColor,
} from '../utils/formatters';

interface CryptoListItemProps {
  asset: CryptoAsset;
}

function CryptoListItemComponent({asset}: CryptoListItemProps) {
  return (
    <View style={styles.row} testID={`crypto-row-${asset.symbol}`}>
      <View style={styles.left}>
        <Text style={styles.symbol}>{asset.baseAsset}</Text>
        <Text style={styles.pair}>{asset.symbol}</Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.price}>{formatPrice(asset.price)}</Text>
        <Text style={styles.meta}>Mcap {formatCompactUsd(asset.marketCap)}</Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.change, {color: percentColor(asset.change1h)}]}>
          1h {formatPercent(asset.change1h)}
        </Text>
        <Text style={[styles.change, {color: percentColor(asset.change24h)}]}>
          24h {formatPercent(asset.change24h)}
        </Text>
        <Text style={styles.meta}>Vol {formatCompactUsd(asset.volume24h)}</Text>
        <Text style={styles.meta}>
          Liq {formatCompactUsd(asset.liquidityScore)}
        </Text>
      </View>
    </View>
  );
}

export const CryptoListItem = memo(CryptoListItemComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#334155',
    gap: 12,
  },
  left: {
    width: 72,
  },
  center: {
    flex: 1,
  },
  right: {
    width: 120,
    alignItems: 'flex-end',
    gap: 2,
  },
  symbol: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  pair: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  price: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  change: {
    fontSize: 12,
    fontWeight: '700',
  },
});
