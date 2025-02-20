import React from "react"

// Set global.applicationHistory so that on-location-changed will listen on it
import history from "shared/application-history"
import {callbacksHandler} from "on-location-changed/build/callbacks-handler"

callbacksHandler.connectReactRouterHistory(history)

// Stimulus
import {Application} from "stimulus"
import {definitionsFromContext} from "stimulus/webpack-helpers"

const application = Application.start()
const context = require.context("controllers", true, /.js$/)
application.load(definitionsFromContext(context))

// API maker
const Modal = (props) => {
  const {className, onRequestClose, ...restProps} = props

  return (
    <div className={`api-maker-dummy-fake-modal ${className}`} {...restProps} />
  )
}

import ApiMakerConfig from "@kaspernj/api-maker/build/config"
ApiMakerConfig.setHistory(history)
ApiMakerConfig.setModal(() => Modal)

// Devise
import Devise from "@kaspernj/api-maker/build/devise"

Devise.addUserScope("user")

// Rest of app
require("shared/error-logger")
require("shared/i18n.js")
require("shared/react-app")
require("stylesheets/application")
