import BaseComponent from "../base-component"
import classNames from "classnames"
import {digs} from "diggerize"
import Header from "./components/header"
import {memo} from "react"
import {Platform, Pressable, Text, View} from "react-native"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component"
import SortLink from "../bootstrap/sort-link"
import useEventListener from "../use-event-listener.mjs"
import Widths from "./widths"

export default memo(shapeComponent(class ApiMakerTableHeaderColumn extends BaseComponent {
  static propTypes = propTypesExact({
    column: PropTypes.object.isRequired,
    resizing: PropTypes.bool.isRequired,
    table: PropTypes.object.isRequired,
    tableSettingColumn: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
    widths: PropTypes.instanceOf(Widths).isRequired
  })

  setup() {
    useEventListener(window, "mousemove", this.tt.onWindowMouseMove)
    useEventListener(window, "mouseup", this.tt.onWindowMouseUp)

    this.useStates({
      cursorX: undefined,
      originalWidth: undefined,
      resizing: false
    })
  }

  render() {
    const {column, resizing, table, tableSettingColumn, width} = this.p
    const {defaultParams} = table.props
    const {styleForHeader, styleForHeaderText} = table.tt
    const {query} = digs(table.collection, "query")

    return (
      <Header
        dataSet={{
          className: classNames(...table.headerClassNameForColumn(column)),
          identifier: tableSettingColumn.identifier()
        }}
        onLayout={this.tt.onLayout}
        style={styleForHeader({style: {
          cursor: resizing ? "col-resize" : undefined,
          width: `${width}%`
        }})}
        {...table.columnProps(column)}
      >
        <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
          {tableSettingColumn.hasSortKey() && query &&
            <SortLink
              attribute={tableSettingColumn.sortKey()}
              defaultParams={defaultParams}
              query={query}
              style={{whiteSpace: "nowrap", overflow: "hidden"}}
              textProps={{ellipsizeMode: "clip", numberOfLines: 1, style: styleForHeaderText()}}
              title={table.headerLabelForColumn(column)}
            />
          }
          {(!tableSettingColumn.hasSortKey() || !query) &&
            <Text ellipsizeMode="clip" numberOfLines={1}>
              {table.headerLabelForColumn(column)}
            </Text>
          }
        </View>
        <Pressable
          onMouseDown={Platform.OS == "web" ? this.tt.onResizeMouseDown : undefined}
          onPressIn={this.tt.onResizePressIn}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 10,
            height: "100%",
            cursor: "col-resize",
            zIndex: 9999
          }}
        />
      </Header>
    )
  }

  onLayout = (e) => {
    const {width} = e.nativeEvent.layout

    this.currentWidth = width
  }

  onResizeEnd = async () => {
    this.setState({cursorX: undefined, resizing: false})
    this.p.table.setState({resizing: false})

    const width = this.p.widths.getWidthOfColumn(this.p.tableSettingColumn.identifier())

    await this.p.tableSettingColumn.update({width})
  }

  // Otherwise text is selectable on web
  onResizeMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const originalWidth = this.currentWidth
    const cursorX = e.nativeEvent.pageX

    this.setState({
      cursorX,
      originalWidth,
      resizing: true
    })
    this.p.table.setState({resizing: true})
  }

  onResizePressIn = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const originalWidth = this.currentWidth
    const cursorX = e.nativeEvent.pageX

    this.setState({
      cursorX,
      originalWidth,
      resizing: true
    })
    this.p.table.setState({resizing: true})
  }

  onWindowMouseMove = (e) => {
    const {cursorX, resizing, originalWidth} = this.s

    if (resizing) {
      const newCursorX = e.pageX
      const diffX = newCursorX - cursorX
      const newWidth = originalWidth + diffX

      this.p.widths.setWidthOfColumn({
        identifier: this.p.tableSettingColumn.identifier(),
        width: newWidth
      })
    }
  }

  onWindowMouseUp = () => {
    if (this.s.resizing) {
      this.onResizeEnd()
    }
  }
}))
