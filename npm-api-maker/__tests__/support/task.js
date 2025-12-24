export default class Task {
  static modelClassData() {
    return {
      attributes: [],
      name: "Task"
    }
  }

  static modelName() {
    return "Task"
  }

  constructor({a, b, isNewRecord = false, r} = {}) {
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
