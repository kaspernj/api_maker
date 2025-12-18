import {useContext} from "react"
import Devise from "./devise.js"
import {EventEmitter} from "eventemitter3"
import Logger from "./logger.js"

const events = new EventEmitter()
const logger = new Logger({name: "ApiMaker / useCurrentUser"})

logger.setDebug(false)

/**
 * @param {object} props
 * @param {string} [props.scope]
 * @param {boolean} [props.withData]
 * @returns {import("./base-model.js").default}
 */
const useCurrentUser = (props = {}) => {
  const {scope = "user", withData, ...restProps} = props

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to useCurrentUser: ${Object.keys(restProps).join(", ")}`)
  }

  const scopeInstance = Devise.getScope(scope)
  const currentUserContext = useContext(scopeInstance.getContext())

  if (withData) {
    return currentUserContext
  } else {
    return currentUserContext.model
  }
}

export {events}
export default useCurrentUser
