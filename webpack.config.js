const path = require('path');

module.exports = {
  // mode: "development",
  mode: "production",
  entry: './src/index.ts',
  // devtool:"inline-source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    library: {
      type: 'module',
    },
  },
  experiments: {
    outputModule: true,
  },
};
