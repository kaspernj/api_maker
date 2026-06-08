// @ts-check
/* eslint-disable sort-imports */
import React from "react"

/**
 * @param {unknown} value
 * @returns {string}
 */
const toText = (value) => (value === null || value === undefined ? "" : String(value))

/**
 * Recursively extracts the text content of a React node without rendering it, so the export path stays
 * lightweight and SSR-/test-safe (no react-dom/server). A column's custom `content` can return a React
 * element even in "html" mode; this keeps such cells exporting their text instead of "[object Object]".
 * @param {unknown} node
 * @returns {string}
 */
const reactNodeToText = (node) => {
  if (node === null || node === undefined || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(reactNodeToText).join("")
  if (React.isValidElement(node)) return reactNodeToText(/** @type {{props?: {children?: unknown}}} */ (node).props?.children)

  return ""
}

/**
 * @param {string} text
 * @returns {string}
 */
const escapeHtml = (text) => text
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")

/**
 * Plain text value of a cell, for CSV/Excel.
 * @param {unknown} value
 * @returns {string}
 */
export const cellToText = (value) => (React.isValidElement(value) ? reactNodeToText(value) : toText(value))

/**
 * HTML-escaped text value of a cell, for the HTML export.
 * @param {unknown} value
 * @returns {string}
 */
export const cellToHtml = (value) => escapeHtml(cellToText(value))
