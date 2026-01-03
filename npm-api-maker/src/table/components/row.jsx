/* eslint-disable sort-imports */
import BaseComponent from "../../base-component"
import memo from "set-state-compare/build/memo.js"
import React from "react"
import {shapeComponent} from "set-state-compare/build/shape-component.js"
import useBreakpoint from "../../use-breakpoint.js"
import {View} from "react-native"

export default memo(shapeComponent(class SharedTableRow extends BaseComponent {
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
