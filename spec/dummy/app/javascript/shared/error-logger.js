import ErrorLogger from "api-maker/error-logger"

window.errorLogger = new ErrorLogger()
window.errorLogger.loadSourceMaps().then(() => {
  window.errorLogger.enable()
})
