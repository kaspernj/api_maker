import BaseModel from "../BaseModel"
import Collection from "../Collection"

export default class Project extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"id","type":"integer"},{"name":"name","type":"string"},{"name":"created_at","type":"datetime"}],"i18nKey":"project","name":"Project","pluralName":"projects","relationships":[{"className":"ProjectDetail","name":"project_detail","macro":"has_one"},{"className":"Task","name":"tasks","macro":"has_many"}],"paramKey":"project","path":"/api_maker/projects","primaryKey":"id"}
  }

  
    
      loadProjectDetail() {
        let id = this.id()
        let modelClass = require(`ApiMaker/Models/ProjectDetail`).default
        return this._loadHasOneReflection({"reflectionName":"project_detail","model":this,"modelClass":modelClass,"ransack":{"project_id_eq":id}})
      }

      projectDetail() {
        let id = this.id()
        let modelClass = require(`ApiMaker/Models/ProjectDetail`).default
        return this._readHasOneReflection({"reflectionName":"project_detail","model":this,"modelClass":modelClass,"ransack":{"project_id_eq":id}})
      }
    
  
    
      tasks() {
        let id = this.id()
        let modelClass = require(`ApiMaker/Models/Task`).default
        return new Collection({"reflectionName":"tasks","model":this,"modelName":"Task","modelClass":modelClass,"targetPathName":"/api_maker/tasks","ransack":{"project_id_eq":id}})
      }
    
  

  
    
    id() {
      // integer
      
        return this._getAttribute("id")
      
    }

    hasId() {
      let value = this.id()
      return this._isPresent(value)
    }
  
    
    name() {
      // string
      
        return this._getAttribute("name")
      
    }

    hasName() {
      let value = this.name()
      return this._isPresent(value)
    }
  
    
    createdAt() {
      // datetime
      
        return this._getAttributeDateTime("created_at")
      
    }

    hasCreatedAt() {
      let value = this.createdAt()
      return this._isPresent(value)
    }
  

  

  
}
