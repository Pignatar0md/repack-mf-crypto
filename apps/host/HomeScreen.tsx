import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  MiniApp: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({navigation}: Props) {
  return (
    <View style={styles.screen}>
      <Text style={styles.kicker}>Re.Pack · Module Federation</Text>
      <Text style={styles.title} testID="host-title">
        Super App · Host
      </Text>
      <Text style={styles.body}>
        Esta app nativa es el contenedor: posee iOS/Android, la navegación y las
        dependencias compartidas (React y React Native). El Mini App vive en
        otro proyecto y se descarga cuando pulsas el botón.
      </Text>

      <View style={styles.ports}>
        <PortChip label="Host" value="8081" />
        <PortChip label="Mini App" value="8082" />
      </View>

      <Pressable
        testID="open-mini"
        style={({pressed}) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => navigation.navigate('MiniApp')}>
        <Text style={styles.buttonText}>Cargar Mini App</Text>
      </Pressable>
    </View>
  );
}

function PortChip({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>:{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  kicker: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: '800',
  },
  body: {
    color: '#CBD5E1',
    fontSize: 16,
    lineHeight: 24,
  },
  ports: {
    flexDirection: 'row',
    gap: 12,
  },
  chip: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  chipValue: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#38BDF8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
});
