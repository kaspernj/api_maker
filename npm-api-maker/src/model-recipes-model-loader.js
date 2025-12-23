import BaseModel from "./base-model.js"
import Collection from "./collection.js"
import {digg, digs} from "diggerize"
import * as inflection from "inflection"

export default class ApiMakerModelRecipesModelLoader {
  constructor ({modelRecipe, modelRecipesLoader}) {
    if (!modelRecipe) throw new Error("No 'modelRecipe' was given")

    this.modelRecipesLoader = modelRecipesLoader
    this.modelRecipe = modelRecipe
  }

  createClass () {
    const {modelRecipe} = digs(this, "modelRecipe")
    const {
      attributes,
      collection_commands: collectionCommands,
      member_commands: memberCommands,
      model_class_data: modelClassData,
      relationships
    } = digs(
      modelRecipe,
      "attributes",
      "collection_commands",
      "member_commands",
      "model_class_data",
      "relationships"
    )
    const {name: modelClassName} = digs(modelClassData, "name")
    const ModelClass = class ApiMakerModel extends BaseModel { }

    Object.defineProperty(ModelClass, "name", {writable: false, value: modelClassName})

    ModelClass.prototype.constructor.modelClassData = () => modelClassData

    this.addAttributeMethodsToModelClass(ModelClass, attributes)
    this.addRelationshipsToModelClass(ModelClass, modelClassData, relationships)
    this.addQueryCommandsToModelClass(ModelClass, collectionCommands)
    this.addMemberCommandsToModelClass(ModelClass, memberCommands)

    return ModelClass
  }

  addAttributeMethodsToModelClass (ModelClass, attributes) {
    for (const attributeName in attributes) {
      const attribute = attributes[attributeName]
      const {name} = digs(attribute, "name")
      const methodName = inflection.camelize(name, true)
      const hasMethodName = inflection.camelize(`has_${name}`, true)

      ModelClass.prototype[methodName] = function () {
        return this.readAttributeUnderscore(attributeName)
      }

      ModelClass.prototype[hasMethodName] = function () {
        const value = this[methodName]()

        return this._isPresent(value)
      }
    }
  }

