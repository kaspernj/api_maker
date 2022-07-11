import {digg} from "diggerize"

const propTypesValidator = (expectedClassName, args = {}) => (props, propName, componentName) => {
  const prop = digg(props, propName)

  if (!prop) {
    if (args.required) {
      return new Error(`The prop \`${propName}\` is marked as required in \`${componentName}\`, but its value is \`${typeof prop}\`.`)
    }

    return
  }

  const className = digg(prop, "constructor", "name")

  if (className != expectedClassName) {
    return new Error(`Invalid prop '${propName}' passed to '${componentName}'. Expected a class name of '${expectedClassName}' but got '${className}'.`)
  }
}

const instanceOfClassName = (expectedClassName) => {
  const validator = propTypesValidator(expectedClassName)

  validator.isRequired = propTypesValidator(expectedClassName, {required: true})

  return validator
}

export default instanceOfClassName
