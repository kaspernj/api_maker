// @ts-check
import {saveAs} from "file-saver"

/**
 * @typedef {object} ExportFileSink
 * @property {(chunk: string | Uint8Array) => Promise<void>} write
 * @property {() => Promise<void>} close
 * @property {() => Promise<void>} abort
 */
/**
 * @typedef {object} FsWritableStream
 * @property {(chunk: string | Uint8Array) => Promise<void>} write
 * @property {() => Promise<void>} close
 * @property {() => Promise<void>} abort
 */
/**
 * @typedef {object} FsFileHandle
 * @property {() => Promise<FsWritableStream>} createWritable
 */
/**
 * @typedef {object} FsWindow
 * @property {(options: object) => Promise<FsFileHandle>} [showSaveFilePicker]
 */

/**
 * Opens a streaming file sink in the browser. When the File System Access API is available (Chromium), the
 * export is written straight to the user-chosen file so memory stays bounded. Otherwise it falls back to
 * buffering the chunks and saving a Blob via file-saver (memory-bound, but works everywhere).
 *
 * Must be called from within a user-gesture handler so the save-file picker is allowed to open.
 *
 * @param {object} args
 * @param {string} args.fileName
 * @param {string} args.mimeType
 * @returns {Promise<ExportFileSink>}
 */
export default async function openWebFileSink({fileName, mimeType}) {
  const win = /** @type {FsWindow | undefined} */ (typeof window === "undefined" ? undefined : /** @type {unknown} */ (window))

  if (win && typeof win.showSaveFilePicker === "function") {
    const extension = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : ""

    try {
      const handle = await win.showSaveFilePicker({
        suggestedName: fileName,
        types: extension ? [{accept: {[mimeType]: [extension]}}] : undefined
      })
      const writable = await handle.createWritable()

      return {
        write: (chunk) => writable.write(chunk),
        close: () => writable.close(),
        abort: () => writable.abort()
      }
    } catch (error) {
      // The user cancelled the picker - propagate so the export aborts quietly.
      if (error && /** @type {Error} */ (error).name === "AbortError") throw error

      // Any other problem (e.g. picker not usable in this context): fall back to the Blob path below.
    }
  }

  /** @type {Array<string | Uint8Array>} */
  const chunks = []

  return {
    write: (chunk) => {
      chunks.push(chunk)

      return Promise.resolve()
    },
    close: () => {
      saveAs(new Blob(chunks, {type: mimeType}), fileName)

      return Promise.resolve()
    },
    abort: () => {
      chunks.length = 0

      return Promise.resolve()
    }
  }
}
