import {digg} from "diggerize"

export default class ApiMakerBaseModelColumn {
  constructor(columnData) {
    if (!columnData) {
      throw new Error("No column data was given")
    }

    this.columnData = columnData
  }

  /**
   * @returns {string}
   */
  getType() { return digg(this, "columnData", "type") }
}
