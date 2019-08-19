const path = require('path');
const glob = require("glob");
const TerserPlugin = require('terser-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const config = {
  performance: { hints: false },
  //mode: 'production',
  mode: 'development',
  entry: [
    path.resolve(__dirname, 'src/public/index.ts'),
  ].concat(glob.sync("./src/public/**/*.auto.ts")),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/public/js')
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.(ts|tsx)$/,
        loader: 'ts-loader', options: {
          appendTsSuffixTo: [/\.vue$/]
        }
      }, {
        test: /\.(js|jsx)$/,
        use: ['source-map-loader'],
        exclude: /node_modules/,
        enforce: "pre"
      }, {
        test: /\.(scss|css)$/,
        use: [
          'vue-style-loader',
          'style-loader',
          'css-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.(jpg|png|svg|gif)$/,
        loaders: 'url-loader'
      },
    ]
  },
  resolve: {
    symlinks: false,
    extensions: ['.ts', '.js', '.tsx', '.scss', 'css', '.svg', '.gif', 'vue'],
    alias: {
      // 'vue$': 'vue/dist/vue.esm.js'
    },
    modules: [
      "node_modules"
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        terserOptions: {
          output: {
            comments: false,
            beautify: false
          },
        },
      })
    ],

    providedExports: true,
    usedExports: true,
    concatenateModules: true,
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist/public'),
    host: "localhost"
  },
  plugins: [new VueLoaderPlugin()]
};
//if (config.mode === "development") {
config.devtool = 'source-map';
//}
module.exports = config;