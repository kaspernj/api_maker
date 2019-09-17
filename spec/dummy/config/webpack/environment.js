const { environment } = require("@rails/webpacker")
const webpack = require("webpack")

environment.plugins.append(
  "ProvidePlugin",
  new webpack.ProvidePlugin({
    Checkbox: ["api-maker/bootstrap/checkbox", "default"],
    Layout: ["components/layout", "default"],
    Params: ["shared/params", "default"],
    React: "react",
    StringInput: ["api-maker/bootstrap/string-input", "default"],
    Task: ["api-maker/models/task", "default"]
  })
)

module.exports = environment
