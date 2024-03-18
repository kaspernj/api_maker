import PropTypes from "prop-types"
import React, {memo} from "react"
import {Suspense} from "react"
import withRouter from "./with-router"

const ApiMakerRouter = (props) => {
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
    <Suspense fallback={<div />}>
      <Component match={match} {...restProps} />
    </Suspense>
  )
}

ApiMakerRouter.propTypes = {
  notFoundComponent: PropTypes.elementType,
  requireComponent: PropTypes.func.isRequired
}

export default withRouter(memo(ApiMakerRouter))
