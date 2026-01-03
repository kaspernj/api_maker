/* eslint-disable implicit-arrow-linebreak, max-len, react/jsx-sort-props, sort-imports */
import {Pressable} from "react-native"
import BaseComponent from "../base-component"
import Column from "./components/column"
import columnIdentifier from "./column-identifier.js"
import {EventEmitter} from "eventemitter3"
import {FlashNotifications} from "flash-notifications"
import Icon from "../utils/icon"
import * as inflection from "inflection"
import modelCallbackArgs from "./model-callback-args.js"
import Link from "../link"
import ModelColumn from "./model-column"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React from "react"
import Row from "./components/row"
import memo from "set-state-compare/build/memo.js"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"
import WorkerPluginsCheckbox from "./worker-plugins-checkbox"

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
          <Column dataSet={this.cache("columnDataSet", {class: "workplace-column"})} style={styleForColumn({even, style: {width: 41}})}>
            <WorkerPluginsCheckbox
              currentWorkplace={currentWorkplace}
              model={model}
              style={this.cache("workerPluginsCheckboxStyle", {marginHorizontal: "auto"})}
            />
          </Column>
        }
        {columns && this.columnsContentFromColumns(model, even)}
        <Column dataSet={this.cache("actionsColumnDataSet", {class: "actions-column"})} style={styleForColumn({even, style: {}, type: "actions"})}>
          {actionsContent && actionsContent(this.tt.modelCallbackArgs)}
          {viewPath &&
            <Link dataSet={this.cache("viewButtonDataSet", {class: "view-button"})} style={this.cache("searchLinkStyle", {marginLeft: 2, marginRight: 2})} to={viewPath}>
              <Icon name="search" size={18} />
            </Link>
          }
          {editPath &&
            <Link dataSet={this.cache("editButtonDataSet", {class: "edit-button"})} style={this.cache("editButtonStyle", {marginLeft: 2, marginRight: 2})} to={editPath}>
              <Icon name="pencil" size={20} />
            </Link>
          }
          {destroyEnabled && model.can("destroy") &&
            <Pressable
              dataSet={this.cache("destroyButtonDataSet", {class: "destroy-button"})}
              style={this.cache("destroyButtonStyle", {marginLeft: 2, marginRight: 2})}
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

    // eslint-disable-next-line no-alert
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
