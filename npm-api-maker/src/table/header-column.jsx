import BaseComponent from "../base-component"
import classNames from "classnames"
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome"
import Header from "./components/header"
import HeaderColumnContent from "./header-column-content"
import memo from "set-state-compare/src/memo"
import {Platform, Pressable, TouchableOpacity} from "react-native"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import {shapeComponent} from "set-state-compare/src/shape-component"
import useBreakpoint from "../use-breakpoint"
import useEventListener from "../use-event-listener.mjs"
import Widths from "./widths"

export default memo(shapeComponent(class ApiMakerTableHeaderColumn extends BaseComponent {
  static propTypes = propTypesExact({
    column: PropTypes.object.isRequired,
    onDragStart: PropTypes.func.isRequired,
    onDragEnd: PropTypes.func.isRequired,
    resizing: PropTypes.bool.isRequired,
    table: PropTypes.object.isRequired,
    tableSettingColumn: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
    widths: PropTypes.instanceOf(Widths).isRequired
  })

  setup() {
    const {name: breakpoint, mdUp, smDown} = useBreakpoint()

    this.setInstance({breakpoint, mdUp, smDown})

    useEventListener(window, "mousemove", this.tt.onWindowMouseMove)
    useEventListener(window, "mouseup", this.tt.onWindowMouseUp)

    this.useStates({
      cursorX: undefined,
      originalWidth: undefined,
      resizing: false
    })
  }

  render() {
    const {mdUp} = this.tt
    const {column, resizing, table, tableSettingColumn, width} = this.p
    const {styleForHeader} = table.tt
    const headerProps = table.headerProps(column)
    const {style, ...restColumnProps} = headerProps
    const actualStyle = Object.assign(
      {
        cursor: resizing ? "col-resize" : undefined,
        width: mdUp ? width : "100%"
      },
      style
    )

    return (
      <Header
        dataSet={{
          className: classNames(...table.headerClassNameForColumn(column)),
          identifier: tableSettingColumn.identifier()
        }}
        onLayout={this.tt.onLayout}
        style={styleForHeader({style: actualStyle})}
        {...restColumnProps}
      >
        <HeaderColumnContent column={column} table={table} tableSettingColumn={tableSettingColumn} />
        <TouchableOpacity onPressIn={this.tt.onDragStart} onPressOut={this.tt.onDragEnd}>
          <FontAwesomeIcon name="bars" size={14} style={{marginLeft: 3}} />
        </TouchableOpacity>
        {mdUp &&
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
        }
      </Header>
    )
  }

  onDragStart = (...args) => {
    console.log("onDragStart", args)

    this.p.onDragStart(...args)
  }

  onDragEnd = (...args) => {
    console.log("onDragEnd", args)

    this.p.onDragEnd(...args)
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
