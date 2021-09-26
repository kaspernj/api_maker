const CableConnectionPool = require("./cable-connection-pool.cjs")

module.exports = class ModelEvents {
  static connect(model, eventName, callback) {
    const modelClassName = digg(model.modelClassData(), "name")
    const cableSubscription = CableConnectionPool.current().connectEvent(modelClassName, model.primaryKey(), eventName, callback)

    return cableSubscription
  }

  static connectModelClass(modelClass, eventName, callback) {
    const modelClassName = digg(modelClass.modelClassData(), "name")
    const cableSubscription = CableConnectionPool.current().connectModelClassEvent(modelClassName, eventName, callback)

    return cableSubscription
  }

  static connectCreated(modelClass, callback) {
    const modelClassName = digg(modelClass.modelClassData(), "name")
    const cableSubscription = CableConnectionPool.current().connectCreated(modelClassName, callback)

    return cableSubscription
  }

  static connectDestroyed(callback) {
    const modelClassName = digg(model.modelClassData(), "name")
    const cableSubscription = CableConnectionPool.current().connectDestroyed(modelClassName, model.primaryKey(), callback)

    return cableSubscription
  }

  static connectUpdated(callback) {
    const modelClassName = digg(model.modelClassData(), "name")
    const cableSubscription = CableConnectionPool.current().connectUpdate(modelClassName, model.primaryKey(), callback)

    return cableSubscription
  }
}
