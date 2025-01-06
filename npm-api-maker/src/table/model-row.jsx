import {Pressable} from "react-native"
import BaseComponent from "../base-component"
import Column from "./components/column"
import columnIdentifier from "./column-identifier"
import EventEmitter from "events"
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome"
import * as inflection from "inflection"
import modelCallbackArgs from "./model-callback-args"
import Link from "../link"
import ModelColumn from "./model-column"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import Row from "./components/row"
import memo from "set-state-compare/src/memo"
import {shapeComponent} from "set-state-compare/src/shape-component"

const WorkerPluginsCheckbox = React.lazy(() => import("./worker-plugins-checkbox"))

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
        dataSet={{class: `${inflection.dasherize(modelClass.modelClassData().paramKey)}-row`, modelId: model.id()}}
        style={styleForRow({even})}
      >
        {workplace &&
          <Column dataSet={{class: "workplace-column"}} style={styleForColumn({even, style: {width: 41}})}>
            <WorkerPluginsCheckbox
              currentWorkplace={currentWorkplace}
              model={model}
              style={{marginHorizontal: "auto"}}
            />
          </Column>
        }
        {columns && this.columnsContentFromColumns(model, even)}
        <Column dataSet={{class: "actions-column"}} style={styleForColumn({even, style: {}, type: "actions"})}>
          {actionsContent && actionsContent(this.tt.modelCallbackArgs)}
          {viewPath &&
            <Link dataSet={{class: "view-button"}} style={{marginLeft: 2, marginRight: 2}} to={viewPath}>
              <FontAwesomeIcon name="search" size={18} />
            </Link>
          }
          {editPath &&
            <Link dataSet={{class: "edit-button"}} style={{marginLeft: 2, marginRight: 2}} to={editPath}>
              <FontAwesomeIcon name="pencil" size={20} />
            </Link>
          }
          {destroyEnabled && model.can("destroy") &&
            <Pressable dataSet={{class: "destroy-button"}} style={{marginLeft: 2, marginRight: 2}} onPress={this.tt.onDestroyClicked}>
              <FontAwesomeIcon name="remove" size={22} />
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
    const {destroyMessage} = this.p.table.props
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
}))
