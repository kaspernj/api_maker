import CustomError from "@kaspernj/api-maker/build/custom-error"
import I18nOnSteroids from "i18n-on-steroids"
import ValidationError from "@kaspernj/api-maker/build/validation-error"
import {digg} from "diggerize"

export default class FlashMessage {
  static alert(message) {
    new FlashMessage({type: "alert", text: message})
  }

  static error(message) {
    this.alert(message)
  }

  static errorResponse(error) {
    if (error instanceof ValidationError) {
      if (error.hasUnhandledErrors()) {
        FlashMessage.alert(error.message)
      } else {
        FlashMessage.error(I18nOnSteroids.getCurrent().t("js.flash_message.couldnt_submit_because_of_validation_errors"))
      }
    } else if (error instanceof CustomError) {
      const errors = error.args.response.errors
      const errorMessages = errors.map((error) => {
        if (typeof error == "string") {
          return error
        }

        return digg(error, "message")
      })

      FlashMessage.alert(errorMessages.map((error) => error.message).join(". "))
    } else {
      console.error("Didnt know what to do with this", error)
    }
  }

  static success(message) {
    new FlashMessage({type: "success", text: message})
  }

  constructor(args) {
    if (!("delay" in args))
      args["delay"] = 3000

    const pnotify = new PNotify(args)
    pnotify.get().click(() => {
      pnotify.remove()
    })
  }
}
