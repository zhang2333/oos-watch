const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const vueUtils = require('./vue-utils')

const cssLoaders = vueUtils.cssLoaders()
const styleLoaders = vueUtils.styleLoaders()

console.log('env', process.env.NODE_ENV)

const outputDir = path.resolve(__dirname, './dist/main/build')

module.exports = {
  entry: {
    content_script: './main/src/content_script/main.js'
  },
  output: {
    path: outputDir,
    filename: '[name].js'
  },
  module: {
    rules: ([
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: cssLoaders
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|eot|svg|ttf|woff)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.(woff2)$/,
        loader: 'url-loader',
        options: {
          limit: 50000,
        }
      },
    ].concat(styleLoaders))
  },
  performance: {
    hints: false
  },
  devServer: {
    contentBase: outputDir,
    port: 9090,
  },
  devtool: '#eval-source-map',
  // devtool: '#source-map',
  mode: process.env.NODE_ENV,
}

if (process.env.NODE_ENV === 'development') {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new HtmlWebpackPlugin()
  ])
} else if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = void 0
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    new CopyWebpackPlugin([
      {
        from: 'main',
        to: path.resolve(__dirname, 'dist/main'),
        ignore: [ 'src/**/*' ]
      }
    ])
  ])
}
