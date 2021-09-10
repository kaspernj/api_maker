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

  constructor({a, b}) {
    this.abilities = b
    this.modelData = a
  }
}
