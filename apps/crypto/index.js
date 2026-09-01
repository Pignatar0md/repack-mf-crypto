/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {setupSslPinning} from './src/security/sslPinning';

async function bootstrap() {
  try {
    await setupSslPinning();
  } catch (error) {
    if (!__DEV__) {
      console.error('SSL pinning initialization failed', error);
    }
  }

  AppRegistry.registerComponent(appName, () => App);
}

void bootstrap();
