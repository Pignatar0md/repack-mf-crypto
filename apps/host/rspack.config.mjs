import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Puerto del servidor de desarrollo del Mini App. */
const MINI_APP_PORT = 8082;

/**
 * Host: consume módulos remotos.
 *
 * `remotes.miniApp` es el contrato con el Mini App:
 *   - la clave `miniApp` es lo que usas en `import('miniApp/App')`
 *   - el prefijo `miniApp@` debe coincidir con `name` del Mini App
 *   - la URL apunta al manifiesto de Module Federation de ese servidor
 */
export default Repack.defineRspackConfig(env => {
  const { platform } = env;

  return {
    context: __dirname,
    entry: './index.js',
    resolve: {
      ...Repack.getResolveOptions(platform, {
        enablePackageExports: true,
        preferNativePlatform: true,
      }),
    },
    output: {
      uniqueName: 'host',
    },
    module: {
      rules: [
        {
          test: /\.[cm]?[jt]sx?$/,
          type: 'javascript/auto',
          use: {
            loader: '@callstack/repack/babel-swc-loader',
            parallel: true,
            options: {},
          },
        },
        ...Repack.getAssetTransformRules(),
      ],
    },
    plugins: [
      new Repack.RepackPlugin(),
      new Repack.plugins.ModuleFederationPluginV2({
        name: 'host',
        dts: false,
        remotes: {
          miniApp: `miniApp@http://localhost:${MINI_APP_PORT}/${platform}/mf-manifest.json`,
        },
        shared: {
          react: {
            singleton: true,
            eager: true,
          },
          'react-native': {
            singleton: true,
            eager: true,
          },
          'react-native-safe-area-context': {
            singleton: true,
            eager: true,
          },
        },
      }),
    ],
  };
});
