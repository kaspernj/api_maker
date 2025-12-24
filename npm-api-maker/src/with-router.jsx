import React from "react"
import useRouter from "./use-router"

const withRouter = (WrapperComponent) => {
  function WithRouter(props) { // eslint-disable-line func-style
    const {path, routes, routeDefinitions, ...restProps} = props
    const {match} = useRouter({path, routes, routeDefinitions})

    return (
      <WrapperComponent match={match} {...restProps} />
    )
  }

  WithRouter.displayName = `WithRouter(${WrapperComponent.displayName || WrapperComponent.name || "Component"})`

  return WithRouter
}

export default withRouter
