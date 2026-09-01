# CryptoApp — Mercados en tiempo real

App React Native standalone con listado de criptomonedas USDT alimentado por **Binance** (REST + WebSocket), estado con **Zustand**, caché con **TanStack Query**, y capa de seguridad (SSL pinning, Keychain, freeRASP, ofuscación).

## Requisitos

- Node.js >= 22.11
- React Native 0.84.1
- Android Studio y/o Xcode

## Instalación

```sh
npm install --prefix apps/crypto
```

## Ejecución

```sh
# Terminal 1 — servidor Re.Pack (puerto 8083)
npm run crypto:start

# Terminal 2 — instalar en dispositivo/emulador
npm run crypto:android
# o en macOS:
npm run crypto:ios
```

Emulador Android:

```sh
adb reverse tcp:8083 tcp:8083
```

## Arquitectura de datos

| Campo | Fuente |
| --- | --- |
| Precio, vol 24h, % 24h | Binance REST + WebSocket `!miniTicker@arr` / `@ticker` |
| % 1h | Binance WebSocket `@kline_1h` |
| Liquidez (proxy) | Spread bid/ask + volumen quote 24h |
| Market cap | CoinGecko REST `/coins/markets` (complementario) |

**Limitación:** Binance Spot no expone market cap nativamente. CoinGecko complementa ese campo con cache de 5 minutos.

## Seguridad

- **SSL Pinning:** `react-native-ssl-public-key-pinning` en `api.binance.com`, `stream.binance.com` y `api.coingecko.com` (solo release).
- **Keychain:** secrets en `src/security/keychain.ts` (p. ej. API keys futuras).
- **Root/Jailbreak:** `freerasp-react-native` + `SecurityGate`.
- **Ofuscación:** `webpack-obfuscator` en Rspack production + R8/ProGuard en Android release.

### Configuración freeRASP para producción

Editar `src/security/freeRaspConfig.ts`:

- `androidConfig.certificateHashes` — hash del certificado de release.
- `iosConfig.appTeamId` — Team ID de Apple Developer.

## Tests

```sh
npm run crypto:test
```

## Build release Android

```sh
cd apps/crypto/android
./gradlew assembleRelease
```

El bundle JS se ofusca automáticamente cuando Re.Pack compila en modo `production`.

## Actualizar hashes SSL

```sh
echo | openssl s_client -connect api.binance.com:443 -servername api.binance.com 2>/dev/null \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

Añadir el resultado como `sha256/<hash>` en `src/security/sslPinning.ts`. Mantener al menos un hash de backup para rotación de certificados.
