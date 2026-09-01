import {FlatList, RefreshControl, StyleSheet, Text, View} from 'react-native';
import type {CryptoAsset} from '../api/types';
import {CryptoListItem} from './CryptoListItem';

interface CryptoListProps {
  assets: CryptoAsset[];
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function CryptoList({assets, isRefreshing, onRefresh}: CryptoListProps) {
  return (
    <FlatList
      testID="crypto-list"
      data={assets}
      keyExtractor={item => item.symbol}
      renderItem={({item}) => <CryptoListItem asset={item} />}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#38BDF8"
        />
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No hay mercados disponibles.</Text>
        </View>
      }
      contentContainerStyle={assets.length === 0 ? styles.emptyContainer : undefined}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 15,
  },
});
