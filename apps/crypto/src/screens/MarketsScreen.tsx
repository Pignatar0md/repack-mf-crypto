import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ConnectionBadge} from '../components/ConnectionBadge';
import {CryptoList} from '../components/CryptoList';
import {useCryptoLivePrices} from '../hooks/useCryptoLivePrices';
import {useCryptoMarkets} from '../hooks/useCryptoMarkets';
import {
  selectOrderedAssets,
  useCryptoStore,
} from '../store/cryptoStore';

export function MarketsScreen() {
  const {isLoading, isError, error, refetch, streamSymbols, isRefreshing} =
    useCryptoMarkets();
  const assets = useCryptoStore(selectOrderedAssets);
  const wsStatus = useCryptoStore(state => state.wsStatus);
  const lastWsUpdateAt = useCryptoStore(state => state.lastWsUpdateAt);

  useCryptoLivePrices(streamSymbols);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.center}>
          <ActivityIndicator color="#38BDF8" size="large" />
          <Text style={styles.loadingText}>Cargando mercados…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Error al cargar mercados</Text>
          <Text style={styles.errorBody}>
            {error instanceof Error ? error.message : 'Error desconocido'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mercados USDT</Text>
          <Text style={styles.subtitle}>
            Precios en tiempo real vía Binance WebSocket
          </Text>
        </View>
        <ConnectionBadge status={wsStatus} lastUpdateAt={lastWsUpdateAt} />
      </View>
      <CryptoList
        assets={assets}
        isRefreshing={isRefreshing}
        onRefresh={() => {
          void refetch();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  loadingText: {
    color: '#CBD5E1',
    fontSize: 15,
  },
  errorTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorBody: {
    color: '#CBD5E1',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
