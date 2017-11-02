const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');


module.exports = {
  entry: {
    background: './src/js/app.js',
    popup: './src/js/popup.jsx',
  },
  output: {
    filename: 'js/[name].bundle.js',
    path: path.resolve(__dirname, 'dist/src/'),
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({ use: ['css-loader', 'sass-loader'] }),
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new ExtractTextPlugin('styles/styles.css'),
    // new UglifyJSPlugin({ test: /\.jsx?$/ }),
  ],
};
