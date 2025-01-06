import {digg} from "diggerize"

const errorMessages = (args) => {
  if (typeof args.response == "object") {
    return digg(args, "response", "errors").map((error) => {
      if (typeof error == "string") {
        return error
      }

      return digg(error, "message")
    })
  }
}

export default errorMessages
