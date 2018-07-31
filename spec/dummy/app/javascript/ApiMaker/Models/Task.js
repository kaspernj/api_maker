import BaseModel from "../BaseModel"
import Collection from "../Collection"

export default class extends BaseModel {
  static modelClassData() {
    return {"name":"Task","relationships":[{"className":"Project","name":"project","macro":"belongs_to"}],"paramKey":"task","path":"/api_maker/tasks","primaryKey":"id"}
  }

  
    
      project() {
        var id = this.projectId()
        return this._readBelongsToReflection({"model":this,"reflectionName":"project","modelName":"Project","targetPathName":"/api_maker/projects","ransack":{"id_eq":id}})
      }
    
  

  
    id() {
      return this._getAttribute("id")
    }
  
    name() {
      return this._getAttribute("name")
    }
  
    projectId() {
      return this._getAttribute("project_id")
    }
  
    createdAt() {
      return this._getAttribute("created_at")
    }
  
}
