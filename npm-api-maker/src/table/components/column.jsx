import BaseComponent from "../../base-component"
import memo from "set-state-compare/src/memo"
import React from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"
import {Animated, View} from "react-native"

export default memo(shapeComponent(class SharedTableColumn extends BaseComponent {
  render() {
    const {dataSet, ...restProps} = this.props
    const actualDataSet = Object.assign(
      {component: "api-maker/table/components/column"},
      dataSet
    )

    return (
      <Animated.View dataSet={actualDataSet} {...restProps} />
    )
  }
}))
