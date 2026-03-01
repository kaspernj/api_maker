/* eslint-disable max-depth */
import * as inflection from "inflection"
import {digg} from "diggerize"

/** PropType helpers for API Maker models. */
export default class ApiMakerModelPropType {
  static ofModel (modelClass) {
    const modelPropTypeInstance = new ApiMakerModelPropType()

    modelPropTypeInstance.withModelType(modelClass)

    return modelPropTypeInstance
  }

  constructor () {
    this.isNotRequired = this.isNotRequired.bind(this)
    this.isRequired = this.isRequired.bind(this)
    this._withLoadedAssociations = {}
  }

  isNotRequired (props, propName, _componentName) {
    const model = props[propName]

    if (model) {
      return this.validate({model, propName})
    }
  }

  isRequired (props, propName, _componentName) {
    const model = props[propName]

    if (!model) return new Error(`${propName} was required but not given`)

    return this.validate({model, propName})
  }

  previous () {
    if (!this._previousModelPropType) throw new Error("No previous model prop type set")

    return this._previousModelPropType
  }

  setPreviousModelPropType (previousModelPropType) {
    this._previousModelPropType = previousModelPropType
  }

  withModelType (modelClass) {
    this._withModelType = modelClass
  }

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
  }

  withLoadedAbilities (arrayOfAbilities) {
    this._withLoadedAbilities = arrayOfAbilities

    return this
  }

  withLoadedAssociation (associationName) {
    const associationModelPropType = new ApiMakerModelPropType()

    associationModelPropType.setPreviousModelPropType(this)
    this._withLoadedAssociations[associationName] = associationModelPropType

    return associationModelPropType
  }

  withLoadedAttributes (arrayOfAttributes) {
    this._withLoadedAttributes = arrayOfAttributes

    return this
  }
}
