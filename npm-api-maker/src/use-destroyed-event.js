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
 * @param {object|object[]} model
 * @param {Function} onDestroyed
 * @param {object} [props]
 * @param {boolean} [props.active]
 * @param {number} [props.debounce]
 * @param {Function} [props.onConnected]
 * @returns {void}
 */
const apiMakerUseDestroyedEvent = (model, onDestroyed, props) => {
  const {active = true, debounce, onConnected, ...restProps} = props || {}

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to useDestroyedEvent: ${Object.keys(restProps).join(", ")}`)
  }

  const s = useShape({active, debounce, model, onDestroyed})

  const debounceCallback = useMemo(() => {
    if (typeof debounce == "number") {
      return debounceFunction(s.p.onDestroyed, debounce)
    } else {
      return debounceFunction(s.p.onDestroyed)
    }
  }, [debounce])

  s.updateMeta({debounceCallback})

  const onDestroyedCallback = useCallback((...args) => {
    if (!s.p.active) {
      return
    }

    if (s.p.debounce) {
      s.m.debounceCallback(...args)
    } else {
      s.p.onDestroyed(...args)
    }
  }, [])

  useLayoutEffect(() => {
    const destroyedConnections = []

    modelsFromInput(model).forEach((modelInstance) => {
      const destroyedConnection = ModelEvents.connectDestroyed(modelInstance, onDestroyedCallback)
      destroyedConnections.push(destroyedConnection)

      if (onConnected) {
        destroyedConnection.events.addListener("connected", onConnected)
      }
    })

    return () => {
      if (onConnected) {
        destroyedConnections.forEach((destroyedConnection) => destroyedConnection.events.removeListener("connected", onConnected))
      }

      destroyedConnections.forEach((destroyedConnection) => destroyedConnection.unsubscribe())
    }
  }, [modelsDependencyKey(model)])
}

export default apiMakerUseDestroyedEvent
