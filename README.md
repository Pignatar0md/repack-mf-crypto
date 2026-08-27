# Micro-frontends en React Native con Re.Pack

Ejemplo **mínimo** para aprender Module Federation en React Native: un **Host** (la app que se instala en el teléfono) y un **Mini App** (un módulo JavaScript que el Host descarga en runtime).

No hay autenticación, ni backend, ni una super-app de verdad. Solo el circuito que hace falta para ver un micro-frontend cargarse dentro de otra app.

```
┌─────────────────────────────────────────────┐
│  Host App  (se instala en el dispositivo)   │
│  puerto 8081                                │
│                                             │
│   Home  ──►  MiniApp screen                 │
│                  │                          │
│                  │  import('miniApp/App')   │
│                  ▼                          │
│         manifiesto MF  :8082/android|ios    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Mini App  (otro proyecto, otro servidor)   │
│  puerto 8082                                │
│  expone:  ./App  →  apps/mini/App.tsx       │
└─────────────────────────────────────────────┘
```

## Qué vas a aprender

1. Por qué Re.Pack (Rspack) en lugar de Metro.
2. El contrato Host / Remote: `remotes` + `exposes` + `shared`.
3. Cómo el Host importa un módulo que **no está** en su bundle inicial.
4. El límite nativo: el JS puede llegar tarde; el código nativo no.

## Requisitos

- Node.js 22.11 o superior
- React Native **0.84.1** (la versión con la que Re.Pack 5.3 está validado)
- [Entorno de React Native](https://reactnative.dev/docs/set-up-your-environment) (Xcode y/o Android Studio)
- Dos terminales: cada app tiene su propio servidor de Re.Pack

## Cómo ejecutarlo

En la raíz del repo:

```sh
npm install --prefix apps/host
npm install --prefix apps/mini
```

Terminal 1 — Host:

```sh
npm run host:start
```

Terminal 2 — Mini App:

```sh
npm run mini:start
```

Terminal 3 — solo el Host se instala en el dispositivo:

```sh
npm run host:android
# o, en macOS:
npm run host:ios
```

Abre la app, pulsa **Cargar Mini App**. Deberías ver un loading breve y después la pantalla naranja del Mini App.

Si ves «Mini App no disponible», el Host no alcanzó el manifiesto. Comprueba que `:8082` está arriba. En un emulador Android suele hacer falta:

```sh
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8082 tcp:8082
```

El Mini App también se puede lanzar **solo** (`npm run mini:android` / `mini:ios`) para desarrollarlo aislado. En el flujo federado no hace falta instalarlo: basta con su servidor.

## Anatomía del ejemplo

```
apps/
  host/                 # contenedor nativo (rol Host)
    App.tsx             # navegación + React.lazy(() => import('miniApp/App'))
    HomeScreen.tsx      # pantalla inicial del Host
    federation.d.ts     # tipos del módulo remoto
    rspack.config.mjs   # remotes + shared
  mini/                 # micro-frontend (rol Remote)
    App.tsx             # componente que se expone
    rspack.config.mjs   # exposes + shared
```

### 1. El Mini App expone un módulo

En `apps/mini/rspack.config.mjs`:

```js
new Repack.plugins.ModuleFederationPluginV2({
  name: 'miniApp',
  filename: 'miniApp.container.bundle',
  exposes: {
    './App': './App', // archivo local App.tsx
  },
  // ...
});
```

`name` es el identificador del *container*. `exposes` publica módulos. El Host los pide como `miniApp/App` (nombre + clave de `exposes`).

### 2. El Host registra el remote

En `apps/host/rspack.config.mjs`:

```js
remotes: {
  miniApp: `miniApp@http://localhost:8082/${platform}/mf-manifest.json`,
}
```

Tres piezas en esa cadena:

| Parte | Significado |
| --- | --- |
| clave `miniApp` | lo que usas en `import('miniApp/…')` |
| prefijo `miniApp@` | debe coincidir con `name` del Mini App |
| URL `…/ios\|android/mf-manifest.json` | manifiesto que genera el servidor del Mini App |

El `platform` importa: Re.Pack emite bundles distintos para iOS y Android.

### 3. Dependencias compartidas

React y React Native **tienen que ser singleton**. Dos copias de React en el mismo proceso rompen los hooks (`Invalid hook call`).

```js
shared: {
  react: { singleton: true, eager: true },
  'react-native': { singleton: true, eager: true },
  'react-native-safe-area-context': { singleton: true, eager: true },
}
```

- `singleton: true` — una sola instancia en runtime.
- `eager: true` — se incluye en el bundle inicial (el Host las tiene listas antes de pedir el remote).

Las versiones de `react` y `react-native` deben ser **idénticas** en Host y Mini App.

### 4. Carga perezosa en el Host

```tsx
const FederatedMiniApp = React.lazy(() => import('miniApp/App'));
```

Hasta que navegas a esa pantalla no se pide el JS remoto. `React.Suspense` cubre la espera; `ErrorBoundary` cubre un servidor caído o un remote incompatible. El Host sigue usable aunque el Mini App falle: eso es parte del diseño.

## El detalle que no existe en la web

En la web, un micro-frontend puede traer casi todo lo que necesita. En móvil, **el código nativo ya tiene que estar en el binario** que subiste a la tienda.

Module Federation descarga JavaScript. No puede añadir un módulo nativo, un permiso o un framework de iOS después de instalar la app.

Consecuencia práctica: si el Mini App usa la cámara, el Host tuvo que incluir esa librería nativa en *su* release. El Mini App solo entrega el JS que llama a esa API.

Tampoco uses esto para colar una feature nueva que las tiendas considerarían un cambio de producto. Re.Pack sirve para partir bundles, retrasar carga y actualizar JS ya contemplado en el binario.

## Experimentos (para interiorizarlo)

1. Cambia el color de fondo en `apps/mini/App.tsx`, guarda, recarga el Host. El nativo no se recompila: estás viendo el remote nuevo.
2. Para el servidor del Mini App y abre la pantalla federada. Debería salir el estado de error del Host.
3. Añade un segundo `exposes` (por ejemplo `./Counter`) e impórtalo desde el Host.
4. Crea otro mini-app en `apps/` copiando `mini`, cambia `name` / puerto / `remotes`, y cárgalo en otra pantalla.

## Scripts útiles

| Script | Qué hace |
| --- | --- |
| `npm run host:start` | Re.Pack del Host en `:8081` |
| `npm run mini:start` | Re.Pack del Mini App en `:8082` |
| `npm run host:android` / `host:ios` | instala el Host |
| `npm test` | tests de Host y Mini App |
| `npm run host:bundle` / `mini:bundle` | genera un bundle Android de comprobación |

## Qué no incluye este repo (a propósito)

- Un tercer mini-app ni un paquete de diseño compartido
- Hosting de bundles en producción (CDN, Zephyr Cloud, etc.)
- Versionado y firma de remotes
- Workspaces con hoisting: cada app tiene su `node_modules` para evitar el clásico pie de monorepo + React Native

Cuando quieras un ejemplo más grande: [Super App Showcase](https://github.com/callstack/super-app-showcase) de Callstack.

## Referencias

- [Re.Pack — Quick start](https://re-pack.dev/docs/getting-started/quick-start)
- [ModuleFederationPluginV2](https://re-pack.dev/api/plugins/module-federation-v2)
- [Guía Super App de Callstack](https://www.callstack.com/blog/step-by-step-guide-to-super-app-development)
- [Module Federation 2](https://module-federation.io/)
