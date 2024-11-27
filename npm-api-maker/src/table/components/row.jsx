import BaseComponent from "../../base-component"
import memo from "set-state-compare/src/memo"
import {shapeComponent} from "set-state-compare/src/shape-component"
import useBreakpoint from "../../use-breakpoint"
import {View} from "react-native"

export default memo(shapeComponent(class SharedTableRow extends BaseComponent {
  render() {
    const {style, ...restProps} = this.props
    const {name: breakpoint, smDown} = useBreakpoint()
    const actualStyle = Object.assign(
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
