import debounceFunction from "debounce"
import ModelEvents from "./model-events.mjs"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {useCallback, useEffect} from "react"
import useShape from "set-state-compare/src/use-shape.js"

const ApiMakerUseCreatedEvent = (modelClass, onCreated, args = {}) => {
  const {active = true, debounce} = args
  const s = useShape({active, debounce, modelClass, onCreated})

  const eventDebounce = useCallback(() => {
    if (!s.meta.debounceInstance) {
      if (typeof this.props.debounce == "number") {
        s.meta.debounceInstance = debounceFunction(s.p.onCreated, s.p.debounce)
      } else {
        s.meta.debounceInstance = debounceFunction(s.p.onCreated)
      }
    }

    return s.meta.debounceInstance
  }, [])

  const onCreatedCallback = useCallback((...args) => {
    if (!s.p.active) {
      return
    }

    if (s.p.debounce) {
      eventDebounce()(...args)
    } else {
      s.p.onCreated(...args)
    }
  }, [])

  useEffect(() => {
    const connectCreated = ModelEvents.connectCreated(s.p.modelClass, (...args) => onCreatedCallback(...args))

    return () => {
      connectCreated.unsubscribe()
    }
  }, [])
}

ApiMakerUseCreatedEvent.propTypes = propTypesExact({
  active: PropTypes.bool.isRequired,
  debounce: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.number
  ]),
  modelClass: PropTypes.func.isRequired,
  onCreated: PropTypes.func.isRequired
})

export default ApiMakerUseCreatedEvent
