import classNames from "classnames"
import columnIdentifier from "./column-identifier.mjs"
import columnVisible from "./column-visible.mjs"
import {digg, digs} from "diggerize"
import inflection from "inflection"
import Link from "../link"
import MoneyFormatter from "../money-formatter"
import PropTypes from "prop-types"

export default class ApiMakerBootStrapLiveTableModelRow extends React.PureComponent {
  static propTypes = {
    model: PropTypes.object.isRequired,
    liveTable: PropTypes.object.isRequired,
    preparedColumns: PropTypes.array
  }

  modelCallbackArgs = this._modelCallbackArgs()

  render() {
    const {model} = digs(this.props, "model")
    const {modelClass} = digs(this.props.liveTable.props, "modelClass")
    const {actionsContent, columnsContent, destroyEnabled, editModelPath, viewModelPath} = digg(this, "props", "liveTable", "props")
    const {columns} = digg(this, "props", "liveTable", "shape")

    let editPath, viewPath

    if (editModelPath && model.can("edit")) editPath = editModelPath(this.modelCallbackArgs)
    if (viewModelPath && model.can("show")) viewPath = viewModelPath(this.modelCallbackArgs)

    const RowComponent = this.props.rowComponent
    const ColumnComponent = this.props.columnComponent

    return (
      <RowComponent className={`live-table-row ${inflection.dasherize(modelClass.modelClassData().paramKey)}-row`} data-model-id={model.id()}>
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
    const {preparedColumns} = digs(this.props, "preparedColumns")
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

  columnContentFromContentArg (column, model) {
    const value = column.content(this.modelCallbackArgs)

    return this.presentColumnValue(value)
  }

  columnsContentFromAttributeAndPath (column, model) {
    const {attribute} = digs(column, "attribute")
    const currentModelClass = this.props.modelClass
    const path = column.path || []

    let currentModel = model

    if (path.length > 0) {
      for (const pathPart of path) {
        currentModel = currentModel[pathPart]()
        if (!currentModel) return
      }
    }

    if (!(attribute in currentModel)) throw new Error(`${currentModelClass.modelName().name} doesn't respond to ${attribute}`)

    const value = currentModel[attribute]()

    return this.presentColumnValue(value)
  }

  _modelCallbackArgs () {
    const {model} = digs(this.props, "model")
    const modelArgName = inflection.camelize(this.props.liveTable.props.modelClass.modelClassData().name, true)
    const modelCallbackArgs = {}

    modelCallbackArgs[modelArgName] = model

    return modelCallbackArgs
  }

  onDestroyClicked = async (e) => {
    e.preventDefault()

    const {destroyMessage} = digg(this, "props", "liveTable", "props")
    const {model} = digs(this.props, "model")

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

  presentColumnValue (value) {
    if (value instanceof Date) {
      return this.presentDateTime(value)
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

  presentDateTime(value) {
    const apiMakerType = value.apiMakerType || "time"

    if (apiMakerType == "time") {
      const dateTimeFormatName = this.props.liveTable.props.defaultDateTimeFormatName || "time.formats.default"

      return I18n.l(dateTimeFormatName, value)
    } else if (apiMakerType == "date") {
      const dateFormatName = this.props.liveTable.props.defaultDateTimeFormatName || "date.formats.default"

      return I18n.l(dateFormatName, value)
    } else {
      throw new Error(`Unhandled type: ${apiMakerType}`)
    }
  }
}
