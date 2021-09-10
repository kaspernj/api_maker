module.exports = class Task {
  static modelClassData() {
    return {
      attributes: [],
      name: "User"
    }
  }

  static modelName() {
    return "Task"
  }

  constructor({a, b, r} = {}) {
    this.abilities = b
    this.modelData = a
    this.relationshipsCache = r
  }
}
