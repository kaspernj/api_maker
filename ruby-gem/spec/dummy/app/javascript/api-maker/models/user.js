import BaseModel from "../base-model"
import Collection from "../collection"

export default class User extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"birthday_at","type":"date"},{"name":"id","type":"integer"},{"name":"email","type":"string"},{"name":"created_at","type":"datetime"},{"name":"custom_attribute","type":"unknown"},{"name":"updated_at","type":"datetime"}],"collectionKey":"users","collectionName":"users","i18nKey":"user","name":"User","pluralName":"users","relationships":[{"className":"Task","collectionName":"tasks","name":"tasks","macro":"has_many"}],"paramKey":"user","path":"/api_maker/users","primaryKey":"id"}
  }

  
    
      tasks() {
        const id = this.id()
        const modelClass = require(`api-maker/models/task`).default
        return new Collection({"reflectionName":"tasks","model":this,"modelName":"Task","modelClass":modelClass,"targetPathName":"/api_maker/tasks"}, {"ransack":{"user_id_eq":id}})
      }
    
  

  
    
    birthdayAt() {
      // date
      
        return this._getAttributeDateTime("birthday_at")
      
    }

    hasBirthdayAt() {
      const value = this.birthdayAt()
      return this._isPresent(value)
    }
  
    
    id() {
      // integer
      
        return this._getAttribute("id")
      
    }

    hasId() {
      const value = this.id()
      return this._isPresent(value)
    }
  
    
    email() {
      // string
      
        return this._getAttribute("email")
      
    }

    hasEmail() {
      const value = this.email()
      return this._isPresent(value)
    }
  
    
    createdAt() {
      // datetime
      
        return this._getAttributeDateTime("created_at")
      
    }

    hasCreatedAt() {
      const value = this.createdAt()
      return this._isPresent(value)
    }
  
    
    customAttribute() {
      // unknown
      
        return this._getAttribute("custom_attribute")
      
    }

    hasCustomAttribute() {
      const value = this.customAttribute()
      return this._isPresent(value)
    }
  
    
    updatedAt() {
      // datetime
      
        return this._getAttributeDateTime("updated_at")
      
    }

    hasUpdatedAt() {
      const value = this.updatedAt()
      return this._isPresent(value)
    }
  

  

  
}
