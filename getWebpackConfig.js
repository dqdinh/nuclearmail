var path = require('path');
var webpack = require('webpack');
var _ = require('lodash');

module.exports = function(options) {
  var config = {
    entry: [
      './src/js/main.js'
    ],
    output: {
      path: path.join(__dirname, 'build'),
      filename: 'app.js',
      publicPath: '/'
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.NoErrorsPlugin()
    ],
    resolve: {
      extensions: ['', '.js']
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          loaders: ['babel?stage=0'],
          exclude: /node_modules/
        },
      ]
    },
  };

  if (options.environment === 'dev') {
    _.assign(config, {
      devtool: 'eval-source-map',
      entry: [
        'webpack-dev-server/client?http://0.0.0.0:8000',
        'webpack/hot/only-dev-server',
        './src/js/main.js'
      ],
      plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
      ],
      module: {
        loaders: [
          {
            test: /\.js$/,
            loaders: ['react-hot', 'babel?stage=0'],
            exclude: /node_modules/
          },
        ]
      },
    });
  }

  return config;
};
