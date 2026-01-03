import * as inflection from "inflection"
import {digg} from "diggerize"

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
