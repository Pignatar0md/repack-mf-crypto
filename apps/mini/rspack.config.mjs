import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Mini App: produce (expone) un módulo federado.
 *
 * `exposes['./App']` hace que el Host pueda hacer `import('miniApp/App')`.
 * Este proyecto también es una app React Native completa: puedes
 * ejecutarla sola para desarrollarla, o servirla como remote.
 */
export default Repack.defineRspackConfig(env => ({
    context: __dirname,
    entry: './index.js',
    resolve: {
      ...Repack.getResolveOptions(env.platform, {
        enablePackageExports: true,
        preferNativePlatform: true,
      }),
    },
    output: {
      uniqueName: 'miniApp',
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
        name: 'miniApp',
        filename: 'miniApp.container.bundle',
        dts: false,
        exposes: {
          './App': './App',
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
  }));
