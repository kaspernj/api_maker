const BaseModel = require("./base-model.cjs")
const Collection = require("./collection.cjs")
const {digg} = require("diggerize")
const inflection = require("inflection")

module.exports = class ApiMakerModelRecipesModelLoader {
  constructor({modelRecipe}) {
    if (!modelRecipe) throw new Error("No 'modelRecipe' was given")

    this.modelRecipe = modelRecipe
  }

  createClass() {
    const {modelRecipe} = digs(this, "modelRecipe")

    console.log({ modelRecipe })

    const {
      attributes,
      collection_commands: collectionCommands,
      model_class_data: modelClassData,
      relationships
    } = digs(
      modelRecipe,
      "attributes",
      "collection_commands",
      "model_class_data",
      "relationships"
    )
    const {name: modelClassName} = digs(modelClassData, "name")

    const ModelClass = function() {
      throw new Error(`Constructor for ${modelClassName}`)
    }

    ModelClass.prototype = new BaseModel()
    ModelClass.prototype.constructor = ModelClass

    this.addAttributeMethodsToModelClass(ModelClass, attributes)
    this.addRelationshipsToModelClass(ModelClass, relationships)
    this.addCollectionCommandsToModelClass(ModelClass, collectionCommands)

    return ModelClass
  }

  addAttributeMethodsToModelClass(ModelClass, attributes) {
    for (const attributeName in attributes) {
      const attribute = attributes[attributeName]
      const {name} = digs(attribute, "name")

      ModelClass.prototype[name] = function () {
        throw new Error(`Attribute function for ${name}`)
      }
    }
  }

  addRelationshipsToModelClass(ModelClass, relationships) {
    for (const relationshipName in relationships) {
      const relationship = relationships[relationshipName]

      console.log({ relationship })

      const loadMethodName = inflection.camelize(`load_${relationshipName}`)
      const modelMethodName = inflection.camelize(relationshipName)

      ModelClass.prototype[loadMethodName] = () => {
        throw new Error(`Load relationship function for ${relationshipName}`)
      }

      ModelClass.prototype[modelMethodName] = () => {
        throw new Error(`Relationship function for ${relationshipName}`)
      }
    }
  }

  addCollectionCommandsToModelClass(ModelClass, collectionCommands) {
    for (const collectionCommandName in collectionCommands) {
      const methodName = inflection.camelize(collectionCommandName)

      ModelClass.constructor.prototype[methodName] = () => {
        throw new Error(`Collection command function for ${collectionCommandName}`)
      }
    }
  }
}

