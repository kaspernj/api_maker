const babel = require("./loaders/babel")
const erb = require("./loaders/erb")
const path = require("path")
const webpack = require("webpack")
const { webpackConfig: baseWebpackConfig, merge } = require("shakapacker")

const options = {
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
  plugins: [],
  resolve: {
    extensions: [".css", ".scss", ".cjs", ".js.erb"],
    modules: [path.resolve(__dirname, "../../node_modules")]
  }
}

// This is necessary for the NPM packages to compile (it might be possible to get rid of with the right configuration)
options.module.rules.push()

options.plugins.push(
  new webpack.ProvidePlugin({
    FlashMessage: ["shared/flash-message", "default"],
    Hash: ["shared/hash", "default"],
    I18n: ["shared/i18n", "default"],
    Layout: ["components/layout", "default"],
    Params: ["@kaspernj/api-maker", "Params"],
    React: "react",
    Routes: ["shared/routes", "default"],
    setStateAsync: ["shared/set-state-async", "default"],

    Checkbox: ["@kaspernj/api-maker-bootstrap", "Checkbox"],
    Checkboxes: ["@kaspernj/api-maker-bootstrap", "Checkboxes"],
    Input: ["@kaspernj/api-maker-bootstrap", "Input"],
    Select: ["@kaspernj/api-maker-bootstrap", "Select"],

    Account: ["@kaspernj/api-maker/src/models", "Account"],
    Project: ["@kaspernj/api-maker/src/models", "Project"],
    Task: ["@kaspernj/api-maker/src/models", "Task"],
    User: ["@kaspernj/api-maker/src/models", "User"]
  })
)

module.exports = merge({}, baseWebpackConfig, options)
