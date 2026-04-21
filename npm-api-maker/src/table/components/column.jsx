/* eslint-disable sort-imports */
import memo from "set-state-compare/build/memo.js"
import React from "react"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import {Animated} from "react-native"

/** @typedef {Record<string, never>} Props */
/** @typedef {Record<string, never>} State */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class SharedTableColumn extends ShapeComponent {
  render() {
    const {dataSet, ...restProps} = this.props
    const actualDataSet = Object.assign( // eslint-disable-line prefer-object-spread
      {component: "api-maker/table/components/column"},
      dataSet
    )

    return (
      <Animated.View dataSet={actualDataSet} {...restProps} />
    )
  }
}))
