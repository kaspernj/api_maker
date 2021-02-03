const I18nOnSteroids = require("i18n-on-steroids")
const {BaseModel} = require("@kaspernj/api-maker")
const i18n = new I18nOnSteroids()
const ymlFiles = require.context("../../../config/locales", true, /^(.+).yml$/)

i18n.setLocale("en")
i18n.scanRequireContext(ymlFiles)

BaseModel.setI18n(i18n)

export default i18n
