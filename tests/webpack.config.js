module.exports = {
  entry: './test-store.js',
  mode: 'development',
  output: {
    path: __dirname,
    filename: 'test-bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
}
