module.exports = {
  test: /\.(js|jsx)$/,
  use: {
    loader: "babel-loader",
    options: {
      cacheCompression: false,
      cacheDirectory: false
    }
  }
}
