import Params from "./params"

const shared = {}

export default class KeyValueStore {
  static current () {
    if (!shared.currentKeyValueStore) shared.currentKeyValueStore = new KeyValueStore()

    return shared.currentKeyValueStore
  }

  static get (key) {
    return KeyValueStore.current().get(key)
  }

  static set (key, value) {
    return KeyValueStore.current().set(key, value)
  }

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

  static setCachedParams (paramName, qParams) {
    return KeyValueStore.set(paramName, qParams)
  }

  constructor () {
    this.database = new Dexie("KeyValueStoreDatabase")
    this.database.version(1).stores({
      keyValues: "++id, key, value"
    })
  }

  async get (key) {
    const row = await this.database.keyValues
      .where("key")
      .equals(key)
      .first()

    if (row)
      return row.value
  }

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
