import BaseModel from "../../src/base-model"

export default class User extends BaseModel {
  static modelClassData() {
    return {
      attributes: [],
      name: "User"
    }
  }
}
