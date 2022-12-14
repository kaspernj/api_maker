import config from "./config.mjs"
import escapeStringRegexp from "escape-string-regexp"
import * as inflection from "inflection"
import PropTypes from "prop-types"
import React from "react"
import shouldComponentUpdate from "set-state-compare/src/should-component-update"

export default (WrapperComponent) => class WithRouter extends React.Component {
  static propTypes = {
    path: PropTypes.string,
    routeDefinitions: PropTypes.object,
    routes: PropTypes.object
  }

  parsedRouteDefinitions = this.parseRouteDefinitions()

  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate(this, nextProps, nextState)
  }

  findRouteParams(routeDefinition) {
    const result = []
    const parts = routeDefinition.path.split("/")

    for (const part of parts) {
      if (part.match(/^:([a-z_]+)$/))
        result.push(part)
    }

    return result
  }

  path() {
    let path = this.props.path || window.location.pathname

    path = path.replace(/[/]+$/, "")

    return path
  }

  routeDefinitions() {
    return this.props.routeDefinitions || config.getRouteDefinitions()
  }

  routes() {
    return this.props.routes || config.getRoutes()
  }

  parseRouteDefinitions() {
    const Locales = require("shared/locales").default
    const routeDefinitions = this.routeDefinitions()
    const routes = this.routes()
    const regex = /:([A-z\d_]+)/
    const parsedRouteDefinitions = []

    for (const locale of Locales.availableLocales()) {
      for (const routeDefinition of routeDefinitions.routes) {
        const routePathName = `${inflection.camelize(routeDefinition.name, true)}Path`
        const params = this.findRouteParams(routeDefinition)

        params.push({locale})

        if (!(routePathName in routes))
          throw new Error(`${routePathName} not found in routes: ${Object.keys(routes, ", ")}`)

        const routePath = routes[routePathName](...params).replace(/[/]+$/, "")
        const groups = []
        let pathRegexString = "^"

        pathRegexString += escapeStringRegexp(routePath)

        while (true) {
          const match = pathRegexString.match(regex)

          if (!match) break

          const variableName = match[1]

          groups.push(variableName)

          pathRegexString = pathRegexString.replace(match[0], "([^/]+)")
        }

        pathRegexString += "$"

        const pathRegex = new RegExp(pathRegexString)

        parsedRouteDefinitions.push({groups, pathRegex, routeDefinition})
      }
    }

    return parsedRouteDefinitions
  }

  findMatchingRoute() {
    const path = this.path()

    for (const parsedRouteDefinition of this.parsedRouteDefinitions) {
      const match = path.match(parsedRouteDefinition.pathRegex)
      let matched, params

      if (match) {
        matched = true
        params = {}

        for (const groupKey in parsedRouteDefinition.groups) {
          const groupName = parsedRouteDefinition.groups[groupKey]

          params[groupName] = match[Number(groupKey) + 1]
        }
      }

      if (path == "" && parsedRouteDefinition.routeDefinition.path == "/") matched = true
      if (matched) {
        return {params, parsedRouteDefinition}
      }
    }
  }

  render() {
    const {path, routes, routeDefinitions, ...restProps} = this.props
    const matchingRoute = this.findMatchingRoute()
    const params = matchingRoute?.params || {}
    const match = {
      matchingRoute,
      params
    }

    return (
      <WrapperComponent match={match} {...restProps} />
    )
  }
}
