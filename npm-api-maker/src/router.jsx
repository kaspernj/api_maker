import React, {memo} from "react"
import withRouter from "./with-router"

const ApiMakerRouter = memo((props) => {
  const {match, ...restProps} = props
  const {matchingRoute} = match

  if (!matchingRoute) {
    if (props.notFoundComponent) {
      const NotFoundComponent = props.notFoundComponent

      return (
        <Suspense fallback={<div />}>
          <NotFoundComponent match={match} />
        </Suspense>
      )
    } else {
      return null
    }
  }

  const Component = props.requireComponent({routeDefinition: matchingRoute.parsedRouteDefinition.routeDefinition})

  return (
    <Component match={match} {...restProps} />
  )
})

export default withRouter(ApiMakerRouter)
