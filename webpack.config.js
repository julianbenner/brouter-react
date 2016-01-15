var webpack = require('webpack');
var path = require('path');

module.exports = {
  module: {
    loaders: [
      {
        loaders: ['react-hot', 'babel?presets[]=react,presets[]=es2015,presets[]=stage-0'],

        // Skip any files outside of your project's `src` directory
        include: [
            path.resolve(__dirname, "src"),
        ],

        // Only run `.js` and `.jsx` files through Babel
        test: /\.jsx?$/
      }, {
        test: /\.css?$/,
        loaders: ['style', 'raw'],
        include: __dirname
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  entry: [
    './src/index.jsx'
  ],
  output: {
    filename: 'brouter.js',
    path: path.join(__dirname, 'dist')
  },
  resolve: {
    extensions: ["", ".webpack.js", ".web.js", ".js", ".json"]
  },
  devtool: 'source-map'
}