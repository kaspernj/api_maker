import ErrorLogger from "@kaspernj/api-maker/src/error-logger"

globalThis.errorLogger = new ErrorLogger()
globalThis.errorLogger.enable()
