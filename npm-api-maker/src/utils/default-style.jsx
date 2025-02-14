import React, {createContext, useContext, useMemo} from "react"
import {incorporate} from "incorporator"
import memo from "set-state-compare/src/memo"

const DefaultStyleContext = createContext({
  Text: []
})

const useDefaultStyle = () => {
  const defaultStyle = useContext(DefaultStyleContext)

  return defaultStyle
}

const useMergedStyle = (style, elementType) => {
  const defaultStyle = useDefaultStyle()

  const {newDefaultStyle, stylesList} = useMemo(() => {
    const textDefaultStyle = defaultStyle[elementType]

    if (!style) {
      return {newDefaultStyle: defaultStyle, stylesList: textDefaultStyle}
    }

    const stylesList = textDefaultStyle ? [...textDefaultStyle] : []

    if (Array.isArray(style)) {
      for (const styleI of style) {
        stylesList.push(styleI)
      }
    } else {
      stylesList.push(style)
    }

    return {newDefaultStyle, stylesList}
  }, [defaultStyle[elementType], style])

  const actualNewDefaultStyle = useMemo(() => {
    const actualNewDefaultStyle = {...defaultStyle}

    actualNewDefaultStyle[elementType] = stylesList

    return actualNewDefaultStyle
  }, [defaultStyle, newDefaultStyle])

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
