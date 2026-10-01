// @ts-check
import escapeStringRegexp from "escape-string-regexp"

const replaces = {
  " ": "+",
  "&": "%26",
  "#": "%23",
  "+": "%2B",
  "/": "%2F",
  "?": "%3F"
}

// eslint-disable-next-line newline-per-chained-call
const regexp = new RegExp(`(${Object.keys(replaces).map(escapeStringRegexp).join("|")})`, "g")

/**
 * @param {string} string
 * @returns {string}
 */
export default function urlEncode(string) {
  // `replace` with the global `regexp` replaces every occurrence, same as `replaceAll`
  // but ES2020-compatible with the project's `lib` target.
  return String(string).replace(regexp, (character) => replaces[character])
}
