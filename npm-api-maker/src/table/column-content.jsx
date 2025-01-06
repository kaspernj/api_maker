import {digs} from "diggerize"
import * as inflection from "inflection"
import modelCallbackArgs from "./model-callback-args"
import MoneyFormatter from "../money-formatter"
import Text from "../utils/text"

export default class ApiMakerTableColumnContent {
  constructor({column, mode = "react-native", model, table}) {
    this.column = column
    this.mode = mode
    this.model = model
    this.table = table
  }

  columnContentFromContentArg() {
    const args = modelCallbackArgs(this.table, this.model)

    args.mode = this.mode

    const value = this.column.content(args)

    return this.presentColumnValue(value)
  }

  columnsContentFromAttributeAndPath() {
    const {attribute: attributeName} = digs(this.column, "attribute")
    const attributeNameUnderscore = inflection.underscore(attributeName)
    const path = this.column.path || []
    let value
    let currentModel = this.model

    if (path.length > 0) {
      for (const pathPart of path) {
        currentModel = currentModel[pathPart]()
        if (!currentModel) return
      }
    }

    if (!(attributeName in currentModel)) {
      throw new Error(`${currentModel.constructor.modelName().human()} doesn't respond to ${attributeName}`)
    }

    if (currentModel.isAttributeLoaded(attributeName)) {
      value = currentModel[attributeName]()
    }

    const attribute = currentModel.constructor.attributes().find((attribute) => attribute.name() == attributeNameUnderscore)
    const modelColumn = attribute?.getColumn()

    if (modelColumn?.getType() == "date" && value) {
      const contentText = this.presentDateTime({apiMakerType: "date", value})

      if (this.mode == "html") {
        return contentText
      } else {
        return (
          <Text>{contentText}</Text>
        )
      }
    }

    return this.presentColumnValue(value)
  }

  content() {
    if (this.column.content) {
      return this.columnContentFromContentArg()
    } else if (!this.column.content && this.column.attribute) {
      return this.columnsContentFromAttributeAndPath()
    }
  }

  presentColumnValue(value) {
    let contentText

    if (value instanceof Date) {
      contentText = this.presentDateTime({value})
    } else if (MoneyFormatter.isMoney(value)) {
      contentText = MoneyFormatter.format(value)
    } else if (typeof value == "boolean") {
      if (value) {
        contentText = I18n.t("js.shared.yes", {defaultValue: "Yes"})
      } else {
        contentText = I18n.t("js.shared.no", {defaultValue: "No"})
      }
    } else if (Array.isArray(value)) {
      contentText = value
        .map((valuePart) => this.presentColumnValue(valuePart))
        .filter((valuePart) => Boolean(valuePart))
        .join(", ")

    } else if (typeof value == "string") {
      contentText = value
    } else {
      // Its a React node - just return it and trust the provider to be HTML compatible.
      return value
    }

    if (this.mode == "html") {
      return contentText
    }

    return <Text>{contentText}</Text>
  }

  presentDateTime({apiMakerType, value}) {
    if (!apiMakerType || apiMakerType == "time") {
      const dateTimeFormatName = this.table.props.defaultDateTimeFormatName || "time.formats.default"

      return I18n.l(dateTimeFormatName, value)
    } else if (apiMakerType == "date") {
      const dateFormatName = this.table.props.defaultDateFormatName || "date.formats.default"

      return I18n.l(dateFormatName, value)
    } else {
      throw new Error(`Unhandled type: ${apiMakerType}`)
    }
  }
}
