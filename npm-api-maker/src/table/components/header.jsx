import BaseComponent from "../../base-component"
import {memo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"
import {View} from "react-native"

export default memo(shapeComponent(class SharedTableHeader extends BaseComponent {
  render() {
    const {dataSet, ...restProps} = this.props
    const {component, ...restDataSet} = dataSet || {}
    const actualDataSet = Object.assign(
      {component: classNames("api-maker/table/header", component)},
      restDataSet
    )

    return (
      <View dataSet={actualDataSet} {...restProps} />
    )
  }
}))
