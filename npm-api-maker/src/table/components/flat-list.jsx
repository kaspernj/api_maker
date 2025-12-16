import BaseComponent from "../../base-component.js"
import {FlatList} from "react-native"
import memo from "set-state-compare/src/memo.js"
import React from "react"
import {shapeComponent} from "set-state-compare/src/shape-component.js"

export default memo(shapeComponent(class SharedTagble extends BaseComponent {
  render() {
    const {style, ...restProps} = this.props
    const actualStyle = Object.assign(
      {width: "100%"},
      style
    )

    return (
      <FlatList style={actualStyle} {...restProps} />
    )
  }
}))
