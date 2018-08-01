import BaseModel from "../BaseModel"
import Collection from "../Collection"

export default class extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"id","type":"integer"},{"name":"name","type":"string"},{"name":"project_id","type":"integer"},{"name":"created_at","type":"datetime"}],"name":"Task","relationships":[{"className":"Project","name":"project","macro":"belongs_to"}],"paramKey":"task","path":"/api_maker/tasks","primaryKey":"id"}
  }

  
    
      project() {
        var id = this.projectId()
        return this._readBelongsToReflection({"reflectionName":"project","modelName":"Project","targetPathName":"/api_maker/projects","ransack":{"id_eq":id}})
      }
    
  

  
    id() {
      // integer
      
        return this._getAttribute("id")
      
    }
  
    name() {
      // string
      
        return this._getAttribute("name")
      
    }
  
    projectId() {
      // integer
      
        return this._getAttribute("project_id")
      
    }
  
    createdAt() {
      // datetime
      
        return this._getAttributeDateTime("created_at")
      
    }
  
}
