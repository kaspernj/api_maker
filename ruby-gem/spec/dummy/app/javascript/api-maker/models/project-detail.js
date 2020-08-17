
  import BaseModel from "../base-model"
  import Collection from "../collection"


export default class ProjectDetail extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"id","type":"integer"},{"name":"project_id","type":"integer"},{"name":"details","type":"string"}],"collectionKey":"project_details","collectionName":"project-details","i18nKey":"project_detail","name":"ProjectDetail","pluralName":"project_details","relationships":[{"className":"Project","collectionName":"projects","name":"project","macro":"belongs_to"}],"paramKey":"project_detail","path":"/api_maker/project_details","primaryKey":"id"}
  }

  
    
      loadProject() {
        const id = this.projectId()
        const modelClass = require(`api-maker/models/project`).default
        return this._loadBelongsToReflection({"reflectionName":"project","model":this,"modelClass":modelClass}, {"ransack":{"id_eq":id}})
      }

      project() {
        const modelClass = require(`api-maker/models/project`).default
        return this._readBelongsToReflection({"reflectionName":"project","model":this,"modelClass":modelClass})
      }
    
  

  
    
    id() {
      // integer
      
        return this._getAttribute("id")
      
    }

    hasId() {
      const value = this.id()
      return this._isPresent(value)
    }
  
    
    projectId() {
      // integer
      
        return this._getAttribute("project_id")
      
    }

    hasProjectId() {
      const value = this.projectId()
      return this._isPresent(value)
    }
  
    
    details() {
      // string
      
        return this._getAttribute("details")
      
    }

    hasDetails() {
      const value = this.details()
      return this._isPresent(value)
    }
  

  

  
}
