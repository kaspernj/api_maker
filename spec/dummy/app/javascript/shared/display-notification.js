import { CustomError, ValidationError } from "api-maker"

export default class DisplayNotification {
  static alert(message) {
    new DisplayNotification({type: "alert", text: message})
  }

  static error(error) {
    if (error instanceof CustomError) {
      DisplayNotification.alert(error.args.response.errors.join(". "))
    } else if (error instanceof ValidationError) {
      if (error.hasUnhandledErrors())
        DisplayNotification.alert(error.message)
    } else {
      console.error("Didnt know what to do with this", error)
    }
  }

  static success(message) {
    new DisplayNotification({type: "success", text: message})
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
