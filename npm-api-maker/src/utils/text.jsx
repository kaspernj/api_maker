/* eslint-disable sort-imports */
import memo from "set-state-compare/build/memo.js"
import React from "react"
import {Animated} from "react-native"
import {useMergedStyle, WithDefaultStyle} from "./default-style"

export default memo((props) => {
  const {style, ...restProps} = props
  const {newDefaultStyle, stylesList} = useMergedStyle(style, "Text")

  return (
    <WithDefaultStyle style={newDefaultStyle}>
      <Animated.Text style={stylesList} {...restProps} />
    </WithDefaultStyle>
  )
})
