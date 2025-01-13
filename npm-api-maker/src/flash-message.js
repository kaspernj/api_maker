import CustomError from "@kaspernj/api-maker/build/custom-error"
import I18nOnSteroids from "i18n-on-steroids"
import ValidationError from "@kaspernj/api-maker/build/validation-error"
import {digg} from "diggerize"

export default class FlashMessage {
  static alert(message) {
    new FlashMessage({type: "alert", message})
  }

  static error(message) {
    new FlashMessage({type: "error", message})
  }

  static errorResponse(error) {
    if (error instanceof ValidationError) {
      if (error.hasUnhandledErrors()) {
        FlashMessage.error(error.message)
      } else {
        FlashMessage.error(I18nOnSteroids.getCurrent().t("js.flash_message.couldnt_submit_because_of_validation_errors"))
      }
    } else if (error instanceof CustomError) {
      const errors = error.args.response.errors
      const errorMessages = errors
        .map((error) => {
          if (typeof error == "string") {
            return error
          }

          return digg(error, "message")
        })
      const errorMessage = errorMessages.join(". ")

      FlashMessage.error(errorMessage)
    } else {
      console.error("Didnt know what to do with this", error)
    }
  }

  static success(message) {
    new FlashMessage({type: "success", message})
  }

  constructor({message, type}) {
    if (!message) throw new Error("No message given")
    if (!type) throw new Error("No type given")

    let title

    if (type == "alert") {
      title = I18nOnSteroids.getCurrent().t("js.flash_message.alert", {defaultValue: "Alert"})
    } else if (type == "error") {
      title = I18nOnSteroids.getCurrent().t("js.flash_message.error", {defaultValue: "Error"})
    } else if (type == "success") {
      title = I18nOnSteroids.getCurrent().t("js.flash_message.success", {defaultValue: "Success"})
    } else {
      title = I18nOnSteroids.getCurrent().t("js.flash_message.notification", {defaultValue: "Notification"})
    }

    const event = new CustomEvent("pushNotification", {
      detail: {
        message,
        title,
        type
      }
    })

    globalThis.dispatchEvent(event)
  }
}
