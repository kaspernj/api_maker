import BaseModel from "../BaseModel"
import Collection from "../Collection"

export default class ProjectDetail extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"id","type":"integer"},{"name":"project_id","type":"integer"},{"name":"details","type":"string"}],"name":"ProjectDetail","pluralName":"project_details","relationships":[{"className":"Project","name":"project","macro":"belongs_to"}],"paramKey":"project_detail","path":"/api_maker/project_details","primaryKey":"id"}
  }

  
    
      loadProject() {
        let id = this.projectId()
        return this._loadBelongsToReflection({"reflectionName":"project","model":this,"modelName":"Project","targetPathName":"/api_maker/projects","ransack":{"id_eq":id}})
      }

      project() {
        let id = this.projectId()
        return this._readBelongsToReflection({"reflectionName":"project","model":this,"modelName":"Project","targetPathName":"/api_maker/projects","ransack":{"id_eq":id}})
      }
    
  

  
    
    id() {
      // integer
      
        return this._getAttribute("id")
      
    }

    hasId() {
      let value = this.id()
      return this._isPresent(value)
    }
  
    
    projectId() {
      // integer
      
        return this._getAttribute("project_id")
      
    }

    hasProjectId() {
      let value = this.projectId()
      return this._isPresent(value)
    }
  
    
    details() {
      // string
      
        return this._getAttribute("details")
      
    }

    hasDetails() {
      let value = this.details()
      return this._isPresent(value)
    }
  

  

  
}
