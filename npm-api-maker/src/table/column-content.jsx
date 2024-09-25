import {digs} from "diggerize"
import modelCallbackArgs from "./model-callback-args.mjs"
import MoneyFormatter from "../money-formatter"
import {Text} from "react-native"

export default class ApiMakerTableColumnContent {
  constructor({column, mode = "react-native", model, table}) {
    this.column = column
    this.mode = mode
    this.model = model
    this.modelCallbackArgs = modelCallbackArgs(table, model)
    this.table = table
  }

  columnContentFromContentArg(column, _model) {
    const value = column.content(this.modelCallbackArgs)

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
    const {column, model} = digs(this, "column", "model")

    if (column.content) {
      return this.columnContentFromContentArg(column, model)
    } else if (!column.content && column.attribute) {
      return this.columnsContentFromAttributeAndPath(column, model)
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
