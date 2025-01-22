import useEventEmitter from "./use-event-emitter"

const EventEmitterListener = ({event, events, onCalled, ...restProps}) => {
  const restPropsKeys = Object.keys(restProps)

  if (restPropsKeys.length > 0) {
    throw new Error(`Unexpected props: ${restPropsKeys}`)
  }

  useEventEmitter(events, event, onCalled)
}

export default EventEmitterListener
