# React Native Micro-frontends using Re.Pack

**Minimum** example to learn Module Federation in React Native: a **Host** (app that is installed on device), a **Crypto App** (a JS module that Host downloads in runtime) and a **Mini App** (another JS module that Host downloads in runtime).

No auth, no backend, nor a real super-app. Just circuit required to see a micro-frontend being loaded inside another app.

```
┌─────────────────────────────────────────────┐
│  Host App  (it is installed in device)      │
│  port 8081                                  │
│                                             │
│   Home  ──►  MiniApp screen                 │
│                  │                          │
│                  │  import('miniApp/App')   │
│                  ▼                          │
│              manifest MF:8082/android|ios   │───────┐
│                                             │       │
│         ──►  CryptoApp screen               │       │
│                  │                          │       │
│                  │  import('cryptoApp/App') │       │
│                  ▼                          │       │
│              manifest MF:8083/android|ios   │       │
└──────────────────┬──────────────────────────┘       │
                   │                                  │
                   │                                  │
                   │                                  │
                   ▼                                  ▼
┌─────────────────────────────────────────────────┐┌────────────────────────────────────────────┐
│ Crypto App  (another project, other server)     ││ Mini App  (another project, other server)  │
│ port 8083                                       ││ port 8082                                  │
│ expose:  ./App  →  apps/crypto/FederatedApp.tsx ││ expose:  ./App  →  apps/mini/App.tsx       │
└─────────────────────────────────────────────────┘└────────────────────────────────────────────┘
```

## Learnt things

1. Why Re.Pack (Rspack) instead of Metro.
2. Host / Remote contract: `remotes` + `exposes` + `shared`.
3. How Host imports a module that **doesn't exist** on its initial bundle.
4. The native limit: JS can load delayed; but not native code.

## Requirements

