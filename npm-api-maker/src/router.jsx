import BaseComponent from "./base-component.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React, {memo, Suspense} from "react"
import {shapeComponent} from ""set-state-compare/build/shape-component.js"
import usePath from "on-location-changed/build/use-path.js"
import useRouter from "./use-router.js"

export default memo(shapeComponent(class ApiMakerRouter extends BaseComponent {
  static propTypes = propTypesExact({
    history: PropTypes.object,
    locales: PropTypes.array.isRequired,
    notFoundComponent: PropTypes.elementType,
    requireComponent: PropTypes.func.isRequired,
    routeDefinitions: PropTypes.object,
    routes: PropTypes.object
  })

  render() {
    const path = usePath()
    const {locales, notFoundComponent, requireComponent, routeDefinitions, routes} = this.props
    const {match} = useRouter({locales, path, routes, routeDefinitions})
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

    const Component = requireComponent({routeDefinition: matchingRoute.parsedRouteDefinition.routeDefinition})

    return (
      <Suspense fallback={<div />}>
        <Component match={match} />
      </Suspense>
    )
  }
}))
