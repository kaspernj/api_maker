import memo from "set-state-compare/src/memo"
import React from "react"
import {Text} from "react-native"
import {useMergedStyle, WithDefaultStyle} from "./default-style"

export default memo((props) => {
  const {style, ...restProps} = props
  const {newDefaultStyle, stylesList} = useMergedStyle(style, "Text")

  return (
    <WithDefaultStyle style={newDefaultStyle}>
      <Text style={stylesList} {...restProps} />
    </WithDefaultStyle>
  )
})
