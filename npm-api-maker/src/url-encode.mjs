const replaces = {
  " ": "+",
  "&": "%26",
  "#": "%23",
  "/": "%2F"
}

const urlEncode = (string) => {
  return `${string}`.replaceAll(/( |&|#)/g, (character) => {
    if (!(character in replaces)) {
      throw new Error(`Didn't exist in replaces: "${character}"`)
    }

    return replaces[character]
  })
}

export default urlEncode
