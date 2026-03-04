import {digg} from "diggerize"

/**
 * @param {string} expectedClassName
 * @param {{required?: boolean}} [args]
 * @returns {(props: Record<string, any>, propName: string, componentName: string) => Error | undefined}
 */
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

/**
 * @param {string} expectedClassName
 * @returns {any}
 */
const instanceOfClassName = (expectedClassName) => {
  const validator = /** @type {any} */ (propTypesValidator(expectedClassName)) // eslint-disable-line no-extra-parens

  validator.isRequired = propTypesValidator(expectedClassName, {required: true})

  return validator
}

export default instanceOfClassName
