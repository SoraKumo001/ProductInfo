const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const config = {
  //mode: 'production',
  mode: 'development',
  target: 'node',
  entry: path.resolve(__dirname, "index.ts"),
  output: {
    libraryTarget: "amd",
    library: "manager",
    filename: 'index.js',
    path: path.resolve(__dirname, '../dist/')
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: 'ts-loader'
      }, {
        test: /\.(js|jsx)$/,
        use: ['source-map-loader'],
        enforce: "pre"
      }, {
        test: /\.(scss|css)$/,
        use: [
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
    extensions: ['.ts', '.js', '.tsx', '.scss', 'css', '.svg', '.gif',],
    moduleExtensions: ['node_modules'],
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
    ]
  }
};
if (config.mode === "development") {
  config.devtool = 'source-map';
}
module.exports = config;