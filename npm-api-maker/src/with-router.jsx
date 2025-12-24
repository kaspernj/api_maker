import React from "react"
import useRouter from "./use-router"

const withRouter = (WrapperComponent) => {
  // eslint-disable-next-line func-style
  function WithRouter(props) {
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
