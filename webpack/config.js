const path = require('path');
const webpack = require('webpack');

// Need to finish and add build scripts
module.exports = {
  entry: [
    'react-hot-loader/patch',
    'webpack/hot/only-dev-server',
    './ui/index.js'
  ],
  output: {
    filename: 'ui.bundle.js',
    chunkFilename: '[name].bundle.js',
    publicPath: '/',
    path: path.resolve(__dirname, '../build')
  },
  devServer: {
    hot: true,
    inline: true,
    port: 3000
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(eot|svg|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
        use: 'url-loader'
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader?singleton',
          'css-loader',
          {
            loader: 'postcss-loader?sourceMap=inline',
            options: {
              plugins: function() {
                return [
                  require('autoprefixer')
                ];
              }
            }
          }
        ]
      }
    ],
  },
  resolve: {
    extensions: [' ', '.js', '.css']
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
};
