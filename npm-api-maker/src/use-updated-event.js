/* eslint-disable sort-imports */
import {useCallback, useLayoutEffect, useMemo, useRef} from "react"
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
 * @param {object|object[]|undefined|null} modelOrModels
 * @returns {Record<string, object>}
 */
const modelsByIdFromInput = (modelOrModels) => {
  const modelsById = {}

  modelsFromInput(modelOrModels).forEach((model) => {
    modelsById[model.id()] = model
  })

  return modelsById
}

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
  const connectionsRef = useRef({})

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
    const currentConnections = connectionsRef.current
    const nextModelsById = modelsByIdFromInput(model)

    Object.keys(currentConnections).forEach((modelId) => {
      if (!(modelId in nextModelsById)) {
        if (onConnected) {
          currentConnections[modelId].events.removeListener("connected", onConnected)
        }

        currentConnections[modelId].unsubscribe()
        delete currentConnections[modelId]
      }
    })

    Object.keys(nextModelsById).forEach((modelId) => {
      if (modelId in currentConnections) {
        return
      }

      const updatedConnection = ModelEvents.connectUpdated(nextModelsById[modelId], onUpdatedCallback)
      currentConnections[modelId] = updatedConnection

      if (onConnected) {
        updatedConnection.events.addListener("connected", onConnected)
      }
    })
  }, [modelsDependencyKey(model)])

  useLayoutEffect(() => () => {
    Object.values(connectionsRef.current).forEach((updatedConnection) => {
      if (onConnected) {
        updatedConnection.events.removeListener("connected", onConnected)
      }

      updatedConnection.unsubscribe()
    })

    connectionsRef.current = {}
  }, [])
}

export default apiMakerUseUpdatedEvent
