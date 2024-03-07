import {memo} from "react"
import useEventEmitter from "./use-event-emitter.mjs"

const ApiMakerEventEmitterListener = ({events, event, onCalled}) => {
  useEventEmitter(events, event, onCalled)

  return null
}

export default memo(ApiMakerEventEmitterListener)
