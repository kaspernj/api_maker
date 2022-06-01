throw new Error("stub")

module.exports = {
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.(js|jsx)$/,
        use: "babel-loader"
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  query: {
    presets: ['es2015']
  }
}
