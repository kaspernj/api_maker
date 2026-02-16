import React, {memo, useCallback, useLayoutEffect, useMemo, useState} from "react"
import onLocationChanged from "./on-location-changed"
import qs from "qs"
import WithCustomPath from "./with-custom-path"

const params = () => qs.parse(globalThis.location.search.substr(1)) || {}

const WithLocationPath = memo(({children, ...restProps}) => {
  const restPropsKeys = Object.keys(restProps)

  if (restPropsKeys.length > 0) {
    throw new Error(`Unhandled props given: ${restPropsKeys.join(", ")}`)
  }

  const [path, setPath] = useState(globalThis.location.pathname)
  const [queryParams, setQueryParams] = useState(params())
  const shared = useMemo(() => ({}), [])

  shared.path = path

  const onLocationChangedCallback = useCallback(() => {
    const newPath = globalThis.location.pathname

    setQueryParams(params())

    if (newPath != shared.path) {
      setPath(newPath)
    }
  }, [])

  useLayoutEffect(() => {
    const onLocationChangedEvent = onLocationChanged(onLocationChangedCallback)

    return () => {
      onLocationChangedEvent.disconnect()
    }
  }, [])

  return (
    <WithCustomPath path={path} queryParams={queryParams}>
      {children}
    </WithCustomPath>
  )
})

export default WithLocationPath
