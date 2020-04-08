const { environment } = require("@rails/webpacker")
const webpack = require("webpack")

environment.loaders.append("babel", {
  test: /\.(js|jsx)$/,
    loader: "babel-loader"
  }
)

environment.plugins.append(
  "ProvidePlugin",
  new webpack.ProvidePlugin({
    Account: ["api-maker/models/account", "default"],
    Hash: ["shared/hash", "default"],
    Layout: ["components/layout", "default"],
    Params: ["shared/params", "default"],
    Project: ["api-maker/models/project", "default"],
    PropTypesExact: "prop-types-exact",
    React: "react",
    setStateAsync: ["shared/set-state-async", "default"],
    Task: ["api-maker/models/task", "default"],

    Checkbox: ["api-maker-bootstrap", "Checkbox"],
    Checkboxes: ["api-maker-bootstrap", "Checkboxes"],
    Input: ["api-maker-bootstrap", "Input"],
    Select: ["api-maker-bootstrap", "Select"]
  })
)

module.exports = environment
