export default class DisplayNotification {
  static alert(message) {
    new DisplayNotification({type: "alert", text: message})
  }

  static error(error) {
    if (error.errors) {
      DisplayNotification.alert(error.errors.join(". "))
    } else if (error.response && error.response.errors) {
      DisplayNotification.alert(error.response.errors.join(". "))
    } else {
      console.error(`Didnt know what to do with: ${JSON.stringify(error)}`)
    }
  }

  static success(message) {
    new DisplayNotification({type: "success", text: message})
  }

  constructor(args) {
    if (!("delay" in args))
      args["delay"] = 3000

    var pnotify = new PNotify(args)
    pnotify.get().click(() => {
      pnotify.remove()
    })
  }
}
