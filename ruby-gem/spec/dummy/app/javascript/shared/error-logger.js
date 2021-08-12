import { ErrorLogger } from "@kaspernj/api-maker"
import { AttributeRow, AttributeRows } from "@kaspernj/api-maker-bootstrap"

global.errorLogger = new ErrorLogger()
global.errorLogger.enable()
