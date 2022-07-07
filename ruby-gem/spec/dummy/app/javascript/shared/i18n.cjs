const I18nOnSteroids = require("i18n-on-steroids").default
const BaseModel = require("@kaspernj/api-maker/src/base-model")
const i18n = new I18nOnSteroids()
const ymlFiles = require.context("../../../config/locales", true, /^(.+).yml$/)

i18n.scanRequireContext(ymlFiles)
i18n.setLocale("en")
i18n.setLocaleOnStrftime()

BaseModel.setI18n(i18n)

module.exports = i18n
