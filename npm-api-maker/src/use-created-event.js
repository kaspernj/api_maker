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
const ApiMakerUseCreatedEvent = (
  modelClass,
  onCreated,
  args = {active: true, debounce: 0, onConnected: undefined}
) => {
  useModelClassEvent(modelClass, "creates", onCreated, args)
}

export default ApiMakerUseCreatedEvent
