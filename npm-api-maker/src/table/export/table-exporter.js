// @ts-check
// The export is intentionally sequential: each page is fetched and written before the next so only one page
// is ever in memory. That requires awaiting inside the paging loop.
/* eslint-disable no-await-in-loop, sort-imports */
import {digg} from "diggerize"
import columnVisible from "../column-visible.js"
import ColumnContent from "../column-content"
import CsvWriter from "./format-writers/csv-writer.js"
import HtmlWriter from "./format-writers/html-writer.js"
import openExportFileSink from "./open-export-file-sink.js"
import XlsxWriter from "./format-writers/xlsx-writer.js"

const FORMATS = {
  csv: {extension: "csv", mimeType: "text/csv;charset=utf-8", Writer: CsvWriter},
  html: {extension: "html", mimeType: "text/html;charset=utf-8", Writer: HtmlWriter},
  xlsx: {extension: "xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", Writer: XlsxWriter}
}

/** Thrown when the user cancels an in-progress export. */
export class ApiMakerTableExportAbortedError extends Error {}

/**
 * Streams a table's whole result set to a file, fetching it page-by-page and writing each page straight to a
 * file sink, so only one page (plus the format writer's own buffering) is ever held in memory.
 *
 * @typedef {object} ExporterArgs
 * @property {number} [batchSize]
 * @property {"csv" | "html" | "xlsx"} format
 * @property {(format: string, value: Date) => string} l
 * @property {(progress: {page: number, totalPages: number, written: number}) => void} [onProgress]
 * @property {object} table
 */
export default class ApiMakerTableExporter {
  /** @param {ExporterArgs} args */
  constructor({batchSize = 1000, format, l, onProgress, table}) {
    this.batchSize = batchSize
    this.format = format
    this.l = l
    this.onProgress = onProgress
    this.table = table
    this.aborted = false
  }

  abort() {
    this.aborted = true
  }

  /** @returns {Promise<{written: number}>} */
  async run() {
    const formatConfig = FORMATS[this.format]

    if (!formatConfig) throw new Error(`Unknown export format: ${this.format}`)

    const writer = new formatConfig.Writer()
    const columns = this.visibleColumns()
    const labels = columns.map((preparedColumn) => this.table.headerLabelForColumn(preparedColumn.column))
    const fileName = `${this.modelName()}.${formatConfig.extension}`
    const sink = await openExportFileSink({fileName, format: this.format, mimeType: formatConfig.mimeType})
    let written = 0

    try {
      await this.writeChunk(sink, writer.header(labels))

      let page = 1
      let totalPages = 1

      do {
        const result = await this.baseQuery()
          .clone()
          .page(page)
          .per(this.batchSize)
          .result()

        if (page === 1) totalPages = result.totalPages()

        let buffer = ""

        for (const model of result.models()) {
          if (this.aborted) throw new ApiMakerTableExportAbortedError("Export aborted")

          const values = columns.map((preparedColumn) => this.cellValue(preparedColumn, model))
          const chunk = writer.row(values)

          if (typeof chunk === "string") {
            buffer += chunk
          } else if (chunk !== null && chunk !== undefined) {
            await this.writeChunk(sink, chunk)
          }

          written += 1
        }

        if (buffer.length > 0) await sink.write(buffer)
        if (this.onProgress) this.onProgress({page, totalPages, written})

        page += 1
      } while (page <= totalPages)

      await this.writeChunk(sink, await writer.footer())
      await sink.close()

      return {written}
    } catch (error) {
      await this.abortSink(sink)

      throw error
    }
  }

  /** @returns {Array<{column: object, tableSettingColumn: object}>} */
  visibleColumns() {
    const preparedColumns = this.table.s.preparedColumns || []

    return preparedColumns.filter(({column, tableSettingColumn}) => columnVisible(column, tableSettingColumn))
  }

  /**
   * @param {{column: object}} preparedColumn
   * @param {object} model
   * @returns {unknown}
   */
  cellValue(preparedColumn, model) {
    return new ColumnContent({column: preparedColumn.column, l: this.l, mode: "html", model, table: this.table}).content()
  }

  /** @returns {string} */
  modelName() {
    return this.table.p.modelClass.modelName().human({count: 2})
  }

  baseQuery() {
    return digg(this.table.tt.collection, "query")
  }

  /**
   * @param {{write: (chunk: string | Uint8Array) => Promise<void>}} sink
   * @param {string | Uint8Array | null | undefined} chunk
   * @returns {Promise<void>}
   */
  async writeChunk(sink, chunk) {
    if (chunk === null || chunk === undefined) return
    if (typeof chunk === "string" && chunk.length === 0) return

    await sink.write(chunk)
  }

  /**
   * @param {{abort: () => Promise<void>}} sink
   * @returns {Promise<void>}
   */
  async abortSink(sink) {
    try {
      await sink.abort()
    } catch {
      // Ignore secondary errors while cleaning up after a failed/aborted export.
    }
  }
}
