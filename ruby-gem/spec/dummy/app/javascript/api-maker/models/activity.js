import BaseModel from "../base-model"
import Collection from "../collection"

export default class PublicActivityActivity extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"id","type":"integer"}],"collectionKey":"public_activity/activities","collectionName":"activities","i18nKey":"public_activity/activity","name":"Activity","pluralName":"public_activity_activities","relationships":[],"paramKey":"public_activity_activity","path":"/api_maker/public_activity_activities","primaryKey":"id"}
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
