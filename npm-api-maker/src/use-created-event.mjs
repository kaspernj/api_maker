import debounceFunction from "debounce"
import ModelEvents from "./model-events.mjs"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {memo} from "react"

const ApiMakerUseCreatedEvent = ({active = true, debounce, modelClass, onCreated}) => {
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

  const onCreated = useCallback((...args) => {
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
    const connectCreated = ModelEvents.connectCreated(s.p.modelClass, (...args) => onCreated(...args))

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

export default memo(ApiMakerUseCreatedEvent)
