import { CustomError, ValidationError } from "@kaspernj/api-maker"
import { digg } from "@kaspernj/object-digger"

export default class FlashMessage {
  static alert(message) {
    new FlashMessage({type: "alert", text: message})
  }

  static error(message) {
    this.alert(message)
  }

  static errorResponse(error) {
    if (error instanceof CustomError) {
      const errors = error.args.response.errors
      const errorMessages = errors.map((error) => {
        if (typeof error == "string") {
          return error
        }

        return digg(error, "message")
      })

      FlashMessage.alert(errorMessages.map((error) => error.message).join(". "))
    } else if (error instanceof ValidationError) {
      if (error.hasUnhandledErrors())
      FlashMessage.alert(error.message)
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
