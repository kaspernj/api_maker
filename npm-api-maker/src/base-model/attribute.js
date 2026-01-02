// @ts-check

import Column from "./column.js"

/**
 * @typedef AttributeArgType
 * @property {string} column
 * @property {string} name
 * @property {boolean} selected_by_default
 * @property {boolean} translated
 * @property {string} type
 */

export default class ApiMakerBaseModelAttribute {
  /** @param {AttributeArgType} attributeData */
  constructor(attributeData) {
    this.attributeData = attributeData
  }

  /**
   * @returns {Column}
   */
  getColumn() {
    if (!this.column) {
      const columnData = this.attributeData.column

      if (columnData) {
        this.column = new Column(columnData)
      }
    }

    return this.column
  }

  /** @returns {boolean} */
  isColumn() { return Boolean(this.attributeData.column) }

  /** @returns {boolean} */
  isSelectedByDefault() {
    const isSelectedByDefault = this.attributeData.selected_by_default

    if (isSelectedByDefault || isSelectedByDefault === null) return true

    return false
  }

  /** @returns {boolean} */
  isTranslated() { return this.attributeData.translated }

  /** @returns {string} */
  name() { return this.attributeData.name }
}
