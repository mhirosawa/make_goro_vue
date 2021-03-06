var path = require('path');

module.exports = {
  entry: './src/index.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'main.js'
  },
  externals: {
    canvas: "commonjs canvas" // Important (2)
  }
}