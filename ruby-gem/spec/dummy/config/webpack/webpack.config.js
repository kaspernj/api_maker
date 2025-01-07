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

options.plugins.push(
  new webpack.ProvidePlugin({
    FlashMessage: ["shared/flash-message", "default"],
    Hash: ["shared/hash", "default"],
    I18n: "shared/i18n.js",
    Layout: ["components/layout", "default"],
    Params: ["@kaspernj/api-maker/build/params.js", "default"],
    React: "react",
    Routes: ["shared/routes", "default"],
    setStateAsync: ["shared/set-state-async", "default"],

    Account: ["@kaspernj/api-maker/build/models.js", "default", "Account"],
    Project: ["@kaspernj/api-maker/build/models.js", "default", "Project"],
    Task: ["@kaspernj/api-maker/build/models.js", "default", "Task"],
    User: ["@kaspernj/api-maker/build/models.js", "default", "User"]
  })
)

const config = merge({}, options, webpackConfig)

// Make sure to try and load .web.js files before .js
const extensions = config.resolve.extensions

extensions.unshift(".web.js")

module.exports = config
