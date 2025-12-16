const Config = require("@kaspernj/api-maker/dist/config.js").default
const I18nOnSteroids = require("i18n-on-steroids").default
const i18n = new I18nOnSteroids()
const ymlFiles = require.context("../../../config/locales", true, /^(.+).yml$/)

I18nOnSteroids.setCurrent(i18n)

i18n.scanRequireContext(ymlFiles)
i18n.setLocale("en")
i18n.setLocaleOnStrftime()

Config.setI18n(i18n)

module.exports = i18n
