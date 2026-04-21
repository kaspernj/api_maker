// @ts-check
import * as inflection from "inflection"
import {digg, digs} from "diggerize"
import BaseModel from "./base-model.js"
import Collection from "./collection.js"

/** @typedef {import("./model-recipes-loader.js").default} ModelRecipesLoaderLike */
/** @typedef {typeof import("./base-model.js").default} ModelClassLike */
/** @typedef {ModelClassLike & {modelClassData: () => ModelRecipeClassData}} ModelClassWithData */
/** @typedef {Record<string, {name: string}>} ModelRecipeAttributes */
/** @typedef {Record<string, {args?: Record<string, object | string | number | boolean | null | undefined>}>} ModelRecipeCommands */
/**
 * @typedef {object} ModelRecipeClassData
 * @property {string} className
 * @property {string} collectionName
 * @property {string} name
 * @property {string} primaryKey
 */
/**
 * @typedef {object} RelationshipOptions
 * @property {string} [as]
 * @property {string} [primary_key]
 * @property {string} [through]
 */
/**
 * @typedef {object} RelationshipDefinition
 * @property {{name: string, primary_key: string}} active_record
 * @property {string} class_name
 * @property {string} foreign_key
 * @property {{primary_key: string}} klass
 * @property {RelationshipOptions} options
 * @property {string} resource_name
 * @property {"belongs_to" | "has_many" | "has_one"} type
 */
/**
 * @typedef {object} ModelRecipe
 * @property {ModelRecipeAttributes} attributes
 * @property {ModelRecipeCommands} collection_commands
 * @property {ModelRecipeCommands} member_commands
 * @property {ModelRecipeClassData} model_class_data
 * @property {Record<string, RelationshipDefinition>} relationships
 */

/** Builds runtime model classes from recipe definitions. */
export default class ApiMakerModelRecipesModelLoader {
  /**
   * Constructor.
   * @param {object} root0
   * @param {ModelRecipe} root0.modelRecipe
   * @param {ModelRecipesLoaderLike} root0.modelRecipesLoader
   */
  constructor ({modelRecipe, modelRecipesLoader}) {
    if (!modelRecipe) throw new Error("No 'modelRecipe' was given")

    this.modelRecipesLoader = modelRecipesLoader
    this.modelRecipe = modelRecipe
  }

  /**
   * createClass.
   * @returns {ModelClassLike}
   */
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

    Object.defineProperty(
      ModelClass,
      "name",
      {writable: false, value: modelClassName}
    )

    const modelClassConstructor = /** @type {ModelClassWithData} */ (ModelClass.prototype.constructor)
    modelClassConstructor.modelClassData = () => modelClassData

    this.addAttributeMethodsToModelClass(ModelClass, attributes)
    this.addRelationshipsToModelClass(ModelClass, modelClassData, relationships)
    this.addQueryCommandsToModelClass(ModelClass, collectionCommands)
    this.addMemberCommandsToModelClass(ModelClass, memberCommands)

