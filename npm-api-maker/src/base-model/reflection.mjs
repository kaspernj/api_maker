import {digg} from "diggerize"
import * as inflection from "inflection"
import modelClassRequire from "../model-class-require.mjs"

export default class ApiMakerBaseModelReflection {
  constructor(reflectionData) {
    this.reflectionData = reflectionData
  }

  foreignKey() {
    return digg(this, "reflectionData", "foreignKey")
  }

  macro() {
    return digg(this, "reflectionData", "macro")
  }

  modelClass() {
    const modelClass = modelClassRequire(inflection.singularize(inflection.camelize(digg(this, "reflectionData", "resource_name"))))

    return modelClass
  }

  name() {
    return inflection.camelize(digg(this, "reflectionData", "name"), true)
  }
}
