import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen, type RootStackParamList } from './HomeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Carga perezosa del remote. `miniApp` es la clave de `remotes`
 * en rspack.config.mjs; `App` es la clave de `exposes` del Mini App.
 */
const FederatedMiniApp = React.lazy(() => import('miniApp/App'));
const FederatedCryptoApp = React.lazy(() => import('cryptoApp/App'));

const initialMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function App() {
  return (
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#0F172A' },
            headerTintColor: '#F8FAFC',
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: '#0F172A' },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Host App' }}
          />
          <Stack.Screen
            name="MiniApp"
            component={MiniAppScreen}
            options={{ title: 'Mini App' }}
          />
          <Stack.Screen
            name="CryptoApp"
            component={CryptoAppScreen}
            options={{ title: 'Crypto App' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
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

function CryptoAppScreen() {
  return (
    <ErrorBoundary FallbackComponent={CryptoAppErrorFallback}>
      <React.Suspense fallback={<LoadingScreen />}>
        <FederatedCryptoApp />
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
        Arranca el servidor del Mini App en el puerto 8082 y asegúrate de que el
        Host puede leer su manifiesto de Federation.
      </Text>
      <Text style={styles.errorHint}>npm run mini:start</Text>
    </View>
  );
}

function CryptoAppErrorFallback() {
  return (
    <View style={styles.center}>
      <Text style={styles.errorTitle}>Crypto App no disponible</Text>
      <Text style={styles.errorBody}>
        Arranca el servidor del Crypto App en el puerto 8083 y asegúrate de que
        el Host puede leer su manifiesto de Federation.
      </Text>
      <Text style={styles.errorHint}>npm run crypto:start</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
