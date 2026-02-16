export default class OnLocationChangedCallback {
  constructor(callbacksHandler, id, callback) {
    this.callback = callback
    this.callbacksHandler = callbacksHandler
    this.id = id
    this.callCallback = this.callCallback.bind(this)
    this.disconnect = this.disconnect.bind(this)
  }

  callCallback() {
    try {
      this.callback()
    } catch (error) {
      // Throw error in a callback to avoid interrupting other callbacks and properly.
      setTimeout(() => { throw error }, 0)
    }
  }

  disconnect() {
    delete this.callbacksHandler.callbacks[this.id]
  }
}
