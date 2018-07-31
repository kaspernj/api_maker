import BaseModel from "../BaseModel"
import Collection from "../Collection"

export default class extends BaseModel {
  static modelClassData() {
    return {"name":"User","relationships":[],"paramKey":"user","path":"/api_maker/users","primaryKey":"id"}
  }

  

  
    id() {
      return this._getAttribute("id")
    }
  
    email() {
      return this._getAttribute("email")
    }
  
    createdAt() {
      return this._getAttribute("created_at")
    }
  
}
