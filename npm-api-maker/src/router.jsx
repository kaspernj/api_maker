import BaseComponent from "./base-component"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import React, {memo} from "react"
import {shapeComponent} from "set-state-compare/src/shape-component.js"
import {Suspense} from "react"
import useRouter from "./use-router"

export default memo(shapeComponent(class ApiMakerRouter extends BaseComponent {
  static propTypes = propTypesExact({
    notFoundComponent: PropTypes.elementType,
    path: PropTypes.string,
    requireComponent: PropTypes.func.isRequired,
    routeDefinitions: PropTypes.array,
    routes: PropTypes.array
  })

  render() {
    const {notFoundComponent, path, requireComponent, routeDefinitions, routes} = this.props
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

    const Component = requireComponent({routeDefinition: matchingRoute.parsedRouteDefinition.routeDefinition})

    return (
      <Suspense fallback={<div />}>
        <Component match={match} />
      </Suspense>
    )
  }
}))
