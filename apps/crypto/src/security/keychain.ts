import * as Keychain from 'react-native-keychain';

const SERVICE_PREFIX = 'com.repackmf.crypto';

export async function saveSecret(
  key: string,
  value: string,
): Promise<void> {
  await Keychain.setGenericPassword(key, value, {
    service: `${SERVICE_PREFIX}.${key}`,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function getSecret(key: string): Promise<string | null> {
  const credentials = await Keychain.getGenericPassword({
    service: `${SERVICE_PREFIX}.${key}`,
  });

  if (!credentials) {
    return null;
  }

  return credentials.password;
}

export async function deleteSecret(key: string): Promise<void> {
  await Keychain.resetGenericPassword({
    service: `${SERVICE_PREFIX}.${key}`,
  });
}

export async function getCoinGeckoApiKey(): Promise<string | null> {
  return getSecret('coingecko_api_key');
}

export async function setCoinGeckoApiKey(value: string): Promise<void> {
  await saveSecret('coingecko_api_key', value);
}
