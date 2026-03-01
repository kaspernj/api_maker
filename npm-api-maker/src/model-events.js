import CableConnectionPool from "./cable-connection-pool.js"
import {digg} from "diggerize"

/** Model and model-class ActionCable event connectors. */
export default class ModelEvents {
  /**
   * @param {import("./base-model.js").default} model
   * @param {string} eventName
   * @param {(...args: any[]) => void} callback
   * @returns {import("./cable-subscription.js").default}
   */
  static connect (model, eventName, callback) {
    const modelClassName = digg(model.modelClassData(), "name")
    const cableSubscription = CableConnectionPool.current().connectEvent(modelClassName, model.primaryKey(), eventName, callback)

    return cableSubscription
  }

  /**
   * @param {typeof import("./base-model.js").default} modelClass
   * @param {string} eventName
   * @param {(...args: any[]) => void} callback
   * @returns {import("./cable-subscription.js").default}
   */
  static connectModelClass (modelClass, eventName, callback) {
    const modelClassName = digg(modelClass.modelClassData(), "name")
    const cableSubscription = CableConnectionPool.current().connectModelClassEvent(modelClassName, eventName, callback)

    return cableSubscription
  }

  /**
   * @param {typeof import("./base-model.js").default} modelClass
   * @param {(...args: any[]) => void} callback
   * @returns {import("./cable-subscription.js").default}
   */
  static connectCreated (modelClass, callback) {
    const modelClassName = digg(modelClass.modelClassData(), "name")
    const cableSubscription = CableConnectionPool.current().connectCreated(modelClassName, callback)

    return cableSubscription
  }

  /**
   * @param {import("./base-model.js").default} model
   * @param {(...args: any[]) => void} callback
   * @returns {import("./cable-subscription.js").default}
   */
  static connectDestroyed (model, callback) {
    const modelClassName = digg(model.modelClassData(), "name")
    const cableSubscription = CableConnectionPool.current().connectDestroyed(modelClassName, model.primaryKey(), callback)

    return cableSubscription
  }

  /**
   * @param {import("./base-model.js").default} model
   * @param {(...args: any[]) => void} callback
   * @returns {import("./cable-subscription.js").default}
   */
  static connectUpdated (model, callback) {
    const modelClassName = digg(model.modelClassData(), "name")
    const cableSubscription = CableConnectionPool.current().connectUpdate(modelClassName, model.primaryKey(), callback)

    return cableSubscription
  }
}
