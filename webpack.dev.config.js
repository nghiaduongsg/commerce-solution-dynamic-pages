const path = require('path');

// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const ESLintPlugin = require('eslint-webpack-plugin');
const { ProgressPlugin } = require('webpack');

module.exports = function (env, argv) {
  return {
    watch: true,
    watchOptions: {
      ignored: '**/node_modules',
      poll: 1000,
    },
    mode: argv.mode ?? 'development',
    entry: {
      setup: path.resolve(__dirname, 'packages/setup/index.tsx'),
      layout: path.resolve(__dirname, 'packages/layout/index.tsx'),

      // THEME
      theme: path.resolve(__dirname, 'packages/theme/index.tsx'),

      // CORE
      core: path.resolve(__dirname, 'packages/core/index.tsx'),
      'core.apiData': path.resolve(__dirname, 'packages/core/apiData/index.tsx'),
      'core.initialization': path.resolve(__dirname, 'packages/core/initialization/index.tsx'),

      // COMMON
      common: path.resolve(__dirname, 'packages/common/index.tsx'),
      'common.components': path.resolve(__dirname, 'packages/common/components.ts'),
      'common.utils': path.resolve(__dirname, 'packages/common/src/utils/index.tsx'),
      'common.dataResolver': path.resolve(__dirname, 'packages/common/src/dataResolver/index.tsx'),

      // DYNAMIC
      dynamic: path.resolve(__dirname, 'packages/dynamic/index.tsx'),
      'dynamic.entity': path.resolve(__dirname, 'packages/dynamic/hooks.tsx'),
      'dynamic.utils': path.resolve(__dirname, 'packages/dynamic/utils.tsx'),

      // CONSTANTS
      'constants.screenTypes': path.resolve(__dirname, 'packages/constants/screenTypeIds.ts'),
      'constants.translations': path.resolve(
        __dirname,
        'packages/constants/translationNamespaces.ts',
      ),
      'constants.validationCodes': path.resolve(__dirname, 'packages/constants/validationCodes.ts'),
      'constants.codeLists': path.resolve(__dirname, 'packages/constants/codeListVariables.ts'),
      'constants.shortcuts': path.resolve(__dirname, 'packages/constants/keyboardShortcuts.ts'),
    },
    output: {
      filename: '[name].js',
      library: '$',
      libraryTarget: 'umd',
      path: path.resolve(__dirname, 'dist'),
      publicPath: './',
    },
    devtool: 'source-map',
    devServer: {
      static: './dist',
      hot: true,
    },
    module: {
      rules: [
        {
          test: /\.(ts|js)x?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.(s[ac]ss|css)$/i,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
            },
            'sass-loader',
          ],
        },
        {
          test: /\.(png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|webp)$/,
          use: 'url-loader',
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack'],
        },
      ],
    },
    externals: {
      react: 'react',
      'react-dom': 'react-dom',
      'react-redux': 'react-redux',
      'react-router': 'react-router',
      '@mui/material': '@mui/material',
      '@mui/x-date-pickers-pro': '@mui/x-date-pickers-pro',
      '@mui/material/styles': '@mui/material/styles',
      '@mui/icons-material': '@mui/icons-material',
      '@mui/utils': '@mui/utils',
      '@date-fns': '@date-fns',
      i18next: 'i18next',
      'react-i18next': 'react-i18next',
      notistack: 'notistack',
      'redux-observable': 'redux-observable',
      'axios-observable': 'axios-observable',
      axios: 'axios',
      rxjs: 'rxjs',
    },
    resolve: {
      alias: {
        '@root': path.resolve(__dirname, 'packages'),
        '@pkg-common': path.resolve(__dirname, 'packages/common/src/'),
        '@pkg-constants': path.resolve(__dirname, 'packages/constants/'),
        '@pkg-core': path.resolve(__dirname, 'packages/core/'),
        '@pkg-entity': path.resolve(__dirname, 'packages/entity/'),
        '@pkg-form': path.resolve(__dirname, 'packages/form/'),
        '@pkg-list': path.resolve(__dirname, 'packages/list/'),
        '@pkg-layout': path.resolve(__dirname, 'packages/layout/'),
        '@pkg-setup': path.resolve(__dirname, 'packages/setup/'),
        '@pkg-theme': path.resolve(__dirname, 'packages/theme/'),
        '@translations': path.resolve(__dirname, 'packages/core/translations/'),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      fallback: {
        console: require.resolve('console-browserify'),
      },
    },
    plugins: [new ProgressPlugin()],
  };
};
