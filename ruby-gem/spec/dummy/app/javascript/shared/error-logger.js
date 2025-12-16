import ErrorLogger from "@kaspernj/api-maker/build/error-logger"

globalThis.errorLogger = new ErrorLogger()
globalThis.errorLogger.enable()
