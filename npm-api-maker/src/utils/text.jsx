import memo from "set-state-compare/src/memo"
import React, {useMemo} from "react"
import {Text} from "react-native"
import {useDefaultStyle, WithDefaultStyle} from "./default-style"

export default memo((props) => {
  const {style, ...restProps} = props
  const defaultStyle = useDefaultStyle()
  const {actualStyle, stylesList} = useMemo(() => {
    const stylesList = []
    const actualStyle = {}

    if (defaultStyle?.Text) {
      Object.assign(actualStyle, defaultStyle.Text)
      stylesList.push(defaultStyle.Text)
    }

    if (style) {
      if (Array.isArray(style)) {
        for (const styleI of style) {
          Object.assign(actualStyle, styleI)
          stylesList.push(styleI)
        }
      } else {
        Object.assign(actualStyle, style)
        stylesList.push(style)
      }
    }

    return {actualStyle, stylesList}
  }, [defaultStyle?.Text, style])

  return (
    <WithDefaultStyle style={actualStyle}>
      <Text style={stylesList} {...restProps} />
    </WithDefaultStyle>
  )
})
