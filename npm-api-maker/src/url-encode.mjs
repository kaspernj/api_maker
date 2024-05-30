import escapeStringRegexp from "escape-string-regexp"

const replaces = {
  " ": "+",
  "&": "%26",
  "#": "%23",
  "+": "%2B",
  "/": "%2F",
  "?": "%3F"
}

const regexp = new RegExp(`(${Object.keys(replaces).map(escapeStringRegexp).join("|")})`, "g")

const urlEncode = (string) => {
  return String(string).replaceAll(regexp, (character) => replaces[character])
}

export default urlEncode
