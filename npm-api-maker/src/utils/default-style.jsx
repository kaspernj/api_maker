import React, {createContext, useContext, useMemo} from "react"
import {incorporate} from "incorporator"
import memo from "set-state-compare/build/memo.js"

const DefaultStyleContext = createContext({
  Text: []
})

const useDefaultStyle = () => {
  const defaultStyle = useContext(DefaultStyleContext)

  return defaultStyle
}

const useMergedStyle = (style, elementType) => {
  const defaultStyle = useDefaultStyle()

  const stylesList = useMemo(() => {
    const defaultElementStyle = defaultStyle[elementType]
    let stylesList

    if (Array.isArray(defaultElementStyle)) {
      stylesList = [...defaultElementStyle]
    } else if (typeof defaultElementStyle == "object") {
      stylesList = [defaultElementStyle]
    } else {
      throw new Error(`Unknown type for default element type: ${typeof defaultElementStyle}`)
    }

    if (style && Array.isArray(style)) {
      for (const styleI of style) {
        stylesList.push(styleI)
      }
    } else if (style) {
      stylesList.push(style)
    }

    return stylesList
  }, [defaultStyle[elementType], style])

  const actualNewDefaultStyle = useMemo(() => {
    const actualNewDefaultStyle = {...defaultStyle}

    actualNewDefaultStyle[elementType] = stylesList

    return actualNewDefaultStyle
  }, [defaultStyle, stylesList])

  return {newDefaultStyle: actualNewDefaultStyle, stylesList}
}

const WithDefaultStyle = memo(({children, style, ...restProps}) => {
  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unhandled props: ${Object.keys(restProps).join(", ")}`)
  }

  const defaultStyle = useContext(DefaultStyleContext)

  const newDefaultStyle = useMemo(() => {
    for (const key in style) {
      if (!(key in defaultStyle)) {
        throw new Error(`Invalid element type given: ${key}`)
      }
    }

    const newDefaultStyle = {}

    incorporate(newDefaultStyle, defaultStyle, style)

    return newDefaultStyle
  }, [defaultStyle, style])

  return (
    <DefaultStyleContext.Provider value={newDefaultStyle}>
      {children}
    </DefaultStyleContext.Provider>
  )
})

export {useDefaultStyle, useMergedStyle, WithDefaultStyle}
