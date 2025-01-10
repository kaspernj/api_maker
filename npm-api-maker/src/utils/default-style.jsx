import React, {createContext, useContext} from "react"
import memo from "set-state-compare/src/memo"

const DefaultStyleContext = createContext({
  Text: {}
})

const useDefaultStyle = () => {
  const defaultStyle = useContext(DefaultStyleContext)

  return defaultStyle
}

const WithDefaultStyle = memo((props) => {
  const defaultStyle = useContext(DefaultStyleContext)
  const newDefaultStyle = Object.assign({}, defaultStyle, props.style)

  return (
    <DefaultStyleContext.Provider value={newDefaultStyle}>
      {props.children}
    </DefaultStyleContext.Provider>
  )
})

export {useDefaultStyle, WithDefaultStyle}
