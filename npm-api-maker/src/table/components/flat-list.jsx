// @ts-check
/* eslint-disable sort-imports */
import {FlatList} from "react-native"
import memo from "set-state-compare/build/memo.js"
import React from "react"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"

/** @typedef {import("react-native").FlatListProps<object>} Props */
/** @typedef {Record<string, never>} State */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class SharedTagble extends ShapeComponent {
  render() {
    const {style, ...restProps} = this.props
    const actualStyle = Object.assign( // eslint-disable-line prefer-object-spread
      {width: "100%"},
      style
    )

    return (
      <FlatList style={actualStyle} {.../** @type {Props} */ (restProps)} />
    )
  }
}))
