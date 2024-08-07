import BaseComponent from "../base-component"
import classNames from "classnames"
import columnIdentifier from "./column-identifier.mjs"
import columnVisible from "./column-visible.mjs"
import {digs} from "diggerize"
import * as inflection from "inflection"
import Link from "../link"
import MoneyFormatter from "../money-formatter"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {memo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"

const WorkerPluginsCheckbox = React.lazy(() => import("./worker-plugins-checkbox"))

export default memo(shapeComponent(class ApiMakerBootStrapLiveTableModelRow extends BaseComponent {
  static propTypes = propTypesExact({
    cacheKey: PropTypes.string.isRequired,
    columnComponent: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string
    ]).isRequired,
    model: PropTypes.object.isRequired,
    liveTable: PropTypes.object.isRequired,
    preparedColumns: PropTypes.array,
    rowComponent: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string
    ]).isRequired,
    tableSettingFullCacheKey: PropTypes.string.isRequired
  })

  render() {
    const {columnComponent: ColumnComponent, model, rowComponent: RowComponent} = this.p
    const {modelClass, workplace} = this.p.liveTable.p
    const {actionsContent, columnsContent, destroyEnabled, editModelPath, viewModelPath} = this.p.liveTable.props
    const {columns, currentWorkplace} = this.p.liveTable.state

    this.modelCallbackArgs = this._modelCallbackArgs() // 'model' can change so this needs to be re-cached for every render

    let editPath, viewPath

    if (editModelPath && model.can("edit")) editPath = editModelPath(this.modelCallbackArgs)
    if (viewModelPath && model.can("show")) viewPath = viewModelPath(this.modelCallbackArgs)

    return (
      <RowComponent className={`live-table-row ${inflection.dasherize(modelClass.modelClassData().paramKey)}-row`} data-model-id={model.id()}>
        {workplace &&
          <ColumnComponent className="workplace-column" style={{width: 25, textAlign: "center"}}>
            <WorkerPluginsCheckbox currentWorkplace={currentWorkplace} model={model} />
          </ColumnComponent>
        }
        {columns && this.columnsContentFromColumns(model)}
        {!columns && columnsContent && columnsContent(this.modelCallbackArgs)}
        <ColumnComponent className="actions-column">
          {actionsContent && actionsContent(this.modelCallbackArgs)}
          {viewPath &&
            <Link className="view-button" to={viewPath}>
              <i className="fa fa-search la la-search" />
            </Link>
          }
          {editPath &&
            <Link className="edit-button" to={editPath}>
              <i className="fa fa-edit la la-edit" />
            </Link>
          }
          {destroyEnabled && model.can("destroy") &&
            <a className="destroy-button" href="#" onClick={this.onDestroyClicked}>
              <i className="fa fa-trash la la-trash" />
            </a>
          }
        </ColumnComponent>
      </RowComponent>
    )
  }

  columnClassNamesForColumn (column) {
    const classNames = ["live-table-column"]

    if (column.commonProps && column.commonProps.className) classNames.push(column.commonProps.className)
    if (column.columnProps && column.columnProps.className) classNames.push(column.columnProps.className)

    return classNames
  }

  columnsContentFromColumns (model) {
    const {preparedColumns} = this.p
    const ColumnComponent = this.props.columnComponent

    return preparedColumns?.map(({column, tableSettingColumn}) => columnVisible(column, tableSettingColumn) &&
      <ColumnComponent
        className={classNames(this.columnClassNamesForColumn(column))}
        data-identifier={columnIdentifier(column)}
        key={columnIdentifier(column)}
        {...this.props.liveTable.columnProps(column)}
      >
        <div className="live-table-column-label">
          {this.props.liveTable.headerLabelForColumn(column)}
        </div>
        <div className="live-table-column-value">
          {column.content && this.columnContentFromContentArg(column, model)}
          {!column.content && column.attribute && this.columnsContentFromAttributeAndPath(column, model)}
        </div>
      </ColumnComponent>
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
      return this.presentDateTime({apiMakerType: "date", value})
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

  onDestroyClicked = async (e) => {
    e.preventDefault()

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
      return this.presentDateTime({value})
    } else if (MoneyFormatter.isMoney(value)) {
      return MoneyFormatter.format(value)
    } else if (typeof value == "boolean") {
      if (value) return I18n.t("js.shared.yes", {defaultValue: "Yes"})

      return I18n.t("js.shared.no", {defaultValue: "No"})
    } else if (Array.isArray(value)) {
      return value
        .map((valuePart) => this.presentColumnValue(valuePart))
        .filter((valuePart) => Boolean(valuePart))
        .join(", ")
    }

    return value
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
