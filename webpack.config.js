var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './src',
  output: {
    path: 'build',
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.js/,
        loader: 'babel',
        include: __dirname + '/src',
       },
      {
        test: /\.css/,
        loader: ExtractTextPlugin.extract('css?modules&importLoaders=1&localIdentName=[local]'),
      }
    ],
  },
  plugins: [
    new ExtractTextPlugin("styles.css")
  ]
};