/*
class <%= resource.short_name %> extends BaseModel {
  static modelClassData() {
    return <%= {
      attributes: attributes,
      className: model.name,
      collectionKey: model.model_name.collection,
      collectionName: resource.collection_name,
      i18nKey: model.model_name.i18n_key,
      name: resource.short_name,
      pluralName: model.model_name.plural,
      relationships: reflections_for_model_class_data,
      paramKey: model.model_name.param_key,
      path: "/api_maker/#{model.model_name.route_key}",
      primaryKey: model.primary_key
    }.to_json %>
  }

  <% reflections.each do |reflection| %>
    <% if reflection.macro == :belongs_to %>
      <%= ApiMaker::JsMethodNamerService.execute!(name: "load_#{reflection.name}") %>() {
        const id = this.<%= ApiMaker::JsMethodNamerService.execute!(name: reflection.foreign_key) %>()
        const resourceName = "<%= ApiMaker::MemoryStorage.current.resource_for_model(reflection.klass).short_name %>"
        const modelClass = digg(require("@kaspernj/api-maker/src/models"), resourceName)
        return this._loadBelongsToReflection(<%= api_maker_json("reflectionName" => reflection.name, "model" => "{{this}}", "modelClass" => "{{modelClass}}") %>, <%= api_maker_json("ransack" => {"#{reflection.options[:primary_key] || reflection.klass.primary_key}_eq" => "{{id}}"}) %>)
      }

      <%= ApiMaker::JsMethodNamerService.execute!(name: reflection.name) %>() {
        const resourceName = "<%= ApiMaker::MemoryStorage.current.resource_for_model(reflection.klass).short_name %>"
        const modelClass = digg(require("@kaspernj/api-maker/src/models"), resourceName)
        return this._readBelongsToReflection(<%= api_maker_json("reflectionName" => reflection.name, "model" => "{{this}}", "modelClass" => "{{modelClass}}") %>)
      }
    <% elsif reflection.macro == :has_many %>
      <% if reflection.options[:through] %>
        <%= ApiMaker::JsMethodNamerService.execute!(name: "load_#{reflection.name}") %>() {
          const id = this.<%= reflection.active_record.primary_key %>()
          const resourceName = "<%= ApiMaker::MemoryStorage.current.resource_for_model(reflection.klass).short_name %>"
          const modelClass = digg(require("@kaspernj/api-maker/src/models"), resourceName)
          return this._loadHasManyReflection(<%= api_maker_json("reflectionName" => reflection.name, "model" => "{{this}}", "modelClass" => "{{modelClass}}") %>, <%= api_maker_json("params": {"through" => {"model" => model.model_name, "id" => "{{id}}", "reflection" => reflection.name}}) %>)
        }
      <% else %>
        <%= ApiMaker::JsMethodNamerService.execute!(name: "load_#{reflection.name}") %>() {
          const id = this.<%= reflection.active_record.primary_key %>()
          const resourceName = "<%= ApiMaker::MemoryStorage.current.resource_for_model(reflection.klass).short_name %>"
          const modelClass = digg(require("@kaspernj/api-maker/src/models"), resourceName)
          return this._loadHasManyReflection(<%= api_maker_json("reflectionName" => reflection.name, "model" => "{{this}}", "modelClass" => "{{modelClass}}") %>, <%= api_maker_json("ransack" => {"#{reflection.foreign_key}_eq" => "{{id}}"}) %>)
        }
      <% end %>

      <%= ApiMaker::JsMethodNamerService.execute!(name: reflection.name) %>() {
        const id = this.<%= ApiMaker::JsMethodNamerService.execute!(name: reflection.options[:primary_key] || reflection.active_record.primary_key) %>()
        const resourceName = "<%= ApiMaker::MemoryStorage.current.resource_for_model(reflection.klass).short_name %>"
        const modelClass = digg(require("@kaspernj/api-maker/src/models"), resourceName)
        return new Collection(<%= api_maker_json(reflection_has_many_parameters(reflection)) %>, <%= api_maker_json(reflection_has_many_parameters_query(reflection)) %>)
      }
    <% elsif reflection.macro == :has_one && reflection.options[:through] %>
      <%= ApiMaker::JsMethodNamerService.execute!(name: "load_#{reflection.name}") %>() {
        const id = this.<%= reflection.active_record.primary_key %>()
        const resourceName = "<%= ApiMaker::MemoryStorage.current.resource_for_model(reflection.klass).short_name %>"
        const modelClass = digg(require("@kaspernj/api-maker/src/models"), resourceName)
        return this._loadHasOneReflection(<%= api_maker_json("reflectionName" => reflection.name, "model" => "{{this}}", "modelClass" => "{{modelClass}}") %>, <%= api_maker_json("params": {"through" => {"model" => model.model_name, "id" => "{{id}}", "reflection" => reflection.name}}) %>)
      }

      <%= ApiMaker::JsMethodNamerService.execute!(name: reflection.name) %>() {
        const resourceName = "<%= ApiMaker::MemoryStorage.current.resource_for_model(reflection.klass).short_name %>"
        const modelClass = digg(require("@kaspernj/api-maker/src/models"), resourceName)
        return this._readHasOneReflection(<%= api_maker_json("reflectionName" => reflection.name, "model" => "{{this}}", "modelClass" => "{{modelClass}}") %>)
      }
    <% elsif reflection.macro == :has_one %>
      <%= ApiMaker::JsMethodNamerService.execute!(name: "load_#{reflection.name}") %>() {
        const id = this.<%= reflection.active_record.primary_key %>()
        const resourceName = "<%= ApiMaker::MemoryStorage.current.resource_for_model(reflection.klass).short_name %>"
        const modelClass = digg(require("@kaspernj/api-maker/src/models"), resourceName)
        return this._loadHasOneReflection(<%= api_maker_json("reflectionName" => reflection.name, "model" => "{{this}}", "modelClass" => "{{modelClass}}") %>, <%= api_maker_json("ransack" => {"#{reflection.foreign_key}_eq" => "{{id}}"}) %>)
      }

      <%= ApiMaker::JsMethodNamerService.execute!(name: reflection.name) %>() {
        const resourceName = "<%= ApiMaker::MemoryStorage.current.resource_for_model(reflection.klass).short_name %>"
        const modelClass = digg(require("@kaspernj/api-maker/src/models"), resourceName)
        return this._readHasOneReflection(<%= api_maker_json("reflectionName" => reflection.name, "model" => "{{this}}", "modelClass" => "{{modelClass}}") %>)
      }
    <% end %>
  <% end %>

  <% attributes.each do |attribute_data| %>
    <% methodName = ApiMaker::JsMethodNamerService.execute!(name: attribute_data.fetch(:name)) %>
    <%= methodName %>() {
      return this.readAttributeUnderscore("<%= attribute_data.fetch(:name) %>")
    }

    <%= ApiMaker::JsMethodNamerService.execute!(name: "has_#{attribute_data.fetch(:name)}") %>() {
      const value = this.<%= methodName %>()
      return this._isPresent(value)
    }
  <% end %>

  <% collection_commands.each do |collection_command, data| %>
    static <%= ApiMaker::JsMethodNamerService.execute!(name: collection_command) %>(args, commandArgs = {}) {
      return this._callCollectionCommand(
        {
          args: args,
          command: "<%= collection_command %>",
          collectionName: this.modelClassData().collectionName,
          type: "collection"
        },
        commandArgs
      )
    }
  <% end %>

  <% member_commands.each do |member_command, data| %>
    <%= ApiMaker::JsMethodNamerService.execute!(name: member_command) %>(args, commandArgs = {}) {
      return this._callMemberCommand(
        {
          args: args,
          command: "<%= member_command %>",
          primaryKey: this.primaryKey(),
          collectionName: this.modelClassData().collectionName,
          type: "member"
        },
        commandArgs
      )
    }
  <% end %>
}
*/
