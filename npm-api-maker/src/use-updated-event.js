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
 * @param {Function} onUpdated
 * @param {object} [props]
 * @param {boolean} [props.active]
 * @param {number} [props.debounce]
 * @param {Function} [props.onConnected]
 * @returns {void}
 */
const apiMakerUseUpdatedEvent = (model, onUpdated, props = {}) => {
  const {active = true, debounce, onConnected, ...restProps} = props

  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unknown props given to useUpdatedEvent: ${Object.keys(restProps).join(", ")}`)
  }

  const s = useShape({active, debounce, model, onUpdated})

  const debounceCallback = useMemo(() => {
    if (typeof debounce == "number") {
      return debounceFunction(s.p.onUpdated, debounce)
    } else {
      return debounceFunction(s.p.onUpdated)
    }
  }, [debounce])

  s.updateMeta({debounceCallback})

  const onUpdatedCallback = useCallback((...args) => {
    if (!s.p.active) {
      return
    }

    if (s.p.debounce) {
      s.m.debounceCallback(...args)
    } else {
      s.p.onUpdated(...args)
    }
  }, [])

  useLayoutEffect(() => {
    const updatedConnections = []

    modelsFromInput(model).forEach((modelInstance) => {
      const updatedConnection = ModelEvents.connectUpdated(modelInstance, onUpdatedCallback)
      updatedConnections.push(updatedConnection)

      if (onConnected) {
        updatedConnection.events.addListener("connected", onConnected)
      }
    })

    return () => {
      if (onConnected) {
        updatedConnections.forEach((updatedConnection) => updatedConnection.events.removeListener("connected", onConnected))
      }

      updatedConnections.forEach((updatedConnection) => updatedConnection.unsubscribe())
    }
  }, [modelsDependencyKey(model)])
}

export default apiMakerUseUpdatedEvent
