import React, {createContext, useContext, useMemo} from "react"
import ApiMakerConfig from "./config.js"
import memo from "set-state-compare/build/memo.js"

const ApiMakerContext = createContext()
const useApiMaker = () => {
  const apiMakerContext = useContext(ApiMakerContext)

  if (apiMakerContext) {
    return apiMakerContext
  }

  return {
    config: ApiMakerConfig
  }
}

const WithApiMaker = memo(({children, config, ...restProps}) => {
  const restPropsKeys = Object.keys(restProps)
  const value = useMemo(() => ({config}), [config])

  if (restPropsKeys.length > 0) throw new Error(`Unhandled props: ${restPropsKeys.join(", ")}`)

  return (
    <ApiMakerContext.Provider value={value}>
      {children}
    </ApiMakerContext.Provider>
  )
})

export {useApiMaker, WithApiMaker}
