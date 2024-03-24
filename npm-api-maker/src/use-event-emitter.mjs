import EventEmitter from "events"
import PropTypes from "prop-types"
import {useCallback, useEffect} from "react"

const ApiMakerUseEventEmitter = (events, event, onCalled) => {
  const onCalledCallback = useCallback((...args) => {
    onCalled.apply(null, args)
  }, [events, event, onCalled])

  useEffect(() => {
    events.addListener(event, onCalledCallback)

    return () => {
      events.removeListener(event, onCalledCallback)
    }
  }, [events, event, onCalled])
}

ApiMakerUseEventEmitter.propTypes = {
  event: PropTypes.string.isRequired,
  events: PropTypes.instanceOf(EventEmitter).isRequired,
  onCalled: PropTypes.func.isRequired
}

export default ApiMakerUseEventEmitter
