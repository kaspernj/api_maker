import BaseComponent from "../../base-component.js"
import classNames from "classnames"
import memo from "set-state-compare/src/memo.js"
import React from "react"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import {Animated} from "react-native"

export default memo(shapeComponent(class SharedTableHeader extends BaseComponent {
  render() {
    const {dataSet, ...restProps} = this.props
    const {component, ...restDataSet} = dataSet || {}
    const actualDataSet = Object.assign(
      {component: classNames("api-maker/table/header", component)},
      restDataSet
    )

    return (
      <Animated.View dataSet={actualDataSet} {...restProps} />
    )
  }
}))
