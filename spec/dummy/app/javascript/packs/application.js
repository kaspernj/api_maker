import { Application } from "stimulus"
import { definitionsFromContext } from "stimulus/webpack-helpers"

require("shared/error-logger")

const application = Application.start()
const context = require.context("controllers", true, /.js$/)
application.load(definitionsFromContext(context))
