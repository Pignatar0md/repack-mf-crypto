# CryptoApp — real-time markets

Standalone React Native app with USDT cryptocurrency listing powered by Binance (REST + WebSocket), status management with Zustand, caching with TanStack Query, and a security layer (SSL pinning, Keychain, FreeRASP, obfuscation).

## Requirements

- Node.js >= 22.11
- React Native 0.84.1
- Android Studio and/or Xcode

## Installation

```sh
npm install --prefix apps/crypto
```

## Execution

```sh
# Terminal 1 — Re.Pack server (port 8083)
npm run crypto:start

# Terminal 2 — install on device/emulator
npm run crypto:android
# or on macOS:
npm run crypto:ios
```

Android Emulator:

```sh
adb reverse tcp:8083 tcp:8083
```

## Data Architecture

| Field | Source |

| --- | --- |

| Price, 24h vol, 24h % | Binance REST + WebSocket `!miniTicker@arr` / `@ticker` |

| % 1h | Binance WebSocket `@kline_1h` |
| Liquidity (proxy) | Spread bid/ask + quote volume 24h |
| Market cap | CoinGecko REST `/coins/markets` (complementary) |

**Limitation:** Binance Spot does not natively expose market cap. CoinGecko complements that field with a 5-minute cache.

## Security

- **SSL Pinning:** `react-native-ssl-public-key-pinning` on `api.binance.com`, `stream.binance.com` and `api.coingecko.com` (release only).
- **Keychain:** secrets in `src/security/keychain.ts` (e.g. future API keys).
- **Root/Jailbreak:** `freerasp-react-native` + `SecurityGate`.
- **Obfuscation:** `webpack-obfuscator` in Rspack production + R8/ProGuard in Android release.

### FreeRASP configuration for production

Edit `src/security/freeRaspConfig.ts`:

- `androidConfig.certificateHashes` — hash of the release certificate.

- `iosConfig.appTeamId` — Apple Developer Team ID.

## Tests

```sh
npm run crypto:test
```

## Build Android release

```sh
cd apps/crypto/android
./gradlew assembleRelease
```

The JS bundle is automatically obfuscated when Re.Pack compiles in `production` mode.

## Update SSL hashes

```sh
echo | openssl s_client -connect api.binance.com:443 -servername api.binance.com 2>/dev/null

| openssl x509 -pubkey -noout

| openssl pkey -pubin -outform der

| openssl dgst -sha256 -binary

| openssl enc -base64
```

Add the result as `sha256/<hash>` in `src/security/sslPinning.ts`. Keep at least one backup hash for certificate rotation.