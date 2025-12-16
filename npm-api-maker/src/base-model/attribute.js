import Column from "./column.js"
import {digg} from "diggerize"

export default class ApiMakerBaseModelAttribute {
  /**
   * @param {object>} attributeData
   */
  constructor(attributeData) {
    this.attributeData = attributeData
  }

  /**
   * @returns {Column}
   */
  getColumn() {
    if (!this.column) {
      const columnData = digg(this, "attributeData", "column")

      if (columnData) {
        this.column = new Column(columnData)
      }
    }

    return this.column
  }

  /**
   * @returns {boolean}
   */
  isColumn() { return Boolean(digg(this, "attributeData", "column")) }

  /**
   * @returns {boolean}
   */
  isSelectedByDefault() {
    const isSelectedByDefault = digg(this, "attributeData", "selected_by_default")

    if (isSelectedByDefault || isSelectedByDefault === null) return true

    return false
  }

  /**
   * @returns {boolean}
   */
  isTranslated() { return digg(this, "attributeData", "translated") }

  /**
   * @returns {string}
   */
  name() { return digg(this, "attributeData", "name")}
}
