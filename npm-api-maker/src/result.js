export default class ApiMakerResult {
  /**
   * @param {object} data
   * @param {import("./collection.js").default} data.collection
   * @param {object} data.response
   */
  constructor (data) {
    this.data = data
  }

  /** @returns {number} */
  count() { return this.data.response.meta.count }

  /** @returns {number} */
  currentPage() { return this.data.response.meta.currentPage }

  /** @returns {Array<import("./base-model.js").default>} */
  models() { return this.data.models }

  /** @returns {typeof import("./base-model.js").default} */
  modelClass() { return this.data.collection.modelClass() }

  /** @returns {number} */
  perPage() { return this.data.response.meta.perPage }

  /** @returns {number} */
  totalCount() { return this.data.response.meta.totalCount }

  /** @returns {number} */
  totalPages() { return this.data.response.meta.totalPages }
}
