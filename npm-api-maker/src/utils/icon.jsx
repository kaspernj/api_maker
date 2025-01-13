import BaseComponent from "../base-component"
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome"
import memo from "set-state-compare/src/memo"
import React from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"
import {useDefaultStyle} from "./default-style"

export default memo(shapeComponent(class ApiMakerUtilsIcon extends BaseComponent {
  render() {
    const defaultStyle = useDefaultStyle()
    const {style, ...restProps} = this.props
    const actualStyle = Object.assign(
      {color: defaultStyle.Text.color},
      style
    )

    return (
      <FontAwesomeIcon style={actualStyle} {...restProps} />
    )
  }
}))
