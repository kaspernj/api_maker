// @ts-check
import {digg} from "diggerize"

/** @typedef {Record<string, object | string | number | boolean | null | undefined>} ComponentProps */
/** @typedef {(props: ComponentProps, propName: string, componentName: string) => Error | undefined} PropTypeValidator */
/** @typedef {PropTypeValidator & {isRequired: PropTypeValidator}} ClassNameValidator */

/**
 * @param {string} expectedClassName
 * @param {{required?: boolean}} [args]
 * @returns {PropTypeValidator}
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
 * @returns {ClassNameValidator}
 */
const instanceOfClassName = (expectedClassName) => {
  const validator = /** @type {ClassNameValidator} */ (propTypesValidator(expectedClassName))

  validator.isRequired = propTypesValidator(expectedClassName, {required: true})

  return validator
}

export default instanceOfClassName
