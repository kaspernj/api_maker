import ErrorLogger from "@kaspernj/api-maker/dist/error-logger"

globalThis.errorLogger = new ErrorLogger()
globalThis.errorLogger.enable()
