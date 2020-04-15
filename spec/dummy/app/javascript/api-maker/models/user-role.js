import BaseModel from "../base-model"
import Collection from "../collection"

export default class UserRole extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"id","type":"integer"},{"name":"role","type":"string"},{"name":"user_id","type":"integer"}],"collectionKey":"user/roles","collectionName":"user-roles","i18nKey":"user/role","name":"UserRole","pluralName":"user_roles","relationships":[{"className":"User","collectionName":"users","name":"user","macro":"belongs_to"}],"paramKey":"user_role","path":"/api_maker/user_roles","primaryKey":"id"}
  }

  
    
      
      loadUser() {
        const id = this.userId()
        const modelClass = require(`api-maker/models/user`).default
        return this._loadBelongsToReflection({"reflectionName":"user","model":this,"modelClass":modelClass}, {"ransack":{"id_eq":id}})
      }

      user() {
        const modelClass = require(`api-maker/models/user`).default
        return this._readBelongsToReflection({"reflectionName":"user","model":this,"modelClass":modelClass})
      }
    
  

  
    
    id() {
      // integer
      
        return this._getAttribute("id")
      
    }

    hasId() {
      const value = this.id()
      return this._isPresent(value)
    }
  
    
    role() {
      // string
      
        return this._getAttribute("role")
      
    }

    hasRole() {
      const value = this.role()
      return this._isPresent(value)
    }
  
    
    userId() {
      // integer
      
        return this._getAttribute("user_id")
      
    }

    hasUserId() {
      const value = this.userId()
      return this._isPresent(value)
    }
  

  

  
}
