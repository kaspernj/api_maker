// @ts-check
/* eslint-disable sort-imports */
import {useCallback, useLayoutEffect, useMemo, useRef} from "react"
import debounceFunction from "debounce"
import ModelEvents from "./model-events.js"
import useShape from "./use-shape.js"

/** @typedef {{active?: boolean, debounce?: number, onConnected?: () => void}} UseUpdatedEventProps */
/** @typedef {import("./base-model.js").default} EventModel */
/** @typedef {EventModel & {id: () => number|string}} EventModelWithId */
/** @typedef {{model: EventModel}} UpdatedEventPayload */
/** @typedef {(payload: UpdatedEventPayload) => void} EventCallback */

/**
 * @param {EventModel | EventModel[] | undefined | null} modelOrModels
 * @returns {EventModel[]}
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
 * @param {EventModel | EventModel[] | undefined | null} modelOrModels
 * @returns {string}
 */
const modelsDependencyKey = (modelOrModels) => JSON.stringify(
  modelsFromInput(modelOrModels).map((model) => /** @type {EventModelWithId} */ (model).id())
)

/**
 * @param {EventModel | EventModel[] | undefined | null} modelOrModels
 * @returns {Record<string, EventModelWithId>}
 */
const modelsByIdFromInput = (modelOrModels) => {
  const modelsById = /** @type {Record<string, EventModelWithId>} */ ({})

  modelsFromInput(modelOrModels).forEach((model) => {
    const modelWithId = /** @type {EventModelWithId} */ (model)

    modelsById[modelWithId.id()] = modelWithId
  })

  return modelsById
}

/**
 * @param {EventModel | EventModel[]} model
 * @param {EventCallback} onUpdated
 * @param {UseUpdatedEventProps} [props]
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

  const onUpdatedCallback = useCallback((payload) => {
    if (!s.p.active) {
      return
    }

    if (s.p.debounce) {
      s.m.debounceCallback(payload)
    } else {
      s.p.onUpdated(payload)
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
