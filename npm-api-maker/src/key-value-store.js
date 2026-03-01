import Params from "./params.js"

const shared = {}

/** Small IndexedDB-backed key/value store. */
export default class KeyValueStore {
  /** @returns {KeyValueStore} */
  static current () {
    if (!shared.currentKeyValueStore) shared.currentKeyValueStore = new KeyValueStore()

    return shared.currentKeyValueStore
  }

  /**
   * @param {string} key
   * @returns {Promise<any>}
   */
  static get (key) {
    return KeyValueStore.current().get(key)
  }

  /**
   * @param {string} key
   * @param {any} value
   * @returns {Promise<boolean>}
   */
  static set (key, value) {
    return KeyValueStore.current().set(key, value)
  }

  /**
   * @param {string} paramName
   * @param {{default?: Record<string, any>}} [args]
   * @returns {Promise<Record<string, any>>}
   */
  static async getCachedParams (paramName, args = {}) {
    const oldQuery = await KeyValueStore.get(paramName)
    const params = Params.parse()

    if (params && paramName in params) {
      return params[paramName]
    } else if (oldQuery) {
      return oldQuery
    } else {
      return args.default || {}
    }
  }

  /**
   * @param {string} paramName
   * @param {Record<string, any>} qParams
   * @returns {Promise<boolean>}
   */
  static setCachedParams (paramName, qParams) {
    return KeyValueStore.set(paramName, qParams)
  }

  constructor () {
    // @ts-expect-error
    this.database = new Dexie("KeyValueStoreDatabase") // eslint-disable-line no-undef
    this.database.version(1).stores({
      keyValues: "++id, key, value"
    })
  }

  /**
   * @param {string} key
   * @returns {Promise<any>}
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
   * @param {any} value
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
