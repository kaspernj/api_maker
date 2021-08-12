const Params = require("./params.cjs")

module.exports = class KeyValueStore {
  static current() {
    if (!global.currentKeyValueStore)
      global.currentKeyValueStore = new KeyValueStore()

    return global.currentKeyValueStore
  }

  static async get(key) {
    return await KeyValueStore.current().get(key)
  }

  static async set(key, value) {
    return await KeyValueStore.current().set(key, value)
  }

  static async getCachedParams(paramName, args = {}) {
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

  static async setCachedParams(paramName, qParams) {
    return await KeyValueStore.set(paramName, qParams)
  }

  constructor() {
    this.database = new Dexie("KeyValueStoreDatabase")
    this.database.version(1).stores({
      keyValues: "++id, key, value"
    })
  }

  async get(key) {
    const row = await this.database.keyValues.where("key").equals(key).first()

    if (row)
      return row.value
  }

  async set(key, value) {
    const row = await this.database.keyValues.where("key").equals(key).first()

    if (row) {
      await this.database.keyValues.update(row.id, {value: value})
    } else {
      await this.database.keyValues.add({
        key: key,
        value: value
      })
    }

    return true
  }
}
