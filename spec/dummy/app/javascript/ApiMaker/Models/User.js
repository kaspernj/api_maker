import BaseModel from "../BaseModel"
import Collection from "../Collection"

export default class User extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"id","type":"integer"},{"name":"email","type":"string"},{"name":"created_at","type":"datetime"}],"name":"User","relationships":[],"paramKey":"user","path":"/api_maker/users","primaryKey":"id"}
  }

  

  
    
    id() {
      // integer
      
        return this._getAttribute("id")
      
    }

    hasId() {
      var value = this.id()
      return this._isPresent(value)
    }
  
    
    email() {
      // string
      
        return this._getAttribute("email")
      
    }

    hasEmail() {
      var value = this.email()
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
