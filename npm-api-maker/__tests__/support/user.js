module.exports = class User {
  static modelClassData() {
    return {
      attributes: [],
      name: "User"
    }
  }

  static modelName() {
    return "User"
  }

  constructor({a, b, isNewRecord = false, r}) {
    this.abilities = b
    this._isNewRecord = isNewRecord
    this.modelData = a
    this.relationshipsCache = r
  }

  isNewRecord() {
    return this._isNewRecord
  }

  isPersisted() {
    return !this._isNewRecord
  }
}
