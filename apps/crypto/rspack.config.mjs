import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as Repack from '@callstack/repack';
import WebpackObfuscator from 'webpack-obfuscator';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const obfuscatorOptions = {
  compact: true,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  selfDefending: false,
  stringArray: true,
  stringArrayThreshold: 0.75,
  transformObjectKeys: false,
};

export default Repack.defineRspackConfig(env => {
  const isProduction = env.mode === 'production';

  return {
    context: __dirname,
    entry: './index.js',
    resolve: {
      ...Repack.getResolveOptions(env.platform, {
        enablePackageExports: true,
        preferNativePlatform: true,
      }),
    },
    output: {
      uniqueName: 'cryptoApp',
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
        name: 'cryptoApp',
        filename: 'cryptoApp.container.bundle',
        dts: false,
        exposes: {
          './App': './FederatedApp',
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
      ...(isProduction
        ? [
            new WebpackObfuscator(obfuscatorOptions, [
              'index.bundle',
              '**/node_modules/**',
            ]),
          ]
        : []),
    ],
  };
});
