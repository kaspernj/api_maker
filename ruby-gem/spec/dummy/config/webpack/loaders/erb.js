module.exports = {
  test: /\.erb$/,
  enforce: "pre",
  use: [{
    loader: "rails-erb-loader",
    options: {
      runner: (/^win/.test(process.platform) ? "ruby " : "") + "bin/rails runner"
    }
  }]
}