- Node.js ^22.11
- React Native **0.84.1** (version which Re.Pack 5.3 is validated)
- [React Native env](https://reactnative.dev/docs/set-up-your-environment) (Xcode & Android Studio)
- 4 terminals: every app has its own Re.Pack server

## How running it

In root's repo/folder:

```sh
npm install --prefix apps/host
npm install --prefix apps/mini
npm install --prefix apps/crypto
```

Terminal 1 — Host:

```sh
npm run host:start
```

Terminal 2 — Mini App:

```sh
npm run mini:start
```

Terminal 3 — Crypto App:

```sh
npm run crypto:start
```

Terminal 4 — only Host is installed in device:

```sh
npm run host:android
# or, in macOS:
npm run host:ios
```

Open the app, touch **Cargar Mini App**. You should see a speedy loading and then the Mini App screen (an orange one).

Open the app, touch **Cargar Crypto App**. You should see a speedy loading and then the Crypto App screen (a list of crypto assets which prices updates in real-time).

If «Mini App no disponible» or «Crypto App no disponible» message is shown, Host app didn´t get the manifest. Check `:8082`/`:8083` is up and running. Sometimes is needed to do in an android emulator these steps:

```sh
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8082 tcp:8082
adb reverse tcp:8083 tcp:8083
```

Mini and Crypto App can be launched **standalone** (`npm run mini:android` / `mini:ios` or `npm run crypto:android` / `crypto:ios`) for isolated development too. No need to be installed in federated flow: just the running server.

## Folder structure of the example

```
apps/
  host/                 # native container (rol Host)
    App.tsx             # navigation + React.lazy(() => import('miniApp/App')) + React.lazy(() => import('cryptoApp/App'))
    HomeScreen.tsx      # Host initial screen
    federation.d.ts     # remote module types
    rspack.config.mjs   # remotes + shared
  mini/                 # micro-frontend (Remote role)
    App.tsx             # exposed component
    rspack.config.mjs   # exposes + shared
  crypto/               # real-time crypto market app (remote role micro-frontend)
    FederatedApp.tsx    # exposed component
    App.tsx             # SecurityGate + TanStack Query + Zustand
    src/                # API Binance, UI, security
    rspack.config.mjs   # Re.Pack with Module Federation
```

### 1.a The Mini App exposes a module

In `apps/mini/rspack.config.mjs`:

```js
new Repack.plugins.ModuleFederationPluginV2({ 
name: 'miniApp', 
filename: 'miniApp.container.bundle', 
exposes: { 
'./App': './App', // local file App.tsx 
}, 
//...
});
```

`name` is the identifier of the *container*. `exposes` publishes modules. The Host requests them as `miniApp/App` (name + `exposes` key).

### 1.b The Crypto App exposes a module

In `apps/crypto/rspack.config.mjs`:

```js
new Repack.plugins.ModuleFederationPluginV2({ 
name: 'cryptoApp', 
filename: 'cryptoApp.container.bundle', 
exposes: { 
'./App': './FederatedApp', // local file App.tsx 
}, 
//...
});
```
Check crypto[README.md](apps/crypto/README.md) for binance, security and other details.

`name` is the identifier of the *container*. `exposes` publishes modules. The Host requests them as `ryptoApp/App` (name + `exposes` key).

### 2. The Host registers the remote

In `apps/host/rspack.config.mjs`:

```js
remotes: { 
miniApp: `miniApp@http://localhost:8082/${platform}/mf-manifest.json`,
cryptoApp: `cryptoApp@http://localhost:${CRYPTO_APP_PORT}/${platform}/mf-manifest.json`,
}
```

Three pieces in that chain:

| Part | Meaning |
| --- | --- |
| key `miniApp` | what you use in `import('miniApp/…')` |
| prefix `miniApp@` | must match `name` of the Mini App |
| URL `…/ios\|android/mf-manifest.json` | manifest generated by the Mini App server |

The platform matters: Re.Pack issues different bundles for iOS and Android.

### 3. Shared dependencies

React and React Native **have to be singleton**. Two copies of React in the same process break hooks (`Invalid hook call`).

```js
shared: { 
  'react': { singleton: true, eager: true }, 
  'react-native': { singleton: true, eager: true }, 
  'react-native-safe-area-context': { singleton: true, eager: true },
}
```

- `singleton: true` — a single instance at runtime.
- `eager: true` — is included in the initial bundle (the Host has them ready before requesting the remote).

The versions of `react` and `react-native` must be **identical** on Host, Crypto and Mini App.

### 4. Lazy loading on the Host

```tsx
const FederatedMiniApp = React.lazy(() => import('miniApp/App'));
const FederatedCryptoApp = React.lazy(() => import('cryptoApp/App'));
```

Until you navigate to that screen, the remote JS is not requested. `React.Suspense` covers the wait; `ErrorBoundary` covers a downed server or incompatible remote. The Host remains usable even if the Mini App fails: that's part of the design.

## The detail that does not exist on the web

On the web, a micro-frontend can bring almost everything you need. On mobile, **the native code must already be in the binary** that you uploaded to the store.

Module Federation downloads JavaScript. You can't add a native module, permission, or iOS framework after installing the app.

Practical consequence: if the Mini App uses the camera, the Host had to include that native library in *its* release. The Mini App only delivers the JS that calls that API.

Also don't use this to sneak in a new feature that stores would consider a product change. Re.Pack is used to split bundles, delay loading and update JS already included in the binary.

## Experiments

1. Change background color in `apps/mini/App.tsx`, save, reload the Host. The native app does not recompile: you are seeing the new remote.
2. Stop mini app server and open federated. Host error status should be seen.
3. Add a second `exposes` (as `./Counter`) and import it from Host.
4. Create another mini-app in `apps/` copying `mini`, change `name` / port / `remotes`, and load it in another screen.

## Useful scripts

| Script | Action |
| --- | --- |
| `npm run host:start` | Host Re.Pack in `:8081` |
| `npm run mini:start` | Mini Re.Pack in `:8082` |
| `npm run host:android` / `host:ios` | installs Host |
| `npm test` | Host and Mini App tests |
| `npm run host:bundle` / `mini:bundle` | generates an Android bundle checking |
| `npm run crypto:start` | CryptoApp Re.Pack in `:8083` |
| `npm run crypto:android` / `crypto:ios` | installs CryptoApp |
| `npm run crypto:test` | CryptoApp tests |

## Things not included on this repo (intentionally)

- Production bundles hosting (CDN, Zephyr Cloud, etc.)
- Versioning and remotes signature
- Workspaces with hoisting: every app has its `node_modules` to avoid the classic monorepo foot + React Native

Bigger example: [Super App Showcase](https://github.com/callstack/super-app-showcase) from Callstack.

## References

- [Re.Pack — Quick start](https://re-pack.dev/docs/getting-started/quick-start)
- [ModuleFederationPluginV2](https://re-pack.dev/api/plugins/module-federation-v2)
- [Callstack Super App Guide](https://www.callstack.com/blog/step-by-step-guide-to-super-app-development)
- [Module Federation 2](https://module-federation.io/)
