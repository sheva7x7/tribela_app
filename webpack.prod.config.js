var webpack = require("webpack");

const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const config = require('./config-dev.json');

module.exports = require('./webpack.config.js');

delete module.exports.devtool;

module.exports.optimization = {
  splitChunks: {
    chunks: "all"
  }
}
module.exports.plugins.pop();
module.exports.plugins.concat([
    new CleanWebpackPlugin(['public']),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
        config: JSON.stringify(config)
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        output: {
          comments: false
        },
        compress: {
          warnings: false
        }
      }
    })
]);

module.exports.module.rules.forEach(rule => {
    delete rule.exclude;
    return rule;
});