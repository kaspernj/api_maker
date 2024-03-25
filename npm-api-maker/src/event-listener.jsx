import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {memo} from "react"
import useEventListener from "./use-event-listener.mjs"

const callEvent = (target, eventName, args = []) => {
  let event = document.createEvent("Event")
  event.initEvent(eventName, false, true)
  target.dispatchEvent(event, args)
}

const ApiMakerEventListener = ({event, onCalled, target}) => {
  useEventListener(target, event, onCalled)

  return null
}

ApiMakerEventListener.propTypes = propTypesExact({
  event: PropTypes.string.isRequired,
  onCalled: PropTypes.func.isRequired,
  target: PropTypes.object.isRequired
})

export {callEvent}
export default memo(ApiMakerEventListener)
