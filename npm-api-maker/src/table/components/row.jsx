/* eslint-disable sort-imports */
import memo from "set-state-compare/build/memo.js"
import React from "react"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import {useBreakpoint} from "responsive-breakpoints"
import {View} from "react-native"

/** @typedef {Record<string, never>} Props */
/** @typedef {Record<string, never>} State */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class SharedTableRow extends ShapeComponent {
  render() {
    const {style, ...restProps} = this.props
    const {name: breakpoint, smDown} = useBreakpoint()
    const actualStyle = Object.assign( // eslint-disable-line prefer-object-spread
      {
        flexDirection: breakpoint == "sm" || smDown ? "column" : "row"
      },
      style
    )

    return (
      <View style={actualStyle} {...restProps} />
    )
  }
}))
