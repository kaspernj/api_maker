/**
 * @typedef {object} ColumnArgType
 * @property {string} type
 */

export default class ApiMakerBaseModelColumn {
  /** @param {ColumnArgType} columnData */
  constructor(columnData) {
    if (!columnData) {
      throw new Error("No column data was given")
    }

    this.columnData = columnData
  }


  /** @returns {string} */
  getType() { return this.columnData.type }
}
