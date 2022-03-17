// Set global.applicationHistory so that on-location-changed will listen on it
import history from "shared/application-history"
import {callbacksHandler} from "on-location-changed/callbacks-handler"

callbacksHandler.connectReactRouterHistory(history)

// Stimulus
import { Application } from "stimulus"
import { definitionsFromContext } from "stimulus/webpack-helpers"

const application = Application.start()
const context = require.context("controllers", true, /.js$/)
application.load(definitionsFromContext(context))

// Devise
import Devise from "@kaspernj/api-maker/src/devise"

Devise.addUserScope("user")

// Rest of app
require("shared/error-logger")
require("shared/i18n")
require("shared/react-app")
