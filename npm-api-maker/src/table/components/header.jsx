import BaseComponent from "../../base-component"
import {memo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"
import {View} from "react-native"

export default memo(shapeComponent(class SharedTableHeader extends BaseComponent {
  render() {
    return (
      <View {...this.props} />
    )
  }
}))
