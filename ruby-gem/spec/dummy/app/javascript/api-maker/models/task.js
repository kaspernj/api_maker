import BaseModel from "../base-model"
import Collection from "../collection"

export default class Task extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"created_at","type":"datetime"},{"name":"finished","type":"boolean"},{"name":"id","type":"integer"},{"name":"name","type":"string"},{"name":"project_id","type":"integer"},{"name":"user_id","type":"integer"},{"name":"custom_id","type":"unknown"}],"collectionKey":"tasks","collectionName":"tasks","i18nKey":"task","name":"Task","pluralName":"tasks","relationships":[{"className":"Account","collectionName":"accounts","name":"account","macro":"has_one"},{"className":"Comment","collectionName":"comments","name":"comments","macro":"has_many"},{"className":"Project","collectionName":"projects","name":"project","macro":"belongs_to"},{"className":"User","collectionName":"users","name":"user","macro":"belongs_to"}],"paramKey":"task","path":"/api_maker/tasks","primaryKey":"id"}
  }

  
    
      loadAccount() {
        const id = this.id()
        const modelClass = require(`api-maker/models/account`).default
        return this._loadHasOneReflection({"reflectionName":"account","model":this,"modelClass":modelClass}, {"params":{"through":{"model":"Task","id":id,"reflection":"account"}}})
      }

      account() {
        const modelClass = require(`api-maker/models/account`).default
        return this._readHasOneReflection({"reflectionName":"account","model":this,"modelClass":modelClass})
      }
    
  
    
      comments() {
        const id = this.id()
        const modelClass = require(`api-maker/models/comment`).default
        return new Collection({"reflectionName":"comments","model":this,"modelName":"Comment","modelClass":modelClass,"targetPathName":"/api_maker/comments"}, {"ransack":{"resource_id_eq":id,"resource_type_eq":"Task"}})
      }
    
  
    
      loadProject() {
        const id = this.projectId()
        const modelClass = require(`api-maker/models/project`).default
        return this._loadBelongsToReflection({"reflectionName":"project","model":this,"modelClass":modelClass}, {"ransack":{"id_eq":id}})
      }

      project() {
        const modelClass = require(`api-maker/models/project`).default
        return this._readBelongsToReflection({"reflectionName":"project","model":this,"modelClass":modelClass})
      }
    
  
    
      loadUser() {
        const id = this.userId()
        const modelClass = require(`api-maker/models/user`).default
        return this._loadBelongsToReflection({"reflectionName":"user","model":this,"modelClass":modelClass}, {"ransack":{"id_eq":id}})
      }

      user() {
        const modelClass = require(`api-maker/models/user`).default
        return this._readBelongsToReflection({"reflectionName":"user","model":this,"modelClass":modelClass})
      }
    
  

  
    
    createdAt() {
      // datetime
      
        return this._getAttributeDateTime("created_at")
      
    }

    hasCreatedAt() {
      const value = this.createdAt()
      return this._isPresent(value)
    }
  
    
    finished() {
      // boolean
      
        return this._getAttribute("finished")
      
    }

    hasFinished() {
      const value = this.finished()
      return this._isPresent(value)
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
  
    
    projectId() {
      // integer
      
        return this._getAttribute("project_id")
      
    }

    hasProjectId() {
      const value = this.projectId()
      return this._isPresent(value)
    }
  
    
    userId() {
      // integer
      
        return this._getAttribute("user_id")
      
    }

    hasUserId() {
      const value = this.userId()
      return this._isPresent(value)
    }
  
    
    customId() {
      // unknown
      
        return this._getAttribute("custom_id")
      
    }

    hasCustomId() {
      const value = this.customId()
      return this._isPresent(value)
    }
  

  
    static commandSerialize(args, commandArgs = {}) {
      return this._callCollectionCommand(
        {
          args: args,
          command: "command_serialize",
          collectionName: this.modelClassData().collectionName,
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
          collectionName: this.modelClassData().collectionName,
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
          primaryKey: this.primaryKey(),
          collectionName: this.modelClassData().collectionName,
          type: "member"
        },
        commandArgs
      )
    }
  
}
