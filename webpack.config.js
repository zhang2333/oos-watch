const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const vueUtils = require('./vue-utils')

module.exports = {
  entry: {
    content_script: './main/src/content_script/main.js'
  },
  output: {
    path: path.resolve(__dirname, './dist/main/build'),
    publicPath: '/dist/',
    filename: '[name].js'
  },
  module: {
    rules: ([
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: vueUtils.cssLoaders()
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ].concat(vueUtils.styleLoaders()))
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  performance: {
    hints: false
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  // devtool: '#eval-source-map'
  devtool: '#source-map'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    new CopyWebpackPlugin([
      { from: 'main', to: path.resolve(__dirname, 'dist/main') }
    ])
  ])
}
