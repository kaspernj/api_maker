// @ts-check
/* eslint-disable sort-imports */
import memo from "set-state-compare/build/memo.js"
import React, {forwardRef} from "react"
import {Animated} from "react-native"
import {useMergedStyle, WithDefaultStyle} from "./default-style"

/**
 * @typedef {import("react-native").TextProps & {
 *   children?: React.ReactNode,
 *   style?: import("react-native").StyleProp<import("react-native").TextStyle>
 * }} TextProps
 */

const ApiMakerUtilsText = forwardRef((/** @type {TextProps} */ props, ref) => {
  const {style, ...restProps} = props
  const {newDefaultStyle, stylesList} = useMergedStyle(style, "Text")

  return (
    <WithDefaultStyle style={newDefaultStyle}>
      <Animated.Text ref={ref} style={stylesList} {...restProps} />
    </WithDefaultStyle>
  )
})

ApiMakerUtilsText.displayName = "ApiMakerUtilsText"

export default memo(ApiMakerUtilsText)
