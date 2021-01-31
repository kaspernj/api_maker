const {digg} = require("@kaspernj/object-digger")
const strftime = require("strftime")

class ApiMakerI18n {
  constructor() {
    this.locales = {}
    this.locale = "en"
  }

  scanRequireContext(contextLoader) {
    contextLoader.keys().forEach((id) => {
      const content = contextLoader(id)

      this._scanRecursive(content, this.locales, id)
    })
  }

  _scanRecursive(data, storage, id, currentPath = []) {
    for (const key in data) {
      const value = data[key]

      if (typeof value == "object") {
        if (!(key in storage)) {
          storage[key] = {}
        }

        this._scanRecursive(value, storage[key], id, currentPath.concat([key]))
      } else {
        if (key in storage) {
          const source = digg(storage, "id")

          console.error(`Key already found in locales: ${currentPath.join(".")}.${key}`, {oldValue: storage[key], newValue: value, id, source})
        }

        storage[key] = {id, value}
      }
    }
  }

  l(format, date) {
    const formatValue = this.t(format)
    const formattedDate = strftime(formatValue, date)

    return formattedDate
  }

  t(key, variables) {
    const path = key.split(".")

    let value = digg(this.locales, this.locale, ...path, "value")

    if (typeof value != "string") {
      throw new Error(`Value for ${key} wasn't a string`, value)
    }

    if (variables) {
      for (const key in variables) {
        value = value.replace(`%{${key}}`, variables[key])
      }
    }

    return value
  }
}

const i18ninstance = new ApiMakerI18n()

export default i18ninstance
