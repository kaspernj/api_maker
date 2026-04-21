// @ts-check
/* eslint-disable sort-imports */
import classNames from "classnames" // eslint-disable-line import/no-unresolved
import memo from "set-state-compare/build/memo.js"
import React from "react"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import {Animated} from "react-native"

/** @typedef {Record<string, never>} Props */
/** @typedef {Record<string, never>} State */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class SharedTableHeader extends ShapeComponent {
  render() {
    const {dataSet, ...restProps} = this.props
    const {component, ...restDataSet} = dataSet || {}
    const actualDataSet = Object.assign( // eslint-disable-line prefer-object-spread
      {component: classNames("api-maker/table/header", component)},
      restDataSet
    )

    return (
      <Animated.View dataSet={actualDataSet} {...restProps} />
    )
  }
}))
