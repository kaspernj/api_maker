import BaseModel from "../BaseModel"
import Collection from "../Collection"

export default class Account extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"id","type":"integer"},{"name":"name","type":"string"}],"name":"Account","pluralName":"accounts","relationships":[{"className":"Project","name":"projects","macro":"has_many"}],"paramKey":"account","path":"/api_maker/accounts","primaryKey":"id"}
  }

  
    
      projects() {
        var id = this.id()
        return new Collection({"reflectionName":"projects","model":this,"modelName":"Project","targetPathName":"/api_maker/projects","ransack":{"account_id_eq":id}})
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
  

  

  
}
