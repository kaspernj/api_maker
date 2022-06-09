import escapeStringRegexp from "escape-string-regexp"
import inflection from "inflection"
import PropTypes from "prop-types"
import React from "react"
import {shouldComponentUpdate} from "set-state-compare"
import {Suspense} from "react"

export default class ApiMakerRouter extends React.Component {
  static propTypes = {
    notFoundComponent: PropTypes.object,
    path: PropTypes.string.isRequired,
    requireComponent: PropTypes.func.isRequired,
    routes: PropTypes.object,
    routeDefinitions: PropTypes.object
  }

  parsedRouteDefinitions = this.parseRouteDefinitions()

  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState)
  }

  findRouteParams (routeDefinition) {
    const result = []
    const parts = routeDefinition.path.split("/")

    for (const part of parts) {
      if (part.match(/^:([a-z_]+)$/))
        result.push(part)
    }

    return result
  }

  parseRouteDefinitions() {
    const Locales = require("shared/locales").default
    const {routeDefinitions, routes} = this.props
    const regex = /:([A-z\d_]+)/
    const parsedRouteDefinitions = []

    for (const locale of Locales.availableLocales()) {
      for (const routeDefinition of routeDefinitions.routes) {
        const routePathName = `${inflection.camelize(routeDefinition.name, true)}Path`
        const params = this.findRouteParams(routeDefinition)

        params.push({locale})

        if (!(routePathName in routes))
          throw new Error(`${routePathName} not found in routes: ${Object.keys(routes, ", ")}`)

        const routePath = routes[routePathName](...params)
        const groups = []

        let pathRegexString = '^'

        pathRegexString += escapeStringRegexp(routePath)

        while (true) {
          const match = pathRegexString.match(regex)

          if (!match) break

          const variableName = match[1]

          groups.push(variableName)

          pathRegexString = pathRegexString.replace(match[0], `([^\/]+)`)
        }

        pathRegexString += '$'

        const pathRegex = new RegExp(pathRegexString)

        parsedRouteDefinitions.push({groups, pathRegex, routeDefinition})
      }
    }

    return parsedRouteDefinitions
  }

  findMatchingRoute() {
    const {path} = this.props

    for (const parsedRouteDefinition of this.parsedRouteDefinitions) {
      const match = path.match(parsedRouteDefinition.pathRegex)

      if (match) {
        const params = {}

        for (const groupKey in parsedRouteDefinition.groups) {
          const groupName = parsedRouteDefinition.groups[groupKey]

          params[groupName] = match[Number(groupKey) + 1]
        }

        return {params, parsedRouteDefinition}
      }
    }
  }

  render() {
    const matchingRoute = this.findMatchingRoute()

    if (!matchingRoute) {
      const NotFoundComponent = this.props.notFoundComponent

      return (
        <Suspense fallback={<div />}>
          <NotFoundComponent />
        </Suspense>
      )
    }

    const Component = this.props.requireComponent({routeDefinition: matchingRoute.parsedRouteDefinition.routeDefinition})

    return (
      <Suspense fallback={<div />}>
        <Component match={{params: matchingRoute.params}} />
      </Suspense>
    )
  }
}
