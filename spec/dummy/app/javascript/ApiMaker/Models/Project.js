import BaseModel from "../BaseModel"
import Collection from "../Collection"

export default class extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"id","type":"integer"},{"name":"name","type":"string"},{"name":"created_at","type":"datetime"}],"name":"Project","relationships":[{"className":"Task","name":"tasks","macro":"has_many"},{"className":"Task","name":"task","macro":"has_one"}],"paramKey":"project","path":"/api_maker/projects","primaryKey":"id"}
  }

  
    
      tasks() {
        var id = this.id()
        return new Collection({"reflectionName":"tasks","modelName":"Task","targetPathName":"/api_maker/tasks","ransack":{"project_id_eq":id}})
      }
    
  
    
      task() {
        var id = this.id()
        return this._readHasOneReflection({"reflectionName":"task","modelName":"Task","targetPathName":"/api_maker/tasks","ransack":{"project_id_eq":id}})
      }
    
  

  
    id() {
      // integer
      
        return this._getAttribute("id")
      
    }
  
    name() {
      // string
      
        return this._getAttribute("name")
      
    }
  
    createdAt() {
      // datetime
      
        return this._getAttributeDateTime("created_at")
      
    }
  
}
