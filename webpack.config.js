var path = require("path");
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: ["babel-polyfill", './src/index.js'],
  output: {
    path: 'public/build',
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.js/,
        loader: 'babel-loader',
        include: __dirname + '/src',
        query: {
          presets: ['es2015']
        }
      },
      { 
        test: /\.html$/, 
        loader: 'raw', 
        exclude: /node_modules/ 
      },
      {
        test: /\.(jpg|png|gif)$/,
        loader: 'url-loader',
      },
      {
        test: /\.(css|less)$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader!postcss-loader")
      },
    ],
  },
  // must be 'source-map' or 'inline-source-map'
  devtool: 'source-map',
  plugins: [
    // extract CSS into separate file
    new ExtractTextPlugin("styles.css")
  ]
};