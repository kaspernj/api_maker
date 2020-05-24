import BaseModel from "../base-model"
import Collection from "../collection"

export default class AccountMarkedTask extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"id","type":"integer"}],"collectionKey":"account_marked_tasks","collectionName":"account-marked-tasks","i18nKey":"account_marked_task","name":"AccountMarkedTask","pluralName":"account_marked_tasks","relationships":[],"paramKey":"account_marked_task","path":"/api_maker/account_marked_tasks","primaryKey":"id"}
  }

  

  
    
    id() {
      // integer
      
        return this._getAttribute("id")
      
    }

    hasId() {
      const value = this.id()
      return this._isPresent(value)
    }
  

  

  
}
