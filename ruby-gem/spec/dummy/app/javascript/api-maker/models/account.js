
  import BaseModel from "../base-model"
  import Collection from "../collection"


export default class Account extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"id","type":"integer"},{"name":"name","type":"string"},{"name":"users_count","type":"unknown"}],"collectionKey":"accounts","collectionName":"accounts","i18nKey":"account","name":"Account","pluralName":"accounts","relationships":[{"className":"Project","collectionName":"projects","name":"projects","macro":"has_many"},{"className":"Task","collectionName":"tasks","name":"tasks","macro":"has_many"}],"paramKey":"account","path":"/api_maker/accounts","primaryKey":"id"}
  }

  
    
      projects() {
        const id = this.id()
        const modelClass = require(`api-maker/models/project`).default
        return new Collection({"reflectionName":"projects","model":this,"modelName":"Project","modelClass":modelClass,"targetPathName":"/api_maker/projects"}, {"ransack":{"account_id_eq":id}})
      }
    
  
    
      tasks() {
        const id = this.id()
        const modelClass = require(`api-maker/models/task`).default
        return new Collection({"reflectionName":"tasks","model":this,"modelName":"Task","modelClass":modelClass,"targetPathName":"/api_maker/tasks"}, {"params":{"through":{"model":"Account","id":id,"reflection":"tasks"}}})
      }
    
  

  
    
    id() {
      // integer
      
        return this._getAttribute("id")
      
    }

    hasId() {
      const value = this.id()
      return this._isPresent(value)
    }
  
    
    name() {
      // string
      
        return this._getAttribute("name")
      
    }

    hasName() {
      const value = this.name()
      return this._isPresent(value)
    }
  
    
    usersCount() {
      // unknown
      
        return this._getAttribute("users_count")
      
    }

    hasUsersCount() {
      const value = this.usersCount()
      return this._isPresent(value)
    }
  

  

  
}
