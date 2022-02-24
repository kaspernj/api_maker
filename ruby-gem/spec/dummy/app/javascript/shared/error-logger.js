import { ErrorLogger } from "@kaspernj/api-maker"

global.errorLogger = new ErrorLogger()
global.errorLogger.enable()
