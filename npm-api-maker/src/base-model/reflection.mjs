import {digg} from "diggerize"
import * as inflection from "inflection"
import modelClassRequire from "../model-class-require.mjs"

export default class ApiMakerBaseModelReflection {
  constructor(reflectionData) {
    this.reflectionData = reflectionData
  }

  foreignKey = () => digg(this, "reflectionData", "foreignKey")
  macro = () => digg(this, "reflectionData", "macro")
  modelClass = () => modelClassRequire(inflection.singularize(inflection.camelize(digg(this, "reflectionData", "resource_name"))))
  name = () => inflection.camelize(digg(this, "reflectionData", "name"), true)
  through = () => digg(this, "reflectionData", "through")
}
