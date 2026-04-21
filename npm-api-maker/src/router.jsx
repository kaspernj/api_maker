// @ts-check
/* eslint-disable sort-imports */
import React, {Suspense, memo} from "react"
import {ShapeComponent, shapeComponent} from "set-state-compare/build/shape-component.js"
import PropTypes from "prop-types"
import propTypesExact from "prop-types-exact"
import usePath from "on-location-changed/build/use-path.js"
import useRouter from "./use-router"

/**
 * @typedef {object} Props
 * @property {object} [history]
 * @property {any[]} locales
 * @property {React.ComponentType<any>} [notFoundComponent]
 * @property {Function} requireComponent
 * @property {object} [routeDefinitions]
 * @property {object} [routes]
 */
/** @typedef {Record<string, never>} State */
export default memo(shapeComponent(/** @augments {ShapeComponent<Props, State>} */ class ApiMakerRouter extends ShapeComponent {
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
