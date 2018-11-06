import BaseModel from "../BaseModel"
import Collection from "../Collection"

export default class Task extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":"created_at","type":"datetime"},{"name":"id","type":"integer"},{"name":"name","type":"string"},{"name":"project_id","type":"integer"},{"name":"user_id","type":"integer"}],"name":"Task","pluralName":"tasks","relationships":[{"className":"Project","name":"project","macro":"belongs_to"},{"className":"User","name":"user","macro":"belongs_to"}],"paramKey":"task","path":"/api_maker/tasks","primaryKey":"id"}
  }

  
    
      loadProject() {
        var id = this.projectId()
        return this._loadBelongsToReflection({"reflectionName":"project","model":this,"modelName":"Project","targetPathName":"/api_maker/projects","ransack":{"id_eq":id}})
      }

      project() {
        var id = this.projectId()
        return this._readBelongsToReflection({"reflectionName":"project","model":this,"modelName":"Project","targetPathName":"/api_maker/projects","ransack":{"id_eq":id}})
      }
    
  
    
      loadUser() {
        var id = this.userId()
        return this._loadBelongsToReflection({"reflectionName":"user","model":this,"modelName":"User","targetPathName":"/api_maker/users","ransack":{"id_eq":id}})
      }

      user() {
        var id = this.userId()
        return this._readBelongsToReflection({"reflectionName":"user","model":this,"modelName":"User","targetPathName":"/api_maker/users","ransack":{"id_eq":id}})
      }
    
  

  
    
    createdAt() {
      // datetime
      
        return this._getAttributeDateTime("created_at")
      
    }

    hasCreatedAt() {
      var value = this.createdAt()
      return this._isPresent(value)
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
  
    
    projectId() {
      // integer
      
        return this._getAttribute("project_id")
      
    }

    hasProjectId() {
      var value = this.projectId()
      return this._isPresent(value)
    }
  
    
    userId() {
      // integer
      
        return this._getAttribute("user_id")
      
    }

    hasUserId() {
      var value = this.userId()
      return this._isPresent(value)
    }
  

  
    static testCollection(args) {
      return this._callCollectionMethod({
        args: args,
        collectionMethod: "test_collection",
        modelClass: this
      })
    }
  

  
    testMember(args) {
      return this._callMemberMethod({
        args: args,
        memberMethod: "test_member",
        model: this
      })
    }
  
}
