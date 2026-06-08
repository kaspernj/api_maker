// @ts-check

/**
 * Streaming HTML-table writer. Emits the table head, one `<tr>` per row, and the closing tags as separate
 * chunks so the export driver can write each page to the file sink incrementally. Cell values are emitted as
 * escaped text (the export is a data dump, not a rendered view).
 */
export default class ApiMakerTableExportHtmlWriter {
  /**
   * @param {Array<string>} labels
   * @returns {string}
   */
  header(labels) {
    const cells = labels.map((label) => `<th>${this.escape(label)}</th>`).join("")

    return `<table><thead><tr>${cells}</tr></thead><tbody>`
  }

  /**
   * @param {Array<unknown>} values
   * @returns {string}
   */
  row(values) {
    const cells = values.map((value) => `<td>${this.escape(value)}</td>`).join("")

    return `<tr>${cells}</tr>`
  }

  /** @returns {string} */
  footer() {
    return "</tbody></table>"
  }

  /**
   * @param {unknown} value
   * @returns {string}
   */
  escape(value) {
    const text = value === null || value === undefined ? "" : String(value)

    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
  }
}
