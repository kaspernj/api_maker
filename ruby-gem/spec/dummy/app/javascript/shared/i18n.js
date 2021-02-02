const {BaseModel, I18n} = require("@kaspernj/api-maker")
const i18nInstance = new I18n()
const ymlFiles = require.context("../../../config/locales", true, /^(.+).yml$/)

i18nInstance.setLocale("en")
i18nInstance.scanRequireContext(ymlFiles)

BaseModel.setI18n(i18nInstance)

export default i18nInstance
