import BaseComponent from "../../base-component"
import memo from "set-state-compare/src/memo"
import {shapeComponent} from "set-state-compare/src/shape-component"
import {View} from "react-native"

export default memo(shapeComponent(class SharedTableColumn extends BaseComponent {
  render() {
    return (
      <View {...this.props} />
    )
  }
}))
