import events from "./src/events.mjs"
import {dig, digg} from "diggerize"
import numberable from "numberable"
import Raiser from "./src/error-handlers/raiser.mjs"
import strftime from "strftime"

if (!globalThis.i18nOnSteroids) globalThis.i18nOnSteroids = {current: null}

export default class I18nOnSteroids {
  static getCurrent() {
    if (!globalThis.i18nOnSteroids.current) throw new Error("A current instance hasn't been set")

    return globalThis.i18nOnSteroids.current
  }

  static setCurrent(i18n) {
    globalThis.i18nOnSteroids.current = i18n
  }

  constructor(args) {
    this.errorHandler = new Raiser(this)
    this.locales = {}

    if (args?.fallbacks) {
      this.fallbacks = args.fallbacks
    } else {
      this.fallbacks = {}
    }
  }

  setErrorHandler(errorHandler) {
    this.errorHandler = errorHandler
  }

  setLocale(locale) {
    this.locale = locale
    events.emit("localeChanged")
  }

  setLocaleOnStrftime() {
    const monthNames = [...Object.values(this.t("date.month_names"))]
    const abbrMonthNames = [...Object.values(this.t("date.abbr_month_names"))]

    monthNames.shift()
    abbrMonthNames.shift()

    const strftimeLocales = {
      days: Object.values(this.t("date.day_names")),
      shortDays: Object.values(this.t("date.abbr_day_names")),
      months: monthNames,
      shortMonths: abbrMonthNames
    }

    this.strftime = strftime.localize(strftimeLocales)
  }

  scanRequireContext(contextLoader) {
    contextLoader.keys().forEach((id) => {
      const content = contextLoader(id)

      this._scanRecursive(content, this.locales, [], id)
    })
  }

  scanObject(object) {
    this._scanRecursive(object, this.locales, [])
  }

  _scanRecursive(data, storage, currentPath, id) {
    for (const key in data) {
      const value = data[key]

      if (typeof value == "object") {
        if (!(key in storage)) {
          storage[key] = {}
        }

        this._scanRecursive(value, storage[key], currentPath.concat([key], id))
      } else {
        if (key in storage) {
          console.error(`Key already found in locales: ${currentPath.join(".")}.${key} '${id}'`, {oldValue: storage[key], newValue: value})
        }

        storage[key] = value
      }
    }
  }

  l(format, date) {
    const formatValue = this.t(format)
    const formattedDate = this.strftime(formatValue, date)

    return formattedDate
  }

  t(key, variables, args) {
    const locale = args?.locale || this.locale
    const path = key.split(".")
    const localesToTry = this.fallbacks[locale] || [locale]
    let defaultValue, value

    for (const locale of localesToTry) {
      value = this._lookup(locale, path)

      if (value) {
        break
      }
    }

    if (variables && "defaultValue" in variables) {
      defaultValue = digg(variables, "defaultValue")
      delete variables.defaultValue
    }

    if (value === undefined) {
      if (args?.default) {
        value = args.default
      } else if (defaultValue) {
        value = defaultValue
      }
    }

    if (value) {
      return this.insertVariables(value, variables)
    }

    const error = Error(`Key didn't exist: ${locale}.${key}`)

    return this.errorHandler.handleError({error, key, path, variables})
  }

  insertVariables(value, variables) {
    if (variables) {
      for (const key in variables) {
        value = value.replace(`%{${key}}`, variables[key])
      }
    }

    return value
  }

  _lookup = (locale, path) => dig(this.locales, locale, ...path)

  toNumber(number) {
    return numberable(number, {
      delimiter: this.t("number.format.delimiter"),
      precision: this.t("number.format.precision"),
      separator: this.t("number.format.separator")
    })
  }
}
