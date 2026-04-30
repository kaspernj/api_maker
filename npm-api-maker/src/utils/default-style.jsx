// @ts-check
import React, {createContext, useContext, useMemo} from "react"
import {incorporate} from "incorporator"
import memo from "set-state-compare/build/memo.js"

/**
 * @typedef {import("react-native").StyleProp<
 *   import("react-native").TextStyle | import("react-native").ViewStyle | import("react-native").ImageStyle
 * >} DefaultStyleValue
 */
/** @typedef {Record<string, DefaultStyleValue>} DefaultStyleMap */
/** @typedef {{children?: React.ReactNode, style: DefaultStyleMap}} WithDefaultStyleProps */

const DefaultStyleContext = createContext(/** @type {DefaultStyleMap} */ ({}))

const useDefaultStyle = () => {
  const defaultStyle = useContext(DefaultStyleContext)

  return defaultStyle
}

/**
 * Pure helper: collapse the inherited default for a slot plus the caller's
 * style into a flat list ready to pass to the underlying RN element.
 * @param {DefaultStyleValue | undefined} defaultElementStyle
 * @param {DefaultStyleValue | undefined} style
 * @returns {DefaultStyleValue[]}
 */
const computeSlotStylesList = (defaultElementStyle, style) => {
  let stylesList

  if (defaultElementStyle === undefined || defaultElementStyle === null) {
    stylesList = []
  } else if (Array.isArray(defaultElementStyle)) {
    stylesList = [...defaultElementStyle]
  } else {
    stylesList = [defaultElementStyle]
  }

  if (style && Array.isArray(style)) {
    for (const styleI of style) {
      stylesList.push(styleI)
    }
  } else if (style) {
    stylesList.push(style)
  }

  return stylesList
}

const useMergedStyle = (style, elementType) => {
  const defaultStyle = useDefaultStyle()

  const stylesList = useMemo(
    () => computeSlotStylesList(defaultStyle[elementType], style),
    [defaultStyle, elementType, style]
  )

  const actualNewDefaultStyle = useMemo(() => {
    const actualNewDefaultStyle = {...defaultStyle}

    actualNewDefaultStyle[elementType] = stylesList

    return actualNewDefaultStyle
  }, [defaultStyle, elementType, stylesList])

  return {newDefaultStyle: actualNewDefaultStyle, stylesList}
}

const WithDefaultStyle = memo((/** @type {WithDefaultStyleProps} */ {children, style, ...restProps}) => {
  if (Object.keys(restProps).length > 0) {
    throw new Error(`Unhandled props: ${Object.keys(restProps).join(", ")}`)
  }

  const defaultStyle = useContext(DefaultStyleContext)

  const newDefaultStyle = useMemo(() => {
    const newDefaultStyle = /** @type {DefaultStyleMap} */ ({})

    incorporate(newDefaultStyle, defaultStyle, style)

    return newDefaultStyle
  }, [defaultStyle, style])

  return (
    <DefaultStyleContext.Provider value={newDefaultStyle}>
      {children}
    </DefaultStyleContext.Provider>
  )
})

export {computeSlotStylesList, useDefaultStyle, useMergedStyle, WithDefaultStyle}
