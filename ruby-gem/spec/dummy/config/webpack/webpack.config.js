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
    extensions: [".css", ".scss", ".mjs", ".mjs.erb", ".mjs", ".mjs.erb", ".js.erb"],
    modules: [path.resolve(__dirname, "../../node_modules")]
  }
}

// This is necessary for the NPM packages to compile (it might be possible to get rid of with the right configuration)
options.module.rules.push()

options.plugins.push(
  new webpack.ProvidePlugin({
    FlashMessage: ["shared/flash-message", "default"],
    Hash: ["shared/hash", "default"],
    I18n: "shared/i18n.js",
    Layout: ["components/layout", "default"],
    Params: ["@kaspernj/api-maker/src/params.mjs", "default"],
    React: "react",
    Routes: ["shared/routes", "default"],
    setStateAsync: ["shared/set-state-async", "default"],

    Checkbox: ["@kaspernj/api-maker/src/bootstrap/checkbox.jsx", "default"],
    Checkboxes: ["@kaspernj/api-maker/src/bootstrap/checkboxes.jsx", "default"],
    Input: ["@kaspernj/api-maker/src/bootstrap/input.jsx", "default"],
    Select: ["@kaspernj/api-maker/src/bootstrap/select.jsx", "default"],

    Account: ["@kaspernj/api-maker/src/models.mjs.erb", "Account"],
    Project: ["@kaspernj/api-maker/src/models.mjs.erb", "Project"],
    Task: ["@kaspernj/api-maker/src/models.mjs.erb", "Task"],
    User: ["@kaspernj/api-maker/src/models.mjs.erb", "User"]
  })
)

const config = merge({}, webpackConfig, options)

module.exports = config
