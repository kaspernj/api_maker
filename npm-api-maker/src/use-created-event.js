import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import useModelClassEvent from "./use-model-class-event.js"

/**
 * @param {Function} modelClass
 * @param {Function} onCreated
 * @param {object} [args]
 * @param {boolean} [args.active]
 * @param {number} [args.debounce]
 * @param {Function} [args.onConnected]
 * @returns {void}
 */
// eslint-disable-next-line max-len
const ApiMakerUseCreatedEvent = (modelClass, onCreated, args = {active: true, debounce: 0, onConnected: undefined}) => { // eslint-disable-line react/function-component-definition
  useModelClassEvent(modelClass, "creates", onCreated, args)
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
