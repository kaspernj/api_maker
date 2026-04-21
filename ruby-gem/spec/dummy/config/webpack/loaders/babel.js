// @ts-check
const babelAllowlistedPackages = [
  "@kaspernj/api-maker",
  "flash-notifications",
  "on-location-changed",
  "react-native-vector-icons",
  "responsive-breakpoints",
  "set-state-compare",
  "ya-use-event-emitter",
  "ya-use-event-listener"
].join("|")
const babelAllowlistedNodeModulesRegex = new RegExp(
  `node_modules\\/(${babelAllowlistedPackages})\\/(?!node_modules)`
)

module.exports = {
  test: /\.(js|jsx)$/,
  include: (filePath) => filePath.includes("node_modules") && filePath.match(babelAllowlistedNodeModulesRegex),
  use: {
    loader: "babel-loader",
    options: {
      cacheCompression: false,
      cacheDirectory: false,
      inputSourceMap: false
    }
  }
}
