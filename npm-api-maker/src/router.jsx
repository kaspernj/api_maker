import BaseComponent from "./base-component"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React, {memo, Suspense} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component"
import usePath from "on-location-changed/build/use-path"
import useRouter from "./use-router"

export default memo(shapeComponent(class ApiMakerRouter extends BaseComponent {
  static propTypes = propTypesExact({
    history: PropTypes.object,
    notFoundComponent: PropTypes.elementType,
    requireComponent: PropTypes.func.isRequired,
    routeDefinitions: PropTypes.object,
    routes: PropTypes.object
  })

  render() {
    const path = usePath()
    const {notFoundComponent, requireComponent, routeDefinitions, routes} = this.props
    const {match} = useRouter({path, routes, routeDefinitions})
    const {matchingRoute} = match

    if (!matchingRoute) {
      if (notFoundComponent) {
        const NotFoundComponent = notFoundComponent

        return (
          <Suspense fallback={<div />}>
            <NotFoundComponent match={match} />
          </Suspense>
        )
      } else {
        return null
      }
    }

    console.log("ApiMaker Router Before requireComponent")

    const Component = requireComponent({routeDefinition: matchingRoute.parsedRouteDefinition.routeDefinition})

    console.log("ApiMaker Router", {Component})

    return (
      <Suspense fallback={<div />}>
        <Component match={match} />
      </Suspense>
    )
  }
}))
