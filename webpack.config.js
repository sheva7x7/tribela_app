const path = require('path');
const webpack = require('webpack')

const HtmlWebPackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const BabelPluginTransformObjectRestSpread = require('babel-plugin-transform-object-rest-spread')

const htmlWebpackPlugin = new HtmlWebPackPlugin({
  template: "./src/index.html",
  filename: "./index.html"
});
const config = require('./config-dev.json');

module.exports = {
  devServer: {
      contentBase: path.resolve(__dirname, 'src/assets'),
      stats: 'errors-only',
      open: true,
      port: 8080,
      compress: true,
      historyApiFallback: true
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(jpg|png|gif|svg)$/,
        use: [
        {
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: './assets/',
            }
        }]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
              presets: ['env'],
              plugins: [BabelPluginTransformObjectRestSpread] 
          }
        }
      },
      {
        test: /\.(css|less)$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          },
          {
            loader: "less-loader"
          }]
        }
    ]
  },
  plugins: [
    htmlWebpackPlugin,
    new CopyWebpackPlugin([
      { from: 'src/assets', to: 'assets' }
    ]),
    new webpack.DefinePlugin({
        API: JSON.stringify(config)
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
};