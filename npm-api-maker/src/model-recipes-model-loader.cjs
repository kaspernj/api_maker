const BaseModel = require("./base-model.cjs")
const Collection = require("./collection.cjs")
const {digg} = require("diggerize")
const inflection = require("inflection")

module.exports = class ApiMakerModelRecipesModelLoader {
  constructor({modelRecipe, modelRecipesLoader}) {
    if (!modelRecipe) throw new Error("No 'modelRecipe' was given")

    this.modelRecipesLoader = modelRecipesLoader
    this.modelRecipe = modelRecipe
  }

  createClass() {
    const {modelRecipe} = digs(this, "modelRecipe")
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
    const ModelClass = class ApiMakerModel extends BaseModel { }

    Object.defineProperty(ModelClass, "name", {writable: false, value: modelClassName})

    ModelClass.prototype.constructor.modelClassData = () => modelClassData

    this.addAttributeMethodsToModelClass(ModelClass, attributes)
    this.addRelationshipsToModelClass(ModelClass, relationships)
    this.addCollectionCommandsToModelClass(ModelClass, collectionCommands)

    return ModelClass
  }

  addAttributeMethodsToModelClass(ModelClass, attributes) {
    for (const attributeName in attributes) {
      const attribute = attributes[attributeName]
      const {name} = digs(attribute, "name")
      const methodName = inflection.camelize(name, true)
      const hasMethodName = inflection.camelize(`has_${name}`, true)

      ModelClass.prototype[methodName] = function () { return this.readAttributeUnderscore(attributeName) }
      ModelClass.prototype[hasMethodName] = function () {
        const value = this[methodName]()

        return this._isPresent(value)
      }
    }
  }

  addRelationshipsToModelClass(ModelClass, relationships) {
    const {modelRecipesLoader} = digs(this, "modelRecipesLoader")

    for (const relationshipName in relationships) {
      const relationship = relationships[relationshipName]
      const {
        active_record: {name: activeRecordName},
        class_name: className,
        foreign_key: foreignKey,
        options: {optionsAs, optionsThrough},
        resource_name: resourceName,
        type
      } = digs(
        relationship,
        "active_record",
        "class_name",
        "foreign_key",
        "options",
        "resource_name",
        "type"
      )
      const loadMethodName = inflection.camelize(`load_${relationshipName}`, true)
      const modelMethodName = inflection.camelize(relationshipName, true)

      ModelClass.prototype[loadMethodName] = () => {
        if (type == "has_many") {
          const id = this.primaryKey()
          const modelClass = modelRecipesLoader.getModelClass(resourceName)
          const ransack = {}

          ransack[`${foreignKey}_eq`] = id

          return this._loadHasManyReflection(
            {
              reflectionName: relationshipName,
              model: this,
              modelClass
            },
            {ransack}
          )
        } else {
          throw new Error(`Unknown relationship type: ${type}`)
        }
      }

      ModelClass.prototype[modelMethodName] = function () {
        if (type == "belongs_to" || type == "has_one") {
          return this._readBelongsToReflection({reflectionName: relationshipName})
        } else if (type == "has_many") {
          const id = this.primaryKey()
          const modelClass = modelRecipesLoader.getModelClass(resourceName)
          const ransack = {}

          ransack[`${foreignKey}_eq`] = id

          return this._loadHasManyReflection(
            {
              reflectionName: relationshipName,
              model: this,
              modelClass
            },
            {ransack}
          )
        } else {
          throw new Error(`Unknown relationship type: ${type}`)
        }
      }

      ModelClass.prototype[modelMethodName] = function () {
        if (type == "belongs_to" || type == "has_one") {
          return this._readBelongsToReflection({reflectionName: relationshipName})
        } else if (type == "has_many") {
          const id = this.primaryKey()
          const modelClass = modelRecipesLoader.getModelClass(resourceName)
          const ransack = {}

          ransack[`${foreignKey}_eq`] = id

          const hasManyParameters = {
            reflectionName: relationshipName,
            model: this,
            modelName: className,
            modelClass
          }

          let queryParameters

          if (optionsThrough) {
            queryParameters = {
              params: {
                through: {
                  model: className,
                  id: this.primaryKey(),
                  reflection: relationshipName
                }
              }
            }
          } else {
            const ransack = {}

            ransack[`${foreignKey}_eq`] = this.primaryKey()

            if (optionsAs) {
              ransack[`${optionsAs}_type_eq`] = activeRecordName
            }

            queryParameters = {ransack}
          }

          return new Collection(hasManyParameters, queryParameters)
        } else {
          throw new Error(`Unknown relationship type: ${type}`)
        }
      }
    }
  }

  addCollectionCommandsToModelClass(ModelClass, collectionCommands) {
    for (const collectionCommandName in collectionCommands) {
      const methodName = inflection.camelize(collectionCommandName, true)

      ModelClass[methodName] = function (args, commandArgs = {}) {
        return this._callCollectionCommand(
          {
            args,
            command: collectionCommandName,
            collectionName: digg(this.modelClassData(), "collectionName"),
            type: "collection"
          },
          commandArgs
        )
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
