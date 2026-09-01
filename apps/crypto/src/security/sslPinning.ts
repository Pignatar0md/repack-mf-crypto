import {initializeSslPinning} from 'react-native-ssl-public-key-pinning';

const BINANCE_PUBLIC_KEY_HASHES = [
  'sha256/Y6BOeqMgXS6wjqk6emFs+Y+HWkIXO2R8Dox5VO1YT0=',
];

const COINGECKO_PUBLIC_KEY_HASHES = [
  'sha256/iAyDoBlNkN0ypLQUj2D87aaMTnWdYPwX4GAn3CakxiU=',
];

export async function setupSslPinning(): Promise<void> {
  if (__DEV__) {
    return;
  }

  await initializeSslPinning({
    'api.binance.com': {
      includeSubdomains: true,
      publicKeyHashes: BINANCE_PUBLIC_KEY_HASHES,
    },
    'stream.binance.com': {
      includeSubdomains: true,
      publicKeyHashes: BINANCE_PUBLIC_KEY_HASHES,
    },
    'api.coingecko.com': {
      includeSubdomains: true,
      publicKeyHashes: COINGECKO_PUBLIC_KEY_HASHES,
    },
  });
}
