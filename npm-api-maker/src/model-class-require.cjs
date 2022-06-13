const {digg} = require("diggerize")
const inflection = require("inflection")

module.exports = (modelName) => {
  const requireName = inflection.camelize(modelName)
  const ModelClass = digg(require("@kaspernj/api-maker/src/models.cjs"), requireName)

  return ModelClass
}
