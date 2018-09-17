import BaseModel from "../BaseModel"
import Collection from "../Collection"

export default class Task extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"id","type":"integer"},{"name":"name","type":"string"},{"name":"project_id","type":"integer"},{"name":"created_at","type":"datetime"}],"name":"Task","pluralName":"tasks","relationships":[{"className":"Project","name":"project","macro":"belongs_to"}],"paramKey":"task","path":"/api_maker/tasks","primaryKey":"id"}
  }

  
    
      loadProject() {
        var id = this.projectId()
        return this._loadBelongsToReflection({"reflectionName":"project","model":this,"modelName":"Project","targetPathName":"/api_maker/projects","ransack":{"id_eq":id}})
      }

      project() {
        var id = this.projectId()
        return this._readBelongsToReflection({"reflectionName":"project","model":this,"modelName":"Project","targetPathName":"/api_maker/projects","ransack":{"id_eq":id}})
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
  
    
    projectId() {
      // integer
      
        return this._getAttribute("project_id")
      
    }

    hasProjectId() {
      var value = this.projectId()
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
