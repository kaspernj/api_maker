const { environment } = require("@rails/webpacker")
const webpack = require("webpack")

environment.plugins.append(
  "ProvidePlugin",
  new webpack.ProvidePlugin({
    Account: ["api-maker/models/account", "default"],
    Checkbox: ["api-maker/bootstrap/checkbox", "default"],
    Checkboxes: ["api-maker/bootstrap/checkboxes", "default"],
    Hash: ["shared/hash", "default"],
    Layout: ["components/layout", "default"],
    Params: ["shared/params", "default"],
    Project: ["api-maker/models/project", "default"],
    PropTypesExact: "prop-types-exact",
    React: "react",
    setStateAsync: ["shared/set-state-async", "default"],
    StringInput: ["api-maker/bootstrap/string-input", "default"],
    Task: ["api-maker/models/task", "default"]
  })
)

module.exports = environment
