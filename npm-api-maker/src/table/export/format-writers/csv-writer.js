// @ts-check
import {cellToText} from "../cell-value.js"

const UTF8_BOM = "﻿"

/**
 * Streaming CSV writer. Emits one chunk per call so the export driver can write each page straight to the
 * file sink without holding the whole document in memory. RFC-4180 quoting, CRLF line breaks, and a UTF-8 BOM
 * so Excel opens it with the right encoding.
 */
export default class ApiMakerTableExportCsvWriter {
  /**
   * @param {Array<string>} labels
   * @returns {string}
   */
  header(labels) {
    return UTF8_BOM + this.line(labels)
  }

  /**
   * @param {Array<unknown>} values
   * @returns {string}
   */
  row(values) {
    return this.line(values)
  }

  /** @returns {string} */
  footer() {
    return ""
  }

  /**
   * @param {Array<unknown>} values
   * @returns {string}
   */
  line(values) {
    return `${values.map((value) => this.escape(value)).join(",")}\r\n`
  }

  /**
   * @param {unknown} value
   * @returns {string}
   */
  escape(value) {
    const text = cellToText(value)

    if ((/["\r\n,]/).test(text)) {
      return `"${text.replace(/"/g, "\"\"")}"`
    }

    return text
  }
}
