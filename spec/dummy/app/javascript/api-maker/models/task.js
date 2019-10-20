import BaseModel from "../base-model"
import Collection from "../collection"

export default class Task extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"created_at","type":"datetime"},{"name":"finished","type":"unknown"},{"name":"id","type":"integer"},{"name":"name","type":"string"},{"name":"project_id","type":"integer"},{"name":"user_id","type":"integer"},{"name":"custom_id","type":"unknown"}],"collectionKey":"tasks","collectionName":"tasks","i18nKey":"task","name":"Task","pluralName":"tasks","relationships":[{"className":"Account","collectionName":"accounts","name":"account","macro":"has_one"},{"className":"Project","collectionName":"projects","name":"project","macro":"belongs_to"},{"className":"User","collectionName":"users","name":"user","macro":"belongs_to"}],"paramKey":"task","path":"/api_maker/tasks","primaryKey":"id"}
  }

  
    
      loadAccount() {
        let id = this.id()
        let modelClass = require(`api-maker/models/account`).default
        return this._loadHasOneReflection({"reflectionName":"account","model":this,"modelClass":modelClass}, {"params":{"through":{"model":"Task","id":id,"reflection":"account"}}})
      }

      account() {
        let modelClass = require(`api-maker/models/account`).default
        return this._readHasOneReflection({"reflectionName":"account","model":this,"modelClass":modelClass})
      }
    
  
    
      loadProject() {
        let id = this.projectId()
        let modelClass = require(`api-maker/models/project`).default
        return this._loadBelongsToReflection({"reflectionName":"project","model":this,"modelClass":modelClass}, {"ransack":{"id_eq":id}})
      }

      project() {
        let modelClass = require(`api-maker/models/project`).default
        return this._readBelongsToReflection({"reflectionName":"project","model":this,"modelClass":modelClass})
      }
    
  
    
      loadUser() {
        let id = this.userId()
        let modelClass = require(`api-maker/models/user`).default
        return this._loadBelongsToReflection({"reflectionName":"user","model":this,"modelClass":modelClass}, {"ransack":{"id_eq":id}})
      }

      user() {
        let modelClass = require(`api-maker/models/user`).default
        return this._readBelongsToReflection({"reflectionName":"user","model":this,"modelClass":modelClass})
      }
    
  

  
    
    createdAt() {
      // datetime
      
        return this._getAttributeDateTime("created_at")
      
    }

    hasCreatedAt() {
      let value = this.createdAt()
      return this._isPresent(value)
    }
  
    
    finished() {
      // unknown
      
        return this._getAttribute("finished")
      
    }

    hasFinished() {
      let value = this.finished()
      return this._isPresent(value)
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
  
    
    projectId() {
      // integer
      
        return this._getAttribute("project_id")
      
    }

    hasProjectId() {
      let value = this.projectId()
      return this._isPresent(value)
    }
  
    
    userId() {
      // integer
      
        return this._getAttribute("user_id")
      
    }

    hasUserId() {
      let value = this.userId()
      return this._isPresent(value)
    }
  
    
    customId() {
      // unknown
      
        return this._getAttribute("custom_id")
      
    }

    hasCustomId() {
      let value = this.customId()
      return this._isPresent(value)
    }
  

  
    static commandSerialize(args, commandArgs = {}) {
      return this._callCollectionCommand(
        {
          args: args,
          command: "command_serialize",
          collectionKey: this.modelClassData().collectionKey,
          type: "collection"
        },
        commandArgs
      )
    }
  
    static testCollection(args, commandArgs = {}) {
      return this._callCollectionCommand(
        {
          args: args,
          command: "test_collection",
          collectionKey: this.modelClassData().collectionKey,
          type: "collection"
        },
        commandArgs
      )
    }
  

  
    testMember(args, commandArgs = {}) {
      return this._callMemberCommand(
        {
          args: args,
          command: "test_member",
          primaryKey: this._primaryKey(),
          collectionKey: this.modelClassData().collectionKey,
          type: "member"
        },
        commandArgs
      )
    }
  
}
