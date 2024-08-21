import BaseComponent from "../../base-component"
import {memo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"
import {View} from "react-native"

export default memo(shapeComponent(class SharedTableRow extends BaseComponent {
  render() {
    const {style, ...restProps} = this.props
    const actualStyle = Object.assign(
      {
        flexDirection: "row"
      },
      style
    )

    return (
      <View style={actualStyle} {...restProps} />
    )
  }
}))
