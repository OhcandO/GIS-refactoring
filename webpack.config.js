const path = require('path');

module.exports = {
  // mode: "development",
  mode: "production",
  entry: './main.js',
  // devtool:"inline-source-map",
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean:true
  },
};