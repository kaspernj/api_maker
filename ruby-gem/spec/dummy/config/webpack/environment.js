const { environment } = require("@rails/webpacker")
const erb = require("./loaders/erb")
const path = require("path")
const webpack = require("webpack")

// Fixes issues with resolving linked packages with peer dependencies when developing
environment.config.resolve.modules = [path.resolve("./node_modules")]
// environment.config.resolve.symlinks = false // Enabling this will make webpack-dev-server unable to watch for changes

environment.loaders.append("babel", {
  test: /\.(js|jsx)$/,
  use: {
    loader: "babel-loader",
    options: {
      cacheCompression: false,
      cacheDirectory: true
    }
  }
})
environment.loaders.prepend("yaml", {
  test: /\.ya?ml$/,
  exclude: /node_modules/,
  use: "js-yaml-loader"
})

// Makes it possible to not import these very used components
environment.plugins.append(
  "ProvidePlugin",
  new webpack.ProvidePlugin({
    classNames: "classnames",
    digg: ["diggerize", "digg"],
    digs: ["diggerize", "digs"],
    FlashMessage: ["shared/flash-message", "default"],
    Hash: ["shared/hash", "default"],
    I18n: ["shared/i18n", "default"],
    Layout: ["components/layout", "default"],
    Params: ["@kaspernj/api-maker", "Params"],
    PropTypes: "prop-types",
    PropTypesExact: "prop-types-exact",
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

environment.loaders.prepend("erb", erb)
module.exports = environment
