// @ts-check
import apiMakerConfig from "../../../config.js"

/**
 * Excel (.xlsx) writer. xlsx is a zipped binary that can't be appended chunk-by-chunk, so this buffers the
 * rows and serializes the whole workbook in `footer()`. To keep api_maker free of a heavy spreadsheet
 * dependency, the actual serialization is provided by the host app via
 * `apiMakerConfig.setExportXlsxSerializer(rows => Uint8Array)`. Best for moderate row counts — use CSV for
 * very large exports.
 */
export default class ApiMakerTableExportXlsxWriter {
  constructor() {
    this.rows = /** @type {Array<Array<unknown>>} */ ([])
  }

  /**
   * @param {Array<string>} labels
   * @returns {null}
   */
  header(labels) {
    this.rows.push(labels)

    return null
  }

  /**
   * @param {Array<unknown>} values
   * @returns {null}
   */
  row(values) {
    this.rows.push(values)

    return null
  }

  /** @returns {Promise<Uint8Array>} */
  async footer() {
    const serializer = apiMakerConfig.getExportXlsxSerializer()

    if (!serializer) {
      throw new Error("Excel export isn't configured. Call apiMakerConfig.setExportXlsxSerializer(...) to enable it.")
    }

    return await serializer(this.rows)
  }
}
