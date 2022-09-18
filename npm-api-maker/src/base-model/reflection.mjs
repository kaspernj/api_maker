import {digg} from "diggerize"
import inflection from "inflection"
import modelClassRequire from "../model-class-require.mjs"

export default class ApiMakerBaseModelReflection {
  constructor(reflectionData) {
    this.reflectionData = reflectionData
  }

  macro() {
    return digg(this, "reflectionData", "macro")
  }

  modelClass() {
    const modelClass = modelClassRequire(inflection.singularize(inflection.camelize(digg(this, "reflectionData", "name"))))

    return modelClass
  }

  name() {
    return inflection.camelize(digg(this, "reflectionData", "name"), true)
  }
}
