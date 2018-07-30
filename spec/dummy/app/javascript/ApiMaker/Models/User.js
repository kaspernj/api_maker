import BaseModel from "../BaseModel"
import Collection from "../Collection"

export default class extends BaseModel {
  static modelClassData() {
    return {"name":"User","paramKey":"user","path":"/api_maker/users","primaryKey":"id"}
  }

  

  
    id() {
      return this.getAttribute("id")
    }
  
    email() {
      return this.getAttribute("email")
    }
  
    createdAt() {
      return this.getAttribute("created_at")
    }
  
}
