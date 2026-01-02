import debounceFunction from "debounce" // eslint-disable-line sort-imports
import ModelEvents from "./model-events.js"
import PropTypes from "prop-types" // eslint-disable-line sort-imports
import propTypesExact from "prop-types-exact"
import {useCallback, useLayoutEffect} from "react" // eslint-disable-line sort-imports
import useShape from "set-state-compare/build/use-shape.js"

/**
 * @param {function} modelClass
 * @param {function} onCreated
 * @param {object} [args]
 * @param {boolean} [args.active]
 * @param {number} [args.debounce]
 * @param {function} [args.onConnected]
 * @returns {void}
 */
const ApiMakerUseCreatedEvent = (modelClass, onCreated, args = {active: true, debounce: 0, onConnected: undefined}) => { // eslint-disable-line react/function-component-definition
  const {active = true, debounce} = args
  const s = useShape({active, debounce, modelClass, onCreated})

  const eventDebounce = useCallback(() => { // eslint-disable-line react-hooks/exhaustive-deps
    if (!s.meta.debounceInstance) {
      if (typeof s.props.debounce == "number") {
        s.meta.debounceInstance = debounceFunction(s.p.onCreated, s.p.debounce)
      } else {
        s.meta.debounceInstance = debounceFunction(s.p.onCreated)
      }
    }

    return s.meta.debounceInstance
  }, [])

  const onCreatedCallback = useCallback((...args) => { // eslint-disable-line react-hooks/exhaustive-deps
    if (!s.p.active) {
      return
    }

    if (s.p.debounce) {
      eventDebounce()(...args)
    } else {
      s.p.onCreated(...args)
    }
  }, [])

  useLayoutEffect(() => { // eslint-disable-line react-hooks/exhaustive-deps
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
