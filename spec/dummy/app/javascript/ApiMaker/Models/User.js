import BaseModel from "../BaseModel"
import Collection from "../Collection"

export default class extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"id","type":"integer"},{"name":"email","type":"string"},{"name":"created_at","type":"datetime"}],"name":"User","relationships":[],"paramKey":"user","path":"/api_maker/users","primaryKey":"id"}
  }

  

  
    id() {
      // integer
      
        return this._getAttribute("id")
      
    }
  
    email() {
      // string
      
        return this._getAttribute("email")
      
    }
  
    createdAt() {
      // datetime
      
        return this._getAttributeDateTime("created_at")
      
    }
  
}
