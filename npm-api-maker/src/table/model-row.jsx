import {Pressable, Text, View} from "react-native"
import BaseComponent from "../base-component"
import classNames from "classnames"
import Column from "./components/column"
import columnIdentifier from "./column-identifier.mjs"
import columnVisible from "./column-visible.mjs"
import {digs} from "diggerize"
import Icon from "../icon"
import * as inflection from "inflection"
import Link from "../link"
import MoneyFormatter from "../money-formatter"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import Row from "./components/row"
import {memo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"

const WorkerPluginsCheckbox = React.lazy(() => import("./worker-plugins-checkbox"))

export default memo(shapeComponent(class ApiMakerBootStrapLiveTableModelRow extends BaseComponent {
  static propTypes = propTypesExact({
    cacheKey: PropTypes.string.isRequired,
    columnWidths: PropTypes.object.isRequired,
    isSmallScreen: PropTypes.bool.isRequired,
    model: PropTypes.object.isRequired,
    liveTable: PropTypes.object.isRequired,
    preparedColumns: PropTypes.array,
    tableSettingFullCacheKey: PropTypes.string.isRequired
  })

  render() {
    const {model} = this.p
    const {modelClass, workplace} = this.p.liveTable.p
    const {actionsContent, columnsContent, destroyEnabled, editModelPath, viewModelPath} = this.p.liveTable.props
    const {columns, currentWorkplace} = this.p.liveTable.state

    this.modelCallbackArgs = this._modelCallbackArgs() // 'model' can change so this needs to be re-cached for every render

    let editPath, viewPath

    if (editModelPath && model.can("edit")) {
      editPath = editModelPath(this.modelCallbackArgs)
    }

    if (viewModelPath && model.can("show")) {
      viewPath = viewModelPath(this.modelCallbackArgs)
    }

    return (
      <Row dataSet={{class: `${inflection.dasherize(modelClass.modelClassData().paramKey)}-row`, modelId: model.id()}}>
        {workplace &&
          <Column dataSet={{class: "workplace-column"}} style={{width: 25}}>
            <WorkerPluginsCheckbox
              currentWorkplace={currentWorkplace}
              model={model}
              style={{marginHorizontal: "auto"}}
            />
          </Column>
        }
        {columns && this.columnsContentFromColumns(model)}
        {!columns && columnsContent && columnsContent(this.modelCallbackArgs)}
        <Column dataSet={{class: "actions-column"}} style={{flexDirection: "row"}}>
          {actionsContent && actionsContent(this.modelCallbackArgs)}
          {viewPath &&
            <Link dataSet={{class: "view-button"}} to={viewPath}>
              <Icon icon="magnifying-glass-solid" />
            </Link>
          }
          {editPath &&
            <Link dataSet={{class: "edit-button"}} to={editPath}>
              <Icon icon="pen-solid" />
            </Link>
          }
          {destroyEnabled && model.can("destroy") &&
            <Pressable dataSet={{class: "destroy-button"}} onPress={this.tt.onDestroyClicked}>
              <Icon icon="xmark-solid" />
            </Pressable>
          }
        </Column>
      </Row>
    )
  }

  columnClassNamesForColumn (column) {
    const classNames = ["table--column"]

    if (column.commonProps && column.commonProps.className) classNames.push(column.commonProps.className)
    if (column.columnProps && column.columnProps.className) classNames.push(column.columnProps.className)

    return classNames
  }

  columnsContentFromColumns (model) {
    const {isSmallScreen, preparedColumns} = this.p

    return preparedColumns?.map(({column, tableSettingColumn, width}) => columnVisible(column, tableSettingColumn) &&
      <Column
        dataSet={{
          class: classNames(this.columnClassNamesForColumn(column)),
          identifier: columnIdentifier(column)
        }}
        key={columnIdentifier(column)}
        style={{width: `${width}%`}}
        {...this.props.liveTable.columnProps(column)}
      >
        {isSmallScreen &&
          <View dataSet={{class: "table--column-label"}}>
            <Text>
              {this.props.liveTable.headerLabelForColumn(column)}
            </Text>
          </View>
        }
        <View dataSet={{class: "table--column-value"}}>
          {column.content && this.columnContentFromContentArg(column, model)}
          {!column.content && column.attribute && this.columnsContentFromAttributeAndPath(column, model)}
        </View>
      </Column>
    )
  }

  columnContentFromContentArg (column, _model) {
    const value = column.content(this.modelCallbackArgs)

    return this.presentColumnValue(value)
  }

  columnsContentFromAttributeAndPath (column, model) {
    const {attribute: attributeName} = digs(column, "attribute")
    const attributeNameUnderscore = inflection.underscore(attributeName)
    const path = column.path || []
    let value
    let currentModel = model

    if (path.length > 0) {
      for (const pathPart of path) {
        currentModel = currentModel[pathPart]()
        if (!currentModel) return
      }
    }

    if (!(attributeName in currentModel)) {
      throw new Error(`${currentModel.constructor.modelName().human()} doesn't respond to ${attributeName}`)
    }

    if (currentModel.isAttributeLoaded(attributeName)) value = currentModel[attributeName]()

    const attribute = currentModel.constructor.attributes().find((attribute) => attribute.name() == attributeNameUnderscore)
    const modelColumn = attribute?.getColumn()

    if (modelColumn?.getType() == "date") {
      return (
        <Text>{this.presentDateTime({apiMakerType: "date", value})}</Text>
      )
    }

    return this.presentColumnValue(value)
  }

  _modelCallbackArgs () {
    const {model} = this.p
    const modelArgName = inflection.camelize(this.props.liveTable.props.modelClass.modelClassData().name, true)
    const modelCallbackArgs = {model}

    modelCallbackArgs[modelArgName] = model

    return modelCallbackArgs
  }

  onDestroyClicked = async () => {
    const {destroyMessage} = this.p.liveTable.props
    const {model} = this.p

    if (!confirm(I18n.t("js.shared.are_you_sure"))) {
      return
    }

    try {
      await model.destroy()

      if (destroyMessage) {
        FlashMessage.success(destroyMessage)
      }
    } catch (error) {
      FlashMessage.errorResponse(error)
    }
  }

  presentColumnValue(value) {
    if (value instanceof Date) {
      return <Text>{this.presentDateTime({value})}</Text>
    } else if (MoneyFormatter.isMoney(value)) {
      return <Text>{MoneyFormatter.format(value)}</Text>
    } else if (typeof value == "boolean") {
      if (value) {
        return <Text>{I18n.t("js.shared.yes", {defaultValue: "Yes"})}</Text>
      }

      return <Text>{I18n.t("js.shared.no", {defaultValue: "No"})}</Text>
    } else if (Array.isArray(value)) {
      return (
        <Text>
          {value
            .map((valuePart) => this.presentColumnValue(valuePart))
            .filter((valuePart) => Boolean(valuePart))
            .join(", ")
          }
        </Text>
      )
    } else if (typeof value == "string") {
      return <Text>{value}</Text>
    }

    return <Text>{value}</Text>
  }

  presentDateTime({apiMakerType, value}) {
    if (!apiMakerType || apiMakerType == "time") {
      const dateTimeFormatName = this.props.liveTable.props.defaultDateTimeFormatName || "time.formats.default"

      return I18n.l(dateTimeFormatName, value)
    } else if (apiMakerType == "date") {
      const dateFormatName = this.props.liveTable.props.defaultDateFormatName || "date.formats.default"

      return I18n.l(dateFormatName, value)
    } else {
      throw new Error(`Unhandled type: ${apiMakerType}`)
    }
  }
}))
