import {digg} from "diggerize"
import * as inflection from "inflection"

export default class ApiMakerBaseModelScope {
  /**
   * @param {object} scopeData
   * @param {string} scopeData.name
   */
  constructor(scopeData) {
    this.scopeData = scopeData
  }

  /** @returns {string} */
  name() {
    return inflection.camelize(digg(this, "scopeData", "name"), true)
  }
}
