// @ts-check

const OWN_ECHO_WINDOW_MS = 1000

const shared = {}

/** @typedef {"creates" | "destroys" | "updates"} MutationKind */
/** @typedef {string | number} MutationModelId */

/**
 * Mutations performed by this client itself.
 *
 * ActionCable broadcasts every mutation to all subscribers, the client that performed it included, and
 * that echo is the only way a component learns that its own change landed. A mutation is therefore
 * delivered to this client's own subscriptions as soon as it resolves, and recorded here so the
 * subscription pool drops that one echo instead of delivering the same change twice.
 */
export default class LocalMutations {
  pendingMutations = {}

  /** @returns {LocalMutations} */
  static current() {
    if (!shared.localMutations) shared.localMutations = new LocalMutations()

    return shared.localMutations
  }

  /** @returns {void} */
  static resetCurrent() {
    if (!shared.localMutations) {
      return
    }

    shared.localMutations.reset()
    delete shared.localMutations
  }

  /**
   * @param {string} modelName
   * @param {MutationModelId} modelId
   * @param {MutationKind} kind
   * @returns {string}
   */
  pendingKey(modelName, modelId, kind) {
    return `${modelName}:${modelId}:${kind}`
  }

  /**
   * Remembers that this client already delivered the mutation to its own subscriptions.
   * @param {string} modelName
   * @param {MutationModelId} modelId
   * @param {MutationKind} kind
   * @returns {void}
   */
  record(modelName, modelId, kind) {
    this.pendingMutations[this.pendingKey(modelName, modelId, kind)] = Date.now()
  }

  /**
   * @param {string} modelName
   * @param {MutationModelId} modelId
   * @param {MutationKind} kind
   * @returns {boolean} true when the broadcast is the echo of a mutation that was already delivered locally
   */
  consume(modelName, modelId, kind) {
    const key = this.pendingKey(modelName, modelId, kind)
    const recordedAt = this.pendingMutations[key]

    if (recordedAt === undefined) {
      return false
    }

    // Only the first broadcast after the mutation can be its echo, so later broadcasts for the same
    // model always reach the subscriptions even when they arrive inside the window.
    delete this.pendingMutations[key]

    return Date.now() - recordedAt <= OWN_ECHO_WINDOW_MS
  }

  /** @returns {void} */
  reset() {
    this.pendingMutations = {}
  }
}
