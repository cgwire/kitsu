module.exports = {
  mode: 'development',
  entry: './test-store.js',
  output: {
    path: __dirname,
    filename: 'test-bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
      }
    ]
  }
}
