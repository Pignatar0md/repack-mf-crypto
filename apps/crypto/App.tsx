import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {SecurityGate} from './src/security/SecurityGate';
import {MarketsScreen} from './src/screens/MarketsScreen';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

const initialMetrics = {
  frame: {x: 0, y: 0, width: 0, height: 0},
  insets: {top: 0, left: 0, right: 0, bottom: 0},
};

function App() {
  return (
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <QueryClientProvider client={queryClient}>
        <SecurityGate>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerStyle: {backgroundColor: '#0F172A'},
                headerTintColor: '#F8FAFC',
                headerTitleStyle: {fontWeight: '700'},
                contentStyle: {backgroundColor: '#0F172A'},
              }}>
              <Stack.Screen
                name="Markets"
                component={MarketsScreen}
                options={{title: 'Crypto Live'}}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SecurityGate>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
