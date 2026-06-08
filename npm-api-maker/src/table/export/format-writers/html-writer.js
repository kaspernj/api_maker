// @ts-check
import {cellToHtml} from "../cell-value.js"

/**
 * Streaming HTML-table writer. Emits the table head, one `<tr>` per row, and the closing tags as separate
 * chunks so the export driver can write each page to the file sink incrementally. Cells that are React
 * elements (from a column's custom `content`) are rendered to markup; other values are escaped text.
 */
export default class ApiMakerTableExportHtmlWriter {
  /**
   * @param {Array<string>} labels
   * @returns {string}
   */
  header(labels) {
    const cells = labels.map((label) => `<th>${cellToHtml(label)}</th>`).join("")

    return `<table><thead><tr>${cells}</tr></thead><tbody>`
  }

  /**
   * @param {Array<unknown>} values
   * @returns {string}
   */
  row(values) {
    const cells = values.map((value) => `<td>${cellToHtml(value)}</td>`).join("")

    return `<tr>${cells}</tr>`
  }

  /** @returns {string} */
  footer() {
    return "</tbody></table>"
  }
}
