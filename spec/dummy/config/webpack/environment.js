const { environment } = require("@rails/webpacker")
const webpack = require("webpack")

environment.plugins.prepend("Provide", new webpack.ProvidePlugin({
  Link: ["react-router-dom", "Link"],
  React: "react",

  Devise: ["api-maker/devise", "default"],
  StringInput: ["api-maker/bootstrap/string-input", "default"],

  DisplayNotification: ["shared/display-notification", "default"],
  Layout: ["components/layout", "default"]
}))

module.exports = environment
