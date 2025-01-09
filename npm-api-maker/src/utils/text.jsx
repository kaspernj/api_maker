import memo from "set-state-compare/src/memo"
import React from "react"
import {Text} from "react-native"
import {useDefaultStyle, WithDefaultStyle} from "./default-style"

export default memo((props) => {
  const {style, ...restProps} = props
  const defaultStyle = useDefaultStyle()
  const actualStyle = Object.assign({}, defaultStyle?.Text, style)

  return (
    <WithDefaultStyle style={actualStyle}>
      <Text style={actualStyle} {...restProps} />
    </WithDefaultStyle>
  )
})
