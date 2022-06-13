const { environment } = require("@rails/webpacker")
const erb = require("./loaders/erb")
const path = require("path")

// Fixes issues with resolving linked packages with peer dependencies when developing
environment.config.resolve.modules = [path.resolve("./node_modules")]
// environment.config.resolve.symlinks = false // Enabling this will make webpack-dev-server unable to watch for changes

environment.loaders.prepend("erb", erb)
module.exports = environment
