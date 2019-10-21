export default class Hash {
  static fetch(key, object) {
    if (!(key in object))
      throw new Error(`Key didn't exist in object: ${key}`)

    return object[key]
  }
}