  addQueryCommandsToModelClass (ModelClass, collectionCommands) {
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

  addMemberCommandsToModelClass (ModelClass, memberCommands) {
    for (const memberCommandName in memberCommands) {
      const methodName = inflection.camelize(memberCommandName, true)

      ModelClass.prototype[methodName] = function (args, commandArgs = {}) {
        return this._callMemberCommand(
          {
            args,
            command: memberCommandName,
            primaryKey: this.primaryKey(),
            collectionName: this.modelClassData().collectionName,
            type: "member"
          },
          commandArgs
        )
      }
    }
  }

  addRelationshipsToModelClass (ModelClass, modelClassData, relationships) {
    const {modelRecipesLoader} = digs(this, "modelRecipesLoader")

    for (const relationshipName in relationships) {
      const relationship = relationships[relationshipName]
      const {
        active_record: {
          name: activeRecordName,
          primary_key: activeRecordPrimaryKey
        },
        class_name: className,
        foreign_key: foreignKey,
        klass: {primary_key: klassPrimaryKey},
        options: {as: optionsAs, primary_key: optionsPrimaryKey, through: optionsThrough},
        resource_name: resourceName,
        type
      } = digs(
        relationship,
        "active_record",
        "class_name",
        "foreign_key",
        "klass",
        "options",
        "resource_name",
        "type"
      )
      const loadMethodName = inflection.camelize(`load_${relationshipName}`, true)
      const modelMethodName = inflection.camelize(relationshipName, true)

      if (type == "belongs_to") {
        this.defineBelongsToGetMethod({ModelClass, modelMethodName, relationshipName})
        this.defineBelongsToLoadMethod({
          foreignKey,
          klassPrimaryKey,
          loadMethodName,
          ModelClass,
          modelRecipesLoader,
          optionsPrimaryKey,
          relationshipName,
          resourceName
        })
      } else if (type == "has_many") {
        this.defineHasManyGetMethod({
          activeRecordName,
          className,
          foreignKey,
          ModelClass,
          modelMethodName,
          modelRecipesLoader,
          optionsAs,
          optionsPrimaryKey,
          optionsThrough,
          relationshipName,
          resourceName
        })
        this.defineHasManyLoadMethod({foreignKey, loadMethodName, ModelClass, modelClassData, modelRecipesLoader, optionsThrough, relationshipName, resourceName})
      } else if (type == "has_one") {
        this.defineHasOneGetMethd({ModelClass, modelMethodName, relationshipName})
        this.defineHasOneLoadMethod({
          activeRecordPrimaryKey,
          foreignKey,
          loadMethodName,
          ModelClass,
          modelClassData,
          modelRecipesLoader,
          optionsThrough,
          relationshipName,
          resourceName
        })
      } else {
        throw new Error(`Unknown relationship type: ${type}`)
      }
    }
  }

  defineBelongsToGetMethod ({ModelClass, modelMethodName, relationshipName}) {
    ModelClass.prototype[modelMethodName] = function () {
      return this._readBelongsToReflection({reflectionName: relationshipName})
    }
  }

  defineBelongsToLoadMethod ({foreignKey, klassPrimaryKey, ModelClass, modelRecipesLoader, loadMethodName, optionsPrimaryKey, relationshipName, resourceName}) {
    ModelClass.prototype[loadMethodName] = function () {
      const foreignKeyMethodName = inflection.camelize(foreignKey, true)

      if (!(foreignKeyMethodName in this)) throw new Error(`Foreign key method wasn't defined: ${foreignKeyMethodName}`)

      const id = this[foreignKeyMethodName]()
      const modelClass = modelRecipesLoader.getModelClass(resourceName)
      const ransack = {}
      const ransackIdSearchKey = `${optionsPrimaryKey || klassPrimaryKey}_eq`

      ransack[ransackIdSearchKey] = id

      return this._loadBelongsToReflection(
        {reflectionName: relationshipName, model: this, modelClass},
        {ransack}
      )
    }
  }

  defineHasManyGetMethod ({
    activeRecordName,
    className,
    foreignKey,
    ModelClass,
    modelMethodName,
    modelRecipesLoader,
    optionsAs,
    optionsPrimaryKey,
    optionsThrough,
    relationshipName,
    resourceName
  }) {
    ModelClass.prototype[modelMethodName] = function () {
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
              model: activeRecordName,
              id: this.primaryKey(),
              reflection: relationshipName
            }
          }
        }
      } else {
        const ransack = {}
        const primaryKeyColumnName = optionsPrimaryKey || digg(ModelClass.modelClassData(), "primaryKey")
        const primaryKeyMethodName = inflection.camelize(primaryKeyColumnName, true)

        if (!(primaryKeyMethodName in this)) throw new Error(`No such primary key method: ${primaryKeyMethodName}`)

        ransack[`${foreignKey}_eq`] = this[primaryKeyMethodName]()

        if (optionsAs) {
          ransack[`${optionsAs}_type_eq`] = activeRecordName
        }

        queryParameters = {ransack}
      }

      return new Collection(hasManyParameters, queryParameters)
    }
  }

  defineHasManyLoadMethod ({foreignKey, loadMethodName, ModelClass, modelClassData, modelRecipesLoader, optionsThrough, relationshipName, resourceName}) {
    ModelClass.prototype[loadMethodName] = function () {
      const id = this.primaryKey()
      const modelClass = modelRecipesLoader.getModelClass(resourceName)

      if (optionsThrough) {
        const modelClassName = digg(modelClassData, "className")

        return this._loadHasManyReflection(
          {
            reflectionName: relationshipName,
            model: this,
            modelClass
          },
          {
            params: {
              through: {
                model: modelClassName,
                id,
                reflection: relationshipName
              }
            }
          }
        )
      } else {
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
      }
    }
  }

  defineHasOneGetMethd ({ModelClass, modelMethodName, relationshipName}) {
    ModelClass.prototype[modelMethodName] = function () {
      return this._readHasOneReflection({reflectionName: relationshipName})
    }
  }

  defineHasOneLoadMethod ({
    activeRecordPrimaryKey,
    foreignKey,
    loadMethodName,
    ModelClass,
    modelClassData,
    modelRecipesLoader,
    optionsThrough,
    relationshipName,
    resourceName
  }) {
    ModelClass.prototype[loadMethodName] = function () {
      const primaryKeyMethodName = inflection.camelize(activeRecordPrimaryKey, true)

      if (!(primaryKeyMethodName in this)) throw new Error(`Primary key method wasn't defined: ${primaryKeyMethodName}`)

      const id = this[primaryKeyMethodName]()
      const modelClass = modelRecipesLoader.getModelClass(resourceName)

      if (optionsThrough) {
        const modelClassName = digg(modelClassData, "className")

        return this._loadHasOneReflection(
          {reflectionName: relationshipName, model: this, modelClass},
          {params: {through: {model: modelClassName, id, reflection: relationshipName}}}
        )
      } else {
        const ransack = {}

        ransack[`${foreignKey}_eq`] = id

        return this._loadHasOneReflection(
          {
            reflectionName: relationshipName,
            model: this,
            modelClass
          },
          {ransack}
        )
      }
    }
  }
}
