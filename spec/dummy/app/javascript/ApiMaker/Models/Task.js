import BaseModel from "./BaseModel"
import Collection from "./Collection"

export default class extends BaseModel {
  static modelClassData() {
    return {"name":"Task","paramKey":"task","path":"/api_maker/tasks"}
  }

  
    
      project() {
        var id = this.projectId()
        return this._readBelongsToReflection({"modelName":"Project","targetPathName":"/api_maker/projects","ransack":{"id_eq":id}})
      }
    
  

  
    id() {
      return this.getAttribute("id")
    }
  
    name() {
      return this.getAttribute("name")
    }
  
    projectId() {
      return this.getAttribute("project_id")
    }
  
    createdAt() {
      return this.getAttribute("created_at")
    }
  
}
