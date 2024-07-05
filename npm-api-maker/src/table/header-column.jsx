import BaseComponent from "../base-component"
import classNames from "classnames"
import {digs} from "diggerize"
import {memo} from "react"
import {Pressable, Text} from "react-native"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component"
import SortLink from "../bootstrap/sort-link"
import useEventListener from "../use-event-listener.mjs"
import {useRef} from "react"

export default memo(shapeComponent(class ApiMakerTableHeaderColumn extends BaseComponent {
  static propTypes = propTypesExact({
    column: PropTypes.object.isRequired,
    table: PropTypes.object.isRequired,
    tableSettingColumn: PropTypes.object.isRequired
  })

  setup() {
    this.columnRef = useRef()

    useEventListener(window, "mousemove", this.tt.onWindowMouseMove)
    useEventListener(window, "mouseup", this.tt.onWindowMouseUp)

    this.useStates({
      cursorX: undefined,
      cursorY: undefined,
      originalWidth: undefined,
      resizing: false,
      width: "auto"
    })
  }

  render() {
    const {column, table, tableSettingColumn} = this.p
    const {width} = this.s
    const {defaultParams} = table.props
    const {query} = digs(table.collection, "query")
    const ColumnInHeadComponent = table.columnInHeadComponent()

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
            <SortLink attribute={tableSettingColumn.sortKey()} defaultParams={defaultParams} query={query} title={table.headerLabelForColumn(column)} />
          }
          {(!tableSettingColumn.hasSortKey() || !query) &&
            table.headerLabelForColumn(column)
          }
          <Pressable onPressIn={this.tt.onResizePressIn} onPressOut={this.tt.onResizePressOut} style={{marginLeft: "auto", width: 20, cursor: "pointer"}}>
            <Text>
              &nbsp;
            </Text>
          </Pressable>
        </View>
      </ColumnInHeadComponent>
    )
  }

  onResizeEnd = async () => {
    console.log("onResizeEnd")
    this.setState({cursorX: undefined, cursorY: undefined, resizing: false})

    await this.p.tableSettingColumn.update({
      width: this.s.width
    })
  }

  onResizePressIn = (e) => {
    console.log("onResizePressIn", {e})

    e.preventDefault()
    e.stopPropagation()

    const width = this.tt.columnRef.current.offsetWidth
    const cursorX = e.nativeEvent.pageX
    const cursorY = e.nativeEvent.pageY

    console.log({width, cursorX, cursorY})

    this.setState({
      cursorX,
      cursorY,
      originalWidth: width,
      resizing: true,
      width
    })
  }

  onResizePressOut = () => {
    console.log("onResizePressOut")
  }

  onWindowMouseMove = (e) => {
    const {cursorX, cursorY, resizing, originalWidth} = this.s

    if (resizing) {
      const newCursorX = e.pageX
      const newCursorY = e.pageY
      const diffX = newCursorX - cursorX
      const diffY = newCursorY - cursorY
      const newWidth = originalWidth + diffX

      console.log("onWindowMouseMove", {diffX, cursorX, cursorY, originalWidth, newWidth})

      this.setState({width: newWidth})
    }
  }

  onWindowMouseUp = () => {
    console.log("onWindowMouseUp")

    const {resizing} = this.s

    if (resizing) {
      this.onResizeEnd()
    }
  }
}))
