import {StyleSheet, Text, View} from 'react-native';
import type {WebSocketStatus} from '../api/types';

interface ConnectionBadgeProps {
  status: WebSocketStatus;
  lastUpdateAt: number | null;
}

const STATUS_LABEL: Record<WebSocketStatus, string> = {
  connecting: 'Conectando…',
  connected: 'En vivo',
  disconnected: 'Desconectado',
};

const STATUS_COLOR: Record<WebSocketStatus, string> = {
  connecting: '#F59E0B',
  connected: '#22C55E',
  disconnected: '#EF4444',
};

export function ConnectionBadge({status, lastUpdateAt}: ConnectionBadgeProps) {
  const timestamp =
    lastUpdateAt != null
      ? new Date(lastUpdateAt).toLocaleTimeString('es-ES')
      : '—';

  return (
    <View style={styles.container} testID="connection-badge">
      <View style={[styles.dot, {backgroundColor: STATUS_COLOR[status]}]} />
      <Text style={styles.label}>{STATUS_LABEL[status]}</Text>
      <Text style={styles.timestamp}>Último tick: {timestamp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1E293B',
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  label: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  timestamp: {
    color: '#94A3B8',
    fontSize: 12,
  },
});
