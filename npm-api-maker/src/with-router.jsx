import React from "react"
import useRouter from "./use-router.js"

export default (WrapperComponent) => (props) => {
  const {path, routes, routeDefinitions, ...restProps} = props
  const {match} = useRouter({path, routes, routeDefinitions})

  return (
    <WrapperComponent match={match} {...restProps} />
  )
}
