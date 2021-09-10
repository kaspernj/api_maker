const Inflection = require("inflection")

module.exports = class ApiMakerModelPropType {
  static ofModel(modelClass) {
    const modelPropTypeInstance = new ApiMakerModelPropType()

    modelPropTypeInstance.setModelClass(modelClass)

    return modelPropTypeInstance
  }

  constructor() {
    this.isNotRequired = this.isNotRequired.bind(this)
    this.isRequired = this.isRequired.bind(this)
  }

  isNotRequired(props, propName, _componentName) {
    const model = props[propName]

    if (model) {
      return this.validate({model, propName})
    }
  }

  isRequired(props, propName, _componentName) {
    const model = props[propName]

    if (!model) return new Error(`${propName} was required but not given`)

    return this.validate({model, propName})
  }

  setModelClass(modelClass) {
    this.modelClass = modelClass
  }

  validate({model, propName}) {
    if (this.modelClass.name != model.constructor.name) {
      return new Error(`Expected ${propName} to be of type ${this.modelClass.name} but it wasn't: ${model.constructor.name}`)
    }

    if (this._withAttributes) {
      for (const attributeName of this._withAttributes) {
        const underscoreAttributeName = Inflection.underscore(attributeName)

        if (!(underscoreAttributeName in model.modelData)) {
          return new Error(`${attributeName} was required to be loaded in ${propName} of the ${model.constructor.name} type but it wasn't`)
        }
      }
    }
  }

  withAttributes(arrayOfAttributes) {
    this._withAttributes = arrayOfAttributes

    return this
  }
}
