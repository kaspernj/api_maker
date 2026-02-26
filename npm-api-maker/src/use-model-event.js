/* eslint-disable sort-imports */
import {useCallback, useLayoutEffect, useMemo} from "react"
import debounceFunction from "debounce"
import ModelEvents from "./model-events.js"
import useShape from "set-state-compare/build/use-shape.js"

/**
 * @param {object|object[]|undefined|null} modelOrModels
 * @returns {object[]}
 */
const modelsFromInput = (modelOrModels) => {
  if (!modelOrModels) {
    return []
  } else if (Array.isArray(modelOrModels)) {
    return modelOrModels.filter(Boolean)
  } else {
    return [modelOrModels]
  }
}

/**
 * @param {object|object[]|undefined|null} modelOrModels
 * @returns {string}
 */
const modelsDependencyKey = (modelOrModels) => JSON.stringify(
  modelsFromInput(modelOrModels).map((model) => model.id())
)

/**
 * @param {import("./base-model.js").default|import("./base-model.js").default[]} model
 * @param {string} event
 * @param {Function} onCallback
 * @param {object} [props]
 * @param {boolean} [props.active]
 * @param {number} [props.debounce]
 * @param {Function} [props.onConnected]
 * @returns {void}
 */
// eslint-disable-next-line max-params
const apiMakerUseModelEvent = (model, event, onCallback, props) => {
  const {active = true, debounce, onConnected, ...restProps} = props || {}

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to apiMakerUseModelEvent: ${Object.keys(restProps).join(", ")}`)
  }

  const s = useShape({active, debounce, model, onCallback})

  const debounceCallback = useMemo(() => {
    if (typeof debounce == "number") {
      return debounceFunction(s.p.onCallback, debounce)
    } else {
      return debounceFunction(s.p.onCallback)
    }
  }, [debounce])

  s.updateMeta({debounceCallback})

  const onCallbackCallback = useCallback((...args) => {
    if (!s.p.active) {
      return
    }

    if (s.p.debounce) {
      s.m.debounceCallback(...args)
    } else {
      s.p.onCallback(...args)
    }
  }, [])

  useLayoutEffect(() => {
    const eventConnections = []

    modelsFromInput(model).forEach((modelInstance) => {
      const eventConnection = ModelEvents.connect(modelInstance, event, onCallbackCallback)
      eventConnections.push(eventConnection)

      if (onConnected) {
        eventConnection.events.addListener("connected", onConnected)
      }
    })

    return () => {
      if (onConnected) {
        eventConnections.forEach((eventConnection) => eventConnection.events.removeListener("connected", onConnected))
      }

      eventConnections.forEach((eventConnection) => eventConnection.unsubscribe())
    }
  }, [event, modelsDependencyKey(model)])
}

export default apiMakerUseModelEvent
