const {I18n} = require("@kaspernj/api-maker")
const i18nInstance = new I18n()
const ymlFiles = require.context("../../../config/locales", true, /^(.+).yml$/)

i18nInstance.scanRequireContext(ymlFiles)

export default i18nInstance
