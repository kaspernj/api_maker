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
 * @typedef {import("./base-model.js").default | null} CurrentUserModel
 * @typedef {object} CurrentUserContextValue
 * @property {boolean} loaded
 * @property {CurrentUserModel} model
 * @typedef {object} UseCurrentUserArgs
 * @param {string} [props.scope]
 * @param {boolean} [props.withData]
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
  const currentUserContext = useContext(scopeInstance.getContext())
  if (!currentUserContext) {
    throw new Error(`useCurrentUser: no context for Devise scope "${scope}". Ensure the provider is mounted before calling useCurrentUser.`)
  }

  if (withData) {
    return currentUserContext
  } else {
    return currentUserContext.model
  }
}

export {events}
export default useCurrentUser
