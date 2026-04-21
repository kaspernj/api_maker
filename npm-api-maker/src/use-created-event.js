// @ts-check
import useModelClassEvent from "./use-model-class-event.js"

/** @typedef {typeof import("./base-model.js").default} ModelClassType */
/** @typedef {{active?: boolean, debounce?: boolean|number, onConnected?: Function}} UseCreatedEventArgs */
/** @typedef {(...args: unknown[]) => void} EventCallback */

/**
 * @param {ModelClassType} modelClass
 * @param {EventCallback} onCreated
 * @param {UseCreatedEventArgs} [args]
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
