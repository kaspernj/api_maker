import BaseModel from "./BaseModel"
import Collection from "./Collection"

export default class extends BaseModel {
  static modelClassData() {
    return {"name":"Task","path":"/api_maker/tasks"}
  }

  
    
      project() {
        return this.readBelongsToReflection({"name":"project"})
      }
    
  

  
    id() {
      return this.getAttribute("id")
    }
  
    name() {
      return this.getAttribute("name")
    }
  
    createdAt() {
      return this.getAttribute("created_at")
    }
  
}
