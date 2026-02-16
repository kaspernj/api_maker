import React, {memo} from "react"
import {LocationContext, QueryParamsContext} from "./location-context"

const withCustomPath = memo(({children, path, queryParams, ...restProps}) => {
  const restPropsKeys = Object.keys(restProps)

  if (restPropsKeys.length > 0) {
    throw new Error(`Unhandled props given: ${restPropsKeys.join(", ")}`)
  }

  return (
    <LocationContext.Provider value={path}>
      <QueryParamsContext.Provider value={queryParams}>
        {children}
      </QueryParamsContext.Provider>
    </LocationContext.Provider>
  )
})

export {LocationContext}
export default withCustomPath
