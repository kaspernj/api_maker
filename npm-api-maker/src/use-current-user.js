// @ts-check
/* eslint-disable jest/require-hook, sort-imports */
import {useContext} from "react"
import Devise from "./devise.js"
import {EventEmitter} from "eventemitter3"
import Logger from "./logger.js"

const events = new EventEmitter()
const logger = new Logger({name: "ApiMaker / useCurrentUser"})

logger.setDebug(false)

/**
 * @typedef {(import("./base-model.js").default & {
 *   name?: () => string,
 *   primaryKey?: () => number | string,
 *   userRoles?: () => {loaded(): Array<{role(): {identifier(): string} | null}>}
 * }) | null} CurrentUserModel
 * @typedef {object} CurrentUserContextValue
 * @property {boolean} loaded
 * @property {CurrentUserModel} model
 * @typedef {object} UseCurrentUserArgs
 * @property {string} [scope]
 * @property {boolean} [withData]
 */

/**
 * @overload
 * @param {{scope?: string, withData: true}} [props]
 * @returns {CurrentUserContextValue}
 */
/**
 * @overload
 * @param {{scope?: string, withData?: false | undefined}} [props]
 * @returns {CurrentUserModel}
 */
/**
 * @param {UseCurrentUserArgs} [props]
 * @returns {CurrentUserContextValue | CurrentUserModel}
 */
const useCurrentUser = (props = {}) => {
  const {scope = "user", withData, ...restProps} = props

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to useCurrentUser: ${Object.keys(restProps).join(", ")}`)
  }

  const scopeInstance = Devise.getScope(scope)
  if (!scopeInstance || !scopeInstance.getContext) {
    throw new Error(`useCurrentUser: Devise scope "${scope}" is not available. Did you initialize the Devise scope provider?`)
  }
  const currentUserContext = /** @type {CurrentUserContextValue | CurrentUserModel} */ (useContext(scopeInstance.getContext()))
  if (!currentUserContext) {
    throw new Error(`useCurrentUser: no context for Devise scope "${scope}". Ensure the provider is mounted before calling useCurrentUser.`)
  }

  if (withData) {
    if (typeof currentUserContext == "object" && "model" in currentUserContext) {
      return currentUserContext
    }

    throw new Error(`useCurrentUser: expected context data wrapper for scope "${scope}"`)
  } else {
    if (typeof currentUserContext == "object" && "model" in currentUserContext) {
      return currentUserContext.model
    }

    return currentUserContext
  }
}

export {events}
export default useCurrentUser
