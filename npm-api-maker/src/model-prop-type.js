// @ts-check
/* eslint-disable max-depth */
import * as inflection from "inflection"
import {digg} from "diggerize"

/** @typedef {typeof import("./base-model.js").default} ApiMakerModelClass */
/**
 * @typedef {object} ApiMakerModelInstance
 * @property {Record<string, boolean>} abilities
 * @property {{name: string}} constructor
 * @property {() => boolean} isPersisted
 * @property {Record<string, object|object[]|null|undefined>} modelData
 * @property {Record<string, object|object[]|null|undefined>} relationshipsCache
 */
/** @typedef {{[propName: string]: ApiMakerModelInstance|undefined}} ModelPropValidatorProps */
/** @typedef {string} ModelPropName */
/** @typedef {Error|undefined} ModelPropValidationResult */

/** PropType helpers for API Maker models. */
export default class ApiMakerModelPropType {
  /**
   * Build a model prop validator that requires a specific model class.
   * @param {ApiMakerModelClass} modelClass
   * @returns {ApiMakerModelPropType}
   */
  static ofModel (modelClass) {
    const modelPropTypeInstance = new ApiMakerModelPropType()

    modelPropTypeInstance.withModelType(modelClass)

    return modelPropTypeInstance
  }

  /** Constructor. */
  constructor () {
    this.isNotRequired = this.isNotRequired.bind(this)
    this.isRequired = this.isRequired.bind(this)
    this._withLoadedAssociations = {}
  }

  /**
   * Validate an optional model prop.
   * @param {ModelPropValidatorProps} props
   * @param {ModelPropName} propName
   * @param {string} _componentName
   * @returns {ModelPropValidationResult}
   */
  isNotRequired (props, propName, _componentName) {
    const model = props[propName]

    if (model) {
      return this.validate({model, propName})
    }

    return undefined
  }

  /**
   * Validate a required model prop.
   * @param {ModelPropValidatorProps} props
   * @param {ModelPropName} propName
   * @param {string} _componentName
   * @returns {ModelPropValidationResult}
   */
  isRequired (props, propName, _componentName) {
    const model = props[propName]

    if (!model) return new Error(`${propName} was required but not given`)

    return this.validate({model, propName})
  }

  /**
   * Return the previous chained model prop type validator.
   * @returns {ApiMakerModelPropType}
   */
  previous () {
    if (!this._previousModelPropType) throw new Error("No previous model prop type set")

    return this._previousModelPropType
  }

  /**
   * Store the previous validator so chained association requirements can return to it.
   * @param {ApiMakerModelPropType} previousModelPropType
   */
  setPreviousModelPropType (previousModelPropType) {
    this._previousModelPropType = previousModelPropType
  }

  /**
   * Require validated props to contain a specific model class.
   * @param {ApiMakerModelClass} modelClass
   */
  withModelType (modelClass) {
    this._withModelType = modelClass
  }

  /**
   * Validate one model instance against all configured model, ability, association, and attribute requirements.
   * @param {object} root0
   * @param {ApiMakerModelInstance} root0.model
   * @param {ModelPropName} root0.propName
   * @returns {ModelPropValidationResult}
   */
  validate ({model, propName}) {
    if (this._withModelType && this._withModelType.name != model.constructor.name)
      return new Error(`Expected ${propName} to be of type ${this._withModelType.name} but it wasn't: ${model.constructor.name}`)

    if (this._withLoadedAbilities) {
      for (const abilityName of this._withLoadedAbilities) {
        const underscoreAbilityName = inflection.underscore(abilityName)

        if (!(underscoreAbilityName in model.abilities))
          return new Error(`The ability ${abilityName} was required to be loaded in ${propName} of the ${model.constructor.name} type but it wasn't`)
      }
    }

    if (this._withLoadedAssociations) {
      for (const associationName in this._withLoadedAssociations) {
        const associationModelPropType = digg(this._withLoadedAssociations, associationName)
        const underscoreAssociationName = inflection.underscore(associationName)

        if (!(underscoreAssociationName in model.relationshipsCache))
          return new Error(`The association ${associationName} was required to be loaded in ${propName} of the ${model.constructor.name} type but it wasn't`)

        const associationCache = digg(model.relationshipsCache, underscoreAssociationName)

        // Find a model to run sub-model-prop-type-validations on
        if (Array.isArray(associationCache)) {
          for (const preloadedModel of associationCache) {
            const validationResult = associationModelPropType.validate({
              model: preloadedModel,
              propName: `${propName}.${associationName}`
            })

            if (validationResult) return validationResult
          }
        } else if (associationCache) {
          const validationResult = associationModelPropType.validate({
            model: associationCache,
            propName: `${propName}.${associationName}`
          })

          if (validationResult) return validationResult
        }
      }
    }

    if (this._withLoadedAttributes && model.isPersisted()) {
      for (const attributeName of this._withLoadedAttributes) {
        const underscoreAttributeName = inflection.underscore(attributeName)

        if (!(underscoreAttributeName in model.modelData)) {
          return new Error(`The attribute ${attributeName} was required to be loaded in ${propName} of the ${model.constructor.name} type but it wasn't`)
        }
      }
    }

    return undefined
  }

  /**
   * Require the listed abilities to be preloaded on the model.
   * @param {string[]} arrayOfAbilities
   * @returns {ApiMakerModelPropType}
   */
  withLoadedAbilities (arrayOfAbilities) {
    this._withLoadedAbilities = arrayOfAbilities

    return this
  }

  /**
   * Require a named association to be loaded and return a validator for that association.
   * @param {string} associationName
   * @returns {ApiMakerModelPropType}
   */
  withLoadedAssociation (associationName) {
    const associationModelPropType = new ApiMakerModelPropType()

    associationModelPropType.setPreviousModelPropType(this)
    this._withLoadedAssociations[associationName] = associationModelPropType

    return associationModelPropType
  }

  /**
   * Require the listed attributes to be loaded on persisted models.
   * @param {string[]} arrayOfAttributes
   * @returns {ApiMakerModelPropType}
   */
  withLoadedAttributes (arrayOfAttributes) {
    this._withLoadedAttributes = arrayOfAttributes

    return this
  }
}
