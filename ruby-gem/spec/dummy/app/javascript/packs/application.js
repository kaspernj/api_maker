import { Application } from "stimulus"
import Devise from "@kaspernj/api-maker/src/devise"
import { definitionsFromContext } from "stimulus/webpack-helpers"

Devise.addUserScope("user")

require("shared/error-logger")
require("shared/i18n.cjs")

const application = Application.start()
const context = require.context("controllers", true, /.js$/)
application.load(definitionsFromContext(context))
