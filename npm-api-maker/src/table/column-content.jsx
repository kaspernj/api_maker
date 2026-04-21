// @ts-check
/* eslint-disable padded-blocks, react/jsx-one-expression-per-line, sort-imports */
import {digs} from "diggerize"
import * as inflection from "inflection"
import modelCallbackArgs from "./model-callback-args.js"
import MoneyFormatter from "../money-formatter.js"
import React from "react"
import Text from "../utils/text"

/** @typedef {import("../base-model.js").default} BaseModel */
/** @typedef {import("../money-formatter.js").MoneyLike} MoneyLike */
/**
 * @typedef {object} AttributeDefinition
 * @property {() => import("../base-model/column.js").default | undefined} getColumn
 * @property {() => string} name
 */
/**
 * @typedef {string | Date | boolean | number | null | undefined | React.ReactNode | MoneyLike} PrimitiveColumnValue
 */
/** @typedef {PrimitiveColumnValue | PrimitiveColumnValue[]} ColumnValue */
/** @typedef {(format: string, value: Date) => string} LocalizeDateTime */
/** @typedef {(key: string, args?: object) => string} TranslateFn */
/**
 * @typedef {object} TableColumn
 * @property {string} [attribute]
 * @property {(args: Record<string, BaseModel | string>) => ColumnValue} [content]
 * @property {string[]} [path]
 */
/** @typedef {{defaultDateFormatName?: string | ((args: object) => string), defaultDateTimeFormatName?: string | ((args: object) => string)}} TableProps */
/** @typedef {{props: TableProps}} TableLike */
/**
 * @typedef {BaseModel & {
 *   constructor: {attributes(): AttributeDefinition[], modelName(): {human(): string}}
 * } & Record<string, (() => BaseModel | PrimitiveColumnValue | null | undefined) | object>} ContentModel
 */

/**
 * @param {PrimitiveColumnValue} value
 * @returns {value is MoneyLike}
 */
const isMoneyValue = (value) => MoneyFormatter.isMoney(value)

export default class ApiMakerTableColumnContent {
  /**
   * @param {object} args
   * @param {TableColumn} args.column
   * @param {LocalizeDateTime} args.l
   * @param {string} [args.mode]
   * @param {ContentModel} args.model
   * @param {TranslateFn} [args.t]
   * @param {TableLike} args.table
   */
  constructor({column, l, mode = "react-native", model, t, table}) {
    this.column = column
    this.l = l
    this.mode = mode
    this.model = model
    this.t = t
    this.table = table
  }

  columnContentFromContentArg() {
    const args = modelCallbackArgs(
      /** @type {{props: {modelClass: {modelClassData(): {name: string}}}}} */ (this.table),
      this.model
    )

    args.mode = this.mode

    const value = this.column.content(args)

    return this.presentColumnValue(value)
  }

  /** @returns {React.ReactNode | undefined} */
  columnsContentFromAttributeAndPath() {
    const {attribute: attributeName} = digs(this.column, "attribute")
    const attributeNameUnderscore = inflection.underscore(attributeName)
    const path = this.column.path || []
    let value
    let currentModel = this.model

    if (path.length > 0) {
      for (const pathPart of path) {
        currentModel = /** @type {ContentModel | null | undefined} */ (
          /** @type {() => BaseModel | null | undefined} */ (currentModel[pathPart])()
        )
        if (!currentModel) return
      }
    }

    if (!(attributeName in currentModel)) {
      throw new Error(`${currentModel.constructor.modelName().human()} doesn't respond to ${attributeName}`)
    }

    if (currentModel.isAttributeLoaded(attributeName)) {
      value = currentModel[attributeName]()
    }

    const attribute = /** @type {AttributeDefinition | undefined} */ (
      currentModel.constructor.attributes().find((attribute) => attribute.name() == attributeNameUnderscore)
    )
    const modelColumn = attribute?.getColumn()

    if (modelColumn?.getType() == "date" && value) {
      const contentText = this.presentDateTime({apiMakerType: "date", value: /** @type {Date} */ (value)})

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

  /**
   * @param {ColumnValue} value
   * @returns {React.ReactNode}
   */
  presentColumnValue = (value) => {
    let contentText

    if (value instanceof Date) {
      contentText = this.presentDateTime({value})
    } else if (!Array.isArray(value) && isMoneyValue(value)) {
      contentText = MoneyFormatter.format(value)
    } else if (typeof value == "number") {
      contentText = String(value)
    } else if (typeof value == "boolean") {
      if (value) {
        contentText = this.t("js.shared.yes", {defaultValue: "Yes"})
      } else {
        contentText = this.t("js.shared.no", {defaultValue: "No"})
      }
    } else if (Array.isArray(value)) {
      contentText = value
        .map((valuePart) => this.presentColumnValue(valuePart))
        .filter((valuePart) => Boolean(valuePart))
        .map((valuePart) => (typeof valuePart == "string" ? valuePart : ""))
        .join(", ")

    } else if (typeof value == "string") {
      contentText = value
    } else {
      // Its a React node - just return it and trust the provider to be HTML compatible.
      return /** @type {React.ReactNode} */ (value)
    }

    if (this.mode == "html") {
      return contentText
    }

    return <Text>{contentText}</Text>
  }

  /**
   * Presents date and datetime values using either translation-format keys or formatter callbacks.
   * @param {object} args
   * @param {"date"|"time"} [args.apiMakerType]
   * @param {Date} args.value
   * @returns {string}
   */
  presentDateTime = ({apiMakerType = "time", value}) => {
    if (!apiMakerType || apiMakerType == "time") {
      const dateTimeFormatName = this.table.props.defaultDateTimeFormatName || "time.formats.default"

      return this.presentDateTimeValue({apiMakerType: "time", format: dateTimeFormatName, value})
    } else if (apiMakerType == "date") {
      const dateFormatName = this.table.props.defaultDateFormatName || "date.formats.default"

      return this.presentDateTimeValue({apiMakerType: "date", format: dateFormatName, value})
    } else {
      throw new Error(`Unhandled type: ${apiMakerType}`)
    }
  }

  /**
   * Resolves a date format key or executes a custom formatter callback.
   * @param {object} args
   * @param {"date"|"time"} args.apiMakerType
   * @param {Function|string} args.format
   * @param {Date} args.value
   * @returns {string}
   */
  presentDateTimeValue({apiMakerType, format, value}) {
    if (typeof format == "function") {
      return format({
        apiMakerType,
        column: this.column,
        l: this.l,
        model: this.model,
        table: this.table,
        value
      })
    }

    return this.l(format, value)
  }
}
