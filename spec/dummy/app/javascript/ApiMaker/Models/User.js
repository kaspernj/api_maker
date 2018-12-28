import BaseModel from "../BaseModel"
import Collection from "../Collection"

export default class User extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"id","type":"integer"},{"name":"email","type":"string"},{"name":"created_at","type":"datetime"},{"name":"custom_attribute","type":"unknown"},{"name":"updated_at","type":"datetime"}],"i18nKey":"user","name":"User","pluralName":"users","relationships":[],"paramKey":"user","path":"/api_maker/users","primaryKey":"id"}
  }

  

  
    
    id() {
      // integer
      
        return this._getAttribute("id")
      
    }

    hasId() {
      let value = this.id()
      return this._isPresent(value)
    }
  
    
    email() {
      // string
      
        return this._getAttribute("email")
      
    }

    hasEmail() {
      let value = this.email()
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
  
    
    customAttribute() {
      // unknown
      
        return this._getAttribute("custom_attribute")
      
    }

    hasCustomAttribute() {
      let value = this.customAttribute()
      return this._isPresent(value)
    }
  
    
    updatedAt() {
      // datetime
      
        return this._getAttributeDateTime("updated_at")
      
    }

    hasUpdatedAt() {
      let value = this.updatedAt()
      return this._isPresent(value)
    }
  

  

  
}
