import {useState} from 'react';
import {Pressable, StatusBar, StyleSheet, Text, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

/**
 * Este componente es el módulo federado.
 * El Host lo carga en runtime con: import('miniApp/App')
 */
const initialMetrics = {
  frame: {x: 0, y: 0, width: 0, height: 0},
  insets: {top: 0, left: 0, right: 0, bottom: 0},
};

function MiniApp() {
  const [taps, setTaps] = useState(0);

  return (
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.screen} testID="mini-screen">
          <View style={styles.badge}>
            <Text style={styles.badgeText}>miniApp / App</Text>
          </View>

          <Text style={styles.title} testID="mini-title">
            Mini App federada
          </Text>
          <Text style={styles.subtitle}>
            Este JavaScript no viaja en el bundle inicial del Host. Re.Pack lo
            descarga del servidor del Mini App (puerto 8082) cuando abres esta
            pantalla.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Prueba de interactividad</Text>
            <Text style={styles.counter} testID="mini-counter">
              {taps}
            </Text>
            <Pressable
              testID="mini-tap"
              style={({pressed}) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setTaps(value => value + 1)}>
              <Text style={styles.buttonText}>Sumar 1</Text>
            </Pressable>
          </View>

          <Text style={styles.hint}>
            Cambia el color de esta pantalla en apps/mini/App.tsx, guarda, y
            recarga el Host. No hace falta recompilar nativo.
          </Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#C2410C',
  },
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#FFF7ED',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  title: {
    color: '#FFF7ED',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: '#FFEDD5',
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    alignItems: 'center',
  },
  cardLabel: {
    color: '#9A3412',
    fontSize: 14,
    fontWeight: '600',
  },
  counter: {
    color: '#C2410C',
    fontSize: 48,
    fontWeight: '800',
  },
  button: {
    backgroundColor: '#C2410C',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#FFF7ED',
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    color: '#FFEDD5',
    fontSize: 13,
    lineHeight: 20,
  },
});

export default MiniApp;
