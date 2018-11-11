import BaseModel from "../BaseModel"
import Collection from "../Collection"

export default class User extends BaseModel {
  static modelClassData() {
    return {"attributes":[{"name":{"data":"id","args":{}},"type":"unknown"},{"name":{"data":"email","args":{}},"type":"unknown"},{"name":{"data":"created_at","args":{}},"type":"unknown"},{"name":{"data":"custom_attribute","args":{}},"type":"unknown"},{"name":{"data":"updated_at","args":{"if":"email_kasper?"}},"type":"unknown"}],"name":"User","pluralName":"users","relationships":[],"paramKey":"user","path":"/api_maker/users","primaryKey":"id"}
  }

  

  
    
    {:data=>:id, :args=>{}}() {
      // unknown
      
        return this._getAttribute("{:data=>:id, :args=>{}}")
      
    }

    has{:data=>:id, :args=>{}}() {
      var value = this.{:data=>:id, :args=>{}}()
      return this._isPresent(value)
    }
  
    
    {:data=>:email, :args=>{}}() {
      // unknown
      
        return this._getAttribute("{:data=>:email, :args=>{}}")
      
    }

    has{:data=>:email, :args=>{}}() {
      var value = this.{:data=>:email, :args=>{}}()
      return this._isPresent(value)
    }
  
    
    {:data=>:createdAt, :args=>{}}() {
      // unknown
      
        return this._getAttribute("{:data=>:created_at, :args=>{}}")
      
    }

    has{:data=>:createdAt, :args=>{}}() {
      var value = this.{:data=>:createdAt, :args=>{}}()
      return this._isPresent(value)
    }
  
    
    {:data=>:customAttribute, :args=>{}}() {
      // unknown
      
        return this._getAttribute("{:data=>:custom_attribute, :args=>{}}")
      
    }

    has{:data=>:customAttribute, :args=>{}}() {
      var value = this.{:data=>:customAttribute, :args=>{}}()
      return this._isPresent(value)
    }
  
    
    {:data=>:updatedAt, :args=>{:if=>:emailKasper?}}() {
      // unknown
      
        return this._getAttribute("{:data=>:updated_at, :args=>{:if=>:email_kasper?}}")
      
    }

    has{:data=>:updatedAt, :args=>{:if=>:emailKasper?}}() {
      var value = this.{:data=>:updatedAt, :args=>{:if=>:emailKasper?}}()
      return this._isPresent(value)
    }
  

  

  
}
