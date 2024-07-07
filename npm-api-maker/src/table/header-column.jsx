import BaseComponent from "../base-component"
import classNames from "classnames"
import {digs} from "diggerize"
import {memo} from "react"
import {Pressable, Text, View} from "react-native"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component"
import SortLink from "../bootstrap/sort-link"
import useEventListener from "../use-event-listener.mjs"
import {useRef} from "react"

export default memo(shapeComponent(class ApiMakerTableHeaderColumn extends BaseComponent {
  static propTypes = propTypesExact({
    column: PropTypes.object.isRequired,
    fixedTableLayout: PropTypes.bool.isRequired,
    table: PropTypes.object.isRequired,
    tableSettingColumn: PropTypes.object.isRequired
  })

  setup() {
    this.columnRef = useRef()

    useEventListener(window, "mousemove", this.tt.onWindowMouseMove)
    useEventListener(window, "mouseup", this.tt.onWindowMouseUp)

    this.useStates({
      cursorX: undefined,
      originalWidth: undefined,
      resizing: false,
      width: this.p.tableSettingColumn.width()
    })
  }

  render() {
    const {column, fixedTableLayout, table, tableSettingColumn} = this.p
    const {width} = this.s
    const {defaultParams} = table.props
    const {query} = digs(table.collection, "query")
    const ColumnInHeadComponent = table.columnInHeadComponent()
    let sortLinkStyle
    let textProps = {}

    if (fixedTableLayout) {
      sortLinkStyle = {whiteSpace: "nowrap", overflow: "hidden"}
      textProps.ellipsizeMode="clip"
      textProps.numberOfLines = 1
    }

    return (
      <ColumnInHeadComponent
        className={classNames(...table.headerClassNameForColumn(column))}
        data-identifier={tableSettingColumn.identifier()}
        ref={this.tt.columnRef}
        style={{width}}
        {...table.columnProps(column)}
      >
        <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
          {tableSettingColumn.hasSortKey() && query &&
            <SortLink
              attribute={tableSettingColumn.sortKey()}
              defaultParams={defaultParams}
              query={query}
              style={sortLinkStyle}
              title={table.headerLabelForColumn(column)}
            />
          }
          {(!tableSettingColumn.hasSortKey() || !query) &&
            <Text {...textProps}>
              {table.headerLabelForColumn(column)}
            </Text>
          }
          {fixedTableLayout &&
            <Pressable onPressIn={this.tt.onResizePressIn} style={{marginLeft: "auto", cursor: "col-resize"}}>
              <Text>
                |
              </Text>
            </Pressable>
          }
        </View>
      </ColumnInHeadComponent>
    )
  }

  onResizeEnd = async () => {
    this.setState({cursorX: undefined, resizing: false})

    await this.p.tableSettingColumn.update({
      width: this.s.width
    })
  }

  onResizePressIn = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const originalWidth = this.s.width || this.tt.columnRef.current.offsetWidth
    const cursorX = e.nativeEvent.pageX

    this.setState({
      cursorX,
      originalWidth,
      resizing: true
    })
  }

  onWindowMouseMove = (e) => {
    const {cursorX, resizing, originalWidth} = this.s

    if (resizing) {
      const newCursorX = e.pageX
      const diffX = newCursorX - cursorX
      const newWidth = originalWidth + diffX

      this.setState({width: newWidth})
    }
  }

  onWindowMouseUp = () => {
    if (this.s.resizing) {
      this.onResizeEnd()
    }
  }
}))