    return ModelClass
  }

  /**
   * addAttributeMethodsToModelClass.
   * @param {ModelClassLike} ModelClass
   * @param {ModelRecipeAttributes} attributes
   */
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

  /**
   * addQueryCommandsToModelClass.
   * @param {ModelClassLike} ModelClass
   * @param {ModelRecipeCommands} collectionCommands
   */
  addQueryCommandsToModelClass (ModelClass, collectionCommands) {
    for (const collectionCommandName in collectionCommands) {
      const methodName = inflection.camelize(collectionCommandName, true)
      const collectionCommand = collectionCommands[collectionCommandName]

      ModelClass[methodName] = function (args, commandArgs = {}) {
        return this._callCollectionCommand(
          {
            args,
            command: collectionCommandName,
            collectionName: digg(this.modelClassData(), "collectionName"),
            type: "collection"
          },
          {...digg(collectionCommand, "args"), ...commandArgs}
        )
      }
    }
  }

  /**
   * addMemberCommandsToModelClass.
   * @param {ModelClassLike} ModelClass
   * @param {ModelRecipeCommands} memberCommands
   */
  addMemberCommandsToModelClass (ModelClass, memberCommands) {
    for (const memberCommandName in memberCommands) {
      const methodName = inflection.camelize(memberCommandName, true)
      const memberCommand = memberCommands[memberCommandName]

      ModelClass.prototype[methodName] = function (args, commandArgs = {}) {
        return this._callMemberCommand(
          {
            args,
            command: memberCommandName,
            primaryKey: this.primaryKey(),
            collectionName: this.modelClassData().collectionName,
            type: "member"
          },
          {...digg(memberCommand, "args"), ...commandArgs}
        )
      }
    }
  }

  /**
   * addRelationshipsToModelClass.
   * @param {ModelClassLike} ModelClass
   * @param {ModelRecipeClassData} modelClassData
   * @param {Record<string, RelationshipDefinition>} relationships
   */
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
      const ensureMethodName = inflection.camelize(`ensure_${relationshipName}_loaded`, true)
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
        this.defineEnsureAssociationLoadedMethod({ensureMethodName, ModelClass, relationshipName})
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
        this.defineHasManyLoadMethod({
          foreignKey,
          loadMethodName,
          ModelClass,
          modelClassData,
          modelRecipesLoader,
          optionsThrough,
          relationshipName,
          resourceName
        })
        this.defineEnsureAssociationLoadedMethod({ensureMethodName, ModelClass, relationshipName})
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
        this.defineEnsureAssociationLoadedMethod({ensureMethodName, ModelClass, relationshipName})
      } else {
        throw new Error(`Unknown relationship type: ${type}`)
      }
    }
  }

  /**
   * defineEnsureAssociationLoadedMethod.
   * @param {object} root0
   * @param {string} root0.ensureMethodName
   * @param {ModelClassLike} root0.ModelClass
   * @param {string} root0.relationshipName
   */
  defineEnsureAssociationLoadedMethod ({ensureMethodName, ModelClass, relationshipName}) {
    ModelClass.prototype[ensureMethodName] = function () {
      return this.ensureAssociationLoaded(relationshipName)
    }
  }

  /**
   * defineBelongsToGetMethod.
   * @param {object} root0
   * @param {ModelClassLike} root0.ModelClass
   * @param {string} root0.modelMethodName
   * @param {string} root0.relationshipName
   */
  defineBelongsToGetMethod ({ModelClass, modelMethodName, relationshipName}) {
    ModelClass.prototype[modelMethodName] = function () {
      return this._readBelongsToReflection({reflectionName: relationshipName})
    }
  }

  /**
   * defineBelongsToLoadMethod.
   * @param {object} root0
   * @param {string} root0.foreignKey
   * @param {string} root0.klassPrimaryKey
   * @param {ModelClassLike} root0.ModelClass
   * @param {ModelRecipesLoaderLike} root0.modelRecipesLoader
   * @param {string} root0.loadMethodName
   * @param {string | undefined} root0.optionsPrimaryKey
   * @param {string} root0.relationshipName
   * @param {string} root0.resourceName
   */
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

  /**
   * defineHasManyLoadMethod.
   * @param {object} root0
   * @param {string} root0.foreignKey
   * @param {string} root0.loadMethodName
   * @param {ModelClassLike} root0.ModelClass
   * @param {ModelRecipeClassData} root0.modelClassData
   * @param {ModelRecipesLoaderLike} root0.modelRecipesLoader
   * @param {string | undefined} root0.optionsThrough
   * @param {string} root0.relationshipName
   * @param {string} root0.resourceName
   */
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

  /**
   * defineHasOneGetMethd.
   * @param {object} root0
   * @param {ModelClassLike} root0.ModelClass
   * @param {string} root0.modelMethodName
   * @param {string} root0.relationshipName
   */
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
