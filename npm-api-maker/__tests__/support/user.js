import BaseModel from "../../src/base-model.mjs"

export default class User extends BaseModel {
  static modelClassData () {
    return {
      attributes: [],
      name: "User",
      primaryKey: "id"
    }
  }

  static modelName () {
    return "User"
  }

  constructor ({a, b, isNewRecord = false, r}) {
    super({a})

    this.abilities = b
    this._isNewRecord = isNewRecord
    this.modelData = a
    this.relationshipsCache = r
  }

  isNewRecord () {
    return this._isNewRecord
  }

  isPersisted () {
    return !this._isNewRecord
  }
}
