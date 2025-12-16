import {Pressable} from "react-native"
import BaseComponent from "../base-component.js"
import Column from "./components/column.jsx"
import columnIdentifier from "./column-identifier.js"
import EventEmitter from "events"
import {FlashNotifications} from "flash-notifications"
import Icon from "../utils/icon.jsx"
import * as inflection from "inflection"
import modelCallbackArgs from "./model-callback-args.js"
import Link from "../link.jsx"
import ModelColumn from "./model-column.jsx"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React from "react"
import Row from "./components/row.jsx"
import memo from "set-state-compare/src/memo.js"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"

const WorkerPluginsCheckbox = React.lazy(() => import("./worker-plugins-checkbox.jsx"))

export default memo(shapeComponent(class ApiMakerBootStrapLiveTableModelRow extends BaseComponent {
  static propTypes = propTypesExact({
    cacheKey: PropTypes.string.isRequired,
    columns: PropTypes.array,
    columnWidths: PropTypes.object.isRequired,
    events: PropTypes.instanceOf(EventEmitter).isRequired,
    index: PropTypes.number.isRequired,
    model: PropTypes.object.isRequired,
    table: PropTypes.object.isRequired,
    tableSettingFullCacheKey: PropTypes.string.isRequired
  })

  setup() {
    const {t} = useI18n({namespace: "js.api_maker.table.model_row"})

    this.t = t
  }

  render() {
    const {index, table, model} = this.p
    const {modelClass, workplace} = table.p
    const {actionsContent, destroyEnabled, editModelPath, viewModelPath} = table.props
    const {columns, currentWorkplace} = table.state
    const {styleForColumn, styleForRow} = table.tt
    const even = index % 2 == 0

    this.modelCallbackArgs = modelCallbackArgs(table, model) // 'model' can change so this needs to be re-cached for every render

    let editPath, viewPath

    if (editModelPath && model.can("edit")) {
      editPath = editModelPath(this.modelCallbackArgs)
    }

    if (viewModelPath && model.can("show")) {
      viewPath = viewModelPath(this.modelCallbackArgs)
    }

    return (
      <Row
        dataSet={this.cache("rowDataSet", {class: `${inflection.dasherize(modelClass.modelClassData().paramKey)}-row`, modelId: model.id()}, [model.id(), modelClass.modelClassData().paramKey])}
        style={styleForRow({even})}
      >
        {workplace &&
          <Column dataSet={this.columnDataSet ||= {class: "workplace-column"}} style={styleForColumn({even, style: {width: 41}})}>
            <WorkerPluginsCheckbox
              currentWorkplace={currentWorkplace}
              model={model}
              style={this.workerPluginsCheckboxStyle ||= {marginHorizontal: "auto"}}
            />
          </Column>
        }
        {columns && this.columnsContentFromColumns(model, even)}
        <Column dataSet={this.actionsColumnDataSet ||= {class: "actions-column"}} style={styleForColumn({even, style: {}, type: "actions"})}>
          {actionsContent && actionsContent(this.tt.modelCallbackArgs)}
          {viewPath &&
            <Link dataSet={this.viewButtonDataSet ||= {class: "view-button"}} style={this.searchLinkStyle ||= {marginLeft: 2, marginRight: 2}} to={viewPath}>
              <Icon name="search" size={18} />
            </Link>
          }
          {editPath &&
            <Link dataSet={this.editButtonDataSet ||= {class: "edit-button"}} style={this.editButtonStyle ||= {marginLeft: 2, marginRight: 2}} to={editPath}>
              <Icon name="pencil" size={20} />
            </Link>
          }
          {destroyEnabled && model.can("destroy") &&
            <Pressable
              dataSet={this.destroyButtonDataSet ||= {class: "destroy-button"}}
              style={this.destroyButtonStyle ||= {marginLeft: 2, marginRight: 2}}
              onPress={this.tt.onDestroyClicked}
            >
              <Icon name="remove" size={22} />
            </Pressable>
          }
        </Column>
      </Row>
    )
  }

  columnsContentFromColumns(model, even) {
    const {columns, events, table} = this.p

    return columns?.map(({animatedPosition, animatedWidth, animatedZIndex, column, tableSettingColumn}, columnIndex) =>
      <ModelColumn
        animatedPosition={animatedPosition}
        animatedWidth={animatedWidth}
        animatedZIndex={animatedZIndex}
        column={column}
        columnIndex={columnIndex}
        even={even}
        events={events}
        key={columnIdentifier(column)}
        model={model}
        table={table}
        tableSettingColumn={tableSettingColumn}
      />
    )
  }

  onDestroyClicked = async () => {
    const {t} = this.tt
    const {destroyMessage} = this.p.table.props
    const {model} = this.p

    if (!confirm(t("js.shared.are_you_sure"))) {
      return
    }

    try {
      await model.destroy()

      if (destroyMessage) {
        FlashNotifications.success(destroyMessage)
      }
    } catch (error) {
      FlashNotifications.errorResponse(error)
    }
  }
}))
