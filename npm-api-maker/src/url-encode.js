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
  return String(string).replaceAll(regexp, (character) => replaces[character])
}
