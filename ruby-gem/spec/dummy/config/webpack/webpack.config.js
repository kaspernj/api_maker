const babel = require("./loaders/babel")
const erb = require("./loaders/erb")
const path = require("path")
const webpack = require("webpack")
const {generateWebpackConfig, merge} = require("shakapacker")
const webpackConfig = generateWebpackConfig()

const options = {
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        }
      },
      babel,
      erb,
      {
        test: /\.ya?ml$/,
        exclude: /node_modules/,
        use: "js-yaml-loader"
      }
    ]
  },
  node: {global: true},
  optimization: {
    runtimeChunk: false
  },
  plugins: [],
  resolve: {
    alias: {
      "react-native$": "react-native-web"
    },
    extensions: [".css", ".scss", ".js.erb"],
    modules: [path.resolve(__dirname, "../../node_modules")]
  }
}

// For some reason the asset/resource doesn't actually bundle the images unless changed to the file-loader
const imagesRule = webpackConfig.module.rules.find((rule) => {
  const fakeFileName = "images/testimage.svg"

  if (rule.test && fakeFileName.match(rule.test)) {
    return true
  }
})

imagesRule.use = {
  loader: "file-loader",
  options: {
    name: "[name]-[hash][ext][query]",
    outputPath: "images",
  }
}

delete imagesRule.generator
delete imagesRule.type

const config = merge({}, options, webpackConfig)

// Make sure to try and load .web.js files before .js
const extensions = config.resolve.extensions

extensions.unshift(".web.js")

module.exports = config
