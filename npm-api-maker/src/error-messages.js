// @ts-check

import {digg} from "diggerize"

/**
 * @typedef {Array<string | {message: string}>} ErrorMessagesArgsType
 */

/**
 * @param {object} args
 * @param {object} args.response
 * @param {ErrorMessagesArgsType} args.response.errors
 */
export default function errorMessages(args) {
  if (typeof args.response == "object") {
    return digg(args, "response", "errors").map((error) => {
      if (typeof error == "string") {
        return error
      }

      return digg(error, "message")
    })
  }
}
