// @ts-check
import Params from "./params.js"

const shared = {}

/** @typedef {string | number | boolean | null} StoredScalar */
/** @typedef {Record<string, StoredScalar>} StoredScalarRecord */
/** @typedef {Array<StoredScalar | StoredScalarRecord>} StoredArray */
/** @typedef {Record<string, StoredScalar | StoredArray | StoredScalarRecord>} KeyValueStoreParams */
/** @typedef {StoredScalar | StoredArray | KeyValueStoreParams} KeyValueStoreValue */

/** Small IndexedDB-backed key/value store. */
export default class KeyValueStore {
  /** @returns {KeyValueStore} */
  static current () {
    if (!shared.currentKeyValueStore) shared.currentKeyValueStore = new KeyValueStore()

    return shared.currentKeyValueStore
  }

  /**
   * @param {string} key
   * @returns {Promise<KeyValueStoreValue | undefined>}
   */
  static get (key) {
    return KeyValueStore.current().get(key)
  }

  /**
   * @param {string} key
   * @param {KeyValueStoreValue} value
   * @returns {Promise<boolean>}
   */
  static set (key, value) {
    return KeyValueStore.current().set(key, value)
  }

  /**
   * @param {string} paramName
   * @param {{default?: KeyValueStoreParams}} [args]
   * @returns {Promise<KeyValueStoreParams>}
   */
  static async getCachedParams (paramName, args = {}) {
    const oldQuery = await KeyValueStore.get(paramName)
    const params = Params.parse()

    if (params && paramName in params) {
      const currentQuery = params[paramName]

      if (currentQuery && typeof currentQuery == "object" && !Array.isArray(currentQuery)) {
        return /** @type {KeyValueStoreParams} */ (currentQuery)
      }
    } else if (oldQuery && typeof oldQuery == "object" && !Array.isArray(oldQuery)) {
      return /** @type {KeyValueStoreParams} */ (oldQuery)
    } else {
      return args.default || {}
    }

    return args.default || {}
  }

  /**
   * @param {string} paramName
   * @param {KeyValueStoreParams} qParams
   * @returns {Promise<boolean>}
   */
  static setCachedParams (paramName, qParams) {
    return KeyValueStore.set(paramName, qParams)
  }

  /** Opens the IndexedDB database used by the shared key/value store. */
  constructor () {
    // @ts-expect-error
    this.database = new Dexie("KeyValueStoreDatabase") // eslint-disable-line no-undef
    this.database.version(1).stores({
      keyValues: "++id, key, value"
    })
  }

  /**
   * @param {string} key
   * @returns {Promise<KeyValueStoreValue | undefined>}
   */
  async get (key) {
    const row = await this.database.keyValues
      .where("key")
      .equals(key)
      .first()

    if (row)
      return row.value
  }

  /**
   * @param {string} key
   * @param {KeyValueStoreValue} value
   * @returns {Promise<boolean>}
   */
  async set (key, value) {
    const row = await this.database.keyValues
      .where("key")
      .equals(key)
      .first()

    if (row) {
      await this.database.keyValues.update(row.id, {value})
    } else {
      await this.database.keyValues.add({key, value})
    }

    return true
  }
}
