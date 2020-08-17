
  import BaseModel from "../base-model"
  import Collection from "../collection"


export default class Comment extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"id","type":"integer"},{"name":"comment","type":"text"}],"collectionKey":"comments","collectionName":"comments","i18nKey":"comment","name":"Comment","pluralName":"comments","relationships":[{"className":"User","collectionName":"users","name":"author","macro":"belongs_to"}],"paramKey":"comment","path":"/api_maker/comments","primaryKey":"id"}
  }

  
    
      loadAuthor() {
        const id = this.authorId()
        const modelClass = require(`api-maker/models/user`).default
        return this._loadBelongsToReflection({"reflectionName":"author","model":this,"modelClass":modelClass}, {"ransack":{"id_eq":id}})
      }

      author() {
        const modelClass = require(`api-maker/models/user`).default
        return this._readBelongsToReflection({"reflectionName":"author","model":this,"modelClass":modelClass})
      }
    
  

  
    
    id() {
      // integer
      
        return this._getAttribute("id")
      
    }

    hasId() {
      const value = this.id()
      return this._isPresent(value)
    }
  
    
    comment() {
      // text
      
        return this._getAttribute("comment")
      
    }

    hasComment() {
      const value = this.comment()
      return this._isPresent(value)
    }
  

  

  
}
