/**
 * @typedef {object} ColumnArgType
 * @property {any} [default]
 * @property {string} [name]
 * @property {boolean} [null]
 * @property {string | null} type
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
