const {digg} = require("diggerize")

const instanceOfClassName = (expectedClassName) => (props, propName, componentName) => {
  const prop = digg(props, propName)
  const className = digg(prop, "constructor", "name")

  if (className != expectedClassName) {
    return new Error(`Invalid prop '${propName}' passed to '${componentName}'. Expected a class name of '${expectedClassName}' but got '${className}'.`)
  }
}

module.exports = instanceOfClassName
