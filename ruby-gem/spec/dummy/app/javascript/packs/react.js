import { Application } from "stimulus"
import { Devise } from "@kaspernj/api-maker"
import { definitionsFromContext } from "stimulus/webpack-helpers"

Devise.addUserScope("User")

require("shared/error-logger")

const application = Application.start()
const context = require.context("controllers", true, /.js$/)
application.load(definitionsFromContext(context))

require("shared/react-app")
