const ymlFiles = require.context("../../../config/locales", true, /^(.+).yml$/)

I18n.scanRequireContext(ymlFiles)
