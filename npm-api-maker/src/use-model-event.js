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
 * @param {string} event
 * @param {Function} onCallback
 * @param {object} [props]
 * @param {boolean} [props.active]
 * @param {number} [props.debounce]
 * @param {Function} [props.onConnected]
 * @returns {void}
 */
/** apiMakerUseModelEvent. */
// eslint-disable-next-line max-params
const apiMakerUseModelEvent = (model, event, onCallback, props) => {
  const {active = true, debounce, onConnected, ...restProps} = props || {}
  const connectionsRef = useRef({})

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

      const eventConnection = ModelEvents.connect(nextModelsById[modelId], event, onCallbackCallback)
      currentConnections[modelId] = eventConnection

      if (onConnected) {
        eventConnection.events.addListener("connected", onConnected)
      }
    })
  }, [event, modelsDependencyKey(model)])

  useLayoutEffect(() => () => {
    Object.values(connectionsRef.current).forEach((eventConnection) => {
      if (onConnected) {
        eventConnection.events.removeListener("connected", onConnected)
      }

      eventConnection.unsubscribe()
    })

    connectionsRef.current = {}
  }, [])
}

export default apiMakerUseModelEvent
