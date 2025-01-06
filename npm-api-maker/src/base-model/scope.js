import {digg} from "diggerize"
import * as inflection from "inflection"

export default class ApiMakerBaseModelScope {
  constructor(scopeData) {
    this.scopeData = scopeData
  }

  name() {
    return inflection.camelize(digg(this, "scopeData", "name"), true)
  }
}
