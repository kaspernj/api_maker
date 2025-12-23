import memo from "set-state-compare/build/memo.js"
import React from "react"
import {Animated} from "react-native"
import {useMergedStyle, WithDefaultStyle} from "./default-style"

const AnimatedText = /** @type {any} */ (Animated.Text)

export default memo((props) => {
  const {style, ...restProps} = props
  const {newDefaultStyle, stylesList} = useMergedStyle(style, "Text")

  return (
    <WithDefaultStyle style={newDefaultStyle}>
      <AnimatedText style={stylesList} {...restProps} />
    </WithDefaultStyle>
  )
})
