import {Animated, View} from "react-native"
import React, {useMemo} from "react"
import BaseComponent from "../base-component.js"
import classNames from "classnames"
import Column from "./components/column.js"
import ColumnContent from "./column-content.js"
import columnIdentifier from "./column-identifier.js"
import {EventEmitter} from "eventemitter3"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import memo from "set-state-compare/build/memo.js"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import Text from "../utils/text.js"
import useBreakpoint from "../use-breakpoint.js"
import useI18n from "i18n-on-steroids/src/use-i18n.mjs"

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
    const {l, t} = useI18n({namespace: "js.api_maker.table.model_column"})
    const {mdUp} = useBreakpoint()
    const {animatedWidth, animatedZIndex, column, columnIndex, even, model, table} = this.props
    const columnProps = table.columnProps(column)
    const {style, ...restColumnProps} = columnProps
    const actualStyle = useMemo(() =>
      Object.assign(
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
      ),
      [column, columnIndex, even, animatedZIndex, mdUp, animatedWidth, style]
    )

    const className = classNames(this.columnClassNamesForColumn(column))
    const identifier = columnIdentifier(column)
    const dataSet = useMemo(() => ({class: className, identifier}), [className])

    return (
      <Column
        dataSet={dataSet}
        style={actualStyle}
        {...restColumnProps}
      >
        {!mdUp &&
          <View dataSet={this.cache("columnLabelDataSet", {class: "table--column-label"})}>
            <Text style={this.cache("columnLabelTextStyle", {fontWeight: "bold"})}>
              {table.headerLabelForColumn(column)}
            </Text>
          </View>
        }
        <View dataSet={this.cache("columnValueDataSet", {class: "table--column-value"})}>
          {new ColumnContent({column, l, model, t, table}).content()}
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
