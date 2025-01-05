import {Animated, View} from "react-native"
import BaseComponent from "../base-component"
import classNames from "classnames"
import Column from "./components/column"
import ColumnContent from "./column-content"
import columnIdentifier from "./column-identifier.mjs"
import EventEmitter from "events"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import memo from "set-state-compare/src/memo"
import {shapeComponent} from "set-state-compare/src/shape-component"
import Text from "../utils/text"
import useBreakpoint from "../use-breakpoint"

export default memo(shapeComponent(class ApiMakerTableModelColumn extends BaseComponent {
  static propTypes = propTypesExact({
    animatedPosition: PropTypes.instanceOf(Animated.ValueXY).isRequired,
    animatedWidth: PropTypes.instanceOf(Animated.Value).isRequired,
    animatedZIndex: PropTypes.instanceOf(Animated.Value).isRequired,
    column: PropTypes.object.isRequired,
    columnIndex: PropTypes.number.isRequired,
    even: PropTypes.bool.isRequired,
    events: PropTypes.instanceOf(EventEmitter).isRequired,
    model: PropTypes.object.isRequired,
    table: PropTypes.object.isRequired,
    tableSettingColumn: PropTypes.object.isRequired
  })

  render() {
    const {mdUp} = useBreakpoint()
    const {animatedWidth, animatedZIndex, column, columnIndex, even, model, table} = this.props
    const columnProps = table.columnProps(column)
    const {style, ...restColumnProps} = columnProps
    const actualStyle = Object.assign(
      table.styleForColumn({
        column,
        columnIndex,
        even,
        style: {
          zIndex: animatedZIndex,
          transform: this.p.animatedPosition.getTranslateTransform(),
          width: mdUp ? animatedWidth : "100%"
        }
      }),
      style
    )

    return (
      <Column
        dataSet={{
          class: classNames(this.columnClassNamesForColumn(column)),
          identifier: columnIdentifier(column)
        }}
        style={actualStyle}
        {...restColumnProps}
      >
        {!mdUp &&
          <View dataSet={{class: "table--column-label"}}>
            <Text style={{fontWeight: "bold"}}>
              {table.headerLabelForColumn(column)}
            </Text>
          </View>
        }
        <View dataSet={{class: "table--column-value"}}>
          {new ColumnContent({column, model, table}).content()}
        </View>
      </Column>
    )
  }

  columnClassNamesForColumn(column) {
    const classNames = ["table--column"]

    if (column.commonProps && column.commonProps.className) classNames.push(column.commonProps.className)
    if (column.columnProps && column.columnProps.className) classNames.push(column.columnProps.className)

    return classNames
  }
}))
