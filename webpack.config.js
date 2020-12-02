const ESLintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const postcssPresetEnv = require('postcss-preset-env');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PostCSSAssetsPlugin = require('postcss-assets-webpack-plugin');
const mqpacker = require('mqpacker');
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');
const { ProgressPlugin, ProvidePlugin } = require('webpack');
const paths = require('./paths');
const path = require('path');

module.exports = {
  entry: {
    public: [`./index.js`],
  },
  output: {
    path: paths.build,
    filename: 'js/[name].bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      // JavaScript
      {
        test: /\.js$/,
        exclude: [
          /(node_modules|vendor|wp-admin|wp-includes|plugins|twentyfifteen|twentysixteen|twentyseventeen|twentynineteen|libs|bundle|dist)/,
        ],
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              ['@babel/preset-env', { modules: false }],
              '@babel/preset-react',
            ],
          },
        },
      },
      // Images
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|svg)$/i,
        exclude: [/(fonts|svg\/svg)/, '/node_modules/@fortawesome/'],
        type: 'asset/resource',
        generator: {
          filename: 'img/[name][ext][query]',
        },
      },
      // Fonts
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg?)(\?[a-z0-9]+)?$/,
        exclude: [/(img|svg\/svg)/],
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext][query]',
        },
      },
      // CSS, PostCSS, and Sass
      {
        test: /\.(scss|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { sourceMap: true },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              postcssOptions: {
                ident: 'postcss',
                plugins: [
                  postcssPresetEnv(),
                  autoprefixer({ overrideBrowserslist: 'last 2 version' }),
                  cssnano(),
                ],
              },
            },
          },
          {
            loader: 'resolve-url-loader',
            options: {
              sourceMap: true,
              keepQuery: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  // Control how source maps are generated
  devtool: 'inline-source-map',
  // Spin up a server for quick development
  devServer: {
    publicPath: paths.public,
    contentBase: './',
    open: true,
    compress: true,
    hot: true,
    port: 8008,
    watchOptions: {
      ignored: [
        path.resolve(__dirname, 'node_modules'),
        path.resolve(__dirname, 'vendor'),
        paths.build,
        `${paths.svg}/generated`,
      ],
    },
  },
  // Watch for file changes
  watch: false,
  watchOptions: {
    aggregateTimeout: 600,
    poll: 1000,
    ignored: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'vendor'),
      paths.build,
      `${paths.svg}/generated`,
    ],
  },
  plugins: [
    // Show build progress
    new ProgressPlugin({ profile: false }),
    // Provide "global" vars mapped to an actual dependency.
    // Allows e.g. jQuery plugins to assume that `window.jquery` is available
    new ProvidePlugin({
      // Bootstrap is dependant on jQuery and Popper
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
    }),
    // Lint Javascript
    new ESLintPlugin(),
    // Lint Styles
    new StylelintPlugin(),
    // Extract CSS into separate files
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: '[id].css',
    }),
    // Manage postcss assets
    // @link https://css-tricks.com/images-in-postcss/
    new PostCSSAssetsPlugin({
      test: /\.css$/,
      log: true,
      plugins: [
        // Pack same CSS media query rules into one media query rule
        mqpacker,
      ],
    }),
    // Generate SVG Spritemap
    new SVGSpritemapPlugin(`${paths.svg}/*.svg`, {
      styles: {
        filename: `${paths.svg}/generated/_icons-generated.scss`,
        variables: {
          sizes: 'svgicon-sizes', // Prevent collision with Bootstrap $sizes
          variables: 'svgicon-variables',
        },
      },
      output: {
        filename: 'spritemap.svg',
        svg4everybody: true,
        svgo: true,
      },
    }),
  ],
};
