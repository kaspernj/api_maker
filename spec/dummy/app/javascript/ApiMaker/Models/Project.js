import BaseModel from "../BaseModel"
import Collection from "../Collection"

export default class Project extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"id","type":"integer"},{"name":"name","type":"string"},{"name":"created_at","type":"datetime"}],"name":"Project","pluralName":"projects","relationships":[{"className":"Task","name":"tasks","macro":"has_many"},{"className":"Task","name":"task","macro":"has_one"}],"paramKey":"project","path":"/api_maker/projects","primaryKey":"id"}
  }

  
    
      tasks() {
        var id = this.id()
        return new Collection({"reflectionName":"tasks","model":this,"modelName":"Task","targetPathName":"/api_maker/tasks","ransack":{"project_id_eq":id}})
      }
    
  
    
      loadTask() {
        var id = this.id()
        return this._loadHasOneReflection({"reflectionName":"task","model":this,"modelName":"Task","targetPathName":"/api_maker/tasks","ransack":{"project_id_eq":id}})
      }

      task() {
        var id = this.id()
        return this._readHasOneReflection({"reflectionName":"task","model":this,"modelName":"Task","targetPathName":"/api_maker/tasks","ransack":{"project_id_eq":id}})
      }
    
  

  
    
    id() {
      // integer
      
        return this._getAttribute("id")
      
    }

    hasId() {
      var value = this.id()
      return this._isPresent(value)
    }
  
    
    name() {
      // string
      
        return this._getAttribute("name")
      
    }

    hasName() {
      var value = this.name()
      return this._isPresent(value)
    }
  
    
    createdAt() {
      // datetime
      
        return this._getAttributeDateTime("created_at")
      
    }

    hasCreatedAt() {
      var value = this.createdAt()
      return this._isPresent(value)
    }
  

  
}
