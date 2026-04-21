// @ts-check
import CableConnectionPool from "./cable-connection-pool.js"
import {digg} from "diggerize"

/** @typedef {import("./base-model.js").default} BaseModel */
/** @typedef {string | number | boolean | null} EventArgumentPrimitive */
/** @typedef {EventArgumentPrimitive | EventArgumentPrimitive[]} EventArgumentValue */
/** @typedef {{args: Record<string, EventArgumentValue>, eventName: string, model: BaseModel}} ModelEventPayload */
/** @typedef {{args: Record<string, EventArgumentValue>, eventName: string}} ModelClassEventPayload */
/** @typedef {{model: BaseModel}} ModelMutationPayload */

/** Model and model-class ActionCable event connectors. */
export default class ModelEvents {
  /**
   * Connects to a named event on one persisted model instance.
   * @param {BaseModel} model
   * @param {string} eventName
   * @param {(payload: ModelEventPayload) => void} callback
   * @returns {import("./cable-subscription.js").default}
   */
  static connect (model, eventName, callback) {
    const modelClassName = digg(model.modelClassData(), "name")
    const cableSubscription = CableConnectionPool.current().connectEvent(modelClassName, model.primaryKey(), eventName, callback)

    return cableSubscription
  }

  /**
   * Connects to a named model-class event stream.
   * @param {typeof import("./base-model.js").default} modelClass
   * @param {string} eventName
   * @param {(payload: ModelClassEventPayload) => void} callback
   * @returns {import("./cable-subscription.js").default}
   */
  static connectModelClass (modelClass, eventName, callback) {
    const modelClassName = digg(modelClass.modelClassData(), "name")
    const cableSubscription = CableConnectionPool.current().connectModelClassEvent(modelClassName, eventName, callback)

    return cableSubscription
  }

  /**
   * Connects to created events for a model class.
   * @param {typeof import("./base-model.js").default} modelClass
   * @param {(payload: ModelMutationPayload) => void} callback
   * @returns {import("./cable-subscription.js").default}
   */
  static connectCreated (modelClass, callback) {
    const modelClassName = digg(modelClass.modelClassData(), "name")
    const cableSubscription = CableConnectionPool.current().connectCreated(modelClassName, callback)

    return cableSubscription
  }

  /**
   * Connects to destroy events for one persisted model instance.
   * @param {BaseModel} model
   * @param {(payload: ModelMutationPayload) => void} callback
   * @returns {import("./cable-subscription.js").default}
   */
  static connectDestroyed (model, callback) {
    const modelClassName = digg(model.modelClassData(), "name")
    const cableSubscription = CableConnectionPool.current().connectDestroyed(modelClassName, model.primaryKey(), callback)

    return cableSubscription
  }

  /**
   * Connects to update events for one persisted model instance.
   * @param {BaseModel} model
   * @param {(payload: ModelMutationPayload) => void} callback
   * @returns {import("./cable-subscription.js").default}
   */
  static connectUpdated (model, callback) {
    const modelClassName = digg(model.modelClassData(), "name")
    const cableSubscription = CableConnectionPool.current().connectUpdate(modelClassName, model.primaryKey(), callback)

    return cableSubscription
  }
}
