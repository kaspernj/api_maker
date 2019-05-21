import BaseModel from "../base-model"
import Collection from "../collection"

export default class Customer extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"id","type":"integer"},{"name":"name","type":"string"}],"collectionKey":"customers","collectionName":"customers","i18nKey":"customer","name":"Customer","pluralName":"customers","relationships":[],"paramKey":"customer","path":"/api_maker/customers","primaryKey":"id"}
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
  

  

  
}
