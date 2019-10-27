import Dexie from "dexie"

export default class KeyValueStore {
  static current() {
    if (!window.currentKeyValueStore)
      window.currentKeyValueStore = new KeyValueStore()

    return window.currentKeyValueStore
  }

  static async get(key) {
    return await KeyValueStore.current().get(key)
  }

  static async set(key, value) {
    return await KeyValueStore.current().set(key, value)
  }

  constructor() {
    this.database = new Dexie("KeyValueStoreDatabase")
    this.database.version(1).stores({
      keyValues: "++id, key, value"
    })
  }

  async get(key) {
    var row = await this.database.keyValues.where("key").equals(key).first()

    if (row)
      return row.value
  }

  async set(key, value) {
    var row = await this.database.keyValues.where("key").equals(key).first()

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
