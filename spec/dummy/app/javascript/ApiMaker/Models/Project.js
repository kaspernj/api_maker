import BaseModel from "./BaseModel"
import Collection from "./Collection"

export default class extends BaseModel {
  static modelClassData() {
    return {"name":"Project","paramKey":"project","path":"/api_maker/projects"}
  }

  
    
      tasks() {
        var id = this.id()
        return new Collection({"modelName":"Task","targetPathName":this.constructor.modelClassData().path,"ransack":{"project_id_eq":id}})
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
