import React from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {NavigationContainer} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

type RootStackParamList = {
  Home: undefined;
  MiniApp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Carga perezosa del remote. `miniApp` es la clave de `remotes`
 * en rspack.config.mjs; `App` es la clave de `exposes` del Mini App.
 */
const FederatedMiniApp = React.lazy(() => import('miniApp/App'));

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {backgroundColor: '#0F172A'},
            headerTintColor: '#F8FAFC',
            headerTitleStyle: {fontWeight: '700'},
            contentStyle: {backgroundColor: '#0F172A'},
          }}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{title: 'Host App'}}
          />
          <Stack.Screen
            name="MiniApp"
            component={MiniAppScreen}
            options={{title: 'Mini App'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export function HomeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  return (
    <View style={styles.screen}>
      <Text style={styles.kicker}>Re.Pack · Module Federation</Text>
      <Text style={styles.title} testID="host-title">
        Super App · Host
      </Text>
      <Text style={styles.body}>
        Esta app nativa es el contenedor: posee iOS/Android, la navegación y
        las dependencias compartidas (React y React Native). El Mini App vive
        en otro proyecto y se descarga cuando pulsas el botón.
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

function MiniAppScreen() {
  return (
    <ErrorBoundary FallbackComponent={MiniAppErrorFallback}>
      <React.Suspense fallback={<LoadingScreen />}>
        <FederatedMiniApp />
      </React.Suspense>
    </ErrorBoundary>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color="#38BDF8" size="large" />
      <Text style={styles.loading}>Descargando miniApp/App…</Text>
    </View>
  );
}

function MiniAppErrorFallback() {
  return (
    <View style={styles.center}>
      <Text style={styles.errorTitle}>Mini App no disponible</Text>
      <Text style={styles.errorBody}>
        Arranca el servidor del Mini App en el puerto 8082 y asegúrate de que
        el Host puede leer su manifiesto de Federation.
      </Text>
      <Text style={styles.errorHint}>npm run mini:start</Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  loading: {
    color: '#CBD5E1',
    fontSize: 16,
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
    lineHeight: 22,
    textAlign: 'center',
  },
  errorHint: {
    color: '#38BDF8',
    fontFamily: 'Courier',
    fontSize: 14,
  },
});

export default App;
